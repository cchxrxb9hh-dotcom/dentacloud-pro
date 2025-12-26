import React, { useState } from 'react';
import { X, Clock, Sparkles, Printer, Copy, Check, Calendar, Timer, Save } from 'lucide-react';

interface TimeSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { name: string; dob: string };
  onSave: (data: { name: string, content: string }) => void;
}

const TimeSlipModal: React.FC<TimeSlipModalProps> = ({ isOpen, onClose, patient, onSave }) => {
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [departureTime, setDepartureTime] = useState('10:30');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const sn = `TS-${Date.now()}`;
    setSerialNumber(sn);
    // Switched to HTML template for proper rendering
    const slip = `
<h3>TIME SLIP / ATTENDANCE CONFIRMATION</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Serial No:</strong> ${sn}</p>
<br/>
<p>This is to confirm that the following individual:</p>
<p>
    <strong>Patient Name:</strong> ${patient.name}<br/>
    <strong>DOB:</strong> ${patient.dob}
</p>
<p>Was present at our clinic for dental treatment during the following times:</p>
<p>
    <strong>Arrival:</strong> ${arrivalTime}<br/>
    <strong>Departure:</strong> ${departureTime}
</p>
<br/>
<p><em>This document serves as proof of attendance for work/school purposes.</em></p>
<br/><br/>
<p>_________________________</p>
<p><strong>DentaCloud Pro Clinic</strong></p>
    `;
    // Simulate generation time
    await new Promise(r => setTimeout(r, 500));
    setDraft(slip.trim());
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (draft) {
      onSave({ name: `Time Slip - ${serialNumber}`, content: draft });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Time Slip Generator</h3>
              <p className="text-xs text-slate-500 font-medium">Attendance verification for {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival Time</label>
                <input 
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departure Time</label>
                <input 
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-800"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Clock size={18} />
              )}
              Generate Slip
            </button>
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Preview</label>
              {draft && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Copy text">
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 overflow-y-auto min-h-[300px] shadow-inner relative">
              {draft ? (
                <div 
                  className="prose max-w-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  dangerouslySetInnerHTML={{ __html: draft }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-center px-8">
                  <Timer size={48} className="mb-4 opacity-10" />
                  Select times and click "Generate" to preview.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={!draft}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-30"
          >
            <Save size={16} /> Save Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlipModal;