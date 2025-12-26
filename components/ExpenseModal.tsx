
import React, { useState } from 'react';
import { X, Save, Receipt, Calendar, DollarSign, Building2, Tag } from 'lucide-react';
import { Expense, ClinicBranch } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  branches: ClinicBranch[];
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, branches }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'Utilities',
    date: new Date().toISOString().split('T')[0],
    branchId: branches[0]?.id || '',
    status: 'Paid'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: `ex-${Date.now()}` } as Expense);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Receipt size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">Record Expense</h3>
              <p className="text-xs text-black font-medium">Log operational overhead costs.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-black uppercase tracking-widest">Description</label>
            <input type="text" name="description" required value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black placeholder-slate-500" placeholder="e.g. Medical Waste Disposal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><Tag size={12} className="text-black" /> Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black">
                <option>Utilities</option>
                <option>Rent</option>
                <option>Marketing</option>
                <option>Wages</option>
                <option>Supplies</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12} className="text-black" /> Branch</label>
                <select name="branchId" value={formData.branchId} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} className="text-black" /> Date</label>
              <input type="date" name="date" required value={formData.date || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><DollarSign size={12} className="text-black" /> Amount</label>
              <input type="number" name="amount" required value={formData.amount || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black placeholder-slate-500" placeholder="0.00" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase text-slate-400 hover:text-black transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
              <Save size={16} /> Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
