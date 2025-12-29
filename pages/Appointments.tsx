import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Stethoscope, 
  X, 
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Bell,
  CalendarClock,
  CheckCircle,
  CalendarDays,
  ClipboardList,
  Receipt,
  UserPlus,
  MapPin,
  Building2,
  Filter,
  Save,
  UserCheck,
  Timer,
  Play,
  ArrowRight,
  UserPlus2,
  Users,
  Lock,
  LayoutGrid,
  Columns,
  GripVertical,
  MoveHorizontal,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  Printer,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { Appointment, ClinicBranch, User as StaffUser, ClinicSettings, Patient } from '../types';
import BillingModal from '../components/BillingModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import RescheduleModal from '../components/RescheduleModal';
import NextVisitModal from '../components/NextVisitModal';
import AddDoctorBlockModal from '../components/AddDoctorBlockModal';
import { useUser } from '../App';

const { useNavigate } = ReactRouterDOM;

const TREATMENT_PRICES: Record<string, number> = {
  'Consultation': 50,
  'Scaling': 100,
  'Scaling & Polishing': 100,
  'Root Canal': 500,
  'Extraction': 200,
  'Dental Implant': 2500,
  'Check-up': 50
};

// Staff for assignment - loads from localStorage
const INITIAL_STAFF: StaffUser[] = [];

// Helper to generate 30-min slots from 08:00 to 21:00
const GENERATE_TIME_SLOTS = () => {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    const h = hour.toString().padStart(2, '0');
    slots.push(`${h}:00`);
    if (hour < 21) slots.push(`${h}:30`);
  }
  return slots;
};

const TIME_SLOTS = GENERATE_TIME_SLOTS();

const INITIAL_APPOINTMENTS: Appointment[] = [];

interface AppointmentCardProps {
  appt: Appointment;
  isMini?: boolean;
  staffList: StaffUser[];
  onUpdateStatus: (id: string, newStatus: Appointment['status']) => void;
  onAssignStaff: (apptId: string, staffId: string) => void;
  onReschedule: (appt: Appointment) => void;
  onNextVisit: (appt: Appointment) => void;
  onDelete: (id: string) => void;
  onBill: (patientId: string, patientName: string, treatmentType: string, branchId: string) => void;
  canBill: boolean;
  activeStaffPicker: string | null;
  setActiveStaffPicker: (id: string | null) => void;
  onDragStart?: (e: React.DragEvent, apptId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  viewMode: 'consolidated' | 'doctor';
  settings: ClinicSettings;
}

const formatWhatsAppMessage = (template: string, appt: Appointment, settings: ClinicSettings) => {
  const branch = settings.branches.find(b => b.id === appt.branchId);
  return template
    .replace(/{{patientName}}/g, appt.patientName)
    .replace(/{{clinicName}}/g, settings.clinicName)
    .replace(/{{branchName}}/g, branch?.name || '')
    .replace(/{{treatmentType}}/g, appt.treatmentType)
    .replace(/{{date}}/g, appt.date)
    .replace(/{{time}}/g, appt.time);
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appt, 
  isMini = false, 
  staffList, 
  onUpdateStatus, 
  onAssignStaff, 
  onReschedule, 
  onNextVisit, 
  onDelete, 
  onBill, 
  canBill,
  activeStaffPicker,
  setActiveStaffPicker,
  onDragStart,
  onDragEnd,
  viewMode,
  settings
}) => {
  const navigate = useNavigate();
  const assignedStaff = staffList.filter(s => (appt.doctorIds || []).includes(s.id));
  const isDoctorBlock = appt.type === 'DoctorBlock';
  const isDraggable = !isDoctorBlock;

  const handleWhatsAppReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appt.patientPhone) return;
    
    const message = formatWhatsAppMessage(settings.whatsappReminderTemplate, appt, settings);
    const sanitizedPhone = appt.patientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  return (
    <div 
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart?.(e, appt.id)}
      onDragEnd={onDragEnd}
      onClick={() => {
        if (!isDoctorBlock) {
          navigate(`/patients/${appt.patientId}`);
        }
      }}
      className={`relative border rounded-[24px] p-5 flex flex-col transition-all animate-in zoom-in-95 duration-300 group/card ${
        isDoctorBlock 
          ? 'bg-slate-900 border-slate-800 shadow-xl' 
          : `bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer`
      } ${isMini ? 'p-3 text-[10px] active:scale-95' : ''} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className={`flex items-start justify-between ${isMini ? 'mb-1.5' : 'mb-3'}`}>
        <div className="flex items-center gap-3">
          {!isDoctorBlock ? (
            <div className={`${isMini ? 'w-6 h-6' : 'w-10 h-10'} rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm`}>
              <img src={`https://i.pravatar.cc/100?u=${appt.id}`} alt={appt.patientName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`${isMini ? 'w-6 h-6' : 'w-10 h-10'} rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 shadow-sm`}>
              <Lock size={isMini ? 12 : 20} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              {!isDoctorBlock && <GripVertical size={isMini ? 10 : 14} className="text-slate-400" />}
              <h4 className={`font-black uppercase tracking-tight ${isMini ? 'text-[9px]' : 'text-sm'} ${isDoctorBlock ? 'text-white' : 'text-slate-800'}`}>
                {isDoctorBlock ? 'Blocked Slot' : appt.patientName}
              </h4>
              {!isDoctorBlock && appt.patientPhone && !isMini && (
                <button 
                  onClick={handleWhatsAppReminder}
                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Send WhatsApp Reminder"
                >
                  <MessageCircle size={14} />
                </button>
              )}
            </div>
            <p className={`font-black uppercase tracking-widest ${isMini ? 'text-[7px]' : 'text-[9px]'} ${isDoctorBlock ? 'text-slate-400' : 'text-blue-700'}`}>
              {appt.treatmentType}
            </p>
          </div>
        </div>

        {/* Action / Status Badge Area */}
        <div className="flex items-center gap-2">
          {isDoctorBlock ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(appt.id); }}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700"
              title="Remove Entire Block"
            >
              <X size={isMini ? 12 : 16} />
            </button>
          ) : (
            !isMini && (
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                appt.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                appt.status === 'Arrived' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                appt.status === 'In Treatment' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                appt.status === 'Reschedule' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                appt.status === 'No Show' ? 'bg-red-50 text-red-800 border-red-200' :
                appt.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {appt.status}
              </span>
            )
          )}
        </div>
      </div>

      <div className={`${isMini ? 'mt-1' : 'mb-4'} flex flex-wrap items-center gap-1.5`}>
        {assignedStaff.map(staff => (
          <div 
            key={staff.id} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
              isDoctorBlock ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            } ${isMini ? 'px-1.5 py-0.5' : ''}`} 
            title={`${staff.role}: ${staff.name}`}
          >
            <div className={`${isMini ? 'w-3.5 h-3.5 text-[6px]' : 'w-4 h-4 text-[7px]'} rounded-full flex items-center justify-center font-black ${isDoctorBlock ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {staff.name.charAt(4)}
            </div>
            {!isMini && <span className={`text-[8px] font-bold ${isDoctorBlock ? 'text-slate-300' : 'text-slate-700'}`}>{staff.name.split(' ').pop()}</span>}
            <button 
              onClick={(e) => { e.stopPropagation(); onAssignStaff(appt.id, staff.id); }}
              className={`ml-1 p-0.5 rounded-full transition-colors ${isDoctorBlock ? 'hover:bg-slate-700 text-slate-500 hover:text-red-400' : 'hover:bg-slate-200 text-slate-500 hover:text-red-500'}`}
              title="Remove Individual Staff"
            >
              <X size={isMini ? 8 : 10} />
            </button>
          </div>
        ))}
        
        {!isDoctorBlock && !isMini && (
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveStaffPicker(activeStaffPicker === appt.id ? null : appt.id); }}
              className={`flex items-center gap-1 border border-dashed border-slate-300 rounded-lg font-black uppercase text-slate-500 hover:border-blue-400 hover:text-blue-700 transition-all ${
                isMini ? 'p-0.5' : 'px-2 py-1 text-[8px]'
              }`}
              title="Add Doctor"
            >
              {isMini ? <Plus size={10} /> : <><UserPlus2 size={10} /> Add Doctor</>}
            </button>
            
            {activeStaffPicker === appt.id && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] p-1 animate-in fade-in zoom-in-95 duration-200">
                <p className="px-3 py-1.5 text-[7px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Assign Clinical Staff</p>
                {staffList.map(staff => {
                  const isAssigned = (appt.doctorIds || []).includes(staff.id);
                  return (
                    <button
                      key={staff.id}
                      onClick={(e) => { e.stopPropagation(); onAssignStaff(appt.id, staff.id); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-tight flex items-center justify-between transition-colors ${
                        isAssigned ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Users size={10} /> {staff.name}
                      </span>
                      {isAssigned && <CheckCircle size={10} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {!isMini && (
        <div className={`mt-auto flex items-center justify-between gap-2 pt-3 border-t ${isDoctorBlock ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex gap-2">
            {!isDoctorBlock ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/patients/${appt.patientId}`); }} className="p-2 text-slate-500 hover:text-blue-700 transition-colors" title="Patient Chart">
                  <ClipboardList size={16} />
                </button>
                {canBill && (
                  <button onClick={(e) => { e.stopPropagation(); onBill(appt.patientId, appt.patientName, appt.treatmentType, appt.branchId); }} className="p-2 text-slate-500 hover:text-amber-700 transition-colors" title="Billing">
                    <Receipt size={16} />
                  </button>
                )}
              </>
            ) : (
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest p-2">Internal Event</span>
            )}
          </div>
          
          <div className="flex gap-1.5">
            {!isDoctorBlock && (
              <>
                {(appt.status === 'Confirmed' || appt.status === 'Scheduled') && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onReschedule(appt); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
                    >
                      <CalendarClock size={14} /> Reschedule
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(appt.id, 'Arrived'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                    >
                      <UserCheck size={14} /> Check-in
                    </button>
                  </>
                )}
                {appt.status === 'Arrived' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(appt.id, 'In Treatment'); }} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                  >
                    <Play size={14} /> Start Treatment
                  </button>
                )}
                 {appt.status === 'In Treatment' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(appt.id, 'Completed'); }} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                  >
                    <CheckCircle2 size={14} /> Finish
                  </button>
                )}
                {appt.status === 'Completed' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNextVisit(appt); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
                  >
                    <ArrowRight size={14} /> Next Visit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, settings, addAuditEntry, addInvoice, addPatient } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'consolidated' | 'doctor'>('consolidated');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('denta_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState<{ date: string; time: string; doctorId?: string; } | null>(null);
  const [isBillingModalOpen, setIsBillingOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isNextVisitModalOpen, setIsNextVisitModalOpen] = useState(false);
  const [isDoctorBlockModalOpen, setIsDoctorBlockModalOpen] = useState(false);
  const [selectedApptForReschedule, setSelectedApptForReschedule] = useState<Appointment | null>(null);
  const [selectedApptForNextVisit, setSelectedApptForNextVisit] = useState<Appointment | null>(null);
  const [selectedPatientForBilling, setSelectedPatientForBilling] = useState<{id: string, name: string, branchId?: string, items?: {description: string, price: number}[]} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(new Date());
  const [activeStaffPicker, setActiveStaffPicker] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null); 
  const [dragOverDoctorIdx, setDragOverDoctorIdx] = useState<number | null>(null);
  const [draggingApptId, setDraggingApptId] = useState<string | null>(null);

  const branches = settings.branches;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const canSchedule = ['Admin', 'Doctor', 'Assistant'].includes(currentUser.role);
  const canBill = ['Admin', 'Assistant'].includes(currentUser.role);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

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
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const appointmentsByTimeSlot = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    TIME_SLOTS.forEach(slot => map[slot] = []);
    
    appointments.forEach(a => {
      if (a.date === selectedDateStr) {
        const matchesBranch = selectedBranchId === 'all' || a.branchId === selectedBranchId;
        const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (a.type === 'DoctorBlock' && a.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matchesBranch && matchesSearch) {
          const slot = [...TIME_SLOTS].reverse().find(s => s <= a.time) || TIME_SLOTS[0];
          map[slot].push(a);
        }
      }
    });
    return map;
  }, [appointments, selectedDateStr, selectedBranchId, searchTerm]);

  const waitingPatients = useMemo(() => {
    return appointments.filter(a => 
      a.status === 'Arrived' && 
      a.date === new Date().toISOString().split('T')[0] &&
      (selectedBranchId === 'all' || a.branchId === selectedBranchId)
    ).sort((a, b) => {
      const timeA = a.arrivedAt ? new Date(a.arrivedAt).getTime() : 0;
      const timeB = b.arrivedAt ? new Date(b.arrivedAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [appointments, selectedBranchId, now]);

  const handleOpenBilling = (patientId: string, patientName: string, treatmentType: string, branchId: string) => {
    if (!canBill) return;
    setSelectedPatientForBilling({ 
      id: patientId, 
      name: patientName,
      branchId: branchId,
      items: []
    });
    setIsBillingOpen(true);
  };

  const handleSaveToFolder = (data: { name: string, content: string }) => {
    if (!selectedPatientForBilling) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newDocument = {
        id: `doc-bill-${Date.now()}`,
        name: data.name,
        url: '#',
        category: 'Document' as const,
        date: today,
        content: data.content,
        patientId: selectedPatientForBilling.id
    };
    
    const existingDocs = JSON.parse(localStorage.getItem('denta_documents') || '[]');
    localStorage.setItem('denta_documents', JSON.stringify([...existingDocs, newDocument]));
    
    addAuditEntry('Archived Bill to Digital Folder', 'Financial', `Archived ${data.name} for patient ${selectedPatientForBilling.name}`);
  };
  
  const handleScheduleNewAppointment = (apptData: Omit<Appointment, 'id' | 'duration' | 'status'>, newPatientRecord?: Patient) => {
      // If a new patient record was created in the modal, persist it globally
      if (newPatientRecord) {
          addPatient(newPatientRecord);
          addAuditEntry('Registered New Patient', 'Clinical', `Registered ${newPatientRecord.firstName} ${newPatientRecord.lastName} during scheduling.`);
      }

      const newAppt: Appointment = {
          ...apptData,
          id: Math.random().toString(36).substr(2, 9),
          duration: 30, // Default duration
          status: 'Scheduled',
      };
      setAppointments(prev => [...prev, newAppt]);
      addAuditEntry('Scheduled New Appointment', 'Clinical', `Patient ${apptData.patientName} for ${apptData.treatmentType}`);
  };

  const openNewAppointmentModal = (time: string, doctorId?: string) => {
    if (!canSchedule) return;
    setNewAppointmentSlot({ date: selectedDateStr, time, doctorId });
    setIsAddAppointmentModalOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: Appointment['status']) => {
    if (!canSchedule) return;
    const apptToUpdate = appointments.find(a => a.id === id);
    if (!apptToUpdate) return;

    setAppointments(prev => prev.map(a => 
      a.id === id 
        ? { 
            ...a, 
            status: newStatus,
            arrivedAt: newStatus === 'Arrived' ? new Date().toISOString() : a.arrivedAt
          } 
        : a
    ));

    addAuditEntry(
      `Updated Appt Status: ${newStatus}`, 
      'Clinical', 
      `Patient: ${apptToUpdate.patientName}, Procedure: ${apptToUpdate.treatmentType}`
    );

    if (newStatus === 'Completed' && apptToUpdate && apptToUpdate.type !== 'DoctorBlock') {
      handleOpenBilling(apptToUpdate.patientId, apptToUpdate.patientName, apptToUpdate.treatmentType, apptToUpdate.branchId);
    }
  };

  const handleReschedule = (id: string, newDate: string, newTime: string) => {
    const appt = appointments.find(a => a.id === id);
    setAppointments(prev => prev.map(a => 
      a.id === id 
        ? { ...a, date: newDate, time: newTime, status: 'Scheduled', arrivedAt: undefined } 
        : a
    ));
    if (appt) {
      addAuditEntry('Rescheduled Appointment', 'Clinical', `Patient ${appt.patientName} moved to ${newDate} @ ${newTime}`);
    }
  };

  const handleScheduleNextVisit = (patientId: string, patientName: string, branchId: string, date: string, time: string, treatmentType: string) => {
    const phone = appointments.find(a => a.patientId === patientId)?.patientPhone;
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      patientName,
      patientPhone: phone,
      branchId,
      date,
      time,
      treatmentType,
      duration: 30,
      status: 'Scheduled',
      doctorIds: [],
      type: 'Patient'
    };
    setAppointments(prev => [...prev, newAppt]);
    addAuditEntry('Scheduled Follow-up', 'Clinical', `Next visit for ${patientName} set for ${date}`);
  };

  const handleAddDoctorBlock = (staffId: string, date: string, time: string, reason: string, duration: number) => {
    const staff = staffList.find(s => s.id === staffId);
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: 'N/A',
      patientName: 'N/A',
      branchId: selectedBranchId === 'all' ? branches[0].id : selectedBranchId,
      date,
      time,
      treatmentType: reason,
      duration,
      status: 'Confirmed',
      doctorIds: [staffId],
      type: 'DoctorBlock'
    };
    setAppointments(prev => [...prev, newAppt]);
    addAuditEntry('Created Doctor Block', 'Administrative', `Blocked ${staff?.name} for "${reason}" on ${date}`);
  };

  const handleRemoveBlock = (apptId: string, doctorId?: string) => {
    const appt = appointments.find(a => a.id === apptId);
    setAppointments(prev => prev.map(a => {
      if (a.id === apptId && a.type === 'DoctorBlock') {
        // If a specific doctorId is provided, just remove them from the list
        if (doctorId && a.doctorIds && a.doctorIds.length > 1) {
          return { ...a, doctorIds: a.doctorIds.filter(id => id !== doctorId) };
        }
        // If no doctorId or it was the last doctor, remove the entire record
        return null;
      }
      // Keep patient appointments or non-matching records as they are
      if (a.id === apptId && a.type !== 'DoctorBlock') {
        return null;
      }
      return a;
    }).filter((a): a is Appointment => a !== null));

    if (appt) {
      addAuditEntry('Removed Calendar Entry', 'Administrative', `Deleted ${appt.type} event: ${appt.treatmentType}`);
    }
  };

  const handleAssignStaff = (apptId: string, staffId: string) => {
    setAppointments(prev => {
      const appt = prev.find(a => a.id === apptId);
      if (!appt) return prev;

      const isDoctorBlock = appt.type === 'DoctorBlock';
      const existing = appt.doctorIds || [];
      const isRemoving = existing.includes(staffId);

      if (isRemoving) {
        const remaining = existing.filter(id => id !== staffId);
        // If it's a block and no doctors left, remove the whole appointment record
        if (isDoctorBlock && remaining.length === 0) {
          return prev.filter(a => a.id !== apptId);
        }
        return prev.map(a => a.id === apptId ? { ...a, doctorIds: remaining } : a);
      } else {
        return prev.map(a => a.id === apptId ? { ...a, doctorIds: [...existing, staffId] } : a);
      }
    });
  };

  const handleApptDragStart = (e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData('application/x-appt-id', apptId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingApptId(apptId);
    setTimeout(() => {
        (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  };

  const handleApptDragEnd = (e: React.DragEvent) => {
    setDraggingApptId(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleApptDrop = (e: React.DragEvent, doctorId: string | null, time: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const apptId = e.dataTransfer.getData('application/x-appt-id');
    if (!apptId) return;

    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        return {
          ...a,
          time: time,
          // If in Doctor View, reassign doctor. If in Consolidated, keep current doctors.
          doctorIds: doctorId ? [doctorId] : a.doctorIds
        };
      }
      return a;
    }));
  };

  const handleDoctorDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/x-doctor-idx', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDoctorDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverDoctorIdx(null);
    const sourceIndexStr = e.dataTransfer.getData('application/x-doctor-idx');
    if (sourceIndexStr === '') return;
    
    const sourceIndex = parseInt(sourceIndexStr);
    if (sourceIndex === targetIndex) return;

    const newList = [...staffList];
    const [removed] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, removed);
    setStaffList(newList);
  };

  const moveDoctor = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= staffList.length) return;

    const newList = [...staffList];
    const [removed] = newList.splice(index, 1);
    newList.splice(newIndex, 0, removed);
    setStaffList(newList);
  };

  const openRescheduleModal = (appt: Appointment) => {
    setSelectedApptForReschedule(appt);
    setIsRescheduleModalOpen(true);
  };

  const openNextVisitModal = (appt: Appointment) => {
    setSelectedApptForNextVisit(appt);
    setIsNextVisitModalOpen(true);
  };

  const calculateWaitTime = (arrivedAt?: string) => {
    if (!arrivedAt) return 0;
    const diff = Math.floor((now.getTime() - new Date(arrivedAt).getTime()) / 60000);
    return diff > 0 ? diff : 0;
  };

  const currentBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Clinical Schedule</h1>
            <p className="text-slate-600 font-medium text-sm">Managing patient flow across all dental branches.</p>
          </div>
          <div className="flex gap-3">
            {canSchedule && (
              <>
                <button 
                  onClick={() => setIsDoctorBlockModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <Lock size={16} /> Block Doctor
                </button>
                <button 
                  onClick={() => openNewAppointmentModal('09:00')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  <Plus size={16} /> New Appointment
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex items-center overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedBranchId('all')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedBranchId === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All Branches
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${selectedBranchId === branch.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Building2 size={12} />
                {branch.name}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewMode('consolidated')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'consolidated' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} /> Consolidated
            </button>
            <button 
              onClick={() => setViewMode('doctor')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'doctor' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Columns size={14} /> Doctor View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <UserCheck size={16} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Waiting Room</h3>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                {waitingPatients.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {waitingPatients.length > 0 ? (
                waitingPatients.map(patient => {
                  const waitTime = calculateWaitTime(patient.arrivedAt);
                  const isCritical = waitTime >= 30;
                  return (
                    <div key={patient.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{patient.patientName}</p>
                          <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest">{patient.treatmentType}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isCritical ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
                          <Timer size={10} /> {waitTime}m
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {patient.patientPhone && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const message = `Hello ${patient.patientName}, we are ready for you at ${settings.clinicName}! Please proceed to the consultation room.`;
                              const sanitizedPhone = patient.patientPhone!.replace(/\D/g, '');
                              window.open(`https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Message Patient"
                          >
                            <MessageCircle size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateStatus(patient.id, 'In Treatment')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                        >
                          <Play size={10} fill="currentColor" /> Call In
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No patients waiting</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">{monthName} {year}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-600">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-600">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 mb-2 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-8" />;
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <button 
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`h-9 w-full flex flex-col items-center justify-center rounded-xl text-xs transition-all relative
                      ${isSelected ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : isToday ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 border border-slate-100">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {selectedBranchId === 'all' ? 'Consolidated View' : `Branch: ${currentBranch?.name}`}
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search schedule..." 
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none w-64 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm text-slate-800 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 p-0">
            {viewMode === 'consolidated' ? (
              <div className="divide-y divide-slate-100">
                {TIME_SLOTS.map(slot => {
                  const slotAppointments = appointmentsByTimeSlot[slot];
                  const isOverConsolidatedSlot = dragOverSlot === `consolidated-${slot}`;
                  
                  return (
                    <div 
                      key={slot} 
                      className={`flex group min-h-[100px] transition-colors ${
                        isOverConsolidatedSlot ? 'bg-blue-50 border-y-2 border-dashed border-blue-400' : 'hover:bg-slate-50/30'
                      }`}
                      onDragOver={(e) => {
                        if (e.dataTransfer.types.includes('application/x-appt-id')) {
                          e.preventDefault();
                          setDragOverSlot(`consolidated-${slot}`);
                        }
                      }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => handleApptDrop(e, null, slot)}
                    >
                      <div className="w-24 p-6 border-r border-slate-100 flex flex-col items-center justify-start bg-slate-50/20">
                        <span className="text-sm font-black text-slate-800 tracking-tighter">{slot}</span>
                      </div>
                      
                      <div className="flex-1 p-4 cursor-pointer" onClick={() => slotAppointments.length === 0 && openNewAppointmentModal(slot)}>
                        {slotAppointments.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {slotAppointments.map(appt => (
                              <AppointmentCard 
                                key={appt.id} 
                                appt={appt} 
                                staffList={staffList}
                                onUpdateStatus={handleUpdateStatus}
                                onAssignStaff={handleAssignStaff}
                                onReschedule={openRescheduleModal}
                                onNextVisit={openNextVisitModal}
                                onDelete={(id) => handleRemoveBlock(id)}
                                onBill={handleOpenBilling}
                                canBill={canBill}
                                activeStaffPicker={activeStaffPicker}
                                setActiveStaffPicker={setActiveStaffPicker}
                                onDragStart={handleApptDragStart}
                                onDragEnd={handleApptDragEnd}
                                viewMode={viewMode}
                                settings={settings}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Open Slot</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <div className="inline-flex min-w-full">
                  <div className="w-20 sticky left-0 z-20 bg-white shadow-sm border-r border-slate-200 shrink-0">
                    <div className="h-16 border-b border-slate-100 flex items-center justify-center bg-slate-50/50">
                       <Clock size={16} className="text-slate-500" />
                    </div>
                    {TIME_SLOTS.map(slot => (
                      <div key={slot} className="h-24 flex items-center justify-center border-b border-slate-100 text-[10px] font-black text-slate-600">
                        {slot}
                      </div>
                    ))}
                  </div>

                  {staffList.map((doctor, idx) => {
                    const isBeingDraggedOver = dragOverDoctorIdx === idx;
                    return (
                      <div 
                        key={doctor.id} 
                        className={`min-w-[320px] flex-1 border-r border-slate-200 transition-all ${
                          isBeingDraggedOver ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''
                        }`}
                        onDragOver={(e) => {
                          if (e.dataTransfer.types.includes('application/x-doctor-idx')) {
                            e.preventDefault();
                            setDragOverDoctorIdx(idx);
                          }
                        }}
                        onDragLeave={() => setDragOverDoctorIdx(null)}
                        onDrop={(e) => handleDoctorDrop(e, idx)}
                      >
                        <div 
                          draggable
                          onDragStart={(e) => handleDoctorDragStart(e, idx)}
                          className="h-16 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 px-4 sticky top-0 z-10 cursor-grab active:cursor-grabbing group/header"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700 border border-blue-200 shrink-0">
                              {doctor.name.charAt(4)}
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight text-slate-800 truncate">{doctor.name.split(' ').pop()}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                             {idx > 0 && (
                               <button 
                                onClick={(e) => { e.stopPropagation(); moveDoctor(idx, 'left'); }}
                                className="p-1 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-blue-700 transition-colors"
                                title="Move Left"
                               >
                                 <ChevronLeft size={14} />
                               </button>
                             )}
                             <MoveHorizontal size={14} className="text-slate-400 group-hover/header:text-blue-600 transition-colors" />
                             {idx < staffList.length - 1 && (
                               <button 
                                onClick={(e) => { e.stopPropagation(); moveDoctor(idx, 'right'); }}
                                className="p-1 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-blue-700 transition-colors"
                                title="Move Right"
                               >
                                 <ChevronRight size={14} />
                               </button>
                             )}
                          </div>
                        </div>
                        
                        {TIME_SLOTS.map(slot => {
                          const slotApptsForDoctor = appointmentsByTimeSlot[slot].filter(a => a.doctorIds?.includes(doctor.id));
                          const isOverSlot = dragOverSlot === `${doctor.id}-${slot}`;
                          return (
                            <div 
                              key={`${doctor.id}-${slot}`} 
                              onClick={() => slotApptsForDoctor.length === 0 && openNewAppointmentModal(slot, doctor.id)}
                              onDragOver={(e) => {
                                if (e.dataTransfer.types.includes('application/x-appt-id')) {
                                  e.preventDefault();
                                  setDragOverSlot(`${doctor.id}-${slot}`);
                                }
                              }}
                              onDragLeave={() => setDragOverSlot(null)}
                              onDrop={(e) => handleApptDrop(e, doctor.id, slot)}
                              className={`h-24 border-b border-slate-100 p-2 group transition-colors cursor-pointer ${
                                isOverSlot ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'hover:bg-slate-50'
                              }`}
                            >
                              {slotApptsForDoctor.length > 0 ? (
                                <div className="space-y-1">
                                  {slotApptsForDoctor.map(a => (
                                    <AppointmentCard 
                                      key={a.id} 
                                      appt={a} 
                                      isMini={true} 
                                      staffList={staffList}
                                      onUpdateStatus={handleUpdateStatus}
                                      onAssignStaff={handleAssignStaff}
                                      onReschedule={openRescheduleModal}
                                      onNextVisit={openNextVisitModal}
                                      onDelete={(id) => handleRemoveBlock(id, doctor.id)}
                                      onBill={handleOpenBilling}
                                      canBill={canBill}
                                      activeStaffPicker={activeStaffPicker}
                                      setActiveStaffPicker={setActiveStaffPicker}
                                      onDragStart={handleApptDragStart}
                                      onDragEnd={handleApptDragEnd}
                                      viewMode={viewMode}
                                      settings={settings}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus size={14} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isAddAppointmentModalOpen}
        onClose={() => setIsAddAppointmentModalOpen(false)}
        onSchedule={handleScheduleNewAppointment}
        initialSlot={newAppointmentSlot}
      />
      <BillingModal 
        key={`billing-${selectedPatientForBilling?.id}-${selectedPatientForBilling?.items?.[0]?.description || 'none'}`}
        isOpen={isBillingModalOpen} 
        onClose={() => {
            setIsBillingOpen(false);
            setSelectedPatientForBilling(null);
        }} 
        patient={selectedPatientForBilling || {id: '', name: ''}} 
        initialItems={selectedPatientForBilling?.items}
        initialBranchId={selectedPatientForBilling?.branchId}
        onSaveToFolder={handleSaveToFolder}
        onSaveInvoice={addInvoice}
      />
      <RescheduleModal 
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointment={selectedApptForReschedule}
        onReschedule={handleReschedule}
      />
      <NextVisitModal
        isOpen={isNextVisitModalOpen}
        onClose={() => setIsNextVisitModalOpen(false)}
        patient={selectedApptForNextVisit ? { id: selectedApptForNextVisit.patientId, name: selectedApptForNextVisit.patientName } : null}
        branchId={selectedApptForNextVisit?.branchId || 'b1'}
        initialTreatment={selectedApptForNextVisit?.treatmentType}
        onSchedule={handleScheduleNextVisit}
      />
      <AddDoctorBlockModal
        isOpen={isDoctorBlockModalOpen}
        onClose={() => setIsDoctorBlockModalOpen(false)}
        staff={staffList}
        branchId={selectedBranchId === 'all' ? branches[0].id : selectedBranchId}
        onAdd={handleAddDoctorBlock}
      />
    </div>
  );
};

export default Appointments;