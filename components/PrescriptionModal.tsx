import React, { useState, useEffect, useRef } from 'react';
import { X, Pill, Printer, Save, MapPin, User, Calendar, FileSignature, Plus, Trash2, Building2 } from 'lucide-react';
import { useUser } from '../App';
import { MedicationItem, FormularyItem } from '../types';
import VisualPrescription from './VisualPrescription';

const MOCK_FORMULARY: FormularyItem[] = [
  { id: '1', name: 'Amoxicillin', category: 'Antibiotics', strength: '500mg', dosageForm: 'Capsule', stockLevel: 1240, unitPrice: 0.45, defaultDosage: '1 capsule every 8 hours for 7 days' },
  { id: '2', name: 'Ibuprofen', category: 'Analgesics', strength: '400mg', dosageForm: 'Tablet', stockLevel: 850, unitPrice: 0.12, defaultDosage: '1 tablet every 4-6 hours as needed for pain' },
  { id: '3', name: 'Metronidazole', category: 'Antibiotics', strength: '200mg', dosageForm: 'Tablet', stockLevel: 15, unitPrice: 0.35, defaultDosage: '1 tablet 3 times a day for 5 days' },
  { id: '4', name: 'Chlorhexidine', category: 'Antiseptics', strength: '0.12%', dosageForm: 'Rinse', stockLevel: 42, unitPrice: 4.50, defaultDosage: 'Rinse with 15ml twice daily for 2 weeks' },
  { id: '5', name: 'Clindamycin', category: 'Antibiotics', strength: '300mg', dosageForm: 'Capsule', stockLevel: 320, unitPrice: 1.20, defaultDosage: '1 capsule every 6 hours for 7 days' },
  { id: '6', name: 'Dexamethasone', category: 'Steroids', strength: '0.5mg', dosageForm: 'Tablet', stockLevel: 120, unitPrice: 0.60, defaultDosage: '1 tablet daily for 3 days' },
  { id: '7', name: 'Lidocaine', category: 'Anesthetics', strength: '2%', dosageForm: 'Cartridge', stockLevel: 500, unitPrice: 0.85, defaultDosage: 'For professional use only' },
];


interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { id: string; name: string; address: string };
  onSave: (data: { name: string; content: string; items: MedicationItem[] }) => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ isOpen, onClose, patient, onSave }) => {
  const { currentUser, settings } = useUser();
  const printRef = useRef<HTMLDivElement>(null);
  const [branchId, setBranchId] = useState(settings.branches[0]?.id || '');
  const [serialNumber, setSerialNumber] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    prescriberName: currentUser?.name || '',
    clinicAddress: settings.branches[0]?.address || '',
    items: [{ medication: '', dosage: '' }] as MedicationItem[]
  });

  useEffect(() => {
    if (isOpen) {
      const selectedBranch = settings.branches.find(b => b.id === branchId);
      setSerialNumber(`RX-${Date.now()}`);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        prescriberName: currentUser?.name || '',
        clinicAddress: selectedBranch?.address || '',
        items: [{ medication: '', dosage: '' }]
      });
    }
  }, [isOpen, currentUser, settings, branchId]);

  if (!isOpen) return null;
  
  const handleAddItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { medication: '', dosage: '' }] }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleItemChange = (index: number, field: keyof MedicationItem, value: string) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;

    if (field === 'medication') {
        const selectedMed = MOCK_FORMULARY.find(med => `${med.name} ${med.strength}` === value);
        if (selectedMed && selectedMed.defaultDosage) {
            newItems[index].dosage = selectedMed.defaultDosage;
        }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const name = `Prescription - ${serialNumber}`;
    
    onSave({ name, content, items: formData.items });
    onClose();
  };
  
  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write('<html><head><title>Print Prescription</title>');
        printWindow.document.write('<style>body { font-family: "Inter", sans-serif; margin: 2rem; } .prose { color: #334155; line-height: 1.6; } .prose h4 { font-size: 1.25rem; font-weight: 900; } .prose p { margin: 0.5em 0; } .prose .font-serif { font-family: serif; } .prose strong { font-weight: 700; }</style>');
        printWindow.document.write('</head><body class="prose">');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  const selectedBranch = settings.branches.find(b => b.id === branchId);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Pill size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">New Prescription</h3>
              <p className="text-xs text-slate-500 font-medium">Drafting medical instructions for {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Side */}
          <form id="prescription-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12} /> Prescriber</label>
                <input type="text" required value={formData.prescriberName} onChange={(e) => setFormData({...formData, prescriberName: e.target.value})} className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12} /> Issuing Branch</label>
              <select 
                value={branchId} 
                onChange={e => setBranchId(e.target.value)} 
                className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800"
              >
                {settings.branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
                {formData.items.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Pill size={12}/> Medication #{index + 1}</label>
                            <input 
                                type="text" 
                                required 
                                value={item.medication} 
                                onChange={e => handleItemChange(index, 'medication', e.target.value)} 
                                placeholder="e.g. Amoxicillin 500mg" 
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                                list={`meds-list-${index}`}
                            />
                             <datalist id={`meds-list-${index}`}>
                                {MOCK_FORMULARY.map(med => (
                                    <option key={med.id} value={`${med.name} ${med.strength}`} />
                                ))}
                            </datalist>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileSignature size={12}/> Dosage & Instructions</label>
                            <input type="text" required value={item.dosage} onChange={e => handleItemChange(index, 'dosage', e.target.value)} placeholder="e.g. 1 cap every 8h for 7 days" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800"/>
                        </div>
                        {formData.items.length > 1 && (
                            <button type="button" onClick={() => handleRemoveItem(index)} className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 hover:bg-red-50 rounded-full border border-slate-200 shadow-sm transition-all">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddItem} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Plus size={16} /> Add Another Medication
                </button>
            </div>
          </form>

          {/* Preview Side */}
          <div className="bg-slate-50 rounded-[40px] border border-slate-200 p-1 flex flex-col">
            <div ref={printRef} className="flex-1">
              <VisualPrescription patientName={patient.name} data={formData} branchName={selectedBranch?.name} serialNumber={serialNumber} />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/30">
          <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
            Discard
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 border border-slate-200">
            <Printer size={16} /> Print
          </button>
          <button type="submit" form="prescription-form" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-3">
            <Save size={18} /> Finalize
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;