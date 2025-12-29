
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ChevronRight, Activity, Sparkles, AlertCircle, User, UserPlus, Phone, MapPin } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  timeoutReason?: string | null;
}

interface UserCredentials {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
}

const Login = ({ onLogin, timeoutReason }: React.PropsWithChildren<LoginProps>) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasUsers, setHasUsers] = useState(false);

  useEffect(() => {
    const credentials = localStorage.getItem('denta_credentials');
    const users = credentials ? JSON.parse(credentials) : [];
    setHasUsers(users.length > 0);
    if (users.length === 0) {
      setMode('register');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const credentials = localStorage.getItem('denta_credentials');
      const users: UserCredentials[] = credentials ? JSON.parse(credentials) : [];
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError('No account found with this email. Please register first.');
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      onLogin(email, password);
      setLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const credentials = localStorage.getItem('denta_credentials');
      const users: UserCredentials[] = credentials ? JSON.parse(credentials) : [];

      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      const newUser: UserCredentials = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase(),
        password: password,
        role: users.length === 0 ? 'Admin' : 'Assistant',
        phone: phone,
        address: address,
      };

      users.push(newUser);
      localStorage.setItem('denta_credentials', JSON.stringify(users));

      const staffList = localStorage.getItem('denta_staff');
      const staff = staffList ? JSON.parse(staffList) : [];
      staff.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        status: 'Active',
        annualLeaveEntitlement: 20,
      });
      localStorage.setItem('denta_staff', JSON.stringify(staff));

      onLogin(email, password);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      
      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl shadow-blue-100 overflow-hidden flex flex-col md:flex-row relative z-10 border border-white">
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
              {mode === 'register' ? (
                <>Welcome! <br /> Set Up Your <br /> Profile.</>
              ) : (
                <>Modern Clinic <br /> Management. <br /> Redefined.</>
              )}
            </h1>
            <p className="text-blue-100 font-medium leading-relaxed max-w-sm">
              {mode === 'register' 
                ? 'Create your admin account to get started with DentaCloud Pro. Your data stays on your device.'
                : 'Integrated with AI-driven summaries, DICOM imaging bridges, and secure patient data sovereignty.'
              }
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

        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {mode === 'register' ? 'Create Account' : 'Staff Login'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'register' 
                ? 'Set up your profile to get started.' 
                : 'Enter your credentials to access the system.'
              }
            </p>
          </div>

          {timeoutReason && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-tight">{timeoutReason}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-red-800 leading-relaxed">{error}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} className="text-blue-500" /> Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" /> Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ChevronRight size={18} /></>
                )}
              </button>

              <button 
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="w-full text-slate-500 font-bold text-xs uppercase tracking-widest py-3 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={14} /> Create New Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-blue-500" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} className="text-blue-500" /> Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} className="text-blue-500" /> Phone
                  </label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                    placeholder="+60123456789"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-blue-500" /> Address
                  </label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" /> Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" /> Confirm Password
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ChevronRight size={18} /></>
                )}
              </button>

              {hasUsers && (
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="w-full text-slate-500 font-bold text-xs uppercase tracking-widest py-3 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <User size={14} /> Already have an account? Sign In
                </button>
              )}
            </form>
          )}

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            V.2.5.0 Build on Server 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
