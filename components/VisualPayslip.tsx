import React from 'react';
import { ClinicSettings } from '../types';

interface PayslipItem {
  description: string;
  amount: number;
}

interface PayslipData {
  employeeName: string;
  employeeId: string;
  role: string;
  payPeriod: string;
  paymentDate: string;
  earnings: PayslipItem[];
  deductions: PayslipItem[];
  netPay: number;
}

interface VisualPayslipProps {
  data: PayslipData;
  settings: ClinicSettings;
}

const VisualPayslip: React.FC<VisualPayslipProps> = ({ data, settings }) => {
  const totalEarnings = data.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = data.deductions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white p-10 font-sans text-slate-900 w-full max-w-3xl mx-auto print:p-0 print:max-w-none">
      {/* Employee Details Header Section */}
      <div className="bg-slate-50 rounded-[20px] p-6 mb-8 border border-slate-200 print:bg-white print:border-slate-300">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee Name</p>
            <p className="text-base font-black text-slate-900 uppercase tracking-tight">{data.employeeName}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee ID</p>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{data.employeeId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Designation</p>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{data.role}</p>
          </div>
        </div>
      </div>

      {/* Earnings & Deductions Grid */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        {/* Earnings Side */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Earnings</h3>
          <div className="space-y-4">
            {data.earnings.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-bold">{item.description}</span>
                <span className="font-black text-slate-900">{settings.currency}{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg print:bg-transparent">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Earnings</span>
             <span className="text-sm font-black text-slate-900">{settings.currency}{totalEarnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Deductions Side */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Deductions</h3>
          <div className="space-y-4">
            {data.deductions.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-bold">{item.description}</span>
                <span className="font-black text-rose-600">-{settings.currency}{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg print:bg-transparent">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Deductions</span>
             <span className="text-sm font-black text-rose-600">-{settings.currency}{totalDeductions.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-900 my-8"></div>

      {/* Net Payable Box Section */}
      <div className="flex justify-end mb-12">
        <div className="w-[340px] bg-[#111827] text-white p-8 rounded-[24px] print:bg-transparent print:text-black print:border-2 print:border-slate-900">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] print:text-slate-600">Net Payable</p>
            <div className="flex items-end justify-between">
                <p className="text-[10px] font-bold text-slate-500 leading-tight w-24">Transferred via Bank Transfer</p>
                <p className="text-4xl font-black tracking-tighter leading-none">{settings.currency}{data.netPay.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Date Footer */}
      <div className="mt-20 pt-8 flex justify-between items-end border-t border-slate-100">
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Payment Date: {data.paymentDate}</p>
          <p className="text-[9px] text-slate-400 font-medium max-w-[200px] leading-relaxed">This is a computer-generated document. No signature is required.</p>
        </div>
        <div className="text-center w-64">
           <div className="h-px bg-slate-300 mb-2 w-full"></div>
           <p className="uppercase font-black tracking-[0.2em] text-[9px] text-slate-400">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default VisualPayslip;