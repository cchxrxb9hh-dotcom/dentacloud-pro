
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Save, ArrowRight, Stethoscope } from 'lucide-react';

interface NextVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { id: string; name: string } | null;
  branchId: string;
  initialTreatment?: string;
  onSchedule: (patientId: string, patientName: string, branchId: string, date: string, time: string, treatmentType: string) => void;
}

const GENERATE_TIME_SLOTS = () => {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    const h = hour.toString().padStart(2, '0');
    slots.push(`${h}:00`);
    if (hour < 21) slots.push(`${h}:30`);
  }
  return slots;
};

const TIME_SLOTS = GENERATE_TIME_SLOTS();

const NextVisitModal: React.FC<NextVisitModalProps> = ({ isOpen, onClose, patient, branchId, initialTreatment, onSchedule }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [treatment, setTreatment] = useState('Routine Check-up');

  useEffect(() => {
    if (isOpen) {
      // Default to next week
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setNewDate(nextWeek.toISOString().split('T')[0]);
      if (initialTreatment) setTreatment(initialTreatment);
    }
  }, [isOpen, initialTreatment]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(patient.id, patient.name, branchId, newDate, newTime, treatment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ArrowRight size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Schedule Next Visit</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Follow-up appointment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Patient</p>
            <p className="text-sm font-bold text-slate-800">{patient.name}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={12} className="text-blue-500" /> Appointment Date
              </label>
              <input 
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} className="text-blue-500" /> Preferred Time
              </label>
              <select 
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm appearance-none cursor-pointer text-slate-900"
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope size={12} className="text-blue-500" /> Treatment Type
              </label>
              <select 
                required
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm appearance-none cursor-pointer text-slate-900"
              >
                <option>Routine Check-up</option>
                <option>Scaling & Polishing</option>
                <option>Composite Filling</option>
                <option>Root Canal Treatment</option>
                <option>Surgical Extraction</option>
                <option>Teeth Whitening</option>
                <option>Porcelain Crown</option>
                <option>Dental Implant</option>
                <option>Invisalign Check-up</option>
              </select>
            </div>
          </div>

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
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Save size={16} /> Schedule Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NextVisitModal;
