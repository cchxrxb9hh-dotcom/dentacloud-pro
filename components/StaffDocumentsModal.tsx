
import React, { useState, useEffect, useRef } from 'react';
import { Folder, X, Upload, Camera, FileText, Image as ImageIcon, Activity, Plus, Maximize2 } from 'lucide-react';
import { User, ClinicalFile } from '../types';
import CameraModal from './CameraModal';
import DocumentViewerModal from './DocumentViewerModal';
import ImageViewer from './ImageViewer';
import { useUser } from '../App';

const STORAGE_KEY = 'denta_staff_documents';

interface StaffDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
}

const StaffDocumentsModal: React.FC<StaffDocumentsModalProps> = ({ isOpen, onClose, staff }) => {
  const { addAuditEntry } = useUser();
  const [files, setFiles] = useState<ClinicalFile[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<ClinicalFile | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && staff) {
      const allStaffDocs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const staffDocs = allStaffDocs.filter((doc: any) => doc.staffId === staff.id);
      setFiles(staffDocs);
    } else {
      setFiles([]);
    }
  }, [isOpen, staff]);

  const saveFiles = (updatedFiles: ClinicalFile[]) => {
    const allStaffDocs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const otherStaffDocs = allStaffDocs.filter((doc: any) => doc.staffId !== staff!.id);
    const newDocsForStorage = updatedFiles.map(f => ({ ...f, staffId: staff!.id }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherStaffDocs, ...newDocsForStorage]));
    setFiles(updatedFiles);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    // Fixed: Explicitly typed 'file' as 'File' to resolve 'unknown' type errors during iteration.
    Array.from(uploadedFiles).forEach((file: File) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (event) => {
        const newFile: ClinicalFile = {
          id: `staff-doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          url: isImage ? (event.target?.result as string) : '#',
          category: isImage ? 'Picture' : 'Document',
          date: new Date().toISOString().split('T')[0],
          content: isImage ? undefined : 'Uploaded document content.',
        };
        saveFiles([...files, newFile]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    addAuditEntry('Uploaded Staff Document', 'Administrative', `${uploadedFiles.length} file(s) for ${staff?.name}`);
    e.target.value = ''; // Reset input
  };
  
  const handleCapture = (base64Image: string) => {
    const newFile: ClinicalFile = {
      id: `staff-scan-${Date.now()}`,
      name: `Scan - ${new Date().toLocaleDateString()}.jpg`,
      url: base64Image,
      category: 'Picture',
      date: new Date().toISOString().split('T')[0],
    };
    saveFiles([...files, newFile]);
    addAuditEntry('Scanned Staff Document', 'Administrative', `For staff member: ${staff?.name}`);
  };

  if (!isOpen || !staff) return null;

  const getIcon = (category: ClinicalFile['category']) => {
    switch(category) {
      case 'Picture': return <ImageIcon size={20} className="text-blue-500" />;
      case 'X-Ray': return <Activity size={20} className="text-purple-500" />;
      case 'Document': return <FileText size={20} className="text-slate-500" />;
    }
  };

  const openImage = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const imageFiles = files.filter(f => f.category !== 'Document');

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Folder size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Staff Document Folder</h3>
                <p className="text-xs text-slate-500 font-medium">{staff.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700">
                <Upload size={16} /> Upload File
              </button>
              <button onClick={() => setIsCameraOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 border border-slate-200">
                <Camera size={16} /> Scan Document
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file) => {
                const isImage = file.category !== 'Document';
                const handleClick = () => {
                   if (isImage) {
                       const imageIndex = imageFiles.findIndex(f => f.id === file.id);
                       if (imageIndex !== -1) openImage(imageIndex);
                   } else {
                       setViewingFile(file);
                   }
                };
                return (
                  <div key={file.id} onClick={handleClick} className="group relative bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:border-blue-400 hover:bg-white transition-all flex flex-col items-center justify-center p-4 gap-3 text-center">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                      {getIcon(file.category)}
                    </div>
                    <div className="w-full">
                      <p className="text-[9px] font-black text-slate-800 uppercase tracking-tight truncate px-1">{file.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-0.5">{file.date}</p>
                    </div>
                  </div>
                );
              })}
               <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all min-h-[140px]">
                <Plus size={18} />
                <span className="text-[8px] font-black uppercase tracking-widest">Add File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <DocumentViewerModal isOpen={!!viewingFile} onClose={() => setViewingFile(null)} file={viewingFile} />
      <ImageViewer 
        isOpen={isImageViewerOpen} 
        onClose={() => setIsImageViewerOpen(false)} 
        images={imageFiles} 
        currentIndex={selectedImageIndex} 
        onNavigate={setSelectedImageIndex} 
      />
    </>
  );
};

export default StaffDocumentsModal;
