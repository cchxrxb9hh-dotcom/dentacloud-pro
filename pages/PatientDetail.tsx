import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Receipt, 
  User, 
  Heart, 
  AlertTriangle, 
  FilePlus2, 
  Edit, 
  ClipboardList, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Activity, 
  Image as ImageIcon, 
  Upload, 
  Camera, 
  Search, 
  ExternalLink, 
  Download, 
  Edit2, 
  CreditCard, 
  List, 
  FileCheck, 
  FileBadge, 
  Clock, 
  Scan, 
  Wallet,
  Filter,
  Printer,
  CheckCircle2,
  X,
  Pill,
  Link as LinkIcon
} from 'lucide-react';
import { useUser } from '../App';
import { Invoice, Patient, ProgressNote, ClinicalFile, MedicationItem } from '../types';
import DentalChart from '../components/DentalChart';
import AddProgressNoteModal from '../components/AddProgressNoteModal';
import BillingModal from '../components/BillingModal';
import EditPatientModal from '../components/EditPatientModal';
import ImageViewer from '../components/ImageViewer';
import CameraModal from '../components/CameraModal';
import MedicalCertificateModal from '../components/MedicalCertificateModal';
import ReferralModal from '../components/ReferralModal';
import TimeSlipModal from '../components/TimeSlipModal';
import PrescriptionModal from '../components/PrescriptionModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { launchNNT } from '../services/integrationService';

const { useParams, useNavigate } = ReactRouterDOM;

// Internal price lookup to calculate RM 40.00 for the sample case
const PHARMACY_PRICE_LOOKUP: Record<string, number> = {
    'Amoxicillin 500mg': 15.00,
    'Ibuprofen 400mg': 12.50,
    'Metronidazole 200mg': 18.00,
    'Chlorhexidine 0.12%': 22.00,
    'Chlorhexidine Rinse 0.12%': 22.00,
    'Clindamycin 300mg': 35.00,
    'Dexamethasone 0.5mg': 10.00,
};

