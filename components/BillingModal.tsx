import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Receipt, Printer, Plus, Trash2, DollarSign, Building2, Wallet, MessageSquare, CreditCard, Save, Mail, Send, Calendar } from 'lucide-react';
import { useUser } from '../App';
import { Patient, TreatmentService, Invoice } from '../types';
import VisualReceipt from './VisualReceipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { id: string; name: string };
  initialType?: 'Invoice' | 'Receipt';
  initialItems?: { description: string; price: number }[];
  initialBranchId?: string;
  initialDate?: string;
  invoiceId?: string;
  relatedInvoiceId?: string; 
  relatedInvoiceIds?: string[]; // Added to support paying multiple invoices at once
  isEditing?: boolean;
  initialPaidAmount?: number;
  onFinalize?: (invoiceId: string) => void;
  onSaveInvoice?: (invoice: Invoice) => void;
  onUpdate?: (id: string, updates: Partial<Invoice>) => void;
  onSaveToFolder?: (data: { name: string, content: string }) => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ 
  isOpen, 
  onClose, 
  patient, 
  initialType = 'Receipt', 
  initialItems, 
  initialBranchId, 
  initialDate,
  invoiceId,
  relatedInvoiceId,
  relatedInvoiceIds,
  isEditing = false,
  initialPaidAmount = 0,
  onFinalize, 
  onSaveInvoice,
  onUpdate,
  onSaveToFolder 
}) => {
  const { settings, addAuditEntry, currentUser, services, globalInvoices } = useUser();
  const [type, setType] = useState<'Invoice' | 'Receipt'>(initialType);
  const [branchId, setBranchId] = useState(initialBranchId || settings.branches[0]?.id || 'b1');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [paymentMethodId, setPaymentMethodId] = useState(settings.paymentMethods?.find(pm => pm.isActive)?.id || '');
  const [items, setItems] = useState<{ description: string; price: number }[]>([
    { description: 'Dental Consultation', price: 50 }
  ]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState('');
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Derived state for original total based on items + SST
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = subtotal * (settings.taxSstRate / 100);
  const originalTotal = subtotal + taxAmount;

  // Calculate the actual outstanding balance for the context of this modal
  const totalOutstanding = useMemo(() => {
    if (relatedInvoiceId || (relatedInvoiceIds && relatedInvoiceIds.length > 0)) {
        const idsToProcess = relatedInvoiceId ? [relatedInvoiceId] : (relatedInvoiceIds || []);
        const targetInvoices = globalInvoices.filter(inv => idsToProcess.includes(inv.id));
        return targetInvoices.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);
    }
    // If editing a single record, balance is total minus what was already recorded as paid
    if (isEditing) {
        return Math.max(0, originalTotal - (initialPaidAmount || 0));
    }
    return originalTotal;
  }, [relatedInvoiceId, relatedInvoiceIds, globalInvoices, originalTotal, isEditing, initialPaidAmount]);

  const performGeneration = (
    targetItems: { description: string; price: number }[],
    targetType: 'Invoice' | 'Receipt',
    targetBranchId: string,
    targetDate: string,
    targetPaymentMethodId: string,
    targetPaymentAmount: number,
    targetCardNumber: string
  ) => {
    const selectedBranch = settings.branches.find(b => b.id === targetBranchId);
    const selectedMethod = settings.paymentMethods?.find(pm => pm.id === targetPaymentMethodId);
    const dateObj = new Date(targetDate);
    
    const sub = targetItems.reduce((sum, item) => sum + item.price, 0);
    const tax = sub * (settings.taxSstRate / 100);
    const totalAmount = sub + tax;
    
    const paid = targetType === 'Receipt' ? targetPaymentAmount : 0;
    const due = totalAmount - paid;

    let paymentMethodName = selectedMethod?.name || 'N/A';
    if (selectedMethod?.type === 'Card' && targetCardNumber) {
        paymentMethodName += ` (**** ${targetCardNumber.slice(-4)})`;
    }

    const data = {
        customerName: patient.name,
        customerReference: `P-${patient.id}`,
        invoiceNumber: (targetType === 'Invoice' && invoiceId) ? invoiceId : `INV-${Date.now()}`,
        receiptNumber: (targetType === 'Receipt' && invoiceId && !relatedInvoiceId && !relatedInvoiceIds) ? invoiceId : `RCPT-${Date.now()}`,
        dateOfSale: dateObj.toLocaleDateString(),
        businessName: selectedBranch?.companyName || 'N/A',
        businessEmail: settings.supportEmail,
        businessPhone: selectedBranch?.phone || 'N/A',
        businessAddress: selectedBranch?.address || 'N/A',
        items: targetItems.map(item => ({
            description: item.description,
            price: item.price,
            quantity: 1,
            taxRate: settings.taxSstRate,
            amount: item.price,
        })),
        subtotal: sub,
        totalTax: tax,
        totalAmount: totalAmount,
        totalPaid: paid,
        balanceDue: due,
        paymentMethod: paymentMethodName,
        currency: settings.currency,
    };
    
    setReceiptData(data);
  };

  useEffect(() => {
    if (isOpen) {
      const freshItems = initialItems && initialItems.length > 0 
        ? initialItems 
        : [{ description: 'Dental Consultation', price: 50 }];
      
      setItems(freshItems);
      setBranchId(initialBranchId || settings.branches[0]?.id || 'b1');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setType(initialType);
      setReceiptData(null);
      setCardNumber('');

      const activeMethods = settings.paymentMethods?.filter(pm => pm.isActive) || [];
      const defaultPaymentMethodId = activeMethods.length > 0 ? activeMethods[0].id : '';
      setPaymentMethodId(defaultPaymentMethodId);
      
      const sub = freshItems.reduce((sum, item) => sum + item.price, 0);
      const tax = sub * (settings.taxSstRate / 100);
      const total = sub + tax;
      
      if (relatedInvoiceId || (relatedInvoiceIds && relatedInvoiceIds.length > 0)) {
          const idsToProcess = relatedInvoiceId ? [relatedInvoiceId] : (relatedInvoiceIds || []);
          const targetInvoices = globalInvoices.filter(inv => idsToProcess.includes(inv.id));
          const totalRemaining = targetInvoices.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);
          setPaymentAmount(totalRemaining);
      } else {
          // Default payment amount to remaining balance if editing/paying
          setPaymentAmount(initialPaidAmount || total);
      }
    }
  }, [isOpen, initialItems, initialType, initialBranchId, initialDate, isEditing, invoiceId, relatedInvoiceId, relatedInvoiceIds, initialPaidAmount, settings.taxSstRate, globalInvoices]);

  useEffect(() => {
      if (!isEditing && !relatedInvoiceId && !relatedInvoiceIds && type === 'Receipt') {
          setPaymentAmount(originalTotal);
      }
  }, [originalTotal, type, isEditing, relatedInvoiceId, relatedInvoiceIds]);

  useEffect(() => {
    if (isOpen) {
        const timer = setTimeout(() => {
            performGeneration(items, type, branchId, date, paymentMethodId, paymentAmount, cardNumber);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [items, type, branchId, date, paymentMethodId, paymentAmount, cardNumber, isOpen]);

  const addItem = () => setItems([...items, { description: '', price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: 'description' | 'price', value: string | number) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    if (field === 'description') {
        currentItem.description = value as string;
        const selectedService = services.find(service => service.name === value);
        if (selectedService) {
            currentItem.price = selectedService.cost;
        }
    } else if (field === 'price') {
        currentItem.price = parseFloat(value as string) || 0;
    }

    newItems[index] = currentItem;
    setItems(newItems);
  };

  const handlePrint = () => {
    if (!receiptData || !receiptRef.current) return;
    const docName = type === 'Invoice' ? `Invoice_${receiptData.invoiceNumber}` : `Receipt_${receiptData.receiptNumber}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${docName}</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="p-10">${receiptRef.current.innerHTML}</body>
        <script>window.onload = () => { window.print(); window.close(); };</script>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  const generateAndDownloadPdf = async (fileName: string) => {
      if (!receiptRef.current) return;
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(fileName);
  };

  const handleFinalizeAndDispatch = async () => {
    if (!receiptData) return;
    const docName = type === 'Invoice' ? `Invoice_${receiptData.invoiceNumber}` : `Receipt_${receiptData.receiptNumber}`;
    
    let status: Invoice['status'] = 'Pending';
    if (type === 'Receipt') status = 'Paid';
    else {
        if (paymentAmount >= originalTotal) status = 'Paid';
        else if (paymentAmount > 0) status = 'Partially Paid';
    }

    // PAYMENT LOGIC
    if (type === 'Receipt' && (relatedInvoiceId || (relatedInvoiceIds && relatedInvoiceIds.length > 0)) && onUpdate && onSaveInvoice) {
        const idsToProcess = relatedInvoiceId ? [relatedInvoiceId] : (relatedInvoiceIds || []);
        
        // 1. Create and Save the Receipt Record First
        const receiptRecord: Invoice = {
            id: receiptData.receiptNumber,
            recordType: 'Receipt',
            relatedInvoiceId: relatedInvoiceId || idsToProcess[0],
            patientId: patient.id,
            patientName: patient.name,
            branchId: branchId,
            date: date,
            amount: paymentAmount,
            status: 'Paid',
            items: items,
            providerId: currentUser?.id,
            providerName: currentUser?.name,
            paidAmount: paymentAmount
        };
        onSaveInvoice(receiptRecord);

        // 2. Update the related invoices
        let remainingToAllocate = paymentAmount;
        const targetInvoices = globalInvoices
            .filter(inv => idsToProcess.includes(inv.id))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const inv of targetInvoices) {
            if (remainingToAllocate <= 0) break;
            const currentBalance = inv.amount - (inv.paidAmount || 0);
            const allocation = Math.min(remainingToAllocate, currentBalance);
            const newTotalPaid = (inv.paidAmount || 0) + allocation;
            let invStatus: Invoice['status'] = 'Pending';
            if (newTotalPaid >= inv.amount - 0.01) invStatus = 'Paid';
            else if (newTotalPaid > 0) invStatus = 'Partially Paid';
            onUpdate(inv.id, { paidAmount: newTotalPaid, status: invStatus });
            remainingToAllocate -= allocation;
        }
        addAuditEntry(`Processed Payment`, 'Financial', `Paid ${paymentAmount} for ${idsToProcess.length} invoices`);
    } 
    else if (isEditing && onUpdate && invoiceId) {
        onUpdate(invoiceId, { branchId, date, amount: originalTotal, status, items, paidAmount: type === 'Receipt' ? paymentAmount : (initialPaidAmount || 0) });
        addAuditEntry(`Updated ${type}`, 'Financial', `ID: ${invoiceId}`);
    }
    else if (onSaveInvoice) {
        const invoiceRecord: Invoice = {
            id: invoiceId || (type === 'Invoice' ? receiptData.invoiceNumber : receiptData.receiptNumber),
            recordType: type,
            patientId: patient.id,
            patientName: patient.name,
            branchId: branchId,
            date: date,
            amount: originalTotal,
            status: status,
            items: items,
            providerId: currentUser?.id,
            providerName: currentUser?.name,
            paidAmount: type === 'Receipt' ? paymentAmount : 0
        };
        onSaveInvoice(invoiceRecord);
        addAuditEntry(`Generated New ${type}`, 'Financial', `Patient: ${patient.name}`);
    }
    
    if (onSaveToFolder) onSaveToFolder({ name: docName, content: receiptRef.current?.innerHTML || '' });
    await generateAndDownloadPdf(`${docName}.pdf`);
    onClose();
  };

  const selectedPaymentMethod = settings.paymentMethods?.find(pm => pm.id === paymentMethodId);
  const isCardPayment = selectedPaymentMethod?.type === 'Card';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                  {(relatedInvoiceId || relatedInvoiceIds) ? 'Pay Invoices' : (isEditing ? `Edit ${type}` : `${type} Generator`)}
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {(relatedInvoiceId || relatedInvoiceIds) ? `Patient: ${patient.name}` : `Clinical Billing: ${patient.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!relatedInvoiceId && !relatedInvoiceIds && (
                <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                <button onClick={() => setType('Invoice')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${type === 'Invoice' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Invoice</button>
                <button onClick={() => setType('Receipt')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${type === 'Receipt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Receipt</button>
                </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={10} className="text-blue-500" /> Transaction Date
                  </label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900" 
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</label>
                  <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                    {settings.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</label>
                  <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                    {settings.paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                </div>
              </div>
              {isCardPayment && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CreditCard size={10} className="text-blue-500" /> Card Number
                    </label>
                    <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        placeholder="Last 4 digits"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900" 
                    />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billable Items</label>
                {!relatedInvoiceId && !relatedInvoiceIds && (
                    <button onClick={addItem} className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Plus size={14} /> Add Item
                    </button>
                )}
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <input 
                        type="text" 
                        value={item.description} 
                        onChange={(e) => updateItem(idx, 'description', e.target.value)} 
                        placeholder="Service" 
                        className={`flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 ${(relatedInvoiceId || relatedInvoiceIds) ? 'opacity-70 pointer-events-none' : ''}`} 
                        list="service-list-billing" 
                        readOnly={!!relatedInvoiceId || !!relatedInvoiceIds}
                    />
                    <div className="w-24 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">RM</span>
                      <input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => updateItem(idx, 'price', e.target.value)} 
                        className={`w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-right text-slate-900 ${(relatedInvoiceId || relatedInvoiceIds) ? 'opacity-70 pointer-events-none' : ''}`} 
                        readOnly={!!relatedInvoiceId || !!relatedInvoiceIds}
                      />
                    </div>
                    {items.length > 1 && !relatedInvoiceId && !relatedInvoiceIds && <button onClick={() => removeItem(idx)} className="p-2.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>}
                  </div>
                ))}
                <datalist id="service-list-billing">{services.map(s => <option key={s.id} value={s.name} />)}</datalist>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between text-xs font-bold text-slate-400"><span>SUBTOTAL</span><span className="text-slate-900">RM{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-black text-slate-950 uppercase tracking-tight">
                  <span>{(relatedInvoiceId || relatedInvoiceIds) ? 'Balance Due' : 'Total Due'}</span>
                  <span>RM{totalOutstanding.toFixed(2)}</span>
              </div>
              
              {type === 'Receipt' && (
                  <div className="space-y-1.5 mt-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                          <DollarSign size={12}/> Amount Paid
                      </label>
                      <input 
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl text-base font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex justify-between text-xs font-bold text-emerald-600 mt-1">
                          <span>Final Balance:</span>
                          <span>RM{Math.max(0, totalOutstanding - paymentAmount).toFixed(2)}</span>
                      </div>
                  </div>
              )}
            </div>
          </div>

          <div className="flex flex-col bg-slate-50 rounded-[32px] border border-slate-200 p-1">
            <div className="flex items-center justify-between p-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Digital Preview</label>
              {receiptData && <button onClick={handlePrint} className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100"><Printer size={16} /></button>}
            </div>
            <div className="flex-1 bg-white mx-4 mb-4 rounded-[24px] overflow-y-auto shadow-inner border border-slate-200 min-h-[400px]">
              <div ref={receiptRef}>
                {receiptData ? <VisualReceipt data={receiptData} type={type} template={type === 'Invoice' ? settings.invoiceTemplate || '' : settings.receiptTemplate || ''} /> : <div className="h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Generating Preview...</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase text-slate-400 hover:text-slate-700 transition-colors">Discard</button>
          <button disabled={!receiptData || items.some(i => !i.description)} onClick={handleFinalizeAndDispatch} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-30">
            <Send size={16} /> {isEditing ? 'Save & Update' : ((relatedInvoiceId || relatedInvoiceIds) ? 'Process Payment' : 'Finalize & Issue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingModal;