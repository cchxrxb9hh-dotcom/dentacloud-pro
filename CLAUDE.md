# CLAUDE.md - DentaCloud Pro

**AI Assistant Guide for DentaCloud Pro Dental Clinic Management System**

Last Updated: 2025-12-29

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Key Conventions](#key-conventions)
6. [Data Models](#data-models)
7. [Development Workflows](#development-workflows)
8. [External Integrations](#external-integrations)
9. [Common Tasks](#common-tasks)
10. [Important Notes](#important-notes)

---

## Project Overview

DentaCloud Pro is a high-performance, AI-integrated dental clinic management system designed for efficiency and clinical precision. It supports multi-branch operations with distinct legal entities, role-based access control, and comprehensive clinical workflows.

### Key Features
- **Clinical Records Management**: Patient records, progress notes, dental charts, prescriptions
- **Appointment Scheduling**: Multi-branch calendar with real-time status tracking
- **Billing & Accounting**: Invoices, receipts, expenses, general ledger, accounts payable
- **Hardware Integrations**: MyKad smart card reader (WebUSB), biometric attendance, NewTom NNT imaging bridge
- **Staff Management**: Attendance tracking, duty roster, payroll, leave management
- **Pharmacy**: Formulary management, prescription tracking, inventory
- **Multi-Branch Support**: Separate branding, legal entities, and tax IDs per branch

### User Roles
- **Admin**: Full system access including settings, staff management, audit trail
- **Doctor**: Clinical features, patient management, treatments, pharmacy
- **Assistant**: Patient management, appointments, billing, basic clinical support
- **Accountant**: Financial features, accounting, reports, expenses

---

## Tech Stack

### Frontend
- **Framework**: React 19.2.3 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.11.0 (HashRouter)
- **UI/Styling**: Tailwind CSS (via utility classes, no config file)
- **Icons**: Lucide React 0.562.0
- **Charts**: Recharts 3.6.0
- **PDF Generation**: jsPDF 2.5.1, html2canvas 1.4.1
- **State Management**: React Context API (UserContext)

### Backend
- **Runtime**: Node.js with Express 5.2.1
- **Database**: MariaDB/MySQL via mysql2 3.16.0
- **File Upload**: Multer 2.0.2 (SSD/HDD tiered storage)
- **Environment**: dotenv 17.2.3

### Development
- **Module System**: ES6 modules (`"type": "module"`)
- **TypeScript Config**: ESNext, bundler resolution, React JSX
- **Path Aliases**: `@/*` maps to project root

---

## Project Structure

```
dentacloud-pro/
├── components/          # Reusable React components (modals, widgets)
│   ├── AddAppointmentModal.tsx
│   ├── AddPatientModal.tsx
│   ├── BillingModal.tsx
│   ├── DentalChart.tsx
│   ├── ConfirmationModal.tsx
│   └── [30+ modal and UI components]
│
├── pages/              # Full-page views (routing targets)
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Appointments.tsx
│   ├── PatientList.tsx
│   ├── PatientDetail.tsx
│   ├── Billing.tsx
│   ├── Accounting.tsx
│   ├── Pharmacy.tsx
│   ├── Settings.tsx
│   └── [20+ page components]
│
├── services/           # External integrations and utilities
│   ├── geminiService.ts       # AI features (deprecated)
│   ├── integrationService.ts  # Hardware integrations
│   └── migrationService.ts    # Data migration utilities
│
├── App.tsx             # Main application component
├── index.tsx           # React root entry point
├── types.ts            # Global TypeScript type definitions
├── server.js           # Express backend server
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

### File Naming Conventions
- **Components/Pages**: PascalCase with `.tsx` extension
- **Services**: camelCase with `.ts` extension
- **Types**: Defined in `types.ts` using PascalCase for interfaces

---

## Architecture Patterns

### 1. State Management

**Global State via Context API**
```typescript
// App.tsx contains UserContext with:
- currentUser: User | null
- settings: ClinicSettings
- auditLogs: AuditEntry[]
- globalInvoices: Invoice[]
- globalExpenses: Expense[]
- patients: Patient[]
- services: TreatmentService[]
```

**LocalStorage Persistence**
- All global state is persisted to localStorage
- Keys: `denta_user`, `denta_settings`, `denta_audit_logs`, `denta_invoices`, `denta_patients`, `denta_services`, `denta_expenses`, `denta_staff`
- Data is synchronized on mount and after updates

**Session Management**
- Auto-logout after configurable inactivity period (default: 30 minutes)
- Activity tracked via mousedown, keydown, scroll, mousemove events
- Timeout reason stored and displayed on re-login

### 2. Routing

**HashRouter Strategy** (`App.tsx:55-56`)
```typescript
const { HashRouter, Routes, Route, Link, Navigate } = ReactRouterDOM;
const Router = HashRouter;
```

**Route Structure**
- `/` → Appointments (default)
- `/patients` → PatientList
- `/patients/:id` → PatientDetail
- `/billing` → Billing
- `/accounting` → Accounting (Admin/Accountant only)
- `/settings` → Settings (Admin only)
- Role-based route protection via conditional rendering

**Scroll Management** (`App.tsx:59-71`)
- Custom `<ScrollToTop />` component resets scroll on route change
- Targets `#main-scroll-container` element

### 3. Component Architecture

**Modal Pattern**
- Modals are separate components in `/components`
- Controlled via boolean state in parent pages
- Example: `AddPatientModal`, `BillingModal`, `ConfirmationModal`
- Props pattern: `isOpen`, `onClose`, `onSubmit`, data props

**Page Pattern**
- Pages consume context via `useUser()` hook
- Local state for UI (filters, modals, forms)
- Fetch/compute data from global context
- Example structure:
  ```typescript
  const PageName = () => {
    const { currentUser, settings, patients } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ... component logic
  }
  ```

### 4. Data Flow

**Adding New Entities**
1. User triggers modal/form in page
2. Modal collects data and calls `onSubmit`
3. Page calls context method (e.g., `addPatient()`)
4. Context updates state and persists to localStorage
5. Audit entry created (if applicable)

**Updating Entities**
1. Similar flow with `updatePatient()`, `updateInvoice()`, etc.
2. Find-and-replace pattern in state arrays
3. Re-save entire array to localStorage

---

## Key Conventions

### 1. Styling

**Tailwind Utility Classes**
- No separate CSS files; all styling inline via className
- Zero-animation CSS override for instantaneous UI (`replit.md` note)
- Consistent spacing: `space-x-*`, `space-y-*`, `gap-*`
- Rounded corners: `rounded-xl`, `rounded-2xl`
- Shadows: `shadow-sm`, `shadow-lg`, `shadow-2xl`
- Colors: slate (neutral), blue (primary), emerald (success), red (danger), amber (warning)

**Component Styling Patterns**
- Cards: `bg-white rounded-2xl border border-slate-200 p-6`
- Buttons: `px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors`
- Inputs: `px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100`
- Badges: `px-2 py-1 text-xs font-bold rounded-lg border`

### 2. TypeScript Usage

**Strict Type Definitions** (`types.ts`)
- All domain entities have interfaces
- Use union types for status fields: `'Pending' | 'Approved' | 'Rejected'`
- Optional fields marked with `?`
- Avoid `any`; prefer specific types

**Import Pattern**
```typescript
import { User, Patient, Invoice, ClinicSettings } from './types';
```

### 3. Naming

**Variables**
- camelCase for local variables and functions
- Descriptive names: `selectedBranch`, `filteredPatients`, `isModalOpen`

**Components**
- PascalCase for React components
- Descriptive names matching purpose: `AddPatientModal`, `BillingModal`

**Functions**
- Verb-first naming: `addPatient`, `updateSettings`, `handleSubmit`
- Event handlers: `handleClick`, `handleChange`, `onSubmit`

### 4. Code Organization

**Component File Structure**
1. Imports (React, external libs, internal components, types)
2. Interface/type definitions (component props)
3. Component function
4. Helper functions (if any)
5. Export statement

**No Prop Drilling**
- Use context for global data
- Pass only component-specific props
- Prefer context over deep prop chains

### 5. Error Handling

**Current Pattern**
- Console logging for errors
- User-facing error messages via alerts or inline text
- No global error boundary (consider adding)

### 6. Performance

**Zero-Animation Philosophy**
- Instant UI responses prioritized over animations
- Transitions only where necessary (hover states, modals)
- No loading spinners in mock data mode

**Optimizations**
- Direct state updates without intermediate loading states
- LocalStorage for persistence (fast, synchronous)
- No virtualization (lists assumed to be manageable size)

---

## Data Models

All types defined in `types.ts`. Key entities:

### Core Entities

**Patient** (`types.ts:105-122`)
```typescript
interface Patient {
  id: string;
  icNumber?: string;          // Malaysian IC
  tin?: string;               // Tax ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;        // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  medicalHistory: string[];
  insuranceProvider?: string;
  lastVisit?: string;
  status: 'Active' | 'Inactive';
  externalImagingId?: string;  // NNT integration
  registrationDate?: string;
}
```

**Appointment** (`types.ts:165-180`)
```typescript
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  branchId: string;
  date: string;               // YYYY-MM-DD
  time: string;               // HH:MM
  treatmentType: string;
  duration: number;           // minutes
  status: 'Confirmed' | 'Scheduled' | 'Completed' | 'Cancelled' |
          'Reminded' | 'Reschedule' | 'Arrived' | 'In Treatment' | 'No Show';
  arrivedAt?: string;         // ISO timestamp
  doctorIds?: string[];
  type?: 'Patient' | 'DoctorBlock';
  notes?: string;
}
```

**Invoice** (`types.ts:182-196`)
```typescript
interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  branchId: string;
  date: string;               // YYYY-MM-DD
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  items: { description: string; price: number }[];
  providerId?: string;        // Staff who created
  providerName?: string;
  paidAmount?: number;
  recordType?: 'Invoice' | 'Receipt';
  relatedInvoiceId?: string;  // Link receipt to invoice
}
```

**ClinicSettings** (`types.ts:88-103`)
```typescript
interface ClinicSettings {
  clinicName: string;
  companyName: string;
  supportEmail: string;
  autoLogoutTime: number;     // minutes
  currency: string;
  taxSstRate: number;         // percentage
  branches: ClinicBranch[];
  whatsappReminderTemplate: string;
  reminderTimingValue: number;
  reminderTimingUnit: 'hours' | 'days';
  paymentMethods: PaymentMethod[];
  clinicPanels?: ClinicPanel[];
  invoiceTemplate?: string;   // HTML template
  receiptTemplate?: string;   // HTML template
}
```

### Supporting Entities

See `types.ts` for complete definitions:
- `User`, `UserRole`
- `ProgressNote`, `Medication`, `MedicationItem`
- `TreatmentService`, `TreatmentLogEntry`
- `FormularyItem` (pharmacy)
- `ClinicBranch`, `PaymentMethod`
- `GLAccount`, `GLTransaction`, `APBill`, `Vendor`, `Expense`, `FixedAsset`
- `AttendanceRecord`, `StaffAttendance`, `LeaveRequest`
- `AuditEntry`, `IncomingReferral`, `ClinicalFile`

---

## Development Workflows

### 1. Adding a New Feature

**Example: Adding a new patient field**

1. **Update Types** (`types.ts`)
   ```typescript
   export interface Patient {
     // ... existing fields
     newField?: string;  // Add optional field
   }
   ```

2. **Update Form Component** (`components/AddPatientModal.tsx`)
   - Add input field to form
   - Update local state to capture value
   - Include in submit payload

3. **Update Display** (`pages/PatientDetail.tsx`)
   - Display new field in patient details
   - Add to edit modal if applicable

4. **Test Flow**
   - Add patient with new field
   - Verify persistence (check localStorage)
   - Verify display on patient detail page

### 2. Adding a New Page

1. **Create Page Component** (`pages/NewPage.tsx`)
   ```typescript
   import React from 'react';
   import { useUser } from '../App';

   const NewPage = () => {
     const { currentUser, settings } = useUser();

     return (
       <div>
         <h1 className="text-2xl font-bold">New Page</h1>
         {/* ... content */}
       </div>
     );
   };

   export default NewPage;
   ```

2. **Add Route** (`App.tsx`)
   ```typescript
   import NewPage from './pages/NewPage';

   // In Routes component:
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add Navigation Link** (`App.tsx` in sidebar)
   ```typescript
   <SidebarLink to="/new-page" icon={IconName} label="New Page"
                active={location.pathname === '/new-page'}
                minimized={isSidebarMinimized} />
   ```

4. **Consider Role Restrictions**
   ```typescript
   {currentUser.role === 'Admin' && (
     <SidebarLink to="/new-page" ... />
   )}
   ```

### 3. Adding a New Modal

1. **Create Modal Component** (`components/NewModal.tsx`)
   ```typescript
   interface NewModalProps {
     isOpen: boolean;
     onClose: () => void;
     onSubmit: (data: NewDataType) => void;
   }

   const NewModal = ({ isOpen, onClose, onSubmit }: NewModalProps) => {
     if (!isOpen) return null;

     // ... modal content with form

     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       onSubmit(formData);
       onClose();
     };

     return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-white rounded-2xl p-6 max-w-md w-full">
           {/* ... form */}
         </div>
       </div>
     );
   };
   ```

2. **Use in Parent Page**
   ```typescript
   const [isNewModalOpen, setIsNewModalOpen] = useState(false);

   const handleNewSubmit = (data: NewDataType) => {
     // Process data
     setIsNewModalOpen(false);
   };

   return (
     <>
       <button onClick={() => setIsNewModalOpen(true)}>Open Modal</button>
       <NewModal
         isOpen={isNewModalOpen}
         onClose={() => setIsNewModalOpen(false)}
         onSubmit={handleNewSubmit}
       />
     </>
   );
   ```

### 4. Working with Backend API

**Current State**: Backend is minimal (server.js)
- Serves static files
- Handles file uploads to SSD/HDD
- Has example `/api/patients` endpoint (likely unused)

**Adding New Endpoint**
1. Add route in `server.js`
   ```javascript
   app.post('/api/new-endpoint', async (req, res) => {
     try {
       const { data } = req.body;
       const [result] = await pool.query('INSERT INTO ...', [data]);
       res.json({ success: true, id: result.insertId });
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: 'Failed' });
     }
   });
   ```

2. Call from frontend
   ```typescript
   const response = await fetch('/api/new-endpoint', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ data: value })
   });
   const result = await response.json();
   ```

**Important**: Most data is currently managed via localStorage (mock mode), not database.

### 5. File Upload Flow

**Client Side**
```typescript
const formData = new FormData();
formData.append('patientFile', file);

