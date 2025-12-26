
import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, Download, Trash2, Calendar, Tag, Printer } from 'lucide-react';
import { ClinicalFile } from '../types';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: ClinicalFile[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isOpen, onClose, images, currentIndex, onNavigate }) => {
  const [zoom, setZoom] = useState(1);
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen || !currentImage) return null;

  const handleNext = () => {
    onNavigate((currentIndex + 1) % images.length);
    setZoom(1);
  };

  const handlePrev = () => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head><title>${currentImage.name}</title></head>
                <body style="margin: 0; text-align: center;">
                    <img src="${currentImage.url}" style="max-width: 100%; max-height: 100vh;" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 text-white border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Maximize2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">{currentImage.name}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Calendar size={12} /> {currentImage.date}
              </span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <Tag size={12} /> {currentImage.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-2xl p-1 mr-4">
            <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ZoomOut size={18} />
            </button>
            <span className="px-3 text-xs font-black w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ZoomIn size={18} />
            </button>
          </div>
          <button onClick={handlePrint} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all" title="Print Image">
            <Printer size={20} />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all" title="Download Image">
            <Download size={20} />
          </button>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-red-500 rounded-2xl transition-all ml-2">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-8 z-10 p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-8 z-10 p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom})` }}>
           <img 
            src={currentImage.url} 
            alt={currentImage.name} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Footer Navigation Strip */}
      <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-center gap-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => onNavigate(idx)}
            className={`w-16 h-16 rounded-xl border-2 transition-all overflow-hidden ${
              idx === currentIndex ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
            }`}
          >
            <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageViewer;