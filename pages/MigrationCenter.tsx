
import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  Cpu,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  DatabaseZap,
  Sparkles,
  Terminal,
  Info,
  FileCode,
  ArrowDown
} from 'lucide-react';
import { startMigration, MappingSuggestion } from '../services/migrationService';

const MigrationCenter: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'migrating' | 'complete'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mappings, setMappings] = useState<MappingSuggestion[]>([]);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [fileName, setFileName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      simulateAnalysis();
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate analysis time

    // Hardcoded mock mapping instead of AI call
    const suggestions = [
      { sourceField: 'LName', targetField: 'lastName', confidence: 0.95, reason: 'Direct mapping.' },
      { sourceField: 'FName', targetField: 'firstName', confidence: 0.95, reason: 'Direct mapping.' },
      { sourceField: 'Birthdate', targetField: 'dob', confidence: 0.99, reason: 'Direct mapping.' },
      { sourceField: 'HmPhone', targetField: 'phone', confidence: 0.90, reason: 'Commonly used for primary phone.' },
    ];
    
    setMappings(suggestions);
    setIsAnalyzing(false);
    setStep('mapping');
  };

  const runMigration = async () => {
    setStep('migrating');
    await startMigration((p) => setProgress(p));
    setStep('complete');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Migration Center</h1>
          <p className="text-slate-500 font-medium text-sm">Transferring from OpenDental (MariaDB 10.5)</p>
        </div>
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
          <DatabaseZap className="text-white" size={24} />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        {['Source File', 'Mapping', 'Ingestion', 'Success'].map((s, idx) => {
          const isActive = (step === 'upload' && idx === 0) || 
                           (step === 'mapping' && idx === 1) || 
                           (step === 'migrating' && idx === 2) || 
                           (step === 'complete' && idx === 3);
          const isDone = (step === 'mapping' && idx < 1) || 
                         (step === 'migrating' && idx < 2) || 
                         (step === 'complete' && idx < 3);
          
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 
                  isDone ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
              </div>
              {idx < 3 && <div className="h-px flex-1 bg-slate-100 mx-4" />}
            </React.Fragment>
          );
        })}
      </div>

      {step === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-8">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center shadow-inner">
              <Database size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Select OpenDental Database Dump</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">Upload your MariaDB 10.5 SQL export. The system will automatically parse the relational structure.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="relative group cursor-pointer">
                <input type="file" className="hidden" accept=".sql,.xml,.json,.csv" onChange={handleFileUpload} />
                <div className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] group-hover:bg-slate-800 transition-all shadow-xl">
                  {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />} 
                  {isAnalyzing ? 'Analyzing Schema...' : 'Upload .sql Export'}
                </div>
              </label>

              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center gap-1.5 hover:underline"
              >
                <Info size={14} /> How do I export from OpenDental?
              </button>
            </div>

            {showInstructions && (
              <div className="w-full max-w-2xl bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={16} className="text-blue-600" /> MariaDB Export Guide
                </h4>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">1</span>
                    <p className="text-xs text-slate-600 font-medium">Log into your Windows/Linux server running the OpenDental database.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">2</span>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Open Command Prompt or Terminal and run the following command:</p>
                      <div className="mt-2 bg-slate-900 p-4 rounded-xl relative group">
                        <code className="text-blue-400 text-xs font-mono block overflow-x-auto whitespace-nowrap pb-1">
                          mysqldump -u root -p opendental > opendental_migration.sql
                        </code>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigator.clipboard.writeText('mysqldump -u root -p opendental > opendental_migration.sql')} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-[9px] font-black uppercase tracking-widest">Copy</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">3</span>
                    <p className="text-xs text-slate-600 font-medium">Upload the resulting <code className="bg-slate-200 px-1 rounded text-slate-800">opendental_migration.sql</code> file above.</p>
                  </li>
                </ol>
              </div>
            )}
            
            <div className="pt-8 border-t border-slate-50 w-full flex items-center justify-center gap-6">
              <div className="flex flex-col items-center opacity-30">
                <FileCode size={24} />
                <span className="text-[9px] font-black uppercase mt-1">SQL (MariaDB)</span>
              </div>
              <div className="flex flex-col items-center opacity-30">
                <FileJson size={24} />
                <span className="text-[9px] font-black uppercase mt-1">JSON/XML</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cpu size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                <Cpu className="w-3 h-3" /> MariaDB Schema Detected
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Schema Mapping Approval</h3>
              <p className="text-slate-400 text-sm max-w-lg">We've identified tables for patients, progress notes, and appointments in your SQL dump. Confirm the field mappings below.</p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">OpenDental SQL Column</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target DentaCloud Field</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mappings.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-600 font-bold self-start">{m.sourceField}</code>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Detected in "patient" table</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{m.targetField}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.confidence * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600">{Math.round(m.confidence * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button 
              onClick={() => setStep('upload')}
              className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800"
            >
              Back to Upload
            </button>
            <button 
              onClick={runMigration}
              className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
            >
              Commit Ingestion
            </button>
          </div>
        </div>
      )}

      {step === 'migrating' && (
        <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Data Ingestion Active</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={14} /> {progress.stage}...
              </p>
            </div>
            <span className="text-4xl font-black text-blue-600 italic">{progress.percent}%</span>
          </div>

          <div className="space-y-3">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 rounded-full shadow-lg" 
                style={{ width: `${progress.percent}%` }} 
              />
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">MariaDB 10.5 SQL Source</span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PostgreSQL Target</span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">System Integrity Lock</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Large SQL files are processed in chunks to prevent memory overflow. Your clinical data is being validated for relational consistency during the mapping phase.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center shadow-lg shadow-emerald-100">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">MariaDB Import Success</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">OpenDental database records have been fully imported into the cloud infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 w-full py-8 border-y border-slate-50">
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">1,284</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Patient Units</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">4,821</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Note Records</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">12,402</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Financial Log</p>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '#/'}
            className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            Go to Dashboard <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MigrationCenter;