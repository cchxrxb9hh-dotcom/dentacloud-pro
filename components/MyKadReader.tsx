
import React, { useState, useEffect } from 'react';
import { CreditCard, X, Loader2, CheckCircle2, AlertCircle, Cpu, Wifi, ShieldCheck, CreditCard as CardIcon } from 'lucide-react';

interface MyKadData {
  fullName: string;
  icNumber: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
}

interface MyKadReaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: MyKadData) => void;
}

const MyKadReader: React.FC<MyKadReaderProps> = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'READING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const connectAndRead = async () => {
    setStatus('SEARCHING');
    try {
      // In a real implementation, we use WebUSB to find the smart card reader
      // Many readers use the CCID standard (Vendor Specific Class 0x0B)
      // For demonstration, we simulate the handshake
      
      await new Promise(r => setTimeout(r, 1500));
      setStatus('READING');
      
      // Simulate data extraction stages
      const stages = ['Reading IC...', 'Extracting Bio-data...', 'Retrieving Address...', 'Finalizing decryption...'];
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const mockData: MyKadData = {
        fullName: 'AHMAD BIN ABDULLAH',
        icNumber: '920101-14-5555',
        dob: '1992-01-01',
        gender: 'Male',
        address: 'NO 123, JALAN AMPANG, 50450 KUALA LUMPUR, MALAYSIA'
      };

      setStatus('SUCCESS');
      setTimeout(() => {
        onSuccess(mockData);
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Smart card reader not found or card removed prematurely.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <CardIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">MyKad Bridge</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Official Smart Card Node</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center space-y-8">
          <div className="relative">
            {/* Visual feedback for the card */}
            <div className={`w-48 h-32 rounded-2xl border-4 transition-all duration-500 relative overflow-hidden flex flex-col justify-between p-4 ${
              status === 'READING' ? 'border-blue-500 bg-blue-50' : 
              status === 'SUCCESS' ? 'border-emerald-500 bg-emerald-50' : 
              status === 'ERROR' ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'
            }`}>
               <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 opacity-50" />
                  <div className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">MyKad Malaysia</div>
               </div>
               <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full opacity-30" />
                  <div className="h-1.5 w-2/3 bg-slate-200 rounded-full opacity-30" />
               </div>

               {status === 'READING' && (
                 <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10">
                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                 </div>
               )}
               {status === 'SUCCESS' && (
                 <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/10">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                 </div>
               )}
            </div>
            
            {status === 'READING' && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {status === 'IDLE' && 'Ready for Input'}
              {status === 'SEARCHING' && 'Connecting to Reader...'}
              {status === 'READING' && 'Extracting Clinical Data'}
              {status === 'SUCCESS' && 'Verified: JPN Authenticated'}
              {status === 'ERROR' && 'Hardware Alert'}
            </h4>
            <p className="text-xs text-slate-500 font-medium px-4">
              {status === 'IDLE' && 'Connect your MyKad reader and insert the patient card.'}
              {status === 'SEARCHING' && 'Locating official CCID-compliant USB hardware.'}
              {status === 'READING' && 'Reading secure chip sectors (Name, IC, Address).'}
              {status === 'SUCCESS' && 'Data parsed successfully. Populating registration form.'}
              {status === 'ERROR' && errorMessage}
            </p>
          </div>

          {status === 'IDLE' && (
            <button 
              onClick={connectAndRead}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Cpu size={16} /> Connect & Scan Card
            </button>
          )}

          {status === 'ERROR' && (
            <button 
              onClick={() => setStatus('IDLE')}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="bg-slate-50 p-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 opacity-30">
            <ShieldCheck size={12} className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">JPN Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 opacity-30">
            <Wifi size={12} className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">WebUSB Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyKadReader;
