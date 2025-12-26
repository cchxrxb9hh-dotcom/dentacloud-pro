import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Edit2, 
  Printer, 
  Trash2,
  Receipt,
  User,
  Calendar,
  Wallet,
  FileText,
  TrendingUp,
  X
} from 'lucide-react';
import { useUser } from '../App';
import BillingModal from '../components/BillingModal';
import { Invoice } from '../types';

const Billing: React.FC = () => {
  const { globalInvoices, updateInvoice, addInvoice, deleteInvoice, settings } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingModalProps, setBillingModalProps] = useState<any>(null);

  const filteredInvoices = useMemo(() => {
    return globalInvoices.filter(inv => {
      const matchesSearch = inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      
      const invDate = new Date(inv.date);
      const isAfterStart = !startDate || invDate >= new Date(startDate);
      const isBeforeEnd = !endDate || invDate <= new Date(endDate);
      
      return matchesSearch && matchesStatus && isAfterStart && isBeforeEnd;
    }).sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id);
    });
  }, [globalInvoices, searchTerm, statusFilter, startDate, endDate]);

  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let calculatedOverdue = 0;

    globalInvoices.forEach(inv => {
        if (inv.recordType === 'Invoice') {
            totalInvoiced += inv.amount;
            if (inv.status === 'Overdue') {
                calculatedOverdue += (inv.amount - (inv.paidAmount || 0));
            }
        } else if (inv.recordType === 'Receipt') {
            totalCollected += inv.amount;
        }
    });

    const netOutstanding = totalInvoiced - totalCollected;

    return { 
        totalPaid: totalCollected, 
        totalPending: netOutstanding, 
        totalOverdue: Math.max(0, calculatedOverdue) 
    };
  }, [globalInvoices]);

  const handlePay = (invoice: Invoice) => {
    setBillingModalProps({
        patient: { id: invoice.patientId, name: invoice.patientName },
        initialItems: invoice.items,
        initialBranchId: invoice.branchId,
        invoiceId: invoice.id,
        initialDate: new Date().toISOString().split('T')[0],
        initialType: 'Receipt',
        initialPaidAmount: invoice.paidAmount || 0,
        isEditing: false, 
        relatedInvoiceId: invoice.id 
    });
    setIsBillingOpen(true);
  };

  const handlePrintOrEdit = (invoice: Invoice) => {
    const isReceipt = invoice.recordType === 'Receipt';
    const isPaid = invoice.status === 'Paid';
    
    setBillingModalProps({
        patient: { id: invoice.patientId, name: invoice.patientName },
        initialItems: invoice.items,
        initialBranchId: invoice.branchId,
        invoiceId: invoice.id,
        initialDate: invoice.date,
        initialType: isReceipt ? 'Receipt' : (isPaid ? 'Receipt' : 'Invoice'),
        initialPaidAmount: invoice.paidAmount || (isPaid ? invoice.amount : 0),
        isEditing: true 
    });
    setIsBillingOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to void this record?')) {
        deleteInvoice(id);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
        case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
        case 'Partially Paid': return 'bg-blue-50 text-blue-700 border-blue-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const setIsBillingOpen = (val: boolean) => setIsBillingModalOpen(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Billing & Transactions</h1>
        <p className="text-slate-500 font-medium text-sm">Monitor patient payments and invoice status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Collected</p>
            <div className="bg-white px-2 py-0.5 inline-block">
               <p className="text-2xl font-black text-slate-900">RM{stats.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-sm ${stats.totalPending < 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            {stats.totalPending < 0 ? <DollarSign size={24} /> : <Clock size={24} />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stats.totalPending < 0 ? 'Patient Credits (Net)' : 'Net Outstanding'}
            </p>
            <div className="bg-white px-2 py-0.5 inline-block">
                <p className={`text-2xl font-black ${stats.totalPending < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    RM{stats.totalPending.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue Balance</p>
            <div className="bg-white px-2 py-0.5 inline-block">
                <p className="text-2xl font-black text-slate-900">RM{stats.totalOverdue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[40px] border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search invoice # or patient name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium placeholder-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
            <span className="text-slate-300 font-black text-[10px]">TO</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
            { (startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {['ALL', 'PAID', 'PENDING', 'PARTIALLY PAID', 'OVERDUE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'ALL' ? 'All' : status.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ') as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                (statusFilter === 'All' ? 'ALL' : statusFilter.toUpperCase()) === status 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-5">Record #</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Summary</th>
                <th className="px-8 py-5 text-right">Total</th>
                <th className="px-8 py-5 text-right">Paid</th>
                <th className="px-8 py-5 text-right">Balance</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv) => {
                const isReceipt = inv.recordType === 'Receipt';
                const paidDisplay = isReceipt ? inv.amount : (inv.paidAmount || 0);
                const balanceDisplay = isReceipt ? 0 : Math.max(0, inv.amount - paidDisplay);
                
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-black text-xs text-slate-800">{inv.id}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{inv.date}</td>
                    <td className="px-8 py-5">
                       {isReceipt ? (
                           <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-tight">
                               <Receipt size={14} className="text-emerald-500" /> Receipt
                           </span>
                       ) : (
                           <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-tight">
                               <FileText size={14} className="text-blue-500" /> Invoice
                           </span>
                       )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border border-white shadow-sm ${isReceipt ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              {inv.patientName.charAt(0)}
                          </div>
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{inv.patientName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-600 max-w-xs truncate font-medium">
                      {inv.items.map(i => i.description).join(', ')}
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-black text-slate-900">
                      RM{inv.amount.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-black text-emerald-600">
                      RM{paidDisplay.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-black text-slate-900">
                      RM{balanceDisplay.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {!isReceipt && (inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partially Paid') && (
                              <button 
                                  onClick={() => handlePay(inv)}
                                  className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Receive Payment"
                              >
                                  <CreditCard size={18} />
                              </button>
                          )}
                          <button 
                              onClick={() => handlePrintOrEdit(inv)}
                              className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-all"
                              title={isReceipt ? "Print Receipt" : "Edit/Print Invoice"}
                          >
                              <Printer size={18} />
                          </button>
                          <button 
                              onClick={() => handleDelete(inv.id)}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"
                              title="Void Record"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                    <td colSpan={10}>
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                            <CreditCard size={64} className="mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No records found matching criteria</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillingModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
        {...billingModalProps} 
        onSaveInvoice={addInvoice} 
        onUpdate={updateInvoice} 
      />
    </div>
  );
};

export default Billing;