
export type UserRole = 'Admin' | 'Doctor' | 'Assistant' | 'Accountant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  icNumber?: string; // Identification Card Number
  email?: string;
  phone?: string; // Staff contact number
  address?: string; // Staff residential address
  avatar?: string;
  status?: 'Active' | 'Inactive';
  assignedBranchId?: string;
  annualLeaveEntitlement?: number;
}

export type PaymentMethodType = 'Cash' | 'Card' | 'Transfer' | 'Insurance' | 'Digital Wallet' | 'Other';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'Annual' | 'Medical' | 'Emergency' | 'Compassionate';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'Clinical' | 'Financial' | 'Administrative' | 'Security';
  timestamp: string;
  details?: string;
}

export interface ClinicBranch {
  id: string;
  name: string;
  companyName: string; // Per-branch legal entity name
  address: string;
  phone: string;
  email?: string;
  color: string; // Theme color for this branch
  logo?: string;
  tin?: string; // Tax Identification Number
  sstNumber?: string; // SST Registration Number
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'In' | 'Out' | 'Break_Start' | 'Break_End';
  method: 'Fingerprint' | 'Manual' | 'RFID';
}

export interface StaffAttendance {
  userId: string;
  name: string;
  role: UserRole;
  currentStatus: 'In' | 'Out' | 'Break';
  lastEvent: string;
  totalHoursToday: string;
}

export interface ClinicPanel {
  id: string;
  name: string;
  url: string;
  description?: string;
  username?: string;
  password?: string;
}

export interface ClinicSettings {
  clinicName: string;
  companyName: string;
  supportEmail: string;
  autoLogoutTime: number; // in minutes
  currency: string;
  taxSstRate: number; // e.g., 6 for 6%
  branches: ClinicBranch[];
  whatsappReminderTemplate: string; // Dynamic template for reminders
  reminderTimingValue: number;
  reminderTimingUnit: 'hours' | 'days';
  paymentMethods: PaymentMethod[]; // Configurable payment options
  clinicPanels?: ClinicPanel[];
  invoiceTemplate?: string;
  receiptTemplate?: string;
}

export interface Patient {
  id: string;
  icNumber?: string; // Malaysian IC Number
  tin?: string; // Tax Identification Number
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  medicalHistory: string[];
  insuranceProvider?: string;
  lastVisit?: string;
  status: 'Active' | 'Inactive';
  externalImagingId?: string; // ID for NNT/NewTom integration
  registrationDate?: string; // YYYY-MM-DD
}

export interface ProgressNote {
  id: string;
  patientId: string;
  branchId: string;
  date: string;
  dentistName: string;
  treatmentPerformed: string;
  clinicalNotes: string;
  plan: string;
  images?: string[];
  amount?: number;
  toothNumber?: string;
}

export interface MedicationItem {
  medication: string;
  dosage: string;
}

export interface Medication { // Now represents a Prescription
  id: string;
  patientId: string;
  branchId?: string;
  date: string;
  prescriberName: string;
  clinicAddress: string;
  items: MedicationItem[];
}


export interface FormularyItem {
  id: string;
  name: string;
  category: string; 
  strength: string;
  dosageForm: string; // e.g., Tablet, Capsule, Liquid
  stockLevel: number;
  unitPrice: number;
  defaultDosage?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string; // Added for reminders
  branchId: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string; // HH:MM
  treatmentType: string;
  duration: number; // in minutes
  status: 'Confirmed' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Reminded' | 'Reschedule' | 'Arrived' | 'In Treatment' | 'No Show';
  arrivedAt?: string; // ISO timestamp when patient checked in
  doctorIds?: string[]; // IDs of assigned doctors/staff
  type?: 'Patient' | 'DoctorBlock'; // Added to support non-patient events
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  branchId: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  items: { description: string; price: number }[];
  providerId?: string;
  providerName?: string;
  paidAmount?: number;
  recordType?: 'Invoice' | 'Receipt'; // Distinguish between Request for Payment and Proof of Payment
  relatedInvoiceId?: string; // Link receipt to original invoice
}

export interface TreatmentLogEntry {
  id: string;
  patientId: string;
  patientName: string;
  branchId: string;
  date: string;
  treatment: string;
  amount: number;
  providerId: string;
  providerName: string;
}

export interface TreatmentService {
  id: string;
  name: string;
  category: 'General' | 'Cosmetic' | 'Surgical' | 'Orthodontic' | 'Diagnostic';
  description: string;
  cost: number;
  duration: string;
  commonNotes?: string;
}

export interface ClinicStats {
  totalPatients: number;
  patientsThisMonth: number;
  upcomingAppointments: number;
}

export interface IncomingReferral {
  id: string;
  referringDoctor: string;
  referringClinic: string;
  patientName: string;
  patientContact: string;
  reason: string;
  date: string; // YYYY-MM-DD
  status: 'Pending Review' | 'Contacted' | 'Scheduled' | 'Completed' | 'Rejected';
  attachments?: { name: string; url: string }[];
}

// Universal file type for patient and staff documents
export interface ClinicalFile {
  id: string;
  name: string;
  url: string;
  category: 'X-Ray' | 'Picture' | 'Document';
  date: string;
  content?: string;
}

export type GLAccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  category: GLAccountCategory;
  balance: number;
  description?: string;
}

export interface GLTransaction {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  description: string;
  debit: number;
  credit: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Dental Supplies' | 'Lab Services' | 'Utilities' | 'Office Supplies';
  contactPerson?: string;
  email?: string;
}

export interface APBill {
  id: string;
  vendorId: string;
  vendorName: string;
  billNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: 'Pending Payment' | 'Overdue' | 'Paid';
  items: { description: string; amount: number }[];
}

export interface FixedAsset {
  id: string;
  name: string;
  category: 'Clinical Equipment' | 'Office Furniture' | 'Property' | 'Computer Hardware';
  purchaseDate: string; // YYYY-MM-DD
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  branchId: string;
  description?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'Utilities' | 'Rent' | 'Marketing' | 'Wages' | 'Supplies' | 'Maintenance' | 'Other';
  description: string;
  amount: number;
  paymentMethodId: string;
  branchId: string;
  status: 'Paid' | 'Pending Approval';
}

export interface InventoryValuation {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  userName: string;
  grossSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'Approved' | 'Paid';
}