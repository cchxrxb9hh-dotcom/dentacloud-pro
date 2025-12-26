
import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Hash, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react';
import { APBill, Vendor } from '../types';

interface APBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: APBill) => void;
  bill: APBill | null;
  vendors: Vendor[];
}

const APBillModal: React.FC<APBillModalProps> = ({ isOpen, onClose, onSave, bill, vendors }) => {
  const [formData, setFormData] = useState<Partial<APBill>>({});
  
  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setFormData(bill);
      } else {
        setFormData({
          status: 'Pending Payment',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{ description: '', amount: 0 }]
        });
      }
    }
  }, [isOpen, bill]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = formData.items?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const finalBill: APBill = {
      ...formData,
      amount: totalAmount,
      vendorName: vendors.find(v => v.id === formData.vendorId)?.name || 'Unknown Vendor'
    } as APBill;
    onSave(finalBill);
    onClose();
  };
  
  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...(formData.items || [])];
    (newItems[index] as any)[field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: newItems });
  };
  
  const addItem = () => setFormData(prev => ({ ...prev, items: [...(prev.items || []), { description: '', amount: 0 }] }));
  const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));

  const isEditing = !!bill;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Edit Supplier Bill' : 'New Payable Bill'}</h3>
                <p className="text-xs text-slate-500 font-medium">Log an incoming invoice from a vendor.</p>
              </div>
            </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12} /> Vendor</label>
                <select name="vendorId" value={formData.vendorId || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium" required>
                    <option value="">Select a vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>
            <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={12} /> Bill / Invoice #</label>
                 <input type="text" name="billNumber" value={formData.billNumber || ''} onChange={e => setFormData({...formData, billNumber: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium" required/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> Issue Date</label>
                <input type="date" name="issueDate" value={formData.issueDate || ''} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium" required/>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium" required/>
             </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-slate-100">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Items</label>
             {formData.items?.map((item, index) => (
                 <div key={index} className="flex gap-2 items-center">
                    <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm" />
                    <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">RM</span>
                        <input type="number" placeholder="0.00" value={item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} className="w-full pl-8 pr-2 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-right" />
                    </div>
                    {formData.items && formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>}
                 </div>
             ))}
             <button type="button" onClick={addItem} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 transition-all"><Plus size={14}/> Add Line Item</button>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"><Save size={16} /> {isEditing ? 'Save Changes' : 'Save Bill'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default APBillModal;
