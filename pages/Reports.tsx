import React, { useState, useMemo, useRef } from 'react';
import { Pill, Search, Download, Calendar, User, MapPin, FileSignature, Lock, BarChart3, Users, FileText as FileTextIcon } from 'lucide-react';
import { Patient } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useUser } from '../App';

const MOCK_PATIENTS: Patient[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890', dateOfBirth: '1985-06-15', gender: 'Male', address: '123 Maple St', medicalHistory: ['Allergy to Penicillin'], status: 'Active', lastVisit: '2023-11-20', registrationDate: new Date().toISOString().split('T')[0] },
  { id: '2', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', phone: '234-567-8901', dateOfBirth: '1992-02-28', gender: 'Female', address: '456 Oak Ave', medicalHistory: [], status: 'Active', lastVisit: '2023-12-05', registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', phone: '345-678-9012', dateOfBirth: '1978-09-10', gender: 'Male', address: '789 Pine Ln', medicalHistory: ['Diabetes Type 2'], status: 'Active', lastVisit: '2023-10-15', registrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: '4', firstName: 'Emma', lastName: 'Wilson', email: 'emma@example.com', phone: '456-789-0123', dateOfBirth: '2005-12-01', gender: 'Female', address: '321 Elm Dr', medicalHistory: ['Asthma'], status: 'Inactive', lastVisit: '2022-05-12', registrationDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: '5', firstName: 'David', lastName: 'Lee', email: 'david@example.com', phone: '567-890-1234', dateOfBirth: '1988-03-22', gender: 'Male', address: '654 Birch St', medicalHistory: [], status: 'Active', lastVisit: '2023-11-28', registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const PRESCRIPTION_LOG = [
    { id: '1', date: '2024-07-15', patientName: 'John Doe', medication: 'Amoxicillin 500mg', category: 'Antibiotics', address: '123 Maple St, North Hills, NY' },
    { id: '2', date: '2024-07-15', patientName: 'John Doe', medication: 'Ibuprofen 400mg', category: 'Analgesics', address: '123 Maple St, North Hills, NY' },
    { id: '3', date: '2024-07-14', patientName: 'Alice Smith', medication: 'Ibuprofen 400mg', category: 'Analgesics', address: '456 Oak Ave, Westside, NY' },
    { id: '4', date: '2024-07-14', patientName: 'Michael Brown', medication: 'Metronidazole 200mg', category: 'Antibiotics', address: '789 Pine Ln, Downtown, NY' },
    { id: '5', date: '2024-07-13', patientName: 'Emma Wilson', medication: 'Chlorhexidine Rinse 0.12%', category: 'Antiseptics', address: '321 Elm Dr, Highland, NY' },
    { id: '6', date: '2024-07-12', patientName: 'David Lee', medication: 'Clindamycin 300mg', category: 'Antibiotics', address: '654 Birch St, Riverside, NY' },
    { id: '7', date: '2024-07-12', patientName: 'Sarah Connor', medication: 'Dexamethasone 0.5mg', category: 'Steroids', address: '101 Cyberdyne Blvd, Valley, CA' },
    { id: '8', date: '2024-06-20', patientName: 'John Doe', medication: 'Chlorhexidine Rinse 0.12%', category: 'Antiseptics', address: '123 Maple St, North Hills, NY' },
    { id: '9', date: '2024-06-05', patientName: 'Alice Smith', medication: 'Amoxicillin 500mg', category: 'Antibiotics', address: '456 Oak Ave, Westside, NY' },
    { id: '10', date: '2024-05-15', patientName: 'Michael Brown', medication: 'Clindamycin 300mg', category: 'Antibiotics', address: '789 Pine Ln, Downtown, NY' },
    { id: '11', date: '2024-04-20', patientName: 'John Doe', medication: 'Dexamethasone 0.5mg', category: 'Steroids', address: '123 Maple St, North Hills, NY' },
    { id: '12', date: '2024-03-10', patientName: 'Alice Smith', medication: 'Metronidazole 200mg', category: 'Antibiotics', address: '456 Oak Ave, Westside, NY' },
    { id: '13', date: '2024-02-01', patientName: 'Michael Brown', medication: 'Ibuprofen 400mg', category: 'Analgesics', address: '789 Pine Ln, Downtown, NY' },
    { id: '14', date: '2023-11-22', patientName: 'David Lee', medication: 'Amoxicillin 500mg', category: 'Antibiotics', address: '654 Birch St, Riverside, NY' },
    { id: '15', date: '2023-09-01', patientName: 'Sarah Connor', medication: 'Amoxicillin 500mg', category: 'Antibiotics', address: '101 Cyberdyne Blvd, Valley, CA' },
];

const medicationCategories = ['All', 'Antibiotics', 'Analgesics', 'Antiseptics', 'Steroids'];

const Reports: React.FC = () => {
    const { addAuditEntry, patients } = useUser();
    const reportTableRef = useRef(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // State for tabs
    const [activeTab, setActiveTab] = useState<'analytics' | 'medication'>('medication');

    // State for Medication Report
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [medTimeFilter, setMedTimeFilter] = useState<'Day' | 'Week' | 'Month' | 'Year' | 'All Time' | 'Custom'>('All Time');
    const [medCustomStartDate, setMedCustomStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [medCustomEndDate, setMedCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

    // State for New Patient Analytics
    const [dateFilter, setDateFilter] = useState<'Today' | 'This Week' | 'This Month' | 'This Year'>('This Month');
    const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Other'>('All');
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });

    const filteredPrescriptions = useMemo(() => {
        const now = new Date();
        return PRESCRIPTION_LOG.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = medSearchTerm === '' ||
                p.patientName.toLowerCase().includes(medSearchTerm.toLowerCase()) ||
                p.medication.toLowerCase().includes(medSearchTerm.toLowerCase()) ||
                p.address.toLowerCase().includes(medSearchTerm.toLowerCase());
            
            const logDate = new Date(p.date);
            let dateMatch = false;
            switch (medTimeFilter) {
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
                    const start = new Date(medCustomStartDate); start.setHours(0,0,0,0);
                    const end = new Date(medCustomEndDate); end.setHours(23,59,59,999);
                    dateMatch = logDate >= start && logDate <= end;
                    break;
                case 'All Time': dateMatch = true; break;
                default: dateMatch = true;
            }

            return matchesCategory && matchesSearch && dateMatch;
        });
    }, [medSearchTerm, activeCategory, medTimeFilter, medCustomStartDate, medCustomEndDate]);

    const calculateAgeFromPatient = (p: Patient): number => {
        let dob: Date;
        if (p.icNumber && p.icNumber.replace(/\D/g, '').length >= 6) {
          const cleanIc = p.icNumber.replace(/\D/g, '');
          const yy = parseInt(cleanIc.substring(0, 2));
          const mm = parseInt(cleanIc.substring(2, 4)) - 1;
          const dd = parseInt(cleanIc.substring(4, 6));
          const currentYear = new Date().getFullYear();
          const currentYY = currentYear % 100;
          const century = yy > currentYY ? 1900 : 2000;
          dob = new Date(century + yy, mm, dd);
        } else {
          dob = new Date(p.dateOfBirth);
        }
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return isNaN(age) ? 0 : age;
    };
    
    const newPatientCount = useMemo(() => {
        const now = new Date();
        return patients.filter(patient => {
          if (!patient.registrationDate) return false;
          const regDate = new Date(patient.registrationDate);
          let dateMatch = false;
          switch (dateFilter) {
            case 'Today': dateMatch = regDate.toDateString() === now.toDateString(); break;
            case 'This Week':
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0,0,0,0);
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23,59,59,999);
              dateMatch = regDate >= startOfWeek && regDate <= endOfWeek;
              break;
            case 'This Month': dateMatch = regDate.getFullYear() === now.getFullYear() && regDate.getMonth() === now.getMonth(); break;
            case 'This Year': dateMatch = regDate.getFullYear() === now.getFullYear(); break;
          }
          if (!dateMatch) return false;
    
          const genderMatch = genderFilter === 'All' || patient.gender === genderFilter;
          if (!genderMatch) return false;
          
          const age = calculateAgeFromPatient(patient);
          const minAge = ageRange.min === '' ? 0 : parseInt(ageRange.min, 10);
          const maxAge = ageRange.max === '' ? 999 : parseInt(ageRange.max, 10);
          const ageMatch = age >= minAge && age <= maxAge;
          if (!ageMatch) return false;
    
          return true;
        }).length;
    }, [dateFilter, genderFilter, ageRange, patients]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Antibiotics': return 'text-blue-600';
            case 'Analgesics': return 'text-emerald-600';
            case 'Antiseptics': return 'text-purple-600';
            case 'Steroids': return 'text-amber-600';
            default: return 'text-slate-600';
        }
    };

    const getPatientInitialColor = (name: string) => {
        const colors = ['bg-emerald-100', 'bg-blue-100', 'bg-amber-100', 'bg-purple-100', 'bg-pink-100'];
        const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    const handleExportPDF = () => {
        const input = reportTableRef.current;
        if (!input) return;
        addAuditEntry('Exported Report PDF', 'Clinical', 'Generated PDF of Medication Dispensation Log.');
        html2canvas(input, { scale: 2, useCORS: true })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                const imgWidth = pdfWidth - 20; // with margin
                const imgHeight = imgWidth / ratio;
                
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight > pdfHeight - 20 ? pdfHeight - 20 : imgHeight);
                pdf.save(`dispensation-report-${new Date().toISOString().split('T')[0]}.pdf`);
            });
    };

    const handleExportCSV = () => {
        addAuditEntry('Exported Report CSV', 'Clinical', 'Generated CSV of Medication Dispensation Log.');
        const headers = ['ID', 'Date', 'Patient Name', 'Medication', 'Category', 'Address'];
        const rows = filteredPrescriptions.map(p => [
            p.id,
            p.date,
            `"${p.patientName}"`,
            `"${p.medication}"`,
            p.category,
            `"${p.address}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `dispensation-report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Clinical Reports</h1>
              <p className="text-slate-600 font-medium text-sm">Analyze clinical data and generate audit logs.</p>
            </div>

            <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex max-w-lg">
                <button 
                    onClick={() => setActiveTab('medication')}
                    className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'medication' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <FileTextIcon size={14} /> Dispensation Log
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <BarChart3 size={14} /> Patient Analytics
                </button>
            </div>

            {activeTab === 'analytics' && (
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm animate-in fade-in">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-6">
                        <Users size={20} className="text-blue-600"/>
                        New Patient Registrations
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Date Range</label>
                            <select value={dateFilter} onChange={e => setDateFilter(e.target.value as any)} className="mt-1.5 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={12}/> Gender</label>
                            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as any)} className="mt-1.5 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>All</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Age</label>
                            <input type="number" placeholder="0" value={ageRange.min} onChange={e => setAgeRange({...ageRange, min: e.target.value})} className="mt-1.5 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"/>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Age</label>
                            <input type="number" placeholder="100" value={ageRange.max} onChange={e => setAgeRange({...ageRange, max: e.target.value})} className="mt-1.5 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"/>
                        </div>
                    </div>
                    <div className="text-center mt-8 py-8 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-6xl font-black text-blue-600 tracking-tighter">{newPatientCount}</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">New Patients Match Criteria</p>
                    </div>
                </div>
            )}

            {activeTab === 'medication' && (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in" ref={reportTableRef}>
                    <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-50/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <FileSignature size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Medication Dispensation Report</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Detailed log of clinical prescriptions and patient addresses</p>
                            </div>
                        </div>
                        <div className="relative">
                            <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">
                                <Download size={14} /> Export Report
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 z-10 p-2" onMouseLeave={() => setIsExportMenuOpen(false)}>
                                    <button onClick={handleExportPDF} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Export as PDF</button>
                                    <button onClick={handleExportCSV} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Export as CSV</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            {medicationCategories.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeCategory === cat ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>
                                    {cat !== 'All' && <div className={`w-2 h-2 rounded-full ${getCategoryColor(cat).replace('text-', 'bg-')}`} />}
                                    {cat}
                                </button>
                            ))}
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                {(['All Time', 'Day', 'Week', 'Month', 'Year', 'Custom'] as const).map(period => (
                                    <button key={period} onClick={() => setMedTimeFilter(period)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${ medTimeFilter === period ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800' }`}>
                                        {period}
                                    </button>
                                ))}
                            </div>
                            {medTimeFilter === 'Custom' && (
                                <div className="flex items-center gap-1 animate-in fade-in duration-300 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <input type="date" value={medCustomStartDate} onChange={e => setMedCustomStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-600 outline-none" />
                                    <span className="text-slate-400 font-bold text-[10px] px-1">to</span>
                                    <input type="date" value={medCustomEndDate} onChange={e => setMedCustomEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-600 outline-none" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-0 overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-4">#</th>
                                    <th className="px-8 py-4"><div className="flex items-center gap-2"><Calendar size={12} /> Issued Date</div></th>
                                    <th className="px-8 py-4"><div className="flex items-center gap-2"><User size={12} /> Patient Name</div></th>
                                    <th className="px-8 py-4"><div className="flex items-center gap-2"><Pill size={12} /> Medication Type</div></th>
                                    <th className="px-8 py-4"><div className="flex items-center gap-2"><MapPin size={12} /> Patient Address</div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPrescriptions.map((record, idx) => (
                                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-slate-500">{record.date}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${getPatientInitialColor(record.patientName)} flex items-center justify-center font-black text-[10px] uppercase text-slate-600`}>
                                                    {record.patientName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{record.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{record.medication}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${getCategoryColor(record.category)}`}>{record.category}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="max-w-[300px]">
                                                <p className="text-xs font-medium text-slate-500 truncate" title={record.address}>{record.address}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Lock size={10} />
                            Restricted Data: Access to full patient addresses is logged for HIPAA compliance auditing
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;