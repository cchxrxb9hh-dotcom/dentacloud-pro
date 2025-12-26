import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Save, Plus, Trash2, DollarSign, Calculator, Calendar } from 'lucide-react';
import { useUser } from '../App';
import { PayrollRecord } from '../types';
import VisualPayslip from './VisualPayslip';

const InputField = ({ label, value, onChange, type = "text", settings }: any) => (
  <div className="flex-1 space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[16px] text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
    />
  </div>
);

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRecord: PayrollRecord | null;
  onSave?: (updatedRecord: PayrollRecord) => void;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, payrollRecord, onSave }) => {
  const { settings, addAuditEntry } = useUser();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [payPeriod, setPayPeriod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [earnings, setEarnings] = useState<{ description: string; amount: number }[]>([]);
  const [deductions, setDeductions] = useState<{ description: string; amount: number }[]>([]);

  useEffect(() => {
    if (isOpen && payrollRecord) {
      const today = new Date();
      setPaymentDate(today.toISOString().split('T')[0]);
      setPayPeriod(`${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`);
      
      setEarnings([
        { description: 'Basic Salary', amount: payrollRecord.grossSalary },
        { description: 'Fixed Allowances', amount: payrollRecord.allowances },
      ]);
      setDeductions([
        { description: 'Standard Deductions', amount: payrollRecord.deductions },
      ]);
    }
  }, [isOpen, payrollRecord]);

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const handleAddItem = (type: 'earning' | 'deduction') => {
    if (type === 'earning') {
      setEarnings([...earnings, { description: '', amount: 0 }]);
    } else {
      setDeductions([...deductions, { description: '', amount: 0 }]);
    }
  };

  const handleUpdateItem = (type: 'earning' | 'deduction', index: number, field: 'description' | 'amount', value: any) => {
    const list = type === 'earning' ? [...earnings] : [...deductions];
    const item = { ...list[index] };
    if (field === 'amount') {
      item.amount = parseFloat(value) || 0;
    } else {
      item.description = value;
    }
    list[index] = item;
    
    if (type === 'earning') setEarnings(list);
    else setDeductions(list);
  };

  const handleRemoveItem = (type: 'earning' | 'deduction', index: number) => {
    if (type === 'earning') {
      setEarnings(earnings.filter((_, i) => i !== index));
    } else {
      setDeductions(deductions.filter((_, i) => i !== index));
    }
  };

  const handlePrint = () => {
    if (!payrollRecord) return;
    
    addAuditEntry(
        'Printed Payslip',
        'Financial',
        `Generated payslip for ${payrollRecord.userName} (${payPeriod})`
    );
    
    window.print();
  };

  if (!isOpen || !payrollRecord) return null;

  const payslipData = {
    employeeName: payrollRecord.userName,
    employeeId: `EMP-${payrollRecord.id}`,
    role: 'Clinical Staff',
    payPeriod,
    paymentDate,
    earnings,
    deductions,
    netPay
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-payslip-section, #print-payslip-section * { visibility: visible; }
          #print-payslip-section { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            padding: 40px; 
            background: white; 
            z-index: 99999;
          }
        }
      `}</style>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 print:hidden">
        <div className="bg-white w-full max-w-7xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-white">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#111827] text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Payslip Editor</h3>
                <p className="text-xs text-slate-400 font-bold">Adjust payroll details for {payrollRecord.userName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-0 flex flex-col lg:flex-row bg-[#F9FAFB]">
            {/* Editor Side */}
            <div className="w-full lg:w-5/12 p-10 space-y-10 bg-white shadow-sm overflow-y-auto">
                <div className="flex gap-6">
                    <InputField label="Pay Period" value={payPeriod} onChange={setPayPeriod} />
                    <InputField label="Payment Date" value={paymentDate} onChange={setPaymentDate} type="date" />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Earnings</h4>
                        <button onClick={() => handleAddItem('earning')} className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5">
                            <Plus size={14} /> Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {earnings.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-right-2">
                                <input 
                                    type="text" 
                                    value={item.description} 
                                    onChange={e => handleUpdateItem('earning', idx, 'description', e.target.value)}
                                    placeholder="Description"
                                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 focus:text-slate-800 outline-none"
                                />
                                <div className="relative w-32">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">{settings.currency}</span>
                                    <input 
                                        type="number" 
                                        value={item.amount}
                                        onChange={e => handleUpdateItem('earning', idx, 'amount', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800"
                                    />
                                </div>
                                <button onClick={() => handleRemoveItem('earning', idx)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em]">Deductions</h4>
                        <button onClick={() => handleAddItem('deduction')} className="text-[10px] font-black text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1.5">
                            <Plus size={14} /> Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {deductions.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-right-2">
                                <input 
                                    type="text" 
                                    value={item.description} 
                                    onChange={e => handleUpdateItem('deduction', idx, 'description', e.target.value)}
                                    placeholder="Description"
                                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 focus:text-slate-800 outline-none"
                                />
                                <div className="relative w-32">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">{settings.currency}</span>
                                    <input 
                                        type="number" 
                                        value={item.amount}
                                        onChange={e => handleUpdateItem('deduction', idx, 'amount', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800"
                                    />
                                </div>
                                <button onClick={() => handleRemoveItem('deduction', idx)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Side */}
            <div className="flex-1 bg-slate-50 p-12 overflow-y-auto flex items-start justify-center">
               <div id="print-payslip-section" className="w-full bg-white shadow-2xl rounded-[32px] overflow-hidden border border-slate-200">
                  <VisualPayslip data={payslipData} settings={settings} />
               </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-6 bg-white">
            <button onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Close</button>
            <button 
              onClick={handlePrint} 
              className="px-10 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl flex items-center gap-3 active:scale-[0.98]"
            >
              <Printer size={18} /> Print Payslip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayslipModal;