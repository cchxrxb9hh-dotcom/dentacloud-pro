import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowRight,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Plus,
  Building2,
  MapPin,
  Download,
  Stethoscope,
  Calculator,
  Edit2,
  Send,
  MessageCircle,
  History,
  Coins,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Box,
  CreditCard,
  Briefcase,
  FileText,
  BarChart4,
  Zap,
  Package,
  Wallet,
  ShieldCheck,
  Scale,
  Loader2,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Invoice, ClinicBranch, GLAccount, GLTransaction, Vendor, APBill, FixedAsset, Expense, PayrollRecord, FormularyItem } from '../types';
import BillingModal from '../components/BillingModal';
import { useUser } from '../App';
import GLAccountModal from '../components/GLAccountModal';
import GLTransactionModal from '../components/GLTransactionModal';
import APBillModal from '../components/APBillModal';
import FixedAssetModal from '../components/FixedAssetModal';
import ExpenseModal from '../components/ExpenseModal';
import ReceiveBatchModal from '../components/ReceiveBatchModal';
import PayslipModal from '../components/PayslipModal';

const MOCK_ASSETS: FixedAsset[] = [];

const MOCK_INVENTORY: FormularyItem[] = [];

const MOCK_PAYROLL: PayrollRecord[] = [];

const MOCK_CHART_DATA: { month: string; revenue: number; expenses: number }[] = [];

const Accounting: React.FC = () => {
  const { settings, addAuditEntry, globalInvoices, globalExpenses, addExpense } = useUser();
  const [activeTab, setActiveTab] = useState<'ledger' | 'assets' | 'expenses' | 'inventory' | 'payroll' | 'taxes' | 'overview'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  
  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPayrollRunning, setIsPayrollRunning] = useState(false);
  const [isReceiveBatchModalOpen, setIsReceiveBatchModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<PayrollRecord | null>(null);
  
  const [assets, setAssets] = useState<FixedAsset[]>(MOCK_ASSETS);
  const [inventory, setInventory] = useState<FormularyItem[]>(MOCK_INVENTORY);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(MOCK_PAYROLL);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const branches = settings.branches;

  const calculateDepreciation = (asset: FixedAsset) => {
    const purchase = new Date(asset.purchaseDate);
    const now = new Date();
    const ageInMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
    const totalMonths = asset.usefulLifeYears * 12;
    const monthlyDepr = (asset.purchasePrice - asset.salvageValue) / totalMonths;
    const accumulated = Math.min(monthlyDepr * ageInMonths, asset.purchasePrice - asset.salvageValue);
    return {
      accumulated,
      bookValue: asset.purchasePrice - accumulated,
      percentUsed: (accumulated / (asset.purchasePrice - asset.salvageValue)) * 100
    };
  };

  const totals = useMemo(() => {
    const branchAssets = selectedBranchId === 'all' ? assets : assets.filter(a => a.branchId === selectedBranchId);
    const branchExpenses = selectedBranchId === 'all' ? globalExpenses : globalExpenses.filter(e => e.branchId === selectedBranchId);
    const branchAR = globalInvoices.filter(i => selectedBranchId === 'all' || i.branchId === selectedBranchId);

    const totalAssetBookValue = branchAssets.reduce((sum, a) => sum + calculateDepreciation(a).bookValue, 0);
    const totalOpExpenses = branchExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = branchAR.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const totalReceivable = branchAR.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.stockLevel * i.unitPrice), 0);

    return { totalAssetBookValue, totalOpExpenses, totalRevenue, totalReceivable, totalInventoryValue };
  }, [selectedBranchId, assets, globalExpenses, globalInvoices, inventory]);

  const exportToExcel = () => {
    const headers = ['Month', 'Revenue', 'Expenses', 'Profit'];
    const rows = MOCK_CHART_DATA.map(item => [
        item.month,
        item.revenue,
        item.expenses,
        item.revenue - item.expenses
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `P&L_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: 'pdf' | 'excel', title: string) => {
    if (format === 'pdf') {
        addAuditEntry(`Generated Report`, 'Financial', `Exported ${title} as PDF`);
        window.print();
    } else {
        addAuditEntry(`Generated Report`, 'Financial', `Exported ${title} as Excel (CSV)`);
        exportToExcel();
    }
    setIsExportMenuOpen(false);
  };
  
  const handleRunPayroll = () => {
    if (window.confirm('Are you sure you want to finalize and run the payroll for this period? This action cannot be undone.')) {
        setIsPayrollRunning(true);
        addAuditEntry('Initiated Payroll Cycle', 'Financial', 'Processing payroll for July 2024');
        setTimeout(() => {
            setPayroll(prev => prev.map(p => p.status === 'Approved' ? {...p, status: 'Paid'} : p));
            alert('Payroll cycle completed successfully! Records have been updated and payslips are now available for generation.');
            setIsPayrollRunning(false);
        }, 2500);
    }
  };

  const handleOpenPayslip = (record: PayrollRecord) => {
    setSelectedPayrollRecord(record);
    setIsPayslipModalOpen(true);
  };

  const handleGeneratePayslips = () => {
      addAuditEntry('Generated Payslips Report', 'Financial', 'Exported all staff payslips as PDF');
      window.print();
  };
  
  const handleReceiveBatch = (itemId: string, quantity: number, invoice: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    setInventory(prev => prev.map(i => 
      i.id === itemId ? { ...i, stockLevel: i.stockLevel + quantity } : i
    ));

    addAuditEntry(
      'Received Inventory Batch', 
      'Financial', 
      `Item: ${item.name}, Quantity: +${quantity}, Invoice: ${invoice || 'N/A'}`
    );
  };

  const handleFileTaxReturn = () => {
    if(window.confirm('This action will finalize the current tax period summary for SST. Are you sure you want to proceed?')) {
      addAuditEntry('Filed SST Tax Return', 'Financial', 'SST return generated and marked as filed for the current period.');
      alert('SST Tax Return has been marked as filed. (Simulation)');
    }
  };

  const filteredExpenses = globalExpenses.filter(e => {
    // Fixed: Completed the truncated filtering logic.
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranchId === 'all' || e.branchId === selectedBranchId;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Clinical Accounting</h1>
          <p className="text-slate-500 font-medium text-sm">Managing practice revenue, expenses, and asset depreciation.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {(['overview', 'ledger', 'assets', 'expenses', 'inventory', 'payroll', 'taxes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Revenue</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Realized Revenue</p>
          <p className="text-2xl font-black text-slate-900 mt-1">RM{totals.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown size={24} /></div>
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Expenses</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Operational Overhead</p>
          <p className="text-2xl font-black text-slate-900 mt-1">RM{totals.totalOpExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Box size={24} /></div>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Assets</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Fixed Asset Book Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">RM{totals.totalAssetBookValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calculator size={24} /></div>
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Payables</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Accounts Receivable</p>
          <p className="text-2xl font-black text-slate-900 mt-1">RM{totals.totalReceivable.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-10 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Performance Analytics</h3>
              <div className="relative">
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                >
                    <Printer size={16} /> Export P&L Statement
                </button>
                {isExportMenuOpen && (
                    <div 
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 z-10 p-2 animate-in fade-in zoom-in-95 duration-200"
                        onMouseLeave={() => setIsExportMenuOpen(false)}
                    >
                        <button 
                            onClick={() => handleExport('pdf', 'Profit & Loss')}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <FileText size={16} className="text-red-500" /> Export as PDF
                        </button>
                        <button 
                            onClick={() => handleExport('excel', 'Profit & Loss')}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <FileText size={16} className="text-emerald-500" /> Export as Excel (CSV)
                        </button>
                    </div>
                )}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `RM${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={4} fill="none" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
           <div className="p-0">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100"><Receipt size={20} /></div>
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Accounts Receivable</h3>
               </div>
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <input type="text" placeholder="Find patient or invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none w-48 focus:ring-4 focus:ring-blue-100 transition-all" />
                 </div>
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-4">Invoice #</th>
                     <th className="px-8 py-4">Patient</th>
                     <th className="px-8 py-4">Date</th>
                     <th className="px-8 py-4">Status</th>
                     <th className="px-8 py-4 text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {globalInvoices.filter(i => i.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())).map(inv => (
                     <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5 text-sm font-black text-slate-900">{inv.id}</td>
                       <td className="px-8 py-5 text-sm font-bold text-slate-700">{inv.patientName}</td>
                       <td className="px-8 py-5 text-xs text-slate-500">{inv.date}</td>
                       <td className="px-8 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{inv.status}</span>
                       </td>
                       <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">RM{inv.amount.toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'assets' && (
           <div className="p-0">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Fixed Asset Registry</h3>
               <button onClick={() => setIsAssetModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md">
                 <Plus size={14} /> Register Asset
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-4">Asset Detail</th>
                     <th className="px-8 py-4">Purchase Info</th>
                     <th className="px-8 py-4">Useful Life</th>
                     <th className="px-8 py-4 text-right">Book Value</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {assets.map(asset => {
                     const depr = calculateDepreciation(asset);
                     return (
                       <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-8 py-5">
                           <p className="text-sm font-black text-slate-900 uppercase">{asset.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.category}</p>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-600">{asset.purchaseDate}</p>
                           <p className="text-[10px] font-black text-slate-400">RM{asset.purchasePrice.toLocaleString()}</p>
                         </td>
                         <td className="px-8 py-5">
                            <div className="w-32">
                               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                                  <div className="h-full bg-blue-500" style={{ width: `${100 - depr.percentUsed}%` }} />
                               </div>
                               <p className="text-[9px] font-black text-slate-400 uppercase">{asset.usefulLifeYears} Years Plan</p>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-right font-black text-blue-700 text-sm">RM{depr.bookValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'expenses' && (
           <div className="p-0">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Expense Ledger</h3>
               <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md">
                 <Plus size={14} /> Log Expense
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-4">Description</th>
                     <th className="px-8 py-4">Category</th>
                     <th className="px-8 py-4">Date</th>
                     <th className="px-8 py-4 text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredExpenses.map(exp => (
                     <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5 text-sm font-bold text-slate-800">{exp.description}</td>
                       <td className="px-8 py-5">
                         <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">{exp.category}</span>
                       </td>
                       <td className="px-8 py-5 text-xs text-slate-500">{exp.date}</td>
                       <td className="px-8 py-5 text-right font-black text-rose-600 text-sm">RM{exp.amount.toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'inventory' && (
           <div className="p-0">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Clinical Inventory Valuation</h3>
               <button onClick={() => setIsReceiveBatchModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
                 <Package size={14} /> Receive Batch
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-4">Item Name</th>
                     <th className="px-8 py-4">Stock Level</th>
                     <th className="px-8 py-4">Unit Cost</th>
                     <th className="px-8 py-4 text-right">Asset Value</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {inventory.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5">
                         <p className="text-sm font-bold text-slate-800">{item.name}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                       </td>
                       <td className="px-8 py-5 text-sm font-black text-slate-700">{item.stockLevel} Units</td>
                       <td className="px-8 py-5 text-xs text-slate-500">RM{item.unitPrice.toFixed(2)}</td>
                       <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">RM{(item.stockLevel * item.unitPrice).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'payroll' && (
           <div className="p-0">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Payroll Processing</h3>
               <div className="flex gap-3">
                 <button onClick={handleGeneratePayslips} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={14} /> Export All Payslips
                 </button>
                 <button 
                  disabled={isPayrollRunning}
                  onClick={handleRunPayroll} 
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                 >
                   {isPayrollRunning ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
                   Run July Payroll
                 </button>
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-4">Employee</th>
                     <th className="px-8 py-4">Gross Salary</th>
                     <th className="px-8 py-4">Deductions</th>
                     <th className="px-8 py-4">Net Payable</th>
                     <th className="px-8 py-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {payroll.map(record => (
                     <tr key={record.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleOpenPayslip(record)}>
                       <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${record.userId}`} alt="" /></div>
                           <span className="text-sm font-bold text-slate-800">{record.userName}</span>
                         </div>
                       </td>
                       <td className="px-8 py-5 text-sm text-slate-600">RM{record.grossSalary.toLocaleString()}</td>
                       <td className="px-8 py-5 text-sm text-rose-500">-RM{record.deductions.toLocaleString()}</td>
                       <td className="px-8 py-5 text-sm font-black text-slate-900">RM{record.netPay.toLocaleString()}</td>
                       <td className="px-8 py-5 text-right">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{record.status}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'taxes' && (
           <div className="p-10 space-y-8">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">SST & Tax Compliance</h3>
                  <p className="text-xs text-slate-500 font-medium">Monitoring Service Tax liabilities (6%).</p>
                </div>
                <button onClick={handleFileTaxReturn} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl">
                  <ShieldCheck size={16} /> File Period SST Return
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-full shadow-sm"><Scale size={32} className="text-blue-600" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated SST Collected</p>
                    <p className="text-4xl font-black text-slate-900 mt-1">RM{(totals.totalRevenue * 0.06).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Period: July 2024</p>
               </div>
               
               <div className="p-8 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col justify-center space-y-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">SST Filing Reminder</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Your next SST return is due in 12 days. Ensure all invoices are marked as paid to reflect accurate collection records.</p>
                    </div>
                  </div>
               </div>
             </div>
           </div>
        )}
      </div>

      <FixedAssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onSave={(a) => { setAssets([...assets, a]); addAuditEntry('Registered Fixed Asset', 'Financial', `Asset: ${a.name}`); }} branches={branches} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={(e) => { addExpense(e); addAuditEntry('Logged Expense', 'Financial', `Desc: ${e.description}`); }} branches={branches} />
      <ReceiveBatchModal isOpen={isReceiveBatchModalOpen} onClose={() => setIsReceiveBatchModalOpen(false)} inventoryItems={inventory} onSave={handleReceiveBatch} />
      <PayslipModal isOpen={isPayslipModalOpen} onClose={() => { setIsPayslipModalOpen(false); setSelectedPayrollRecord(null); }} payrollRecord={selectedPayrollRecord} />
    </div>
  );
};

// Fixed: Added the missing default export to satisfy App.tsx import.
export default Accounting;