const response = await fetch(`/api/upload/${patientId}`, {
  method: 'POST',
  body: formData
});

const { file: uploadedFile } = await response.json();
// uploadedFile.url is public path: /uploads/ssd/... or /uploads/hdd/...
```

**Server Side** (`server.js:117-160`)
- Multer handles file upload
- Files routed to SSD (default) or HDD (clinical assets: images, PDFs, documents)
- Returns public URL based on storage location

---

## External Integrations

### 1. NewTom NNT Imaging Bridge (`services/integrationService.ts`)

**Custom Protocol Handler**: `nnt://`
- Triggers external workstation to open patient imaging session
- Usage: `window.location.href = 'nnt://open?patientId=X'`
- Patient ID linked via `externalImagingId` field

### 2. MyKad Smart Card Reader

**Technology**: WebUSB API (Malaysian IC card reader)
- Automated patient registration from government ID
- Reads: Name, IC number, address, date of birth
- Browser support: Chrome/Edge only
- Requires user permission for USB device access

**Implementation Pattern**
```typescript
const requestMyKadReader = async () => {
  const device = await navigator.usb.requestDevice({ filters: [...] });
  await device.open();
  // ... read card data
  return {
    icNumber: '...',
    firstName: '...',
    lastName: '...',
    dateOfBirth: '...',
    address: '...'
  };
};
```

