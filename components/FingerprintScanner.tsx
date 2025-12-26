
import React, { useState, useEffect } from 'react';
/* Added Lock to imports to fix conflict with global Lock browser API */
import { Fingerprint, X, Loader2, CheckCircle2, AlertCircle, Cpu, Wifi, Lock } from 'lucide-react';

interface FingerprintScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
  mode: 'Identify' | 'Enroll';
}

const FingerprintScanner: React.FC<FingerprintScannerProps> = ({ isOpen, onClose, onSuccess, mode }) => {
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  /* Using any for usbDevice to avoid missing USBDevice type error */
  const [usbDevice, setUsbDevice] = useState<any>(null);

  const connectDevice = async () => {
    setStatus('CONNECTING');
    try {
      /* Cast navigator to any to access WebUSB API property which might not be in standard types */
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      
      setUsbDevice(device);
      setStatus('SCANNING');
      
      // Simulate scanning logic
      setTimeout(() => {
        setStatus('SUCCESS');
        setTimeout(() => {
          onSuccess('1'); // Mock Admin User ID
          onClose();
        }, 1500);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Connection cancelled or device not supported.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <Fingerprint size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {mode === 'Identify' ? 'Biometric Clock-in' : 'Staff Enrollment'}
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Biometric Security Node</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center space-y-8">
          <div className="relative">
            {/* Animated Scanner Ring */}
            <div className={`absolute inset-[-20px] rounded-full border-2 transition-all duration-700 ${
              status === 'SCANNING' ? 'border-blue-500 scale-125 opacity-20 animate-ping' : 
              status === 'SUCCESS' ? 'border-emerald-500 scale-100 opacity-100' : 'border-slate-100 scale-100 opacity-50'
            }`} />
            
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              status === 'IDLE' ? 'bg-slate-50 text-slate-300' :
              status === 'CONNECTING' ? 'bg-blue-50 text-blue-400' :
              status === 'SCANNING' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' :
              status === 'SUCCESS' ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' :
              'bg-red-50 text-red-500'
            }`}>
              {status === 'SCANNING' ? (
                <div className="relative">
                  <Fingerprint size={64} className="animate-pulse" />
                  <div className="absolute inset-0 bg-blue-400/30 mix-blend-overlay animate-scan h-1 w-full top-0" />
                </div>
              ) : status === 'SUCCESS' ? (
                <CheckCircle2 size={64} />
              ) : status === 'ERROR' ? (
                <AlertCircle size={64} />
              ) : (
                <Fingerprint size={64} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {status === 'IDLE' && 'Device Offline'}
              {status === 'CONNECTING' && 'Initializing USB Bridge...'}
              {status === 'SCANNING' && 'Scanning Fingerprint...'}
              {status === 'SUCCESS' && 'Verified Successfully'}
              {status === 'ERROR' && 'Hardware Error'}
            </h4>
            <p className="text-xs text-slate-500 font-medium px-4">
              {status === 'IDLE' && 'Please connect your fingerprint reader to continue.'}
              {status === 'CONNECTING' && 'Establishing secure handshake with the biometric hardware.'}
              {status === 'SCANNING' && 'Place your finger firmly on the scanner glass.'}
              {status === 'SUCCESS' && 'Access granted. Recording clinical attendance event.'}
              {status === 'ERROR' && errorMessage}
            </p>
          </div>

          {status === 'IDLE' && (
            <button 
              onClick={connectDevice}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Cpu size={16} /> Connect USB Reader
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
            <Wifi size={12} className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">Local Link</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 opacity-30">
            <Lock size={12} className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">AES-256 Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerprintScanner;

// CSS for scanning animation (to be injected in index.html if possible, or used as inline style)
const styles = `
@keyframes scan {
  from { top: 0%; }
  to { top: 100%; }
}
.animate-scan {
  animation: scan 2s linear infinite;
}
`;