interface TreatmentLogItem {
  id: string;
  invoiceId?: string;
  date: string;
  tooth?: string;
  treatment: string;
  description: string;
  doctor: string;
  staff?: string;
  amount?: number;
  status: 'Completed' | 'Planned' | 'Existing';
  paymentStatus?: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  type: 'Note' | 'Billing';
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, addAuditEntry, globalInvoices, addInvoice, patients, updatePatient, deleteInvoice, updateInvoice, settings } = useUser();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [files, setFiles] = useState<ClinicalFile[]>([]);
  const [chartData, setChartData] = useState<any>({});
  
  const [activeLogTab, setActiveLogTab] = useState<'ALL' | 'PLANNED' | 'COMPLETED' | 'EXISTING' | 'DOCUMENTS' | 'BILLING' | 'PHOTOS'>('ALL');
  
  const [billingStatusFilter, setBillingStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid'>('All');
  const [billingStartDate, setBillingStartDate] = useState('');
  const [billingEndDate, setBillingEndDate] = useState('');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProgressNote | null>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingModalProps, setBillingModalProps] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<ClinicalFile | null>(null);
  
  const [isMedicalCertModalOpen, setIsMedicalCertModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isTimeSlipModalOpen, setIsTimeSlipModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  const [openLogMenuId, setOpenLogMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const foundPatient = patients.find(p => p.id === id);
    if(foundPatient) setPatient(foundPatient);

    const savedNotes = localStorage.getItem(`denta_notes_${id}`);
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    const savedChart = localStorage.getItem(`denta_chart_${id}`);
    if (savedChart) setChartData(JSON.parse(savedChart));

    const savedFiles = localStorage.getItem(`denta_files_${id}`);
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    
  }, [id, patients]);

  const persistFiles = (updatedFiles: ClinicalFile[]) => {
    setFiles(updatedFiles);
    localStorage.setItem(`denta_files_${id}`, JSON.stringify(updatedFiles));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file: File) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newFile: ClinicalFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          url: isImage ? result : '#',
          category: isImage ? 'Picture' : 'Document',
          date: new Date().toISOString().split('T')[0],
          content: !isImage ? result : undefined
        };
        persistFiles([...files, newFile]);
      };
      if (isImage) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
    addAuditEntry('Uploaded Patient Files', 'Clinical', `${uploadedFiles.length} file(s) for ${patient?.firstName}`);
  };

  const handleCapture = (base64Image: string) => {
    const newFile: ClinicalFile = {
      id: `scan-${Date.now()}`,
      name: `Clinical Capture - ${new Date().toLocaleDateString()}.jpg`,
      url: base64Image,
      category: 'Picture',
      date: new Date().toISOString().split('T')[0],
    };
    persistFiles([...files, newFile]);
    addAuditEntry('Captured Clinical Image', 'Clinical', `Photo for ${patient?.firstName}`);
  };

  const handleSaveDocument = (data: { name: string, content: string }) => {
    const newFile: ClinicalFile = {
      id: `doc-${Date.now()}`,
      name: data.name,
      url: '#',
      category: 'Document',
      date: new Date().toISOString().split('T')[0],
      content: data.content
    };
    persistFiles([...files, newFile]);
    addAuditEntry('Generated Clinical Document', 'Clinical', `Created ${data.name}`);
  };

  const handleSavePrescription = (data: { name: string, content: string, items: MedicationItem[] }) => {
    // 1. Save document to digital folder
    handleSaveDocument({ name: data.name, content: data.content });

    // 2. Reflect in progress notes
    const activeMeds = data.items.filter(i => i.medication);
    const medNames = activeMeds.map(i => i.medication.toUpperCase()).join(', ');
    const medInstructions = activeMeds.map(i => i.dosage).join(', ');
    
    // Calculate subtotal price based on lookup
    const subtotal = activeMeds.reduce((sum, med) => {
        const price = PHARMACY_PRICE_LOOKUP[med.medication] || 0;
        return sum + price;
    }, 0);
    
    // Calculate total including tax (SST 6%)
    const taxRate = settings.taxSstRate || 6;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const newNote: ProgressNote = {
        id: `note-rx-${Date.now()}`,
        patientId: id!,
        branchId: 'b1',
        date: new Date().toISOString().split('T')[0],
        dentistName: currentUser?.name || 'Doctor',
        treatmentPerformed: medNames || 'MEDICATION PRESCRIBED',
        clinicalNotes: medInstructions || 'No instructions provided.',
        plan: '',
        amount: totalAmount 
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem(`denta_notes_${id}`, JSON.stringify(updatedNotes));

    // 3. Automatically create invoice for medication
    if (totalAmount > 0 && patient) {
        const newInvoice: Invoice = {
          id: `INV-RX-${Date.now()}`,
          recordType: 'Invoice',
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          branchId: 'b1',
          date: newNote.date,
          amount: totalAmount,
          status: 'Pending',
          items: activeMeds.map(m => ({ 
            description: m.medication.toUpperCase(), 
            price: PHARMACY_PRICE_LOOKUP[m.medication] || 0 
          })),
          providerId: currentUser?.id,
          providerName: newNote.dentistName,
          paidAmount: 0
        };
        addInvoice(newInvoice);
        addAuditEntry('Auto-generated Medication Invoice', 'Financial', `Generated from prescription: ${medNames}`);
    }
    
    addAuditEntry('Prescribed Medication', 'Clinical', `Meds: ${activeMeds.length} items, Total Val (inc tax): RM${totalAmount.toFixed(2)}`);
  };

  const handleBridgeNNT = async () => {
    if (!patient) return;
    const result = await launchNNT(patient.id, patient.externalImagingId);
    if (result.success) {
        addAuditEntry('Launched Imaging Bridge', 'Clinical', result.message);
    } else {
        alert('Could not bridge to NNT. Please ensure the local agent is running.');
    }
  };

  const handleSaveNote = (noteData: Omit<ProgressNote, 'id' | 'patientId' | 'branchId'>) => {
    if (editingNote) {
      const updatedNotes = notes.map(note => note.id === editingNote.id ? { ...editingNote, ...noteData } : note);
      setNotes(updatedNotes);
      localStorage.setItem(`denta_notes_${id}`, JSON.stringify(updatedNotes));
    } else {
      const newNote: ProgressNote = { ...noteData, id: `note-${Date.now()}`, patientId: id!, branchId: 'b1' };
      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem(`denta_notes_${id}`, JSON.stringify(updated));

      if (noteData.amount && noteData.amount > 0 && patient) {
        const newInvoice: Invoice = {
          id: `INV-${Date.now()}`,
          recordType: 'Invoice',
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          branchId: 'b1',
          date: noteData.date,
          amount: noteData.amount,
          status: 'Pending',
          items: [{ description: noteData.treatmentPerformed, price: noteData.amount }],
          providerId: currentUser?.id,
          providerName: noteData.dentistName,
          paidAmount: 0
        };
        addInvoice(newInvoice);
        addAuditEntry('Auto-generated Invoice', 'Financial', `Generated from treatment: ${noteData.treatmentPerformed}`);
      }
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this clinical note? This action cannot be undone.')) {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(`denta_notes_${id}`, JSON.stringify(updatedNotes));
      addAuditEntry('Deleted Progress Note', 'Clinical', `Deleted note for patient ${patient?.firstName}`);
    }
  };

  const handleEditTreatment = (log: TreatmentLogItem) => {
    if (log.type === 'Note') {
      const note = notes.find(n => n.id === log.id);
      if (note) {
        setEditingNote(note);
        setIsNoteModalOpen(true);
      }
    } else {
      handleEditInvoiceById(log.invoiceId!);
    }
    setOpenLogMenuId(null);
  };

  const handleEditInvoiceById = (invoiceId: string) => {
      const inv = globalInvoices.find(i => i.id === invoiceId);
      if (inv) {
        const isPaid = inv.status === 'Paid';
        const isReceipt = inv.recordType === 'Receipt';
        
        setBillingModalProps({ 
          patient: { id: patient!.id, name: `${patient!.firstName} ${patient!.lastName}` }, 
          initialItems: inv.items, 
          initialBranchId: inv.branchId, 
          invoiceId: inv.id, 
          initialDate: inv.date, 
          initialType: isReceipt ? 'Receipt' : (isPaid ? 'Receipt' : 'Invoice'),
          initialPaidAmount: inv.paidAmount || (isPaid ? inv.amount : 0),
          isEditing: true 
        });
        setIsBillingOpen(true);
      }
  };

  const handlePay = (log: TreatmentLogItem) => {
    if (!log.invoiceId) return;
    handlePayInvoiceById(log.invoiceId);
    setOpenLogMenuId(null);
  };

  const handlePayInvoiceById = (invoiceId: string) => {
    const inv = globalInvoices.find(i => i.id === invoiceId);
    if (inv) {
        setBillingModalProps({
            patient: { id: patient!.id, name: `${patient!.firstName} ${patient!.lastName}` },
            initialItems: inv.items,
            initialBranchId: inv.branchId,
            invoiceId: inv.id,
            initialDate: new Date().toISOString().split('T')[0],
            initialType: 'Receipt',
            initialPaidAmount: inv.paidAmount || 0,
            isEditing: false, 
            relatedInvoiceId: inv.id 
        });
        setIsBillingOpen(true);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
      setInvoiceToDelete(invoiceId);
      setOpenLogMenuId(null); 
  };

  const confirmDeleteInvoice = () => {
      if (invoiceToDelete) {
          deleteInvoice(invoiceToDelete);
          setInvoiceToDelete(null);
          addAuditEntry('Voided Invoice', 'Financial', `Invoice ID: ${invoiceToDelete}`);
      }
  };

  const outstandingBalance = useMemo(() => {
    const totalInvoiced = globalInvoices
        .filter(inv => inv.patientId === id && inv.recordType === 'Invoice')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPaid = globalInvoices
        .filter(inv => inv.patientId === id && inv.recordType === 'Receipt')
        .reduce((sum, inv) => sum + inv.amount, 0);

    return totalInvoiced - totalPaid;
  }, [globalInvoices, id]);

  const totalPaidByPatient = useMemo(() => {
    return globalInvoices
        .filter(inv => inv.patientId === id && inv.recordType === 'Receipt')
        .reduce((sum, inv) => sum + inv.amount, 0);
  }, [globalInvoices, id]);

  const handlePayBalance = () => {
    const unpaidInvoices = globalInvoices.filter(inv => 
        inv.patientId === id && 
        inv.recordType !== 'Receipt' && 
        (inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partially Paid')
    );
    
    // Allow pre-payment/credit even if no unpaid invoices exist
    const items = unpaidInvoices.length > 0 
        ? unpaidInvoices.flatMap(inv => inv.items)
        : [{ description: 'Credit Pre-payment', price: 0 }];
        
    const invoiceIds = unpaidInvoices.map(inv => inv.id);

    setBillingModalProps({
        patient: { id: patient!.id, name: `${patient!.firstName} ${patient!.lastName}` },
        initialItems: items,
        initialBranchId: unpaidInvoices[0]?.branchId || 'b1',
        initialDate: new Date().toISOString().split('T')[0],
        initialType: 'Receipt',
        isEditing: false,
        relatedInvoiceIds: invoiceIds,
        initialPaidAmount: Math.max(0, outstandingBalance)
    });
    setIsBillingOpen(true);
  };

  const combinedLog = useMemo(() => {
    const log: TreatmentLogItem[] = [];
    const notesMap = new Map<string, TreatmentLogItem[]>();

    notes.forEach(note => {
      const item: TreatmentLogItem = { 
        id: note.id, 
        date: note.date, 
        tooth: note.toothNumber, 
        treatment: note.treatmentPerformed, 
        description: note.clinicalNotes, 
        doctor: note.dentistName, 
        amount: note.amount, 
        status: 'Completed', 
        type: 'Note' 
      };
      log.push(item);
      
      const key = `${note.date}-${note.treatmentPerformed.trim().toLowerCase()}-${note.amount ? note.amount.toFixed(2) : '0.00'}`;
      if (!notesMap.has(key)) {
        notesMap.set(key, []);
      }
      notesMap.get(key)!.push(item);
    });

    globalInvoices.filter(inv => inv.patientId === id && inv.recordType !== 'Receipt').forEach(inv => {
      inv.items.forEach(item => {
        const key = `${inv.date}-${item.description.trim().toLowerCase()}-${item.price ? item.price.toFixed(2) : '0.00'}`;
        const matchingNotes = notesMap.get(key);
        
        if (matchingNotes && matchingNotes.length > 0) {
          const noteToLink = matchingNotes.shift(); 
          if (noteToLink) {
            noteToLink.invoiceId = inv.id;
            noteToLink.paymentStatus = inv.status;
          }
        }
      });
    });

    return log.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(item => activeLogTab === 'ALL' || item.status.toUpperCase() === activeLogTab);
  }, [id, globalInvoices, notes, activeLogTab]);

  const filteredPatientInvoices = useMemo(() => {
      if (!patient) return [];
      return globalInvoices
        .filter(inv => {
            const isPatient = inv.patientId === id;
            const isStatus = billingStatusFilter === 'All' || inv.status === billingStatusFilter;
            const dateObj = new Date(inv.date);
            const isAfterStart = !billingStartDate || dateObj >= new Date(billingStartDate);
            const isBeforeEnd = !billingEndDate || dateObj <= new Date(billingEndDate);
            return isPatient && isStatus && isAfterStart && isBeforeEnd;
        })
        .sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return b.id.localeCompare(a.id);
        });
  }, [globalInvoices, id, patient, billingStatusFilter, billingStartDate, billingEndDate]);

  const imageFiles = useMemo(() => files.filter(f => f.category !== 'Document'), [files]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openLogMenuId && !(event.target as Element).closest('.log-menu-container')) {
        setOpenLogMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openLogMenuId]);

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Paid': return 'bg-emerald-100 text-emerald-700';
          case 'Overdue': return 'bg-red-100 text-red-700';
          case 'Partially Paid': return 'bg-blue-100 text-blue-700';
          default: return 'bg-amber-100 text-amber-700';
      }
  };

  const calculateAgeFromPatient = (p: Patient): number => {
    let dob: Date;
    if (p.icNumber && p.icNumber.replace(/\D/g, '').length >= 6) {
      const cleanIc = p.icNumber.replace(/\D/g, '');
      const yy = parseInt(cleanIc.substring(0, 2));
      const mm = parseInt(cleanIc.substring(2, 4)) - 1;
      const dd = parseInt(cleanIc.substring(4, 6));
      const currentYear = new Date().getFullYear();
      const currentYY = currentYear % 100;
      const century = yy > currentYY ? 1900 : 2000;
      dob = new Date(century + yy, mm, dd);
    } else {
      dob = new Date(p.dateOfBirth);
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return isNaN(age) ? 0 : age;
  };

  if (!patient) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft size={24} /></button>
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase italic">{patient.firstName} {patient.lastName} <span className="text-slate-300 font-bold ml-2">#{patient.id}</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6 flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">Medical Context</p>
            
            <div className="space-y-4 text-xs font-bold text-slate-400 px-1 flex-1">
              <p className="flex justify-between border-b border-slate-50 pb-2"><span>IC:</span> <span className="text-slate-900 font-black tracking-tight">{patient.icNumber}</span></p>
              <p className="flex justify-between border-b border-slate-50 pb-2"><span>DOB:</span> <span className="text-slate-900 font-black tracking-tight">{patient.dateOfBirth} ({calculateAgeFromPatient(patient)}y)</span></p>
              <p className="flex justify-between border-b border-slate-50 pb-2"><span>Phone:</span> <span className="text-slate-900 font-black tracking-tight">{patient.phone}</span></p>
            </div>

            <div className="p-6 bg-red-50 rounded-[24px] border border-red-100 mt-6">
              <h3 className="text-xs font-black text-red-700 uppercase flex items-center gap-2 mb-3"><AlertTriangle size={16}/> ALERTS</h3>
              <p className="text-xs font-bold text-red-900 leading-relaxed">{patient.medicalHistory.join(', ') || 'No known clinical alerts'}</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-full">
            <DentalChart data={chartData} onChange={(d) => { setChartData(d); localStorage.setItem(`denta_chart_${id}`, JSON.stringify(d)); }} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setIsNoteModalOpen(true)} 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 border-b-4 border-blue-800"
               >
                 <Plus size={16} /> ENTER TREATMENT
               </button>

               <button 
                onClick={() => setIsPrescriptionModalOpen(true)} 
                className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-200 transition-all shadow-sm active:scale-95"
                title="Add Medication"
               >
                 <Pill size={24} />
               </button>
               
               <div className="h-10 w-px bg-slate-200 hidden md:block" />
               
               <div className="flex items-center gap-6">
                  <div className="bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-inner">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Total Outstanding
                      </p>
                      <p className={`text-lg font-black leading-none ${outstandingBalance > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                          RM {Math.abs(outstandingBalance).toFixed(2)}
                      </p>
                  </div>
                  <button 
                      onClick={handlePayBalance}
                      className={`group relative flex items-center gap-3 px-8 py-3 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 overflow-hidden ${outstandingBalance <= 0 ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                  >
                      <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                      <Wallet size={16} className="relative z-10" /> 
                      <span className="relative z-10">{outstandingBalance <= 0 ? 'ADD CREDIT' : 'RECEIVE PAYMENT'}</span>
                  </button>
               </div>
            </div>

            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                    onClick={() => setActiveLogTab('ALL')}
                    className={`p-2.5 rounded-xl transition-all ${activeLogTab === 'ALL' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Treatment Log"
                >
                    <List size={20} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setActiveLogTab('BILLING')}
                    className={`p-2.5 rounded-xl transition-all ${activeLogTab === 'BILLING' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Billing History"
                >
                    <CreditCard size={20} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setActiveLogTab('DOCUMENTS')}
                    className={`p-2.5 rounded-xl transition-all ${activeLogTab === 'DOCUMENTS' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Documents"
                >
                    <FileText size={20} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setActiveLogTab('PHOTOS')}
                    className={`p-2.5 rounded-xl transition-all ${activeLogTab === 'PHOTOS' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Photos & X-Rays"
                >
                    <ImageIcon size={20} strokeWidth={2.5} />
                </button>
            </div>
         </div>

         <div className="max-h-[600px] overflow-y-auto pb-20">
            {activeLogTab === 'DOCUMENTS' || activeLogTab === 'PHOTOS' ? (
                <div className="p-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {activeLogTab === 'DOCUMENTS' && (
                        <>
                            <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer text-slate-400 hover:text-blue-600">
                                <Upload size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Upload Files</span>
                            </div>
                            <div onClick={() => setIsMedicalCertModalOpen(true)} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer text-slate-400 hover:text-emerald-600">
                                <FileCheck size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Medical Cert</span>
                            </div>
                            <div onClick={() => setIsReferralModalOpen(true)} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer text-slate-400 hover:text-indigo-600">
                                <FileBadge size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Referral Letter</span>
                            </div>
                            <div onClick={() => setIsTimeSlipModalOpen(true)} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer text-slate-400 hover:text-amber-600">
                                <Clock size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Time Slip</span>
                            </div>
                            <div onClick={() => setIsPrescriptionModalOpen(true)} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer text-slate-400 hover:text-rose-600">
                                <Pill size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Prescription</span>
                            </div>
                        </>
                    )}

                    {activeLogTab === 'PHOTOS' && (
                        <>
                             <div onClick={() => setIsCameraOpen(true)} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer text-slate-400 hover:text-blue-600">
                                <Camera size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Capture</span>
                            </div>
                            <div onClick={handleBridgeNNT} className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer text-slate-400 hover:text-purple-600">
                                <Scan size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">X-Ray Bridge</span>
                            </div>
                        </>
                    )}

                    {files
                        .filter(f => activeLogTab === 'PHOTOS' ? f.category !== 'Document' : f.category === 'Document')
                        .map((file) => {
                        const isImage = file.category !== 'Document';
                        const handleClick = () => {
                            if (isImage) {
                                const idx = imageFiles.findIndex(f => f.id === file.id);
                                if (idx !== -1) { setSelectedImageIndex(idx); setIsImageViewerOpen(true); }
                            } else {
                                setViewingDocument(file);
                            }
                        };
                        return (
                            <div key={file.id} onClick={handleClick} className="group flex flex-col items-center gap-4 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 cursor-pointer hover:border-blue-400 hover:bg-white transition-all shadow-sm">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                    {file.category === 'Picture' ? <ImageIcon size={32} /> : file.category === 'X-Ray' ? <Activity size={32} /> : <FileText size={32} />}
                                </div>
                                <div className="text-center w-full px-1">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{file.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{file.date}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : activeLogTab === 'BILLING' ? (
                <div className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Filter size={18} className="text-slate-400" />
                            <select 
                                value={billingStatusFilter} 
                                onChange={(e) => setBillingStatusFilter(e.target.value as any)}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
                            >
                                <option value="All">All Transactions</option>
                                <option value="Paid">Paid Only</option>
                                <option value="Pending">Unpaid</option>
                                <option value="Partially Paid">Partial</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Total Paid Portfolio</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">
                                RM {totalPaidByPatient.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-[32px] border border-slate-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-8 py-5">Ref #</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Summary</th>
                                    <th className="px-8 py-5 text-right">Total</th>
                                    <th className="px-8 py-5 text-right">Paid</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatientInvoices.map(inv => {
                                    const isReceipt = inv.recordType === 'Receipt';
                                    return (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-xs font-black text-slate-700">{inv.id}</td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-500">{inv.date}</td>
                                        <td className="px-8 py-5 text-xs text-slate-600 max-w-[240px] truncate font-medium">
                                            {inv.items.map(i => i.description).join(', ')}
                                        </td>
                                        <td className="px-8 py-5 text-right text-xs font-black text-slate-900">RM {inv.amount.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-emerald-600">RM {(isReceipt ? inv.amount : (inv.paidAmount || 0)).toFixed(2)}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border ${getStatusColor(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!isReceipt && inv.status !== 'Paid' && (
                                                    <button onClick={() => handlePayInvoiceById(inv.id)} className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-white rounded-xl transition-all shadow-sm" title="Pay Invoice">
                                                        <CreditCard size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEditInvoiceById(inv.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                                    <Printer size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <table className="w-full text-left text-xs table-fixed border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-6 w-32">Date</th>
                      <th className="p-6 w-48">Treatment</th>
                      <th className="p-6">Description</th>
                      <th className="p-6 w-36 text-right">Amount</th>
                      <th className="p-6 w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {combinedLog.map(log => (
                      <tr 
                        key={log.id} 
                        onClick={() => handleEditTreatment(log)}
                        className="align-top hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-6 font-bold text-slate-500">{log.date}</td>
                        <td className="p-6">
                           <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">{log.treatment}</span>
                        </td>
                        <td className="p-6">
                           <p className="text-slate-600 font-medium whitespace-pre-wrap leading-relaxed text-xs">{log.description || '-'}</p>
                        </td>
                        <td className="p-6 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="font-black text-slate-900 text-sm">RM {log.amount?.toFixed(2) || '0.00'}</span>
                                {log.paymentStatus && (
                                    <span className={`text-[8px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black border ${getStatusColor(log.paymentStatus)}`}>
                                        {log.paymentStatus}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="p-6">
                           <div className="relative flex justify-end items-center gap-2 log-menu-container" onClick={(e) => e.stopPropagation()}>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setOpenLogMenuId(openLogMenuId === log.id ? null : log.id); }} 
                                 className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-800 hover:shadow-sm transition-all"
                               >
                                 <MoreVertical size={16} />
                               </button>
                               
                               {openLogMenuId === log.id && (
                                   <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 p-2 w-52 animate-in zoom-in-95 duration-150 origin-top-right">
                                       {(log.paymentStatus === 'Pending' || log.paymentStatus === 'Overdue' || log.paymentStatus === 'Partially Paid') && (
                                           <>
                                              <button onClick={(e) => { e.stopPropagation(); handlePay(log); }} className="w-full text-left px-4 py-3 text-[10px] font-black text-emerald-600 uppercase hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition-all">
                                                <CreditCard size={14} /> RECEIVE PAYMENT
                                              </button>
                                              <div className="h-px bg-slate-50 my-1"/>
                                           </>
                                       )}
                                       <button onClick={() => handleEditTreatment(log)} className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-700 uppercase hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-all">
                                           <Edit2 size={14} className="text-slate-400" /> EDIT RECORD
                                       </button>
                                       <div className="h-px bg-slate-50 my-1"/>
                                       <button onClick={() => log.type === 'Note' ? handleDeleteNote(log.id) : handleDeleteInvoice(log.invoiceId!)} className="w-full text-left px-4 py-3 text-[10px] font-black text-red-600 uppercase hover:bg-red-50 rounded-xl flex items-center gap-2 transition-all">
                                           <Trash2 size={14} className="text-red-400" /> DELETE RECORD
                                       </button>
                                   </div>
                               )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
         </div>
      </div>
      
      <AddProgressNoteModal isOpen={isNoteModalOpen} onClose={() => { setIsNoteModalOpen(false); setEditingNote(null); }} onSave={handleSaveNote} noteToEdit={editingNote} />
      <EditPatientModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} patient={patient} onSave={updatePatient} />
      {patient && <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} {...billingModalProps} onSaveInvoice={addInvoice} onUpdate={updateInvoice} />}
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <ImageViewer isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} images={imageFiles} currentIndex={selectedImageIndex} onNavigate={setSelectedImageIndex} />
      
      {patient && (
        <>
            <MedicalCertificateModal 
                isOpen={isMedicalCertModalOpen}
                onClose={() => setIsMedicalCertModalOpen(false)}
                patient={{ name: `${patient.firstName} ${patient.lastName}`, dob: patient.dateOfBirth }}
                onSave={handleSaveDocument}
            />
            <ReferralModal 
                isOpen={isReferralModalOpen}
                onClose={() => setIsReferralModalOpen(false)}
                patient={{ name: `${patient.firstName} ${patient.lastName}`, dob: patient.dateOfBirth }}
                clinicalContext={notes.length > 0 ? notes[0].clinicalNotes : ''}
                onSave={handleSaveDocument}
            />
            <TimeSlipModal 
                isOpen={isTimeSlipModalOpen}
                onClose={() => setIsTimeSlipModalOpen(false)}
                patient={{ name: `${patient.firstName} ${patient.lastName}`, dob: patient.dateOfBirth }}
                onSave={handleSaveDocument}
            />
            <PrescriptionModal 
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patient={{ id: patient.id, name: `${patient.firstName} ${patient.lastName}`, address: patient.address }}
                onSave={handleSavePrescription}
            />
        </>
      )}
      
      <DocumentViewerModal 
        isOpen={!!viewingDocument} 
        onClose={() => setViewingDocument(null)} 
        file={viewingDocument} 
      />

      <ConfirmationModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDeleteInvoice}
        title="Void Record?"
        message="Are you sure you want to void this billing record? This will remove it from financial reports permanently."
        confirmLabel="Void Record"
      />
    </div>
  );
};

export default PatientDetail;