### 3. Biometric Fingerprint Scanner

**Use Case**: Staff attendance clock-in/out
- Fingerprint verification
- Creates `AttendanceRecord` with method: 'Fingerprint'
- Tracks: In, Out, Break_Start, Break_End events

### 4. WhatsApp Reminder System

**Template Configuration** (`ClinicSettings.whatsappReminderTemplate`)
- Variables: `{{patientName}}`, `{{branchName}}`, `{{treatmentType}}`, `{{date}}`, `{{time}}`
- Timing: Configurable (default: 24 hours before appointment)
- Implementation: External integration (not in codebase, likely via webhook/API)

### 5. Google Gemini AI (Deprecated)

**Previous Features** (now removed per `geminiService.ts`):
- Clinical note summarization
- Patient-friendly translation
- Note: AI features may be re-enabled; check environment variables

**Environment Variable**: `GEMINI_API_KEY` (defined in `vite.config.ts:15-16`)

---

## Common Tasks

### Task 1: Change Auto-Logout Duration

**File**: `App.tsx:143` (DEFAULT_SETTINGS)
```typescript
autoLogoutTime: 30,  // Change to desired minutes
```

Or update via Settings page (Admin only) at runtime.

### Task 2: Add New Branch

**Via Settings UI**:
1. Navigate to `/settings` (Admin only)
2. Add branch with all required fields:
   - name, companyName, address, phone, email, color, tin, sstNumber, logo

