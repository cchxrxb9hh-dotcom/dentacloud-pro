
import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Heart, Save, X, UserPlus, CreditCard } from 'lucide-react';
import MyKadReader from './MyKadReader';
import { useUser } from '../App';
import { Patient } from '../types';

const InputField = ({ label, icon: Icon, type = "text", name, placeholder, value, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
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

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPatient: Patient) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    icNumber: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male' as Patient['gender'],
    address: '',
    medicalHistory: '',
  });

  const [isMyKadOpen, setIsMyKadOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      ...formData,
      medicalHistory: formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (onSuccess) {
      onSuccess(newPatient);
    }
    onClose();
  };

  const handleMyKadSuccess = (data: any) => {
    const names = data.fullName.split(' ');
    const first = names[0];
    const last = names.slice(1).join(' ');

    setFormData({
      ...formData,
      firstName: first,
      lastName: last,
      icNumber: data.icNumber,
      dateOfBirth: data.dob,
      gender: data.gender,
      address: data.address
    });
    setIsMyKadOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl scale-in-95 animate-in flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Patient Registration</h3>
              <p className="text-xs text-slate-500 font-medium">Create a new comprehensive electronic medical record.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMyKadOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              <CreditCard size={14} /> Auto-fill with MyKad
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">Personal Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="First Name" 
                  name="firstName" 
                  placeholder="John" 
                  value={formData.firstName}
                  onChange={(e: any) => setFormData({...formData, firstName: e.target.value})}
                />
                <InputField 
                  label="Last Name" 
                  name="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={(e: any) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Date of Birth" 
                  type="date" 
                  name="dateOfBirth" 
                  value={formData.dateOfBirth}
                  onChange={(e: any) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biological Gender</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-black text-slate-950 shadow-sm"
                    value={formData.gender}
                    onChange={(e: any) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <InputField 
                label="IC Number (MyKad)" 
                icon={CreditCard} 
                name="icNumber"
                placeholder="XXXXXX-XX-XXXX" 
                value={formData.icNumber}
                onChange={(e: any) => setFormData({...formData, icNumber: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Email Address" 
                  type="email" 
                  name="email"
                  icon={Mail} 
                  placeholder="john.doe@medical.com" 
                  value={formData.email}
                  onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                />
                <InputField 
                  label="Primary Phone" 
                  icon={Phone} 
                  name="phone"
                  placeholder="+60 1X-XXXXXXX" 
                  value={formData.phone}
                  onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">Clinical Context</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin size={12} className="mr-1.5 text-blue-500" />
                  Residential Address
                </label>
                <textarea 
                  rows={3}
                  name="address"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-black text-slate-950 shadow-sm placeholder-slate-400"
                  placeholder="Full street address, city, state" 
                  value={formData.address}
                  onChange={(e: any) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Heart size={12} className="mr-1.5 text-red-500" />
                  Medical Problems
                </label>
                <textarea 
                  rows={3}
                  name="medicalHistory"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-black text-slate-950 shadow-sm placeholder-slate-400"
                  placeholder="e.g., Allergy to Penicillin, Diabetes, Hypertension. Separate with commas."
                  value={formData.medicalHistory}
                  onChange={(e: any) => setFormData({...formData, medicalHistory: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 flex items-center justify-end space-x-4 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit}
            className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
          >
            <Save size={16} /> Finalize & Register
          </button>
        </div>
      </div>

      <MyKadReader 
        isOpen={isMyKadOpen} 
        onClose={() => setIsMyKadOpen(false)} 
        onSuccess={handleMyKadSuccess} 
      />
    </div>
  );
};

export default AddPatientModal;
