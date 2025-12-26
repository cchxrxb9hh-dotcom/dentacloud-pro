
import React from 'react';
import { X, Calculator, Calendar, FileText } from 'lucide-react';
import { GLAccount, GLTransaction } from '../types';

interface GLTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: GLAccount | null;
  transactions: GLTransaction[];
}

const GLTransactionModal: React.FC<GLTransactionModalProps> = ({ isOpen, onClose, account, transactions }) => {
  if (!isOpen || !account) return null;

  const getCategoryColor = (category: GLAccount['category']) => {
    switch (category) {
      case 'Asset': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Liability': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Equity': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Revenue': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Expense': return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  const calculateRunningBalance = () => {
    let runningBalance = account.balance;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sortedTransactions.map(tx => {
      const balance = runningBalance;
      if(account.category === 'Asset' || account.category === 'Expense') {
        runningBalance = runningBalance - tx.debit + tx.credit;
      } else { // Liability, Equity, Revenue
        runningBalance = runningBalance + tx.debit - tx.credit;
      }
      return { ...tx, balance };
    }).reverse();
  };

  const transactionsWithBalance = calculateRunningBalance();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Transaction Ledger</h3>
              <p className="text-xs text-slate-500 font-medium">{account.code} - {account.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto">
            <div className={`p-6 rounded-2xl border ${getCategoryColor(account.category)} flex items-center justify-between`}>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Account Category</p>
                    <p className="text-base font-bold">{account.category}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest">Current Balance</p>
                    <p className="text-2xl font-black">RM{account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="py-3 pr-4">Date</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4 text-right">Debit</th>
                            <th className="py-3 px-4 text-right">Credit</th>
                            <th className="py-3 pl-4 text-right">Running Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsWithBalance.map(tx => (
                            <tr key={tx.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                <td className="py-3 pr-4 text-xs font-medium text-slate-500">{tx.date}</td>
                                <td className="py-3 px-4 text-sm text-slate-800">{tx.description}</td>
                                <td className="py-3 px-4 text-right font-mono text-sm text-amber-700">{tx.debit > 0 ? tx.debit.toFixed(2) : '-'}</td>
                                <td className="py-3 px-4 text-right font-mono text-sm text-emerald-700">{tx.credit > 0 ? tx.credit.toFixed(2) : '-'}</td>
                                <td className="py-3 pl-4 text-right font-mono text-sm font-bold text-slate-600">{tx.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {transactions.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-slate-400 font-medium">No transactions recorded for this account.</p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GLTransactionModal;
