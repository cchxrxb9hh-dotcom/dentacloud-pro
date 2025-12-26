import React, { useState } from 'react';
import { X, Send, FileText, Sparkles, Printer, Copy, Check, Save } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: { name: string; dob: string };
  clinicalContext: string;
  onSave: (data: { name: string, content: string }) => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, patient, clinicalContext, onSave }) => {
  const [specialty, setSpecialty] = useState('Oral Surgeon');
  const [reason, setReason] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const sn = `REF-${Date.now()}`;
    setSerialNumber(sn);
    // Switched to HTML template for proper rendering
    const letter = `
<h3>REFERRAL LETTER</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Serial No:</strong> ${sn}</p>
<br/>
<p><strong>To:</strong> ${specialty}</p>
<br/>
<p><strong>Patient:</strong> ${patient.name}<br/><strong>DOB:</strong> ${patient.dob}</p>
<br/>
<p>Dear Specialist,</p>
<p>I am referring ${patient.name} for your expert evaluation and management regarding the following:</p>
<p><strong>Reason for Referral:</strong><br/>${reason}</p>
<p><strong>Clinical Context:</strong><br/>${clinicalContext.replace(/\n/g, '<br/>')}</p>
<br/>
<p>Thank you for your attention to this matter.</p>
<br/>
<p>Sincerely,</p>
<p><strong>DentaCloud Pro Clinic</strong></p>
    `;
    // Simulate generation time
    await new Promise(r => setTimeout(r, 500));
    setDraft(letter.trim());
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (draft) {
      onSave({ name: `Referral - ${specialty} - ${serialNumber}`, content: draft });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Referral Generator</h3>
              <p className="text-xs text-slate-500 font-medium">Create a specialist referral for {patient.name}</p>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist Type</label>
              <select 
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-800"
              >
                <option>Oral Surgeon</option>
                <option>Endodontist</option>
                <option>Periodontist</option>
                <option>Orthodontist</option>
                <option>Pediatric Dentist</option>
                <option>Prosthodontist</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason for Referral</label>
              <textarea 
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Evaluation of impacted #17 and #32, patient experiencing localized pain..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none text-slate-800"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !reason}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              Generate Letter
            </button>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] text-amber-700 leading-relaxed">
                <strong>Note:</strong> The system will automatically include relevant patient demographics and summary clinical history in the formal letter.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Letter Preview</label>
              {draft && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Copy text">
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-6 overflow-y-auto min-h-[300px] shadow-inner">
              {draft ? (
                <div 
                  className="prose max-w-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  dangerouslySetInnerHTML={{ __html: draft }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-center px-8">
                  <FileText size={48} className="mb-4 opacity-10" />
                  Configure the referral details and click "Generate Letter" to see the preview here.
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

export default ReferralModal;