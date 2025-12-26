import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileBadge, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Check, 
  MoreVertical, 
  Camera, 
  Phone, 
  Calendar, 
  X,
  Folder,
  LayoutList,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Filter,
  ArrowLeft,
  User
} from 'lucide-react';
import { IncomingReferral, ClinicalFile } from '../types';
import AddReferralModal from '../components/AddReferralModal';
import { useUser } from '../App';
import CameraModal from '../components/CameraModal';
import ImageViewer from '../components/ImageViewer';

const Referrals: React.FC = () => {
    const { addAuditEntry } = useUser();
    const [referrals, setReferrals] = useState<IncomingReferral[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'LIST' | 'FOLDER'>('LIST');
    const [viewingReferralId, setViewingReferralId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    // Media Viewer State
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState<ClinicalFile[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Initial Load Mock (matching screenshot data)
    useEffect(() => {
        const initial = [
          { id: 'ref1', referringDoctor: 'Dr. Emily Carter', referringClinic: 'City General Hospital', patientName: 'Samantha Ray', patientContact: '555-0101', reason: 'Evaluation for wisdom tooth extraction (#18, #28).', date: '2025-12-24', status: 'Scheduled', attachments: [] },
          { id: 'ref2', referringDoctor: 'Dr. Ben Hanson', referringClinic: 'SmileBright Dental', patientName: 'Thomas Green', patientContact: '555-0102', reason: 'Endodontic consultation for tooth #14, persistent pain.', date: '2025-12-24', status: 'Completed', attachments: [] },
          { id: 'ref3', referringDoctor: 'Dr. Anya Sharma', referringClinic: 'Community Health Clinic', patientName: 'Maria Garcia', patientContact: '555-0103', reason: 'Pediatric patient with multiple caries, requires specialist care.', date: '2025-12-24', status: 'Pending Review', attachments: [] },
          { id: 'ref4', referringDoctor: 'Dr. Ken Miles', referringClinic: 'Prestige Orthodontics', patientName: 'Leo Fitzpatrick', patientContact: '555-0104', reason: 'Post-ortho assessment and routine cleaning.', date: '2025-12-24', status: 'Contacted', attachments: [] },
        ];
        setReferrals(initial as any);
    }, []);

    const filteredReferrals = useMemo(() => {
        return referrals.filter(r => 
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [referrals, searchTerm]);

    const activeReferral = useMemo(() => {
        return referrals.find(r => r.id === viewingReferralId);
    }, [referrals, viewingReferralId]);

    const referralAttachments = useMemo(() => {
        if (!viewingReferralId) return [];
        const referral = referrals.find(r => r.id === viewingReferralId);
        if (!referral || !referral.attachments) return [];

        return referral.attachments.map((att, idx) => ({
            id: `${referral.id}-att-${idx}`,
            name: att.name,
            url: att.url,
            category: 'Picture' as const,
            date: referral.date,
            content: `Referral ID: ${referral.id}`
        }));
    }, [referrals, viewingReferralId]);

    const handleAddReferral = (newReferral: Omit<IncomingReferral, 'id'>) => {
        const newRef = { ...newReferral, id: `ref${Date.now()}`, attachments: [] };
        setReferrals(prev => [newRef, ...prev]);
        addAuditEntry('Added Incoming Referral', 'Clinical', `From: ${newReferral.referringDoctor} for ${newReferral.patientName}`);
    };
    
    const handleCapture = (base64Image: string) => {
        if (!selectedReferralId) return;
        const referral = referrals.find(r => r.id === selectedReferralId);
        if (!referral) return;

        setReferrals(prevReferrals =>
            prevReferrals.map(r => {
                if (r.id === selectedReferralId) {
                    const newAttachment = {
                        name: `Referral Doc - ${r.patientName} - ${new Date().toLocaleDateString()}.jpg`,
                        url: base64Image,
                    };
                    return { ...r, attachments: [...(r.attachments || []), newAttachment] };
                }
                return r;
            })
        );
        addAuditEntry('Scanned Referral Document', 'Clinical', `Document stored in individual folder for ${referral.patientName}`);
        setIsCameraOpen(false);
        setSelectedReferralId(null);
    };

    const handleUpdateStatus = (id: string, status: IncomingReferral['status']) => {
        setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        setOpenMenuId(null);
    };

    const handleOpenFolder = (id: string) => {
        setViewingReferralId(id);
        setActiveTab('FOLDER');
    };

    const openFile = (file: ClinicalFile) => {
        setViewerImages([file]);
        setViewerIndex(0);
        setIsViewerOpen(true);
    };

    const getStatusStyles = (status: IncomingReferral['status']) => {
        switch (status) {
            case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Contacted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Scheduled': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Referral Management</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Track and process incoming patient referrals from external clinics.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group"
                >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:scale-110 transition-transform"><Plus size={14} /></div>
                    Add Incoming Referral
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex-1 w-full flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by patient, referring doctor, or reason..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl text-sm focus:ring-0 outline-none transition-all font-medium placeholder-slate-400"
                        />
                    </div>
                </div>
                
                <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex shrink-0">
                    <button 
                        onClick={() => setActiveTab('LIST')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutList size={14} /> Referral List
                    </button>
                    <button 
                        onClick={() => setActiveTab('FOLDER')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FOLDER' ? 'bg-white text-blue-600 border border-blue-100 shadow-md shadow-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Folder size={14} /> Referral Folder
                    </button>
                </div>
            </div>

            {activeTab === 'LIST' ? (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">#</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Referred By</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredReferrals.map((ref, idx) => (
                                    <tr key={ref.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 align-top">
                                            <span className="text-sm font-black text-slate-300">{idx + 1}</span>
                                        </td>
                                        <td className="px-8 py-6 align-top">
                                            <div className="space-y-0.5">
                                                <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{ref.patientName}</p>
                                                <p className="text-xs text-slate-500 font-bold">{ref.patientContact}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 align-top">
                                            <div className="space-y-0.5">
                                                <p className="font-black text-slate-700 text-sm uppercase tracking-tight">{ref.referringDoctor}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ref.referringClinic}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 align-top max-w-sm">
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{ref.reason}</p>
                                        </td>
                                        <td className="px-8 py-6 align-top text-center">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${getStatusStyles(ref.status)}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 align-top text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => { setSelectedReferralId(ref.id); setIsCameraOpen(true); }}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all"
                                                    title="Scan Referral"
                                                >
                                                    <Camera size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenFolder(ref.id)}
                                                    className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                                                    title="View Individual Folder"
                                                >
                                                    <Folder size={18} />
                                                </button>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setOpenMenuId(openMenuId === ref.id ? null : ref.id)}
                                                        className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {openMenuId === ref.id && (
                                                        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                                                            <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Workflow Stage</p>
                                                            {(['Contacted', 'Scheduled', 'Completed', 'Rejected'] as const).map(status => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleUpdateStatus(ref.id, status)}
                                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                                                                >
                                                                    {status}
                                                                    {ref.status === status && <Check size={12} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredReferrals.length === 0 && (
                            <div className="py-32 text-center">
                                <FileBadge size={64} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No incoming referrals matched</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setActiveTab('LIST')}
                                className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                                title="Back to List"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Folder size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                        {activeReferral ? `${activeReferral.patientName}'s Folder` : 'Patient Folder'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {activeReferral ? `Referred by: ${activeReferral.referringDoctor} • ${activeReferral.referringClinic}` : 'Select a referral to view individual attachments.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {activeReferral && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral ID</p>
                                    <p className="text-xs font-black text-slate-700">#{activeReferral.id}</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedReferralId(activeReferral.id); setIsCameraOpen(true); }}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg"
                                >
                                    <Camera size={16} /> New Scan
                                </button>
                            </div>
                        )}
                    </div>

                    {!viewingReferralId ? (
                        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <User size={40} className="text-slate-200" />
                            </div>
                            <h4 className="text-slate-600 font-black uppercase tracking-widest text-sm">Individual Folder Access</h4>
                            <p className="text-slate-400 text-xs mt-2 max-w-sm">Please click the folder icon <Folder size={12} className="inline mx-1"/> next to a patient in the Referral List to access their individual clinical attachments.</p>
                            <button 
                                onClick={() => setActiveTab('LIST')}
                                className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800"
                            >
                                Back to Referral List
                            </button>
                        </div>
                    ) : referralAttachments.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {referralAttachments.map((file) => (
                                <div key={file.id} onClick={() => openFile(file)} className="group relative cursor-pointer">
                                    <div className="aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 transition-all hover:scale-105 hover:shadow-xl hover:border-blue-300 shadow-sm">
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <button className="bg-white text-slate-900 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                <ExternalLink size={12} /> Full View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 px-1">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Calendar size={10} /> {file.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px]">
                            <ImageIcon size={48} className="text-slate-100 mb-4" />
                            <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs">No attachments found for this patient</h4>
                            <p className="text-slate-300 text-[10px] mt-2">Use the "New Scan" button above to capture and store referral documents.</p>
                        </div>
                    )}
                </div>
            )}

            <AddReferralModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddReferral}
            />
            <CameraModal 
                isOpen={isCameraOpen} 
                onClose={() => setIsCameraOpen(false)} 
                onCapture={handleCapture} 
            />
            <ImageViewer 
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                images={viewerImages}
                currentIndex={viewerIndex}
                onNavigate={setViewerIndex}
            />
        </div>
    );
};

export default Referrals;