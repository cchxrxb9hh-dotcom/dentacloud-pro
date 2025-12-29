import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Users, 
  Search, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  UserCircle,
  BarChart3,
  Stethoscope,
  ChevronDown,
  ShieldCheck,
  Stethoscope as DoctorIcon,
  Briefcase,
  Wallet,
  DatabaseZap,
  UserCog,
  AlertCircle,
  Fingerprint,
  ChevronLeft,
  PieChart as ReportsIcon,
  LayoutGrid,
  Pill,
  ClipboardList,
  CalendarDays,
  FileText,
  FileBadge,
  Globe,
  CreditCard
} from 'lucide-react';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import Appointments from './pages/Appointments';
import Accounting from './pages/Accounting';
import Treatments from './pages/Treatments';
import Pharmacy from './pages/Pharmacy';
import MigrationCenter from './pages/MigrationCenter';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import AuditTrail from './pages/AuditTrail';
import DutyRoster from './pages/DutyRoster';
import Login from './pages/Login';
import DocumentEditor from './pages/DocumentEditor';
import Referrals from './pages/Referrals';
import TreatmentLog from './pages/TreatmentLog';
import ClinicPanels from './pages/ClinicPanels';
import Billing from './pages/Billing';
import { User, UserRole, ClinicSettings, AuditEntry, Invoice, Expense, Patient, TreatmentService } from './types';

const { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } = ReactRouterDOM;
const Router = HashRouter;

// Scroll Management Utility
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainElement = document.getElementById('main-scroll-container');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

const DEFAULT_INVOICE_TEMPLATE = `
<div style="font-family: 'Inter', sans-serif; padding: 2.5rem; color: #1e293b;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #1e293b; padding-bottom: 1rem; margin-bottom: 2.5rem;">
    <div>
      <h1 style="font-size: 3rem; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.05em;">INVOICE</h1>
      <p style="color: #64748b; margin: 0; font-weight: 700;">#{{invoiceNumber}}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="font-size: 1.125rem; font-weight: 800; margin: 0;">{{businessName}}</h2>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0.25rem 0;">{{businessAddress}}</p>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0.25rem 0;">{{businessPhone}}</p>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
    <div>
      <h3 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; font-weight: 700;">BILLED TO</h3>
      <p style="font-weight: 700; margin: 0;">{{customerName}}</p>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0.25rem 0;">ID: {{customerReference}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; font-weight: 700;">DETAILS</h3>
      <p style="font-weight: 700; margin: 0;">Date Issued: {{dateOfSale}}</p>
      <p style="font-weight: 700; margin: 0;">Due Date: Immediate</p>
    </div>
  </div>
  {{items_html_table}}
  <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
    <div style="width: 22rem;">
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; font-size: 0.875rem;"><span style="color: #64748b; font-weight: 500;">Subtotal</span><span style="font-weight: 700;">{{currency}}{{subtotal}}</span></div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; font-size: 0.875rem; border-bottom: 1px solid #e2e8f0;"><span style="color: #64748b; font-weight: 500;">SST ({{taxRate}}%)</span><span style="font-weight: 700;">{{currency}}{{totalTax}}</span></div>
      <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-weight: 900; font-size: 1.75rem;"><span>TOTAL DUE</span><span>{{currency}}{{totalAmount}}</span></div>
    </div>
  </div>
</div>
`;

const DEFAULT_RECEIPT_TEMPLATE = `
<div style="font-family: 'Inter', sans-serif; padding: 2.5rem; color: #1e293b;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #16a34a; padding-bottom: 1rem; margin-bottom: 2.5rem;">
    <div>
      <h1 style="font-size: 3rem; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.05em;">RECEIPT</h1>
      <p style="color: #64748b; margin: 0; font-weight: 700;">#{{receiptNumber}}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="font-size: 1.125rem; font-weight: 800; margin: 0;">{{businessName}}</h2>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0.25rem 0;">{{businessAddress}}</p>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
    <div>
      <h3 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; font-weight: 700;">RECEIVED FROM</h3>
      <p style="font-weight: 700; margin: 0;">{{customerName}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; font-weight: 700;">PAYMENT DETAILS</h3>
      <p style="font-weight: 700; margin: 0;">Date Paid: {{dateOfSale}}</p>
      <p style="font-weight: 700; margin: 0;">Method: {{paymentMethod}}</p>
    </div>
  </div>
  {{items_html_table}}
  <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
    <div style="width: 22rem;">
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 1.25rem; font-size: 0.875rem; border-bottom: 1px solid #e2e8f0;"><span style="color: #64748b; font-weight: 500;">Invoice Total</span><span style="font-weight: 700;">{{currency}}{{totalAmount}}</span></div>
      <div style="display: flex; justify-content: space-between; padding: 1rem 1.25rem; font-weight: 900; font-size: 1.25rem; background-color: #dcfce7; border-radius: 1rem; color: #166534; margin-top: 0.5rem;"><span>AMOUNT PAID</span><span>{{currency}}{{totalPaid}}</span></div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 1.25rem; font-size: 0.875rem; margin-top: 0.5rem;"><span style="color: #64748b; font-weight: 500;">Balance Due</span><span style="font-weight: 700;">{{currency}}{{balanceDue}}</span></div>
    </div>
  </div>
</div>
`;

const DEFAULT_SETTINGS: Omit<ClinicSettings, ''> = {
  clinicName: 'DentaCloud Pro',
  companyName: 'DentaCloud Solutions Ltd.',
  supportEmail: 'support@dentacloud.pro',
  autoLogoutTime: 30,
  currency: 'RM',
  taxSstRate: 6,
  whatsappReminderTemplate: 'Hello {{patientName}}, this is a friendly reminder for your appointment at {{branchName}} for {{treatmentType}} on {{date}} at {{time}}. Please let us know if you need to reschedule. Thank you!',
  reminderTimingValue: 24,
  reminderTimingUnit: 'hours',
  branches: [
    { id: 'b1', name: 'DentaCloud HQ', companyName: 'DentaCloud HQ Sdn Bhd', address: '101 Medical Plaza, 50480 Kuala Lumpur', phone: '03-555-0100', email: 'hq@dentacloud.pro', color: 'blue', tin: 'C2993301820', sstNumber: 'SST-01-23-45678910', logo: 'https://share.google/e1y6lPuG4zQWO5Gzv' },
    { id: 'b2', name: 'DentaCloud North', companyName: 'DentaCloud North Ltd', address: '404 Sunset Blvd, 47800 Petaling Jaya', phone: '03-555-0200', email: 'north@dentacloud.pro', color: 'emerald', tin: 'C2993301821', sstNumber: 'SST-01-23-45678911', logo: 'https://share.google/FPPEPvuOlkLFD9jbx' },
    { id: 'b3', name: 'DentaCloud South', companyName: 'DentaCloud South Services', address: '707 Highland Ave, 11950 Penang', phone: '03-555-0300', email: 'south@dentacloud.pro', color: 'indigo', tin: 'C2993301822', sstNumber: 'SST-01-23-45678912', logo: 'https://share.google/79JV9LzXOn1aWOwlC' },
  ],
  paymentMethods: [
    { id: 'pm1', name: 'Cash', type: 'Cash', isActive: true },
    { id: 'pm2', name: 'Credit Card', type: 'Card', isActive: true },
    { id: 'pm3', name: 'Bank Transfer', type: 'Transfer', isActive: true },
    { id: 'pm4', name: 'Insurance Billing', type: 'Insurance', isActive: true },
  ],
  clinicPanels: [],
  invoiceTemplate: DEFAULT_INVOICE_TEMPLATE,
  receiptTemplate: DEFAULT_RECEIPT_TEMPLATE,
};

const INITIAL_MOCK_INVOICES: Invoice[] = [];

const INITIAL_MOCK_EXPENSES: Expense[] = [];

const INITIAL_MOCK_PATIENTS: Patient[] = [];

const INITIAL_MOCK_SERVICES: TreatmentService[] = [
  { id: '1', name: 'Comprehensive Consultation', category: 'Diagnostic', description: "A thorough evaluation of oral health, including dental charting, periodontal assessment, cancer screening, and personalized treatment planning.", cost: 50, duration: '30 min', commonNotes: "Patient presented for a comprehensive exam. Full mouth dental charting, periodontal probing, and oral cancer screening performed. Discussed findings with patient and formulated a personalized treatment plan. Patient understands and agrees to the proposed treatment." },
  { id: '2', name: 'Scaling & Polishing', category: 'General', description: "Professional cleaning procedure to remove plaque, calculus (tartar), and external stains, promoting gum health and a brighter smile.", cost: 100, duration: '45 min', commonNotes: "Performed full mouth scaling to remove supra and subgingival calculus. Polished all teeth with prophy paste. Oral hygiene instructions reviewed and reinforced, emphasizing proper flossing technique. Patient tolerated procedure well." },
  { id: '3', name: 'Composite Filling', category: 'General', description: "Restoration of a decayed or fractured tooth using a tooth-colored composite resin material for a natural and durable finish.", cost: 150, duration: '45 min', commonNotes: "Administered local anesthesia. Isolated tooth with rubber dam. Removed carious lesion using high-speed handpiece. Etched, bonded, and placed composite resin in increments. Light-cured, finished, and polished. Occlusion checked and adjusted. Post-op instructions given." },
  { id: '4', name: 'Root Canal Treatment', category: 'Surgical', description: "An endodontic procedure to treat infection at the center of a tooth by removing the infected pulp, cleaning, and sealing the root canal system.", cost: 500, duration: '90 min', commonNotes: "Administered local anesthesia and isolated tooth with rubber dam. Accessed pulp chamber and located canals. Cleaned and shaped canals using rotary files and irrigation with sodium hypochlorite. Obturated canals with gutta-percha and sealer. Placed temporary filling. Patient advised to return for permanent restoration." },
  { id: '5', name: 'Surgical Extraction', category: 'Surgical', description: "A complex dental procedure for the removal of teeth that are not easily accessible, such as impacted wisdom teeth or severely broken-down teeth.", cost: 200, duration: '60 min', commonNotes: "Administered local anesthesia. Reflected full-thickness flap. Removed bone as necessary to expose tooth. Sectioned tooth and elevated from socket. Irrigated socket and achieved hemostasis. Sutured flap. Post-operative instructions provided, including prescription for analgesics." },
  { id: '6', name: 'Teeth Whitening', category: 'Cosmetic', description: "A cosmetic dental procedure that lightens teeth and helps to remove stains and discoloration using professional-grade whitening agents.", cost: 350, duration: '60 min', commonNotes: "Performed initial shade assessment. Isolated soft tissues. Applied professional-grade hydrogen peroxide whitening gel to facial surfaces of teeth. Activated gel as per manufacturer's instructions for 3 cycles. Final shade assessed. Patient advised on post-whitening care and diet to maintain results." },
  { id: '7', name: 'Porcelain Crown', category: 'Cosmetic', description: "A custom-fabricated tooth-shaped cap that is placed over a tooth to restore its shape, size, strength, and improve its appearance.", cost: 800, duration: '120 min', commonNotes: "Administered local anesthesia. Prepared tooth for a full-coverage porcelain crown, ensuring adequate reduction and smooth margins. Took final impression and fabricated a temporary crown. Cemented temporary crown with temporary cement. Sent case to lab with shade selection. Patient to return in 2 weeks for final cementation." },
  { id: '8', name: 'Dental Implant', category: 'Surgical', description: "A surgical fixture that is placed into the jawbone and allowed to fuse with the bone over a few months, acting as a replacement root for a missing tooth.", cost: 2500, duration: '180 min', commonNotes: "Administered local anesthesia. Reflected full-thickness flap to expose implant site. Prepared osteotomy according to manufacturer's protocol. Placed dental implant with good primary stability. Placed cover screw and sutured flap. Post-operative instructions and medications prescribed. Patient scheduled for follow-up." },
  { id: '9', name: 'Invisalign Check-up', category: 'Orthodontic', description: "A routine appointment to monitor the progress of clear aligner treatment, make necessary adjustments, and receive new aligner sets.", cost: 150, duration: '30 min', commonNotes: "Assessed tracking of current aligners. Verified fit and checked for any issues. Performed interproximal reduction (IPR) as prescribed. Delivered next series of aligners to patient. Reviewed treatment progress and reinforced instructions on wear time and aligner care." },
  { id: '10', name: 'Digital X-Ray (Full Mouth)', category: 'Diagnostic', description: "A comprehensive set of intraoral X-rays providing a detailed view of all the teeth, roots, and surrounding bone structure for thorough diagnosis.", cost: 75, duration: '15 min', commonNotes: "Took a full mouth series of digital radiographs (FMX) for diagnostic purposes. Images are clear and of diagnostic quality. Reviewed radiographs with the patient to discuss findings." },
];

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: (reason?: string) => void;
  sessionTimeoutReason: string | null;
  settings: ClinicSettings;
  updateSettings: (newSettings: ClinicSettings) => void;
  auditLogs: AuditEntry[];
  addAuditEntry: (action: string, category: AuditEntry['category'], details?: string) => void;
  globalInvoices: Invoice[];
  globalExpenses: Expense[];
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addExpense: (expense: Expense) => void;
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  services: TreatmentService[];
  addService: (service: TreatmentService) => void;
  updateService: (service: TreatmentService) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

