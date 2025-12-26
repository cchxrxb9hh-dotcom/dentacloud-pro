import React from 'react';
import { X, FileText, Printer } from 'lucide-react';
import { ClinicalFile } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: ClinicalFile | null;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${file.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              @media print {
                @page { margin: 1cm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 0;
                margin: 0;
              }
              .prose-print {
                max-width: none;
                color: #334155;
                line-height: 1.6;
              }
              .prose-print h1, .prose-print h2, .prose-print h3 { 
                color: #0f172a; 
                font-weight: 800; 
                margin-top: 1.5em; 
                margin-bottom: 0.5em;
                text-transform: uppercase;
                letter-spacing: -0.025em;
              }
            </style>
          </head>
          <body>
            <div class="prose-print">
              ${file.content}
            </div>
            <script>
              // Wait for Tailwind to process classes and images to load
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl text-slate-600 flex items-center justify-center shadow-sm border border-slate-200">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight truncate max-w-md">{file.name}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Generated on {file.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              <Printer size={18} /> Print Document
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
          <div className="max-w-3xl mx-auto">
            <div 
              className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-sm min-h-[70vh] prose max-w-none text-slate-800"
              dangerouslySetInnerHTML={{ __html: file.content || 'No content available for this document.' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;