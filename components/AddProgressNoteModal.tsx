import React, { useState, useEffect } from 'react';
import { X, Save, ClipboardList, DollarSign } from 'lucide-react';
import { ProgressNote, TreatmentService } from '../types';
import { useUser } from '../App';

interface AddProgressNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<ProgressNote, 'id' | 'patientId' | 'branchId'>) => void;
  noteToEdit?: ProgressNote | null;
}

const AddProgressNoteModal: React.FC<AddProgressNoteModalProps> = ({ isOpen, onClose, onSave, noteToEdit }) => {
  const { currentUser, services } = useUser();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toothNumber, setToothNumber] = useState('');
  const [treatmentPerformed, setTreatmentPerformed] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [plan, setPlan] = useState('');
  const [amount, setAmount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setDate(noteToEdit.date);
        setToothNumber(noteToEdit.toothNumber || '');
        setTreatmentPerformed(noteToEdit.treatmentPerformed);
        
        // Intelligent splitting of notes and plan if they were previously combined
        const planMarker = '\n\nTreatment Plan\n';
        const notesContent = noteToEdit.clinicalNotes || '';
        const planIndex = notesContent.indexOf(planMarker);

        if (planIndex !== -1) {
            setClinicalNotes(notesContent.substring(0, planIndex));
            setPlan(notesContent.substring(planIndex + planMarker.length));
        } else {
            setClinicalNotes(notesContent);
            setPlan(noteToEdit.plan || '');
        }

        setAmount(noteToEdit.amount);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setToothNumber('');
        setTreatmentPerformed('');
        setClinicalNotes('');
        setPlan('');
        setAmount(undefined);
      }
    }
  }, [isOpen, noteToEdit]);

  if (!isOpen) return null;

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTreatmentName = e.target.value;
    setTreatmentPerformed(selectedTreatmentName);

    const selectedService = services.find(service => service.name === selectedTreatmentName);
    if (selectedService) {
        if (selectedService.commonNotes && !noteToEdit) { // Only auto-fill notes for new entries to prevent overwriting
            setClinicalNotes(selectedService.commonNotes);
        }
        // Auto-fill amount if not already set or if it's a new note
        if (amount === undefined || !noteToEdit) {
            setAmount(selectedService.cost);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentPerformed || !clinicalNotes) {
      alert('Please fill out "Treatment Performed" and "Clinical Notes".');
      return;
    }
    
    // Combine notes for display consistency, but 'plan' is also passed separately in the object
    const combinedNotes = plan ? `${clinicalNotes}\n\nTreatment Plan\n${plan}` : clinicalNotes;
      
    onSave({
      date: date,
      dentistName: currentUser?.name || 'Unknown Dentist',
      treatmentPerformed: treatmentPerformed,
      toothNumber: toothNumber,
      clinicalNotes: combinedNotes,
      plan: plan,
      amount: amount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{noteToEdit ? 'Edit Treatment Record' : 'New Progress Note'}</h3>
              <p className="text-xs text-slate-500 font-medium">{noteToEdit ? 'Modify clinical details.' : 'Record a new clinical entry for the patient.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-800"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tooth No.</label>
              <input
                type="text"
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-800"
                placeholder="e.g., 18, 21"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Performed</label>
            <input
              type="text"
              value={treatmentPerformed}
              onChange={handleTreatmentChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-800"
              placeholder="e.g., Composite Filling, Scaling & Polishing"
              required
              list="treatment-list"
            />
            <datalist id="treatment-list">
              {services.map(service => (
                <option key={service.id} value={service.name} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Notes</label>
            <textarea
              rows={5}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium resize-none text-slate-800"
              placeholder="Detailed observations, procedures, and patient feedback..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Steps / Plan</label>
                <input
                  type="text"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800"
                  placeholder="e.g., Routine cleaning in 6 months."
                  list="plan-list"
                />
                <datalist id="plan-list">
                  {services.map(service => (
                    <option key={service.id} value={service.name} />
                  ))}
                </datalist>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign size={12} className="text-emerald-600"/> Cost (RM)
                </label>
                <input
                  type="number"
                  value={amount !== undefined ? amount : ''}
                  onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-800"
                  placeholder="0.00"
                />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95">
              <Save size={16} /> {noteToEdit ? 'Save Changes' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgressNoteModal;