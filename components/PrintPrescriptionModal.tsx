
import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { Medication } from '../types';
import VisualPrescription from './VisualPrescription';
import { useUser } from '../App';

interface PrintPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Medication | null;
  patientName: string;
}

const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({ isOpen, onClose, prescription, patientName }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useUser();
  
  if (!isOpen || !prescription) return null;

  const branch = settings.branches.find(b => b.id === prescription.branchId);
  const branchName = branch?.name;

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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Print Prescription</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-10">
          <div ref={printRef}>
            <VisualPrescription patientName={patientName} data={prescription} branchName={branchName} />
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
            Close
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 border border-blue-600">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPrescriptionModal;