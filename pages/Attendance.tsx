
import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Fingerprint, 
  History, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Coffee, 
  Timer, 
  Search, 
  ExternalLink, 
  BarChart3, 
  DollarSign, 
  Download, 
  Lock, 
  ArrowUpRight, 
  Calculator 
} from 'lucide-react';
import { StaffAttendance, AttendanceRecord } from '../types';
import FingerprintScanner from '../components/FingerprintScanner';
import { useUser } from '../App';

const MOCK_ATTENDANCE: StaffAttendance[] = [
  { userId: '1', name: 'Dr. Sarah Johnson', role: 'Admin', currentStatus: 'In', lastEvent: '08:05 AM', totalHoursToday: '6h 12m' },
  { userId: '2', name: 'Dr. Michael Chen', role: 'Doctor', currentStatus: 'Break', lastEvent: '12:30 PM', totalHoursToday: '4h 30m' },
  { userId: '3', name: 'Emma Wilson', role: 'Assistant', currentStatus: 'Out', lastEvent: '05:00 PM (Prev)', totalHoursToday: '0h 0m' },
  { userId: '4', name: 'Robert Blake', role: 'Accountant', currentStatus: 'In', lastEvent: '09:00 AM', totalHoursToday: '5h 17m' },
];

const MOCK_RECORDS: AttendanceRecord[] = [
  { id: '1', userId: '1', userName: 'Dr. Sarah Johnson', timestamp: '2023-12-10 08:05:22', type: 'In', method: 'Fingerprint' },
  { id: '2', userId: '4', userName: 'Robert Blake', timestamp: '2023-12-10 09:00:15', type: 'In', method: 'Fingerprint' },
  { id: '3', userId: '2', userName: 'Dr. Michael Chen', timestamp: '2023-12-10 09:12:44', type: 'In', method: 'Fingerprint' },
  { id: '4', userId: '2', userName: 'Dr. Michael Chen', timestamp: '2023-12-10 12:30:10', type: 'Break_Start', method: 'Fingerprint' },
];

const MOCK_MONTHLY_REPORT = [
  { userId: '1', name: 'Dr. Sarah Johnson', days: 22, hours: 176, rate: 85, overtime: 12 },
  { userId: '2', name: 'Dr. Michael Chen', days: 20, hours: 160, rate: 75, overtime: 5 },
  { userId: '3', name: 'Emma Wilson', days: 18, hours: 144, rate: 25, overtime: 0 },
  { userId: '4', name: 'Robert Blake', days: 21, hours: 168, rate: 45, overtime: 2 },
];

const Attendance: React.FC = () => {
  const { currentUser, addAuditEntry } = useUser();
  const [activeTab, setActiveTab] = useState<'terminal' | 'reports'>('terminal');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAuthorizedForReports = currentUser?.role === 'Admin' || currentUser?.role === 'Accountant';

  const getStatusStyle = (status: StaffAttendance['currentStatus']) => {
    switch (status) {
      case 'In': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Out': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Break': return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const getStatusIcon = (status: StaffAttendance['currentStatus']) => {
    switch (status) {
      case 'In': return <CheckCircle2 size={12} />;
      case 'Out': return <XCircle size={12} />;
      case 'Break': return <Coffee size={12} />;
    }
  };

  const handleExportCSV = () => {
    addAuditEntry('Exported Payroll CSV', 'Financial', 'Generated monthly staff summary report');
    
    const headers = ['Staff Member', 'Work Days', 'Hours Logged', 'Overtime (h)', 'Hourly Rate (RM)', 'Calculated Pay (RM)'];
    const rows = MOCK_MONTHLY_REPORT.map(item => [
      item.name,
      `${item.days} Days`,
      `${item.hours}h`,
      item.overtime,
      item.rate,
      ((item.hours + item.overtime) * item.rate).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DentaCloud_Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Attendance & Payroll</h1>
          <p className="text-slate-500 font-medium text-sm">Biometric shift tracking and staff availability.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'terminal' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Daily Terminal
          </button>
          <button 
            onClick={() => isAuthorizedForReports ? setActiveTab('reports') : null}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'} ${!isAuthorizedForReports ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {!isAuthorizedForReports && <Lock size={12} />}
            Monthly Reports
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Live Status Board */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Users size={20} className="text-blue-600" /> Active Staff Status
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Find staff..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none w-48 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Team Member</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Action</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Today</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_ATTENDANCE.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((staff) => (
                      <tr key={staff.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                              <img src={`https://i.pravatar.cc/100?u=${staff.userId}`} alt={staff.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(staff.currentStatus)}`}>
                            {getStatusIcon(staff.currentStatus)}
                            {staff.currentStatus === 'In' ? 'On Duty' : staff.currentStatus === 'Out' ? 'Off Duty' : 'On Break'}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-600">
                          {staff.lastEvent}
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2">
                             <Timer size={14} className="text-slate-300" />
                             <span className="text-sm font-black text-slate-800">{staff.totalHoursToday}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Daily Log & Stats */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Fingerprint size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Terminal 01</h4>
                  <p className="text-2xl font-black uppercase tracking-tight">Biometric Node</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Place finger on hardware scanner to record attendance event instantly.</p>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint size={16} /> Scan Fingerprint
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center justify-between">
                Live Event Log
                <History size={16} className="text-slate-300" />
              </h3>
              <div className="space-y-6">
                {MOCK_RECORDS.map((record) => (
                  <div key={record.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${record.type === 'In' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      <div className="w-px flex-1 bg-slate-100 my-1 group-last:hidden" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-xs font-bold text-slate-800">{record.userName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {record.type === 'In' ? 'Clocked In' : record.type === 'Out' ? 'Clocked Out' : 'Started Break'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{record.timestamp.split(' ')[1]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Monthly Reports Tab - RESTRICTED */
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <BarChart3 size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">December</span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Clinical Hours</p>
              <p className="text-3xl font-black text-slate-900 mt-1">1,482h</p>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <DollarSign size={24} />
                </div>
                <ArrowUpRight size={20} className="text-emerald-500" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Est. Payroll Liabilities</p>
              <p className="text-3xl font-black text-slate-900 mt-1">RM42,850</p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-2xl text-blue-400">
                  <Calculator size={24} />
                </div>
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Payroll Actions</h4>
              <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                Finalize & Process Salary
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Staff Monthly Summary</h3>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Work Days</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Hours Logged</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Overtime</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Hourly Rate</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Calculated Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_MONTHLY_REPORT.map((item) => (
                    <tr key={item.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-800 text-sm">{item.name}</td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{item.days} Days</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-800">{item.hours}h</td>
                      <td className="px-8 py-5">
                        {item.overtime > 0 ? (
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+{item.overtime}h OT</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">RM{item.rate}/hr</td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-slate-900">RM{((item.hours + item.overtime) * item.rate).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <FingerprintScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onSuccess={() => {}} 
        mode="Identify" 
      />
    </div>
  );
};

export default Attendance;