**Programmatically** (`App.tsx:153-156`):
```typescript
branches: [
  { id: 'b4', name: 'New Branch', companyName: '...', ... }
]
```

### Task 3: Customize Invoice Template

**File**: `App.tsx:73-141` (DEFAULT_INVOICE_TEMPLATE, DEFAULT_RECEIPT_TEMPLATE)
- HTML templates with mustache-style variables: `{{invoiceNumber}}`, `{{customerName}}`, etc.
- Special variable: `{{items_html_table}}` (auto-generated table)
- Inline CSS styling required

**Editable via**: Document Editor page (`/documents/:docId`)

### Task 4: Add New Treatment Service

**Via UI**: `/treatments` page → "New Service" button

**Data Structure**:
```typescript
{
  id: string;
  name: string;
  category: 'General' | 'Cosmetic' | 'Surgical' | 'Orthodontic' | 'Diagnostic';
  description: string;
  cost: number;
  duration: string;  // e.g., "45 min"
  commonNotes?: string;  // Pre-filled clinical notes template
}
```

**Storage**: `localStorage.denta_services`

### Task 5: Add New User Role

1. **Update Type** (`types.ts:2`)
   ```typescript
   export type UserRole = 'Admin' | 'Doctor' | 'Assistant' | 'Accountant' | 'NewRole';
   ```

