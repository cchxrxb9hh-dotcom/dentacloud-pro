import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Globe, 
  Clock, 
  Sparkles, 
  Save, 
  Bell, 
  Smartphone,
  CheckCircle2,
  Mail,
  Building2,
  Lock,
  Edit3,
  MapPin,
  Trash2,
  Plus,
  Upload,
  ImageIcon,
  X,
  MessageSquare,
  CreditCard,
  Coins,
  ArrowRightLeft,
  ShieldCheck as InsuranceIcon,
  Wallet,
  FileText,
  FileCheck,
  User,
  CalendarClock,
  Calculator,
  Percent
} from 'lucide-react';
import { useUser } from '../App';
import { ClinicSettings, ClinicBranch, PaymentMethod, PaymentMethodType, ClinicPanel } from '../types';

const SettingCard = ({ title, description, icon: Icon, children }: any) => (
  <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
    <div className="flex items-start gap-4 mb-8">
      <div className="p-3 bg-slate-50 rounded-2xl text-blue-600 border border-slate-100">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">{title}</h3>
        <p className="text-sm text-slate-600 font-medium">{description}</p>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const Settings: React.FC = () => {
  const { settings, updateSettings, addAuditEntry } = useUser();
  const [localSettings, setLocalSettings] = useState<ClinicSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Ensure local state stays in sync if master settings change externally
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdateBranch = (id: string, field: keyof ClinicBranch, value: string) => {
    setLocalSettings({
      ...localSettings,
      branches: localSettings.branches.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const handleLogoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateBranch(id, 'logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (id: string) => {
    handleUpdateBranch(id, 'logo', '');
  };

  const handleAddBranch = () => {
    const newBranch: ClinicBranch = {
      id: `b${Date.now()}`,
      name: 'New Branch Location',
      companyName: 'Branch Legal Entity',
      address: 'Enter address...',
      phone: 'Enter phone...',
      email: 'branch@email.com',
      color: 'blue',
      logo: ''
    };
    setLocalSettings({
      ...localSettings,
      branches: [...localSettings.branches, newBranch]
    });
  };

  const handleRemoveBranch = (id: string) => {
    if (localSettings.branches.length <= 1) return;
    setLocalSettings({
      ...localSettings,
      branches: localSettings.branches.filter(b => b.id !== id)
    });
  };
  
  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `pm${Date.now()}`,
      name: 'New Payment Option',
      type: 'Cash',
      isActive: true
    };
    setLocalSettings({
      ...localSettings,
      paymentMethods: [...(localSettings.paymentMethods || []), newMethod]
    });
  };

  const handleUpdatePaymentMethod = (id: string, field: keyof PaymentMethod, value: any) => {
    setLocalSettings({
      ...localSettings,
      paymentMethods: localSettings.paymentMethods.map(pm => pm.id === id ? { ...pm, [field]: value } : pm)
    });
  };

  const handleRemovePaymentMethod = (id: string) => {
    setLocalSettings({
      ...localSettings,
      paymentMethods: localSettings.paymentMethods.filter(pm => pm.id !== id)
    });
  };

  const getPaymentIcon = (type: PaymentMethodType) => {
    switch(type) {
      case 'Cash': return <Coins size={16} />;
      case 'Card': return <CreditCard size={16} />;
      case 'Transfer': return <ArrowRightLeft size={16} />;
      case 'Insurance': return <InsuranceIcon size={16} />;
      case 'Digital Wallet': return <Wallet size={16} />;
      default: return <SettingsIcon size={16} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Workspace Settings</h1>
          <p className="text-slate-600 font-medium text-sm">Configure your clinical environment and branch locations.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'Settings Persistent' : 'Commit Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Branch Management */}
        <SettingCard 
          title="Branch Management" 
          description="Manage and rename your clinical locations and their specific legal entities."
          icon={MapPin}
        >
          <div className="space-y-4">
            {localSettings.branches.map((branch) => (
              <div key={branch.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest self-start">Clinic Logo</label>
                    <div className="relative group">
                      <div 
                        onClick={() => fileInputRefs.current[branch.id]?.click()}
                        className="w-20 h-20 bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center hover:border-blue-400 transition-all shadow-sm"
                      >
                        {branch.logo ? (
                          <img src={branch.logo} alt="Clinic Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={16} className="text-blue-600" />
                        </div>
                      </div>
                      {branch.logo && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveLogo(branch.id); }}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 p-1 rounded-full shadow-md hover:bg-red-50 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={(el) => { fileInputRefs.current[branch.id] = el; }}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(branch.id, e)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Branch Name</label>
                      <input 
                        type="text" 
                        value={branch.name}
                        onChange={(e) => handleUpdateBranch(branch.id, 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-sm text-slate-950 placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Branch Legal/Company Name</label>
                      <input 
                        type="text" 
                        value={branch.companyName}
                        onChange={(e) => handleUpdateBranch(branch.id, 'companyName', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-sm text-slate-950 placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="p-3 text-slate-500 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                    title="Remove Branch"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-200/50">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Address</label>
                      <input 
                        type="text" 
                        value={branch.address}
                        onChange={(e) => handleUpdateBranch(branch.id, 'address', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs text-slate-950 placeholder-slate-400"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
                          <input 
                            type="text" 
                            value={branch.phone}
                            onChange={(e) => handleUpdateBranch(branch.id, 'phone', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs text-slate-950 placeholder-slate-400"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                          <input 
                            type="email" 
                            value={branch.email || ''}
                            onChange={(e) => handleUpdateBranch(branch.id, 'email', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs text-slate-950 placeholder-slate-400"
                          />
                       </div>
                   </div>
                </div>
              </div>
            ))}
            <button 
              onClick={handleAddBranch}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
            >
              <Plus size={16} /> Add New Clinical Location
            </button>
          </div>
        </SettingCard>

        {/* Tax & Financials */}
        <SettingCard 
          title="Tax & Financials" 
          description="Configure standard tax rates and financial reporting parameters."
          icon={Calculator}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Percent size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">SST Tax Rate</p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Standard percentage for billing</p>
              </div>
            </div>
            <div className="relative w-32">
                <input 
                  type="number" 
                  value={localSettings.taxSstRate}
                  onChange={(e) => setLocalSettings({...localSettings, taxSstRate: parseFloat(e.target.value) || 0})}
                  className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-950 focus:ring-4 focus:ring-blue-100 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
            </div>
          </div>
        </SettingCard>

        {/* Payment Configuration */}
        <SettingCard 
          title="Payment Configuration" 
          description="Define how your clinic collects revenue and integrates with insurance providers."
          icon={Wallet}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {(localSettings.paymentMethods || []).map((pm) => (
                <div key={pm.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${pm.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className={`p-2.5 rounded-xl ${pm.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    {getPaymentIcon(pm.type)}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text"
                      value={pm.name}
                      onChange={(e) => handleUpdatePaymentMethod(pm.id, 'name', e.target.value)}
                      className="bg-transparent border-none focus:ring-0 font-black text-sm p-0 text-slate-950 placeholder-slate-400"
                      placeholder="Method Name"
                    />
                    <select 
                      value={pm.type}
                      onChange={(e) => handleUpdatePaymentMethod(pm.id, 'type', e.target.value as PaymentMethodType)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 outline-none text-slate-950"
                    >
                      <option value="Cash">Liquid Cash</option>
                      <option value="Card">Debit/Credit Card</option>
                      <option value="Transfer">Bank Transfer</option>
                      <option value="Insurance">Insurance Carrier</option>
                      <option value="Digital Wallet">Digital Wallet</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdatePaymentMethod(pm.id, 'isActive', !pm.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${pm.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700 border border-slate-300'}`}
                    >
                      {pm.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button 
                      onClick={() => handleRemovePaymentMethod(pm.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddPaymentMethod}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
            >
              <Plus size={16} /> Register New Payment Channel
            </button>
          </div>
        </SettingCard>

        {/* Appointment Reminders */}
        <SettingCard 
          title="Appointment Reminders" 
          description="Automate patient outreach and reduce no-shows with configurable reminders."
          icon={CalendarClock}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-blue-500" /> Auto-Reminder Lead Time
                 </label>
                 <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={localSettings.reminderTimingValue}
                      onChange={(e) => setLocalSettings({...localSettings, reminderTimingValue: parseInt(e.target.value) || 1})}
                      className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-sm text-slate-950 placeholder-slate-400"
                    />
                    <select 
                      value={localSettings.reminderTimingUnit}
                      onChange={(e) => setLocalSettings({...localSettings, reminderTimingUnit: e.target.value as 'hours' | 'days'})}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-sm text-slate-950"
                    >
                      <option value="hours">Hours before</option>
                      <option value="days">Days before</option>
                    </select>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium italic">Reminders will be highlighted on the schedule {localSettings.reminderTimingValue} {localSettings.reminderTimingUnit} prior.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  WhatsApp Reminder Template
                </label>
                <textarea 
                  value={localSettings.whatsappReminderTemplate}
                  onChange={(e) => setLocalSettings({...localSettings, whatsappReminderTemplate: e.target.value})}
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm text-slate-950 resize-none shadow-inner placeholder-slate-400"
                  placeholder="Write your reminder template here..."
                />
              </div>
              
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3">Available Data Placeholders</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { tag: '{{patientName}}', desc: 'Patient Name' },
                    { tag: '{{clinicName}}', desc: 'Clinic Brand' },
                    { tag: '{{branchName}}', desc: 'Branch Location' },
                    { tag: '{{treatmentType}}', desc: 'Procedure Name' },
                    { tag: '{{date}}', desc: 'Appt. Date' },
                    { tag: '{{time}}', desc: 'Appt. Time' },
                  ].map(p => (
                    <div key={p.tag} className="flex flex-col">
                      <code className="text-[10px] font-black text-slate-800">{p.tag}</code>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Security & Access */}
        <SettingCard 
          title="Security & Access" 
          description="Control session behavior and clinical data access."
          icon={Lock}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Inactivity Timeout</p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Auto-logout duration</p>
              </div>
            </div>
            <select 
              value={localSettings.autoLogoutTime}
              onChange={(e) => setLocalSettings({...localSettings, autoLogoutTime: parseInt(e.target.value)})}
              className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-black text-slate-950 focus:ring-4 focus:ring-blue-100 outline-none"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={240}>4 Hours</option>
            </select>
          </div>
        </SettingCard>
      </div>

      <div className="flex flex-col items-center gap-6 pt-12 border-t border-slate-100">
        <button 
          onClick={handleSave}
          className="flex items-center gap-3 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'Settings Saved Locally' : 'Finalize & Persist Settings'}
        </button>
        
        <div className="flex items-center justify-center opacity-40 select-none">
          <div className="h-px w-12 bg-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] px-4 text-slate-500">End of Workspace Configuration</p>
          <div className="h-px w-12 bg-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Settings;