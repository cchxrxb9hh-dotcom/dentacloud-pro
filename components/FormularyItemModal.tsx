
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Pill, Tag, Package, DollarSign, FileSignature } from 'lucide-react';
import { FormularyItem } from '../types';

interface FormularyItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: FormularyItem) => void;
  item: Partial<FormularyItem> | null;
  existingItems?: FormularyItem[];
}

const FormularyItemModal: React.FC<FormularyItemModalProps> = ({ isOpen, onClose, onSave, item, existingItems = [] }) => {
  const [formData, setFormData] = useState<Partial<FormularyItem>>({});

  // Collect unique categories to suggest
  const categorySuggestions = useMemo(() => {
    const cats = new Set(existingItems.map(i => i.category).filter(Boolean));
    // Add default common categories
    ['Antibiotics', 'Analgesics', 'Antiseptics', 'Steroids', 'Anesthetics'].forEach(c => cats.add(c));
    return Array.from(cats).sort();
  }, [existingItems]);

  useEffect(() => {
    if (isOpen) {
      setFormData(item || {
        category: 'Antibiotics',
        dosageForm: 'Tablet',
        stockLevel: 0,
        unitPrice: 0,
        defaultDosage: ''
      });
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItem: FormularyItem = {
      id: item?.id || `med-${Date.now()}`,
      name: formData.name || 'Untitled Medication',
      category: formData.category || 'Other',
      strength: formData.strength || '',
      dosageForm: formData.dosageForm || 'Tablet',
      stockLevel: Number(formData.stockLevel) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      defaultDosage: formData.defaultDosage,
    };
    onSave(finalItem);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const isEditing = !!item?.id;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Pill size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Edit Medication' : 'Add to Formulary'}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">New Clinical Stock Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication Generic Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-sm text-slate-800"
              placeholder="e.g. Amoxicillin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</label>
              <input 
                type="text" 
                name="strength"
                required
                value={formData.strength || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-sm text-slate-800"
                placeholder="e.g. 500mg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage Form</label>
              <select 
                name="dosageForm"
                value={formData.dosageForm}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-800"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid</option>
                <option value="Gel">Gel</option>
                <option value="Rinse">Rinse</option>
                <option value="Cartridge">Injection Cartridge</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Tag size={12} className="text-blue-500" /> Therapeutic Category
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="category"
                list="pharmacy-categories"
                required
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-sm text-slate-800"
                placeholder="Select or type new category..."
              />
              <datalist id="pharmacy-categories">
                {categorySuggestions.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest ml-1">Tip: Type a new name to create a category</p>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileSignature size={12}/> Default Dosage Instructions</label>
            <input 
              type="text" 
              name="defaultDosage"
              value={formData.defaultDosage || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-sm text-slate-800"
              placeholder="e.g. 1 tablet every 8 hours"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Quantity</label>
              <input 
                type="number" 
                name="stockLevel"
                required
                value={formData.stockLevel || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm text-slate-800"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Cost (Standard)</label>
              <input 
                type="number" 
                name="unitPrice"
                step="0.01"
                required
                value={formData.unitPrice || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm text-slate-800"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Save size={16} /> {isEditing ? 'Save Changes' : 'Register Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularyItemModal;
