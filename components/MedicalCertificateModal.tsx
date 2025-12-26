import React, { useState } from 'react';
import { X, Send, FileCheck, Sparkles, Printer, Copy, Check, Calendar, Save } from 'lucide-react';

interface MedicalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { name: string; dob: string };
  onSave: (data: { name: string, content: string }) => void;
}

const MedicalCertificateModal: React.FC<MedicalCertificateModalProps> = ({ isOpen, onClose, patient, onSave }) => {
  const [procedure, setProcedure] = useState('');
  const [restDays, setRestDays] = useState('1');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString();
    const sn = `MC-${Date.now()}`;
    setSerialNumber(sn);
    // Switched to HTML template for proper rendering
    const certificate = `
<h3>MEDICAL CERTIFICATE</h3>
<p><strong>Date:</strong> ${today}</p>
<p><strong>Serial No:</strong> ${sn}</p>
<br/>
<p>This is to certify that:</p>
<p>
    <strong>Patient Name:</strong> ${patient.name}<br/>
    <strong>DOB:</strong> ${patient.dob}
</p>
<p>Underwent the following procedure on ${today}:<br/><strong>${procedure}</strong></p>
<p>This patient is medically unfit for work/school and is advised to rest for <strong>${restDays} day(s)</strong>.</p>
<br/>
<p><em>This certificate is issued for medical purposes only.</em></p>
<br/><br/>
<p>_________________________</p>
<p><strong>DentaCloud Pro Clinic</strong></p>
    `;
    // Simulate generation time
    await new Promise(r => setTimeout(r, 500));
    setDraft(certificate.trim());
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (draft) {
      onSave({ name: `Medical Certificate - ${serialNumber}`, content: draft });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Medical Certificate</h3>
              <p className="text-xs text-slate-500 font-medium">Issue excuse letter for {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procedure/Diagnosis</label>
              <input 
                type="text"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="e.g. Surgical Extraction of #32"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Rest (Days)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="number"
                  min="1"
                  max="14"
                  value={restDays}
                  onChange={(e) => setRestDays(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm text-slate-800"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !procedure}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileCheck size={18} />
              )}
              Generate Certificate
            </button>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-700 leading-relaxed">
                <strong>Information:</strong> Certificates are generated based on clinical standards and include required details for employer or school verification.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Preview</label>
              {draft && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="Copy text">
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 overflow-y-auto min-h-[300px] shadow-inner relative">
                {/* Clinic Header Watermark style */}
                <div className="absolute top-4 left-0 right-0 text-center opacity-5 select-none pointer-events-none">
                    <h1 className="text-4xl font-black">DENTACLOUD PRO</h1>
                </div>

              {draft ? (
                <div 
                  className="prose max-w-none animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10"
                  dangerouslySetInnerHTML={{ __html: draft }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-center px-8">
                  <FileCheck size={48} className="mb-4 opacity-10" />
                  Enter procedure details and click "Generate" to preview the certificate.
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

export default MedicalCertificateModal;