2. **Update Role List** (`App.tsx:249`)
   ```typescript
   const ROLES: UserRole[] = ['Admin', 'Doctor', 'Assistant', 'Accountant', 'NewRole'];
   ```

3. **Add Role Icon and Color** (`App.tsx:252-268`)
   ```typescript
   case 'NewRole': return <IconName size={14} className="text-color-600" />;
   // ... and color
   case 'NewRole': return 'bg-color-50 text-color-700 border-color-100';
   ```

4. **Update Route Permissions** (`App.tsx:295-332`)
   ```typescript
   {(currentUser.role === 'Admin' || currentUser.role === 'NewRole') && (
     <SidebarLink to="/some-page" ... />
   )}
   ```

### Task 6: Debug LocalStorage Data

**Browser Console**:
```javascript
// View all DentaCloud data
Object.keys(localStorage).filter(k => k.startsWith('denta_')).forEach(k => {
  console.log(k, JSON.parse(localStorage.getItem(k)));
});

// Clear all data (reset to defaults)
Object.keys(localStorage).filter(k => k.startsWith('denta_')).forEach(k => {
  localStorage.removeItem(k);
});
```

### Task 7: Add Audit Logging to Action

**Usage**:
```typescript
const { addAuditEntry } = useUser();

// After important action
addAuditEntry(
  'Action Description',  // e.g., "Updated Patient Record"
  'Clinical',            // 'Clinical' | 'Financial' | 'Administrative' | 'Security'
  'Optional details'     // e.g., "Patient ID: 123"
);
```

