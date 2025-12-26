import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Search, Filter, Eye, Edit2, Mail, Phone, UserPlus, CreditCard } from 'lucide-react';
import { Patient } from '../types';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import { useUser } from '../App';

const { useNavigate } = ReactRouterDOM;

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, patients, addPatient, updatePatient, addAuditEntry } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.icNumber && p.icNumber.includes(searchTerm))
  );

  const canAddOrEditPatient = ['Admin', 'Doctor', 'Assistant'].includes(currentUser.role);

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleSavePatient = (patient: Patient) => {
    addPatient(patient);
    addAuditEntry('Registered New Patient', 'Clinical', `Identity: ${patient.firstName} ${patient.lastName}`);
    setIsAddModalOpen(false);
  };

  const handleUpdatePatient = (patient: Patient) => {
    updatePatient(patient);
    addAuditEntry('Updated Patient Profile', 'Clinical', `Updated details for ${patient.firstName} ${patient.lastName}`);
    setIsEditModalOpen(false);
    setEditingPatient(null);
  };

  const calculateAgeFromPatient = (patient: Patient): number => {
    let dob: Date;
    
    // Attempt to get DOB from IC Number first (Format: YYMMDD...)
    if (patient.icNumber && patient.icNumber.replace(/\D/g, '').length >= 6) {
      const cleanIc = patient.icNumber.replace(/\D/g, '');
      const yy = parseInt(cleanIc.substring(0, 2));
      const mm = parseInt(cleanIc.substring(2, 4)) - 1; // Month is 0-indexed
      const dd = parseInt(cleanIc.substring(4, 6));
      
      const currentYear = new Date().getFullYear();
      const currentYY = currentYear % 100;
      
      // If YY is greater than current YY, assume 1900s, else 2000s
      const century = yy > currentYY ? 1900 : 2000;
      dob = new Date(century + yy, mm, dd);
    } else {
      // Fallback to provided dateOfBirth field
      dob = new Date(patient.dateOfBirth);
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return isNaN(age) ? 0 : age;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Patient Database</h1>
          <p className="text-slate-600 font-medium text-sm">Comprehensive clinical records management.</p>
        </div>
        <div className="flex items-center gap-3">
          {canAddOrEditPatient && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="relative flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              <span className="absolute -inset-0.5 rounded-2xl bg-inherit blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <UserPlus size={16} /> New Patient
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or IC..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium placeholder-slate-400"
          />
        </div>
        <button className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">#</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">Clinical Data</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">Last Visit</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((patient, idx) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-8 py-5" onClick={() => navigate(`/patients/${patient.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm border-2 border-white shadow-sm uppercase">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{patient.firstName} {patient.lastName}</p>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tight">{patient.gender} • {calculateAgeFromPatient(patient)} years</p>
                        {patient.icNumber && (
                          <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5 flex items-center gap-1">
                            <CreditCard size={10} /> {patient.icNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-slate-700 font-medium">
                        <Mail size={12} className="mr-2 text-slate-400" /> {patient.email}
                      </div>
                      <div className="flex items-center text-xs text-slate-700 font-medium">
                        <Phone size={12} className="mr-2 text-slate-400" /> {patient.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-800">{patient.lastVisit || 'Initial Consultation'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      patient.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      {canAddOrEditPatient && (
                        <button 
                          onClick={() => handleOpenEditModal(patient)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                          title="Edit Profile"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleSavePatient}
      />
      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={editingPatient}
        onSave={handleUpdatePatient}
      />
    </div>
  );
};

export default PatientList;