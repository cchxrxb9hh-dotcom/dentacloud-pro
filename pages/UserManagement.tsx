
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Briefcase, 
  Wallet, 
  Stethoscope as DoctorIcon, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Mail,
  ShieldAlert,
  Search,
  CheckCircle2,
  X,
  Save,
  CreditCard,
  MapPin,
  Phone,
  MessageSquare,
  Folder,
  Calendar
} from 'lucide-react';
import { User, UserRole } from '../types';
import MyKadReader from '../components/MyKadReader';
import { useUser } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';
import StaffDocumentsModal from '../components/StaffDocumentsModal';

const INITIAL_STAFF: User[] = [];

const UserManagement: React.FC = () => {
  const { addAuditEntry } = useUser();
  const [staff, setStaff] = useState<User[]>(() => {
    const saved = localStorage.getItem('denta_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [docsStaff, setDocsStaff] = useState<User | null>(null);
  const [isMyKadOpen, setIsMyKadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    localStorage.setItem('denta_staff', JSON.stringify(staff));
  }, [staff]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin': return <ShieldCheck size={14} className="text-purple-600" />;
      case 'Doctor': return <DoctorIcon size={14} className="text-blue-600" />;
      case 'Assistant': return <Briefcase size={14} className="text-emerald-600" />;
      case 'Accountant': return <Wallet size={14} className="text-amber-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Doctor': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Assistant': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Accountant': return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ role: 'Assistant', status: 'Active', annualLeaveEntitlement: 18 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
        setStaff(staff.filter(s => s.id !== userToDelete.id));
        addAuditEntry('Deleted Staff Member', 'Administrative', `Removed profile for ${userToDelete.name}`);
        setUserToDelete(null);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setStaff(staff.map(s => (s.id === editingUser.id ? { ...s, ...formData } as User : s)));
      addAuditEntry('Updated Staff Profile', 'Administrative', `Details updated for ${formData.name}`);
    } else {
      const newUser: User = {
        id: `s-${Date.now()}`,
        ...formData
      } as User;
      setStaff([...staff, newUser]);
      addAuditEntry('Registered New Staff', 'Administrative', `Added profile for ${newUser.name}`);
    }
    setIsModalOpen(false);
  };
  
  const handleMyKadSuccess = (data: any) => {
    setFormData(prev => ({
      ...prev,
      name: data.fullName,
      icNumber: data.icNumber,
      address: data.address
    }));
    setIsMyKadOpen(false);
  };

  const handleOpenDocsModal = (user: User) => {
    setDocsStaff(user);
    setIsDocsModalOpen(true);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    (s.icNumber && s.icNumber.includes(searchTerm))
  );

  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${sanitized}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Staff Management</h1>
          <p className="text-slate-500 font-medium text-sm">Control clinic access and personnel contact records.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
        >
          <UserPlus size={18} /> Register Staff
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search staff by name, IC, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">#</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Staff Identity</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Clinical Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStaff.map((user, idx) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 font-bold text-slate-400">{idx + 1}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {user.icNumber && (
                          <p className="text-[9px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-tight">
                            <CreditCard size={10} /> {user.icNumber}
                          </p>
                        )}
                        <a href={`mailto:${user.email}`} className="text-xs text-slate-400 font-medium flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                          <Mail size={10} className="text-slate-300" /> {user.email}
                        </a>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-tight">
                            <Phone size={10} className="text-slate-300" /> {user.phone}
                          </p>
                          {user.phone && (
                            <button 
                              onClick={() => openWhatsApp(user.phone!)}
                              className="text-emerald-500 hover:text-emerald-600 transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => handleOpenDocsModal(user)}
                    className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"
                    title="Document Folder"
                  >
                    <Folder size={16} />
                  </button>
                  <button onClick={() => handleOpenEditModal(user)} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100 ml-1">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleOpenDeleteModal(user)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100 ml-1">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingUser ? 'Edit Staff Profile' : 'Staff Registration'}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{editingUser ? 'Update clinical profile' : 'New clinical profile'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMyKadOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  <CreditCard size={14} /> MyKad
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                  placeholder="e.g. Dr. Jane Foster"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard size={12} className="text-blue-500" /> Identification Card (IC) Number
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.icNumber || ''}
                  onChange={e => setFormData({...formData, icNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                  placeholder="XXXXXX-XX-XXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                    placeholder="jane.f@dentacloud.pro"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                    placeholder="+60123456789"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-500" /> Residential Address
                </label>
                <textarea 
                  value={formData.address || ''}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm resize-none text-slate-800"
                  placeholder="Full street address, city, state"
                  rows={2}
                />
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Role</label>
                    <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                    >
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Doctor">Doctor (Clinical Access)</option>
                      <option value="Assistant">Assistant (Records Access)</option>
                      <option value="Accountant">Accountant (Financial Access)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-500" /> Annual Leave (Days)
                    </label>
                    <input 
                      type="number"
                      value={formData.annualLeaveEntitlement || ''}
                      onChange={e => setFormData({...formData, annualLeaveEntitlement: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm text-slate-800"
                      placeholder="e.g. 20"
                    />
                  </div>
              </div>


              <div className="pt-4 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {editingUser ? 'Save Changes' : 'Authorize User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title={`Delete Staff: ${userToDelete?.name}?`}
        message="This will permanently remove the staff member's profile and access. This action is irreversible."
        confirmLabel="Confirm Deletion"
      />

      <StaffDocumentsModal 
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        staff={docsStaff}
      />

      <MyKadReader 
        isOpen={isMyKadOpen} 
        onClose={() => setIsMyKadOpen(false)} 
        onSuccess={handleMyKadSuccess} 
      />
    </div>
  );
};

export default UserManagement;
