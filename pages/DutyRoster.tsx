
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Info,
  Calendar as CalendarIcon,
  X,
  FileSignature,
  AlertCircle,
  Stethoscope,
  Briefcase,
  Wallet,
  ShieldCheck,
  Check,
  MoreVertical,
  History
} from 'lucide-react';
import { useUser } from '../App';
import { LeaveRequest, User as StaffUser } from '../types';

const INITIAL_LEAVES: LeaveRequest[] = [];

const DutyRoster: React.FC = () => {
  const { currentUser, addAuditEntry } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date('2025-12-01'));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'my-leaves'>('roster');
  const [pendingOnly, setPendingOnly] = useState(false);

  const [newLeave, setNewLeave] = useState({
    type: 'Annual' as LeaveRequest['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const isAdmin = currentUser?.role === 'Admin';

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const request: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser!.id,
      userName: currentUser!.name,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      status: 'Pending',
      reason: newLeave.reason
    };
    setLeaves([...leaves, request]);
    addAuditEntry('Applied for Leave', 'Administrative', `Type: ${request.type}, Dates: ${request.startDate} to ${request.endDate}`);
    setIsApplyModalOpen(false);
    setNewLeave({ 
      type: 'Annual', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date().toISOString().split('T')[0], 
      reason: '' 
    });
  };

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const leave = leaves.find(l => l.id === id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    addAuditEntry(`Leave Request ${newStatus}`, 'Administrative', `Staff: ${leave?.userName}, Dates: ${leave?.startDate}`);
  };

  const getLeavesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return leaves.filter(l => {
      const isWithin = dateStr >= l.startDate && dateStr <= l.endDate;
      const isApproved = l.status === 'Approved';
      return isWithin && (isApproved || isAdmin);
    });
  };

  const getLeaveTypeStyles = (type: LeaveRequest['type']) => {
    switch (type) {
      case 'Annual': return 'bg-blue-500 text-white';
      case 'Medical': return 'bg-rose-500 text-white';
      case 'Emergency': return 'bg-amber-500 text-white';
      case 'Compassionate': return 'bg-purple-500 text-white';
    }
  };

  const annualLeaveTaken = useMemo(() => {
    if (!currentUser) return 0;
    
    return leaves
      .filter(l => l.userId === currentUser.id && l.type === 'Annual' && l.status === 'Approved')
      .reduce((total, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return total + diffDays;
      }, 0);
  }, [leaves, currentUser]);

  const annualLeaveEntitlement = currentUser?.annualLeaveEntitlement || 0;
  const leaveBalance = annualLeaveEntitlement - annualLeaveTaken;
  const leaveTakenPercentage = annualLeaveEntitlement > 0 ? (annualLeaveTaken / annualLeaveEntitlement) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Staff Duty Roster</h1>
          <p className="text-slate-500 font-medium text-sm">Managing clinical availability and leave tracking.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex">
              <button 
                onClick={() => setActiveTab('roster')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Team View
              </button>
              <button 
                onClick={() => setActiveTab('my-leaves')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-leaves' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                My Requests
              </button>
           </div>
           <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={16} /> Apply Leave
          </button>
        </div>
      </div>

      {activeTab === 'roster' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Roster Calendar */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                        <CalendarIcon size={20} />
                     </div>
                     <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{monthName} {year}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">Today</button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 grid-rows-5 min-h-[600px]">
                  {calendarDays.map((day, idx) => {
                    const isToday = day?.toDateString() === new Date().toDateString();
                    const dayLeaves = day ? getLeavesForDate(day) : [];
                    
                    return (
                      <div 
                        key={idx} 
                        className={`border-r border-b border-slate-100 p-3 flex flex-col gap-2 transition-colors hover:bg-slate-50/20 ${!day ? 'bg-slate-50/10' : ''}`}
                      >
                        {day && (
                          <>
                            <span className={`text-xs font-black self-end ${isToday ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100' : 'text-slate-400'}`}>
                              {day.getDate()}
                            </span>
                            <div className="space-y-1.5 overflow-hidden">
                              {dayLeaves.map(l => (
                                <div 
                                  key={l.id} 
                                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight flex items-center gap-1.5 transition-all truncate ${getLeaveTypeStyles(l.type)} ${l.status === 'Pending' ? 'opacity-60 grayscale' : ''}`}
                                  title={`${l.userName} - ${l.type} (${l.status})`}
                                >
                                  {l.status === 'Pending' ? <Clock size={8} /> : <Check size={8} />}
                                  {l.userName.split(' ').pop()}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>

          {/* Right Sidebar: Legends & Approvals */}
          <div className="space-y-6">
             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Roster Legend</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Annual Leave', style: 'bg-blue-500' },
                    { label: 'Medical Leave', style: 'bg-rose-500' },
                    { label: 'Emergency', style: 'bg-amber-500' },
                    { label: 'Compassionate', style: 'bg-purple-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.style}`} />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-50 mt-4">
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Pending Approval</span>
                    </div>
                  </div>
                </div>
             </div>
             
             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Leave Balance</h4>
                <div className="text-center">
                    <p className="text-4xl font-black text-slate-800 tracking-tighter">{leaveBalance}</p>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest -mt-1">Days Remaining</p>
                </div>
                <div className="my-6">
                    <div className="h-2 bg-slate-100 rounded-full w-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${leaveTakenPercentage}%` }} />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                        <span>Taken: {annualLeaveTaken}</span>
                        <span>Total: {annualLeaveEntitlement}</span>
                    </div>
                </div>
             </div>

             {isAdmin && (
               <div className="bg-slate-900 rounded-[40px] border border-slate-800 shadow-xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                     <ShieldCheck size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Pending Requests</h4>
                      <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        {leaves.filter(l => l.status === 'Pending').length}
                      </span>
                    </div>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                      {leaves.filter(l => l.status === 'Pending').map(l => (
                        <div key={l.id} className="p-4 bg-white/5 border border-white/10 rounded-[24px] space-y-4 animate-in slide-in-from-right-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[10px]">
                               {l.userName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-black uppercase tracking-tight truncate">{l.userName}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">{l.startDate} to {l.endDate}</p>
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${getLeaveTypeStyles(l.type)}`}>
                                 {l.type}
                              </span>
                            </div>
                          </div>
                          
                          {l.reason && (
                            <p className="text-[9px] text-slate-500 italic bg-white/5 p-2 rounded-lg leading-relaxed">
                              "{l.reason}"
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                             <button 
                              onClick={() => handleUpdateStatus(l.id, 'Rejected')}
                              className="py-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
                             >
                               Reject
                             </button>
                             <button 
                              onClick={() => handleUpdateStatus(l.id, 'Approved')}
                              className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                             >
                               Approve
                             </button>
                          </div>
                        </div>
                      ))}
                      {leaves.filter(l => l.status === 'Pending').length === 0 && (
                        <div className="py-12 text-center opacity-30">
                           <CheckCircle2 size={32} className="mx-auto mb-2" />
                           <p className="text-[9px] font-black uppercase tracking-widest">No pending actions</p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      ) : (
        /* My Leaves View */
        <div className="space-y-6 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <History size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Leave History</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Record of your time-off requests</p>
                   </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                       <th className="px-8 py-4">Request Period</th>
                       <th className="px-8 py-4">Category</th>
                       <th className="px-8 py-4">Reason Context</th>
                       <th className="px-8 py-4 text-right">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaves.filter(l => l.userId === currentUser?.id).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{l.startDate}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">to {l.endDate}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getLeaveTypeStyles(l.type)}`}>
                              {l.type}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">{l.reason || 'No specific details provided.'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                             l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             l.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                           }`}>
                             {l.status === 'Approved' && <CheckCircle2 size={12} />}
                             {l.status === 'Pending' && <Clock size={12} />}
                             {l.status === 'Rejected' && <XCircle size={12} />}
                             {l.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                    {leaves.filter(l => l.userId === currentUser?.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic text-sm">
                           No leave records found in your clinical profile.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
               <div className="flex flex-col">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Apply for Leave</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Schedule your clinical time-off</p>
               </div>
               <button onClick={() => setIsApplyModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleApplyLeave} className="p-8 space-y-6 overflow-y-auto">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Annual', 'Medical', 'Emergency', 'Compassionate'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewLeave({ ...newLeave, type })}
                        className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 ${
                          newLeave.type === type ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {type === 'Annual' && <CalendarDays size={18} />}
                        {type === 'Medical' && <Stethoscope size={18} />}
                        {type === 'Emergency' && <AlertCircle size={18} />}
                        {type === 'Compassionate' && <User size={18} />}
                        {type}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={newLeave.startDate}
                      onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date"
                      required
                      value={newLeave.endDate}
                      onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Additional Context</label>
                  <textarea 
                    value={newLeave.reason}
                    onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm resize-none h-32 text-slate-800"
                    placeholder="Provide a brief explanation for your clinical supervisor..."
                  />
               </div>

               <div className="pt-4 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3"
                  >
                    <FileSignature size={18} /> Submit Application
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutyRoster;