const SidebarLink = ({ to, icon: Icon, label, active, minimized }: { to: string, icon: any, label: string, active: boolean, minimized: boolean }) => (
  <Link
    to={to}
    title={minimized ? label : ""}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    } ${minimized ? 'justify-center px-0' : ''}`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
    {!minimized && (
      <span className={`font-bold text-sm whitespace-nowrap transition-opacity duration-200 ${active ? 'tracking-wide' : ''}`}>
        {label}
      </span>
    )}
  </Link>
);

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const { currentUser, setCurrentUser, logout, settings } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  if (!currentUser) return null;

  const ROLES: UserRole[] = ['Admin', 'Doctor', 'Assistant', 'Accountant'];
  const assignedBranch = settings.branches.find(b => b.id === currentUser.assignedBranchId) || settings.branches[0];

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

  const sidebarWidthClass = isSidebarMinimized ? 'w-20' : 'w-64';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <ScrollToTop />
      
      <aside 
        className={`${sidebarWidthClass} bg-white border-r border-slate-200 hidden lg:flex flex-col transition-all duration-300 relative shrink-0 z-50 shadow-sm`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className={`flex items-center space-x-3 mb-10 ${isSidebarMinimized ? 'justify-center space-x-0' : ''}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <span className="text-white font-black text-xl">D</span>
            </div>
            {!isSidebarMinimized && (
              <div className="overflow-hidden">
                <span className="text-xl font-black text-slate-800 tracking-tighter italic block leading-none">DentaCloud</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate block mt-1">{assignedBranch.companyName}</span>
              </div>
            )}
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
            <SidebarLink to="/" icon={Calendar} label="Appointments" active={location.pathname === '/'} minimized={isSidebarMinimized} />
            
            {(currentUser.role === 'Admin' || currentUser.role === 'Doctor' || currentUser.role === 'Assistant') && (
              <>
                <SidebarLink to="/patients" icon={Users} label="Patients" active={location.pathname.startsWith('/patients')} minimized={isSidebarMinimized} />
                <SidebarLink to="/billing" icon={CreditCard} label="Billing" active={location.pathname.startsWith('/billing')} minimized={isSidebarMinimized} />
                <SidebarLink to="/referrals" icon={FileBadge} label="Referrals" active={location.pathname.startsWith('/referrals')} minimized={isSidebarMinimized} />
              </>
            )}
            
            {(currentUser.role === 'Admin' || currentUser.role === 'Doctor') && (
              <>
                <SidebarLink to="/documents" icon={FileText} label="Documents" active={location.pathname.startsWith('/documents')} minimized={isSidebarMinimized} />
                <SidebarLink to="/treatments" icon={Stethoscope} label="Service Menu" active={location.pathname === '/treatments'} minimized={isSidebarMinimized} />
                <SidebarLink to="/treatment-log" icon={ClipboardList} label="Treatment Log" active={location.pathname.startsWith('/treatment-log')} minimized={isSidebarMinimized} />
                <SidebarLink to="/pharmacy" icon={Pill} label="Pharmacy" active={location.pathname === '/pharmacy'} minimized={isSidebarMinimized} />
              </>
            )}
            
            {(currentUser.role === 'Admin' || currentUser.role === 'Accountant') && (
              <SidebarLink to="/accounting" icon={BarChart3} label="Accounting" active={location.pathname === '/accounting'} minimized={isSidebarMinimized} />
            )}

            {(currentUser.role === 'Admin' || currentUser.role === 'Accountant') && (
              <SidebarLink to="/reports" icon={ReportsIcon} label="Reports" active={location.pathname === '/reports'} minimized={isSidebarMinimized} />
            )}

            <SidebarLink to="/attendance" icon={Fingerprint} label="Attendance" active={location.pathname === '/attendance'} minimized={isSidebarMinimized} />
            <SidebarLink to="/roster" icon={CalendarDays} label="Duty Roster" active={location.pathname === '/roster'} minimized={isSidebarMinimized} />

            {currentUser.role === 'Admin' && (
              <div className={`pt-4 pb-2 border-t border-slate-50 mt-4 ${isSidebarMinimized ? 'border-t-0' : ''}`}>
                {!isSidebarMinimized && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Administration</p>}
                <SidebarLink to="/staff" icon={UserCog} label="Staff Management" active={location.pathname === '/staff'} minimized={isSidebarMinimized} />
                <SidebarLink to="/panels" icon={Globe} label="Clinic Panels" active={location.pathname === '/panels'} minimized={isSidebarMinimized} />
                <SidebarLink to="/audit" icon={ClipboardList} label="Audit Trail" active={location.pathname === '/audit'} minimized={isSidebarMinimized} />
                <SidebarLink to="/settings" icon={SettingsIcon} label="Workspace Settings" active={location.pathname === '/settings'} minimized={isSidebarMinimized} />
                <SidebarLink to="/migration" icon={DatabaseZap} label="Migration Tool" active={location.pathname === '/migration'} minimized={isSidebarMinimized} />
              </div>
            )}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-6">
            <button 
              onClick={() => logout()}
              title={isSidebarMinimized ? "Sign Out" : ""}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-600 transition-colors font-bold text-sm ${isSidebarMinimized ? 'justify-center px-0' : ''}`}
            >
              <LogOut size={20} className="shrink-0" />
              {!isSidebarMinimized && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl hidden lg:block"
              title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
                <ChevronLeft size={24} className={`transition-transform duration-300 ${isSidebarMinimized ? 'rotate-180' : ''}`} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clinic records..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl w-64 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
              <div className={`flex items-center justify-end gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest mt-0.5 ${getRoleColor(currentUser.role)}`}>
                {getRoleIcon(currentUser.role)}
                {currentUser.role}
              </div>
            </div>
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md hover:ring-4 hover:ring-blue-50 transition-all"
            >
               <img src={currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="User" />
            </button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Perspective</p>
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentUser({ ...currentUser, role });
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      currentUser.role === role 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      {role}
                    </div>
                  </button>
                ))}
                <div className="h-px bg-slate-100 my-1" />
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="p-8 max-w-7xl mx-auto min-h-full">
            <Routes>
              <Route path="/" element={<Appointments />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/documents/:docId?" element={<DocumentEditor />} />
              <Route path="/appointments" element={<Navigate to="/" />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="/treatment-log" element={<TreatmentLog />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/migration" element={<MigrationCenter />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/roster" element={<DutyRoster />} />
              <Route path="/panels" element={currentUser.role === 'Admin' ? <ClinicPanels /> : <Navigate to="/" />} />
              <Route path="/staff" element={currentUser.role === 'Admin' ? <UserManagement /> : <Navigate to="/" />} />
              <Route path="/audit" element={currentUser.role === 'Admin' ? <AuditTrail /> : <Navigate to="/" />} />
              <Route path="/settings" element={currentUser.role === 'Admin' ? <Settings /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

const UserProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeoutReason, setSessionTimeoutReason] = useState<string | null>(null);
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS as ClinicSettings);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [globalInvoices, setGlobalInvoices] = useState<Invoice[]>([]);
  const [globalExpenses, setGlobalExpenses] = useState<Expense[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<TreatmentService[]>([]);

  const lastActivity = useRef<number>(Date.now());

  // Init Data from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('denta_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    const savedSettings = localStorage.getItem('denta_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS as ClinicSettings);
    }
    const savedLogs = localStorage.getItem('denta_audit_logs');
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    }
    
    // Load persisted entities
    const savedInvoices = localStorage.getItem('denta_invoices');
    setGlobalInvoices(savedInvoices ? JSON.parse(savedInvoices) : INITIAL_MOCK_INVOICES);

    const savedPatients = localStorage.getItem('denta_patients');
    setPatients(savedPatients ? JSON.parse(savedPatients) : INITIAL_MOCK_PATIENTS);

    const savedServices = localStorage.getItem('denta_services');
    setServices(savedServices ? JSON.parse(savedServices) : INITIAL_MOCK_SERVICES);

    const savedExpenses = localStorage.getItem('denta_expenses');
    setGlobalExpenses(savedExpenses ? JSON.parse(savedExpenses) : INITIAL_MOCK_EXPENSES);

  }, []);

  const addAuditEntry = (action: string, category: AuditEntry['category'], details?: string) => {
    const entry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      action,
      category,
      timestamp: new Date().toISOString(),
      details
    };
    const newLogs = [entry, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem('denta_audit_logs', JSON.stringify(newLogs.slice(0, 1000)));
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setGlobalInvoices(prev => {
        const updated = prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
        localStorage.setItem('denta_invoices', JSON.stringify(updated));
        return updated;
    });
  };

  const addInvoice = (invoice: Invoice) => {
    setGlobalInvoices(prev => {
        const updated = [invoice, ...prev];
        localStorage.setItem('denta_invoices', JSON.stringify(updated));
        return updated;
    });
  };

  const deleteInvoice = (id: string) => {
    setGlobalInvoices(prev => {
        const updated = prev.filter(inv => inv.id !== id);
        localStorage.setItem('denta_invoices', JSON.stringify(updated));
        return updated;
    });
    addAuditEntry('Deleted Invoice', 'Financial', `Invoice ID: ${id}`);
  };

  const addExpense = (expense: Expense) => {
    const updated = [expense, ...globalExpenses];
    setGlobalExpenses(updated);
    localStorage.setItem('denta_expenses', JSON.stringify(updated));
  };
  
  const addPatient = (patient: Patient) => {
    const updated = [patient, ...patients];
    setPatients(updated);
    localStorage.setItem('denta_patients', JSON.stringify(updated));
  };
  
  const updatePatient = (patient: Patient) => {
    const updated = patients.map(p => p.id === patient.id ? patient : p);
    setPatients(updated);
    localStorage.setItem('denta_patients', JSON.stringify(updated));
  };

  const addService = (service: TreatmentService) => {
    const updated = [service, ...services];
    setServices(updated);
    localStorage.setItem('denta_services', JSON.stringify(updated));
    addAuditEntry('Created New Service', 'Administrative', `Service: ${service.name}`);
  };
  
  const updateService = (service: TreatmentService) => {
    const updated = services.map(s => s.id === service.id ? service : s);
    setServices(updated);
    localStorage.setItem('denta_services', JSON.stringify(updated));
    addAuditEntry('Updated Service', 'Administrative', `Service: ${service.name}`);
  };


  const resetTimer = () => {
    lastActivity.current = Date.now();
  };

  useEffect(() => {
    if (!currentUser) return;
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    const interval = setInterval(() => {
      const now = Date.now();
      const timeoutMs = settings.autoLogoutTime * 60 * 1000;
      if (now - lastActivity.current >= timeoutMs) {
        logout('inactivity');
      }
    }, 60000);
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [currentUser, settings.autoLogoutTime]);

  const updateSettings = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    localStorage.setItem('denta_settings', JSON.stringify(newSettings));
    addAuditEntry('Updated Workspace Settings', 'Administrative', 'User modified clinic-wide configuration');
  };

  type StoredCredentials = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: string;
    assignedBranchId?: string;
  };

  const login = async (email: string, pass: string) => {
    setSessionTimeoutReason(null);
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !pass) {
      return { ok: false as const, error: 'Please enter your email and password.' };
    }

    let credentialsList: StoredCredentials[] = [];
    try {
      const raw = localStorage.getItem('denta_credentials');
      credentialsList = raw ? JSON.parse(raw) : [];
    } catch {
      return { ok: false as const, error: 'Saved credentials are corrupted. Please register again.' };
    }

    const credUser = credentialsList.find(u => (u.email || '').toLowerCase() === normalizedEmail);
    if (!credUser) {
      return { ok: false as const, error: 'No account found with this email. Please register first.' };
    }

    if (credUser.password !== pass) {
      return { ok: false as const, error: 'Incorrect password. Please try again.' };
    }

    // Ensure a matching staff profile exists (used across the app)
    let staffList: User[] = [];
    try {
      const savedStaff = localStorage.getItem('denta_staff');
      staffList = savedStaff ? JSON.parse(savedStaff) : [];
    } catch {
      staffList = [];
    }

    let staffUser = staffList.find(s => (s.email || '').toLowerCase() === normalizedEmail);
    if (!staffUser) {
      staffUser = {
        id: credUser.id,
        name: credUser.name,
        email: credUser.email,
        role: credUser.role,
        phone: credUser.phone,
        address: credUser.address,
        status: 'Active',
        annualLeaveEntitlement: 20,
        assignedBranchId: credUser.assignedBranchId || settings.branches?.[0]?.id,
      };
      staffList = [staffUser, ...staffList];
      localStorage.setItem('denta_staff', JSON.stringify(staffList));
    }

    setCurrentUser(staffUser);
    setIsAuthenticated(true);
    localStorage.setItem('denta_user', JSON.stringify(staffUser));
    resetTimer();
    addAuditEntry('User Login Successful', 'Security', `Identity verified for ${normalizedEmail}`);
    return { ok: true as const };
  };

  const logout = (reason?: string) => {
    const email = currentUser?.email || 'Unknown';
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('denta_user');
    if (reason === 'inactivity') {
      setSessionTimeoutReason(`Your session has expired due to ${settings.autoLogoutTime} minutes of inactivity.`);
      addAuditEntry('Session Timed Out', 'Security', `Auto-logout triggered for ${email}`);
    } else {
      setSessionTimeoutReason(null);
      addAuditEntry('User Logout', 'Security', `Manual session termination for ${email}`);
    }
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      isAuthenticated, 
      login, 
      logout, 
      sessionTimeoutReason,
      settings, 
      updateSettings,
      auditLogs,
      addAuditEntry,
      globalInvoices,
      globalExpenses,
      updateInvoice,
      addInvoice,
      deleteInvoice,
      addExpense,
      patients,
      addPatient,
      updatePatient,
      services,
      addService,
      updateService
    }}>
      {children}
    </UserContext.Provider>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppWithAuth />
      </Router>
    </UserProvider>
  );
};

const AppWithAuth = () => {
  const { currentUser, login, sessionTimeoutReason } = useUser();
  if (!currentUser) return <Login onLogin={login} timeoutReason={sessionTimeoutReason} />;
  return <AppContent />;
}

export default App;