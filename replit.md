# DentaCloud Pro

## Overview
DentaCloud Pro is a modern dental clinic management system built with React, TypeScript, and Vite. It provides comprehensive tools for managing patients, appointments, billing, treatments, pharmacy, and staff.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS (CDN)
- **Routing**: React Router DOM (HashRouter)
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Generation**: jsPDF, html2canvas

## Project Structure
```
/
├── components/       # Reusable UI components and modals
├── pages/           # Page components (Appointments, Patients, etc.)
├── services/        # API and integration services
├── App.tsx          # Main application with routing and context
├── index.tsx        # React entry point
├── index.html       # HTML template
├── types.ts         # TypeScript type definitions
├── vite.config.ts   # Vite configuration
└── server.js        # Express backend (not used in dev mode)
```

## Development
- Run `npm run dev` to start the Vite development server on port 5000
- The frontend uses mock data for demonstration purposes

## Features
- Patient management with dental charting
- Appointment scheduling
- Billing and invoicing
- Treatment services menu
- Pharmacy/formulary management
- Staff management and attendance
- Multi-branch support
- Audit trail
- Reports and analytics

## Notes
- The backend (server.js) is designed for MariaDB/MySQL but is not required for the frontend demo
- The app uses localStorage for data persistence in demo mode