**Automatic Logging**: Login, logout, settings changes already logged

---

## Important Notes

### 1. Development vs. Production

**Current Mode**: Development (Vite dev server)
- Server: `npm run dev` → `http://localhost:5000`
- Backend: `node server.js` → Port 80 (or from env)
- Database: MariaDB (configured via .env)

**Production Build**:
```bash
npm run build     # Creates dist/
npm run preview   # Preview production build
```

### 2. Environment Variables

**Required in `.env`**:
```env
GEMINI_API_KEY=...          # Google AI (if re-enabling)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=dentacloud
PORT=80
```

**Vite Config**: Exposes `GEMINI_API_KEY` as `process.env.GEMINI_API_KEY`

### 3. Database Schema

**Not Included**: Schema not in repository
- Expected tables: patients, appointments, invoices, etc.
- Current app uses localStorage primarily
- Backend API endpoints mostly unused

**Migration Strategy**: See `services/migrationService.ts` for data migration utilities

### 4. Testing

**No Test Suite**: No Jest, Vitest, or E2E tests currently
- Consider adding: Unit tests for utilities, integration tests for workflows
- Recommended: React Testing Library + Vitest

### 5. Security Considerations

**Current Implementation**:
- Role-based UI hiding (not enforced on backend)
- Auto-logout for inactivity
- Audit trail for important actions

**Needs Improvement**:
- Backend authentication/authorization
- API endpoint protection
- Input validation and sanitization
- SQL injection prevention (use parameterized queries)
- File upload validation (malware scanning)

### 6. Browser Compatibility

**Target**: Modern browsers (Chrome, Edge, Firefox, Safari)
- WebUSB: Chrome/Edge only (MyKad feature)
- ES2022 features used (check compatibility)

### 7. Performance at Scale

**Current Assumptions**:
- Small to medium clinics (hundreds of patients, not thousands)
- LocalStorage limits: ~5-10MB per domain
- No pagination on lists (filter/search only)

**Scaling Considerations**:
- Move to database-backed API
- Implement pagination and virtualization
- Add caching layer (Redis)

### 8. Internationalization

**Current**: English only
- Hardcoded strings throughout
- Date format: ISO (YYYY-MM-DD)
- Currency: Configurable (default: RM - Malaysian Ringgit)

**To Add i18n**:
- Use react-i18next or similar
- Extract strings to translation files
- Add language selector

### 9. Accessibility

**Current**: Limited accessibility features
- Semantic HTML usage: moderate
- ARIA labels: minimal
- Keyboard navigation: basic (browser defaults)

**Recommendations**:
- Add ARIA labels to interactive elements
- Improve keyboard navigation (modals, forms)
- Test with screen readers
- Add focus indicators

### 10. Code Quality Tools

**Not Configured**:
- ESLint
- Prettier
- Husky (git hooks)
- Lint-staged

