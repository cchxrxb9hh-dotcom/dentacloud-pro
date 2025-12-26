
import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Save, X, UserCog, CreditCard, Heart } from 'lucide-react';
import { Patient } from '../types';

const InputField = ({ label, icon: Icon, type = "text", name, placeholder, value, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center">
      {Icon && <Icon size={12} className="mr-1.5 text-blue-500" />}
      {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm"
      required
    />
  </div>
);

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patient: Patient) => void;
}

// FIX: Define a specific type for form data. In the form, medicalHistory is a string, but in the Patient type it's a string array. This resolves type errors.
type PatientFormData = Omit<Partial<Patient>, 'medicalHistory'> & {
  medicalHistory?: string;
};

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, patient, onSave }) => {
  const [formData, setFormData] = useState<PatientFormData>({});

  useEffect(() => {
    if (patient) {
        const medicalHistoryString = Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(', ') : '';
        setFormData({...patient, medicalHistory: medicalHistoryString});
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medicalHistoryArray = typeof formData.medicalHistory === 'string' 
      ? formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean) 
      : [];
      
    onSave({ ...patient, ...formData, medicalHistory: medicalHistoryArray } as Patient);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl scale-in-95 animate-in flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCog size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Edit Patient Profile</h3>
              <p className="text-xs text-slate-500 font-medium">Updating details for {patient.firstName} {patient.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-x-4 gap-y-6">
          <div className="col-span-1">
            <InputField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
          </div>
          <div className="col-span-1">
            <InputField label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
          </div>
          <div className="col-span-2">
            <InputField label="IC Number (MyKad)" icon={CreditCard} name="icNumber" value={formData.icNumber || ''} onChange={handleChange} />
          </div>
          <div className="col-span-1">
            <InputField label="Email Address" icon={Mail} name="email" type="email" value={formData.email || ''} onChange={handleChange} />
          </div>
          <div className="col-span-1">
            <InputField label="Primary Phone" icon={Phone} name="phone" value={formData.phone || ''} onChange={handleChange} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center">
              <MapPin size={12} className="mr-1.5 text-blue-500" />
              Residential Address
            </label>
            <textarea 
              rows={3}
              name="address"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-black resize-none text-slate-950"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center">
              <Heart size={12} className="mr-1.5 text-red-500" />
              Medical Alerts / Problems
            </label>
            <textarea 
              rows={4}
              name="medicalHistory"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-black resize-none text-slate-950 placeholder-slate-400"
              placeholder="e.g., Allergy to Penicillin, Diabetes. Separate with commas."
              value={formData.medicalHistory || ''}
              onChange={handleChange}
            />
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 flex items-center justify-end space-x-4 bg-slate-50/50">
          <button type="button" onClick={onClose} className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 flex items-center gap-3">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;
