
import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, Calendar, DollarSign, Stethoscope, User, MapPin } from 'lucide-react';
import { useUser } from '../App';
import { Invoice, TreatmentLogEntry, TreatmentService } from '../types';

const TreatmentLog: React.FC = () => {
    const { settings, globalInvoices, services } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTreatment, setSelectedTreatment] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [timeFilter, setTimeFilter] = useState<'Day' | 'Week' | 'Month' | 'Year' | 'Custom'>('Month');
    const [customStartDate, setCustomStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

    const treatmentLogs = useMemo(() => {
        return globalInvoices.flatMap(inv => 
            inv.status === 'Paid' ? inv.items.map((item, index) => ({
                id: `${inv.id}-${index}`,
                patientId: inv.patientId,
                patientName: inv.patientName,
                branchId: inv.branchId,
                date: inv.date,
                treatment: item.description,
                amount: item.price,
                providerId: inv.providerId || 'N/A',
                providerName: inv.providerName || 'N/A',
            })) : []
        );
    }, [globalInvoices]);

    const treatmentTypes = useMemo(() => {
        return ['All', ...Array.from(new Set(services.map(s => s.name)))];
    }, [services]);

    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(services.map(s => s.category)))];
    }, [services]);

    const filteredLogs = useMemo(() => {
        const now = new Date();
        return treatmentLogs.filter(log => {
            // Date Filter
            const logDate = new Date(log.date);
            let dateMatch = false;
            switch (timeFilter) {
                case 'Day': dateMatch = logDate.toDateString() === now.toDateString(); break;
                case 'Week':
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0,0,0,0);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23,59,59,999);
                    dateMatch = logDate >= startOfWeek && logDate <= endOfWeek;
                    break;
                case 'Month': dateMatch = logDate.getFullYear() === now.getFullYear() && logDate.getMonth() === now.getMonth(); break;
                case 'Year': dateMatch = logDate.getFullYear() === now.getFullYear(); break;
                case 'Custom':
                    const start = new Date(customStartDate); start.setHours(0,0,0,0);
                    const end = new Date(customEndDate); end.setHours(23,59,59,999);
                    dateMatch = logDate >= start && logDate <= end;
                    break;
                default: dateMatch = true;
            }

            // Treatment Filter
            const treatmentMatch = selectedTreatment === 'All' || log.treatment === selectedTreatment;

            // Category Filter
            const service = services.find(s => s.name === log.treatment);
            const categoryMatch = selectedCategory === 'All' || (service && service.category === selectedCategory);

            // Search Filter
            const searchMatch = log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.providerName.toLowerCase().includes(searchTerm.toLowerCase());
            
            return dateMatch && treatmentMatch && searchMatch && categoryMatch;
        });
    }, [searchTerm, selectedTreatment, selectedCategory, timeFilter, customStartDate, customEndDate, treatmentLogs, services]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Treatment Log</h1>
                    <p className="text-slate-500 font-medium text-sm">A comprehensive record of all performed clinical procedures.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search by patient or provider..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-blue-100 outline-none"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat} Category</option>)}
                    </select>
                    <select
                        value={selectedTreatment}
                        onChange={(e) => setSelectedTreatment(e.target.value)}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-blue-100 outline-none"
                    >
                        {treatmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(['Day', 'Week', 'Month', 'Year', 'Custom'] as const).map(period => (
                            <button
                                key={period}
                                onClick={() => setTimeFilter(period)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                timeFilter === period ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    {timeFilter === 'Custom' && (
                        <div className="flex items-center gap-1 animate-in fade-in duration-300 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 outline-none" />
                            <span className="text-slate-400 font-bold text-xs px-1">to</span>
                            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 outline-none" />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-8 py-5">#</th>
                                <th className="px-8 py-5">Patient</th>
                                <th className="px-8 py-5">Treatment</th>
                                <th className="px-8 py-5">Provider</th>
                                <th className="px-8 py-5">Branch</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log, idx) => {
                                const branch = settings.branches.find(b => b.id === log.branchId);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-black text-xs text-blue-600 border border-blue-100">
                                                    {log.patientName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{log.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-sm font-bold text-slate-800">{log.treatment}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                             <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-xs font-medium text-slate-600">{log.providerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-xs font-medium text-slate-600">{branch?.name || log.branchId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-xs font-medium text-slate-600">{log.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-sm font-black text-emerald-600">RM{log.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                )
                            })}
                             {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <ClipboardList size={48} className="mb-4 opacity-30" />
                                            <h4 className="font-bold">No Treatment Records Found</h4>
                                            <p className="text-sm">Try adjusting your filters to find what you're looking for.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TreatmentLog;