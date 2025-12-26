
import React, { useState } from 'react';
import { 
  Globe,
  Plus,
  Trash2,
  User,
  Lock,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useUser } from '../App';
import { ClinicPanel } from '../types';

const ClinicPanels: React.FC = () => {
  const { settings, updateSettings } = useUser();
  const [panels, setPanels] = useState<ClinicPanel[]>(settings.clinicPanels || []);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddPanel = () => {
    const newPanel: ClinicPanel = {
      id: `panel-${Date.now()}`,
      name: 'New Panel',
      url: '',
      description: '',
      username: '',
      password: ''
    };
    setPanels([...panels, newPanel]);
  };

  const handleUpdatePanel = (id: string, field: keyof ClinicPanel, value: string) => {
    setPanels(panels.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemovePanel = (id: string) => {
    setPanels(panels.filter(p => p.id !== id));
  };

  const handleSave = () => {
    updateSettings({ ...settings, clinicPanels: panels });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Clinic Panel Links</h1>
          <p className="text-slate-600 font-medium text-sm">Manage external links and credentials for your clinic's administrative panels.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'Changes Saved' : 'Commit Settings'}
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-slate-50 rounded-2xl text-blue-600 border border-slate-100">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">External Portals</h3>
            <p className="text-sm text-slate-600 font-medium">Quick access to insurance, lab, or other third-party web panels.</p>
          </div>
        </div>
        <div className="space-y-4">
          {panels.map((panel) => (
            <div key={panel.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative group animate-in slide-in-from-right-2 duration-300">
                <button 
                  onClick={() => handleRemovePanel(panel.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Remove Panel"
                >
                  <Trash2 size={16} />
                </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Panel Name</label>
                  <input 
                    type="text" 
                    value={panel.name}
                    onChange={(e) => handleUpdatePanel(panel.id, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                    placeholder="e.g., Main Admin, Lab Portal"
                  />
                </div>
                  <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Website URL</label>
                  <input 
                    type="url"
                    value={panel.url}
                    onChange={(e) => handleUpdatePanel(panel.id, 'url', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-slate-800"
                    placeholder="https://yourclinicpanel.com/login"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea
                      value={panel.description || ''}
                      onChange={(e) => handleUpdatePanel(panel.id, 'description', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs text-slate-600 resize-none"
                      placeholder="e.g., For accessing patient lab results."
                      rows={2}
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> Username</label>
                  <input 
                    type="text"
                    value={panel.username || ''}
                    onChange={(e) => handleUpdatePanel(panel.id, 'username', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-slate-800"
                    placeholder="admin_user"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Lock size={10} /> Password</label>
                  <input 
                    type="password"
                    value={panel.password || ''}
                    onChange={(e) => handleUpdatePanel(panel.id, 'password', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          ))}
            <button 
            onClick={handleAddPanel}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
          >
            <Plus size={16} /> Add New Panel Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicPanels;