**Recommended Setup**:
```bash
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## Development Best Practices for AI Assistants

### When Adding Features

1. **Always update types first** (`types.ts`)
2. **Follow existing patterns** (modal structure, page layout, context usage)
3. **Add audit logging** for important actions
4. **Test localStorage persistence** (refresh page, check data)
5. **Consider role permissions** (who should see this?)
6. **Update this CLAUDE.md** if adding significant patterns

### When Debugging

1. **Check browser console** for React errors
2. **Inspect localStorage** (DevTools → Application)
3. **Verify context updates** (add console.log in context methods)
4. **Check network tab** for API calls (if using backend)
5. **Test role switching** (profile dropdown → different roles)

### When Refactoring

1. **Maintain backward compatibility** with localStorage data
2. **Don't break existing routes** (users may have bookmarks)
3. **Keep context API simple** (avoid over-engineering)
4. **Test all user roles** after changes
5. **Update documentation** for significant changes

### Code Style

- **Prefer functional components** (no class components)
- **Use hooks** (useState, useEffect, useContext, useRef)
- **Avoid inline functions in JSX** for event handlers (performance)
- **Keep components focused** (single responsibility)
- **Extract complex logic** into helper functions
- **Comment complex algorithms** (dental chart calculations, date manipulations)

### Git Workflow

- **Commit frequently** with descriptive messages
- **Branch naming**: `feature/feature-name`, `fix/bug-description`
- **No merge conflicts** (coordinate on shared files)
- **Test before pushing** (at least manual smoke test)

---

## Quick Reference

### Context API Methods

```typescript
// From useUser() hook
currentUser              // Current logged-in user
settings                 // Clinic settings
patients                 // All patients
services                 // Treatment services
globalInvoices           // All invoices/receipts
globalExpenses           // All expenses
auditLogs                // Audit trail

addPatient(patient)      // Add new patient
updatePatient(patient)   // Update existing patient
addService(service)      // Add treatment service
updateService(service)   // Update treatment service
addInvoice(invoice)      // Add invoice/receipt
updateInvoice(id, updates) // Update invoice
deleteInvoice(id)        // Delete invoice
addExpense(expense)      // Add expense
addAuditEntry(action, category, details?) // Log audit event
updateSettings(settings) // Update clinic settings
login(email, password)   // Authenticate user
logout(reason?)          // End session
```

### Common Tailwind Patterns

```css
/* Card */
className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"

/* Primary Button */
className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"

/* Secondary Button */
className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"

/* Danger Button */
className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"

/* Input Field */
className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"

/* Modal Backdrop */
className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"

/* Modal Content */
className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"

/* Status Badge */
className="px-2 py-1 text-xs font-bold rounded-lg border bg-green-50 text-green-700 border-green-100"

/* Table */
className="w-full"
/* Table Header */
className="bg-slate-50 border-b border-slate-200"
/* Table Row */
className="border-b border-slate-100 hover:bg-slate-50"
```

### Date Formatting

```typescript
// ISO to Display
new Date('2025-01-15').toLocaleDateString('en-MY', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
// → "Jan 15, 2025"

// Current Date to ISO
new Date().toISOString().split('T')[0];
// → "2025-12-29"

// ISO Timestamp
new Date().toISOString();
// → "2025-12-29T11:32:00.000Z"
```

### ID Generation

```typescript
// Simple random ID (current pattern)
const id = Math.random().toString(36).substr(2, 9);

// Better: UUID (requires library)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

---

## Conclusion

DentaCloud Pro is a comprehensive dental clinic management system with a modern React frontend and minimal Express backend. The architecture prioritizes rapid development and instant UI responsiveness using localStorage for persistence. When extending the system, maintain consistency with existing patterns, update type definitions, and test across different user roles.

For questions or clarifications, refer to:
- **Technical Docs**: `README.md`
- **Replit Notes**: `replit.md`
- **Type Definitions**: `types.ts`
- **Main App Logic**: `App.tsx`

**Last Updated**: 2025-12-29 by AI Assistant
