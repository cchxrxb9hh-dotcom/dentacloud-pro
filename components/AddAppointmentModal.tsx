import React, { useState, useEffect } from 'react';
import { X, Search, User, Stethoscope, Save, Calendar, Clock, UserPlus, ArrowLeft, CreditCard } from 'lucide-react';
import { Patient, Appointment } from '../types';
import MyKadReader from './MyKadReader';
import { useUser } from '../App';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (newAppointment: Omit<Appointment, 'id' | 'duration' | 'status'>, newPatientRecord?: Patient) => void;
  initialSlot: { date: string; time: string; doctorId?: string } | null;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, onSchedule, initialSlot }) => {
  const { patients } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [treatment, setTreatment] = useState('Consultation');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', phone: '', email: '', icNumber: '', address: '' });
  const [isMyKadOpen, setIsMyKadOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedPatient(null);
      setTreatment('Consultation');
      setShowNewPatientForm(false);
      setNewPatient({ firstName: '', lastName: '', phone: '', email: '', icNumber: '', address: '' });
    }
  }, [isOpen]);

  const filteredPatients = searchTerm
    ? patients.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.icNumber && p.icNumber.includes(searchTerm))
      )
    : [];

  const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };
  
  const handleMyKadSuccess = (data: any) => {
    const names = data.fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    setNewPatient(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        icNumber: data.icNumber,
        address: data.address || ''
    }));
    setIsMyKadOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialSlot) return;

    let patientForSchedule: { id: string; name: string; phone?: string; icNumber?: string };
    let newPatientRecord: Patient | undefined = undefined;

    if (selectedPatient) {
        patientForSchedule = {
            id: selectedPatient.id,
            name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
            phone: selectedPatient.phone,
            icNumber: selectedPatient.icNumber,
        };
    } else if (showNewPatientForm && newPatient.firstName && newPatient.lastName && newPatient.phone) {
        const newId = `p-${Math.random().toString(36).substr(2, 9)}`;
        
        // Construct full patient object for global database
        newPatientRecord = {
            id: newId,
            firstName: newPatient.firstName,
            lastName: newPatient.lastName,
            email: newPatient.email,
            phone: newPatient.phone,
            icNumber: newPatient.icNumber,
            address: newPatient.address || 'Not Provided',
            dateOfBirth: '1990-01-01', // Default, should ideally be extracted from IC if possible
            gender: 'Male',
            medicalHistory: [],
            status: 'Active',
            registrationDate: new Date().toISOString().split('T')[0]
        };

        patientForSchedule = {
            id: newId,
            name: `${newPatient.firstName} ${newPatient.lastName}`,
            phone: newPatient.phone,
            icNumber: newPatient.icNumber,
        };
    } else {
        alert('Please select or register a patient.');
        return;
    }

    onSchedule({
      patientId: patientForSchedule.id,
      patientName: patientForSchedule.name,
      patientPhone: patientForSchedule.phone,
      branchId: 'b1', 
      date: initialSlot.date,
      time: initialSlot.time,
      treatmentType: treatment,
      doctorIds: initialSlot.doctorId ? [initialSlot.doctorId] : [],
      type: 'Patient'
    }, newPatientRecord);
    
    onClose();
  };
  
  const isSubmitDisabled = !selectedPatient && !(showNewPatientForm && newPatient.firstName && newPatient.lastName && newPatient.phone);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Appointment</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {initialSlot ? `Scheduling for ${initialSlot.date} at ${initialSlot.time}` : 'Select a patient to begin'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
            {!selectedPatient ? (
              <div className="space-y-4">
                {!showNewPatientForm ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search for an existing patient..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-sm text-slate-950 placeholder-slate-400"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {filteredPatients.map(p => (
                        <button 
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPatient(p)}
                          className="w-full flex items-center gap-3 p-3 text-left bg-white hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all"
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600 border border-blue-100">
                            {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 text-sm">{p.firstName} {p.lastName}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.phone}</p>
                                {p.icNumber && <span className="text-[9px] font-black text-blue-600">IC: {p.icNumber}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                      {searchTerm && filteredPatients.length === 0 && (
                        <div className="text-center py-8 space-y-4">
                          <p className="text-slate-400 text-sm font-medium">No patients found matching your search.</p>
                          <button 
                            type="button"
                            onClick={() => setShowNewPatientForm(true)}
                            className="flex items-center gap-2 mx-auto bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                          >
                            <UserPlus size={16} /> Register New Patient
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">New Patient Details</h4>
                      <div className="flex items-center gap-2">
                          <button
                              type="button"
                              onClick={() => setIsMyKadOpen(true)}
                              className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800"
                          >
                              <CreditCard size={12} /> MyKad
                          </button>
                          <button type="button" onClick={() => setShowNewPatientForm(false)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                              <ArrowLeft size={12}/> Back to Search
                          </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="firstName" placeholder="First Name" value={newPatient.firstName} onChange={handleNewPatientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm" required/>
                      <input type="text" name="lastName" placeholder="Last Name" value={newPatient.lastName} onChange={handleNewPatientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm" required/>
                    </div>
                    <input type="text" name="icNumber" placeholder="IC Number (YYMMDD-XX-XXXX)" value={newPatient.icNumber} onChange={handleNewPatientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm" required/>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="tel" name="phone" placeholder="Phone Number" value={newPatient.phone} onChange={handleNewPatientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm" required/>
                      <input type="email" name="email" placeholder="Email (Optional)" value={newPatient.email} onChange={handleNewPatientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 placeholder-slate-400 shadow-sm"/>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between animate-in fade-in">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Selected Patient</p>
                  <p className="text-base font-black text-slate-950">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs font-bold text-blue-600 hover:underline">Change</button>
              </div>
            )}

            {(selectedPatient || showNewPatientForm) && (
              <div className="space-y-1.5 pt-4 border-t border-slate-100 animate-in fade-in">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Stethoscope size={12} className="text-blue-500" /> Treatment Type
                  </label>
                  <select 
                    required
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-sm text-slate-950"
                  >
                    <option>Consultation</option>
                    <option>Scaling & Polishing</option>
                    <option>Composite Filling</option>
                    <option>Root Canal Treatment</option>
                    <option>Surgical Extraction</option>
                    <option>Teeth Whitening</option>
                    <option>Routine Check-up</option>
                  </select>
                </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitDisabled}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Save size={16} /> Finalize & Book
              </button>
            </div>
          </form>
        </div>
      </div>
      <MyKadReader 
        isOpen={isMyKadOpen}
        onClose={() => setIsMyKadOpen(false)}
        onSuccess={handleMyKadSuccess}
      />
    </>
  );
};

export default AddAppointmentModal;