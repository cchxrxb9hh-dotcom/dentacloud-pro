
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Stethoscope, 
  Wallet, 
  UserCog, 
  Clock,
  Calendar,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUser } from '../App';
import { AuditEntry } from '../types';

const AuditTrail: React.FC = () => {
  const { auditLogs } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AuditEntry['category']>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: ('All' | AuditEntry['category'])[] = ['All', 'Clinical', 'Financial', 'Administrative', 'Security'];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [auditLogs, searchTerm, categoryFilter]);

  const getCategoryIcon = (cat: AuditEntry['category']) => {
    switch (cat) {
      case 'Clinical': return <Stethoscope size={14} className="text-blue-500" />;
      case 'Financial': return <Wallet size={14} className="text-emerald-500" />;
      case 'Administrative': return <UserCog size={14} className="text-purple-500" />;
      case 'Security': return <ShieldAlert size={14} className="text-amber-500" />;
    }
  };

  const getCategoryStyles = (cat: AuditEntry['category']) => {
    switch (cat) {
      case 'Clinical': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Financial': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Administrative': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Security': return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Audit Trail</h1>
          <p className="text-slate-500 font-medium text-sm">Chronological record of all administrative and clinical actions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export Audit Data
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search action, user, or details..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Authorized User</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Action Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => {
                const { date, time } = formatDate(log.timestamp);
                const isExpanded = expandedId === log.id;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${isExpanded ? 'bg-blue-50/20' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 tracking-tight">{date}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {time}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                            <img src={`https://i.pravatar.cc/100?u=${log.userId}`} alt={log.userName} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.action}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getCategoryStyles(log.category)}`}>
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50 animate-in slide-in-from-top-1 duration-200">
                        <td colSpan={5} className="px-8 py-6">
                          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-inner">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                               <AlertCircle size={14} className="text-blue-500" /> System Integrity Report
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                              {log.details || "No additional context was provided for this record event."}
                            </p>
                            <div className="flex items-center gap-8 pt-4 border-t border-slate-50">
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry ID</p>
                                  <code className="text-[10px] font-bold text-slate-800">#{log.id}</code>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User ID</p>
                                  <code className="text-[10px] font-bold text-slate-800">U-{log.userId}</code>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliant Protocol</p>
                                  <span className="text-[10px] font-black text-emerald-600 uppercase">HIPAA/IMR-2025</span>
                               </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20">
                      <ClipboardList size={64} className="mb-4" />
                      <h4 className="text-sm font-black uppercase tracking-widest">No activity matching filters</h4>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-8 bg-blue-600 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-200 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
           <ShieldCheck size={160} />
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0 border border-white/20">
          <ShieldCheck size={40} />
        </div>
        <div className="flex-1 relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Compliance Integrity</h3>
          <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-2xl">
            This audit trail is tamper-resistant and logs all PII (Personally Identifiable Information) access events as required by modern dental healthcare regulations.
          </p>
        </div>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap relative z-10">
          Request Forensic Export
        </button>
      </div>
    </div>
  );
};

export default AuditTrail;
