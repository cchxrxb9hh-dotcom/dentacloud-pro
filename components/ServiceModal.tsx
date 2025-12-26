
import React, { useState, useEffect } from 'react';
import { X, Save, Stethoscope, DollarSign, Clock, MessageSquare, Tag, ClipboardList } from 'lucide-react';
import { TreatmentService } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: TreatmentService) => void;
  service: TreatmentService | null;
  categoryOptions: string[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service, categoryOptions }) => {
  const [formData, setFormData] = useState<Partial<TreatmentService>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(service || {
        category: 'General',
        cost: 0,
        duration: '30 min',
        commonNotes: '',
      });
    }
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalService: TreatmentService = {
      id: service?.id || `svc-${Date.now()}`,
      name: formData.name || 'Untitled Service',
      category: formData.category || 'General',
      description: formData.description || '',
      cost: Number(formData.cost) || 0,
      duration: formData.duration || 'N/A',
      commonNotes: formData.commonNotes || '',
    };
    onSave(finalService);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const isEditing = !!service;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Stethoscope size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
              <p className="text-xs text-slate-500 font-medium">Update your clinic's treatment menu.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-800"
              placeholder="e.g., Comprehensive Consultation"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Tag size={12} /> Category</label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800"
                placeholder="e.g., General, Surgical"
                list="category-suggestions"
                required
              />
              <datalist id="category-suggestions">
                {categoryOptions.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
             <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} /> Cost</label>
              <input 
                type="number"
                name="cost"
                value={formData.cost || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800"
                placeholder="0.00"
                required
              />
            </div>
          </div>
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12} /> Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium resize-none text-slate-800"
                placeholder="A brief summary of the treatment."
                required
              />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> Standard Duration</label>
                <input 
                  type="text"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800"
                  placeholder="e.g., 45 min"
                  required
                />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={12} /> Common Clinical Notes Template</label>
              <textarea
                name="commonNotes"
                rows={5}
                value={formData.commonNotes || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium resize-none text-slate-800"
                placeholder="Enter a default template for progress notes for this service. This can be used to quickly fill out patient records."
              />
            </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 flex items-center gap-2">
              <Save size={16} /> {isEditing ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
