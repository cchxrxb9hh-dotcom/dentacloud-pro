
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ChevronRight, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  timeoutReason?: string | null;
}

// Fixed: Changed from React.FC to regular functional component and used PropsWithChildren for compatibility
const Login = ({ onLogin, timeoutReason }: React.PropsWithChildren<LoginProps>) => {
  const [email, setEmail] = useState('admin@dentacloud.pro');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      
      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl shadow-blue-100 overflow-hidden flex flex-col md:flex-row relative z-10 border border-white">
        {/* Brand Side */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Activity className="absolute top-10 right-10 w-64 h-64 -rotate-12" />
            <ShieldCheck className="absolute bottom-[-20px] left-[-20px] w-80 h-80 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-black text-2xl tracking-tighter italic">D</span>
              </div>
              <span className="text-2xl font-black tracking-tighter italic uppercase">DentaCloud Pro</span>
            </div>
            
            <h1 className="text-4xl font-black leading-tight mb-6">
              Modern Clinic <br /> Management. <br /> Redefined.
            </h1>
            <p className="text-blue-100 font-medium leading-relaxed max-w-sm">
              Integrated with AI-driven summaries, DICOM imaging bridges, and secure patient data sovereignty.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] opacity-60">
            <span className="flex items-center gap-2">
              <Sparkles size={14} /> HIPAA Compliant
            </span>
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>SSL Secured</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Staff Login</h2>
            <p className="text-slate-500 text-sm mt-1">Authorized access only. Use clinical credentials.</p>
          </div>

          {timeoutReason && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-tight">{timeoutReason}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-blue-500" /> Professional Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                placeholder="dr.johnson@clinic.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} className="text-blue-500" /> Secure Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold px-2">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded-md border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4" /> Remember session
              </label>
              <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign into Workspace <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            V.2.5.0 Build on Server 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
