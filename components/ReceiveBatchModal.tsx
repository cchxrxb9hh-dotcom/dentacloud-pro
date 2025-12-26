
import React, { useState, useEffect } from 'react';
import { X, Save, Package, Hash, Calendar, Plus, Box } from 'lucide-react';
import { FormularyItem } from '../types';

interface ReceiveBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, quantity: number, invoice: string) => void;
  inventoryItems: FormularyItem[];
}

const ReceiveBatchModal: React.FC<ReceiveBatchModalProps> = ({ isOpen, onClose, onSave, inventoryItems }) => {
  const [itemId, setItemId] = useState(inventoryItems[0]?.id || '');
  const [quantity, setQuantity] = useState(0);
  const [invoice, setInvoice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItemId(inventoryItems[0]?.id || '');
      setQuantity(0);
      setInvoice('');
    }
  }, [isOpen, inventoryItems]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || quantity <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }
    onSave(itemId, quantity, invoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Package size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">Receive Inventory Batch</h3>
              <p className="text-xs text-black font-medium">Update stock levels from a supplier delivery.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-black uppercase tracking-widest">Stock Item</label>
            <select 
              value={itemId} 
              onChange={e => setItemId(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black"
            >
              {inventoryItems.map(item => <option key={item.id} value={item.id}>{item.name} {item.strength}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><Box size={12} className="text-black" /> Quantity Received</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value) || 0)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black placeholder-slate-500" 
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} className="text-black" /> Supplier Invoice #</label>
              <input 
                type="text" 
                value={invoice} 
                onChange={e => setInvoice(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-black placeholder-slate-500" 
                placeholder="(Optional)"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase text-slate-400 hover:text-black">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 flex items-center gap-2">
              <Save size={16} /> Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiveBatchModal;
