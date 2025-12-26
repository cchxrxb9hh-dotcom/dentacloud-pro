
import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Filter, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  Activity,
  Zap,
  Tag,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import { FormularyItem } from '../types';
import { useUser } from '../App';
import FormularyItemModal from '../components/FormularyItemModal';
import ConfirmationModal from '../components/ConfirmationModal';

const MOCK_FORMULARY: FormularyItem[] = [
  { id: '1', name: 'Amoxicillin', category: 'Antibiotics', strength: '500mg', dosageForm: 'Capsule', stockLevel: 1240, unitPrice: 0.45, defaultDosage: '1 capsule every 8 hours for 7 days' },
  { id: '2', name: 'Ibuprofen', category: 'Analgesics', strength: '400mg', dosageForm: 'Tablet', stockLevel: 850, unitPrice: 0.12, defaultDosage: '1 tablet every 4-6 hours as needed for pain' },
  { id: '3', name: 'Metronidazole', category: 'Antibiotics', strength: '200mg', dosageForm: 'Tablet', stockLevel: 15, unitPrice: 0.35, defaultDosage: '1 tablet 3 times a day for 5 days' },
  { id: '4', name: 'Chlorhexidine', category: 'Antiseptics', strength: '0.12%', dosageForm: 'Rinse', stockLevel: 42, unitPrice: 4.50, defaultDosage: 'Rinse with 15ml twice daily for 2 weeks' },
  { id: '5', name: 'Clindamycin', category: 'Antibiotics', strength: '300mg', dosageForm: 'Capsule', stockLevel: 320, unitPrice: 1.20, defaultDosage: '1 capsule every 6 hours for 7 days' },
  { id: '6', name: 'Dexamethasone', category: 'Steroids', strength: '0.5mg', dosageForm: 'Tablet', stockLevel: 120, unitPrice: 0.60, defaultDosage: '1 tablet daily for 3 days' },
  { id: '7', name: 'Lidocaine', category: 'Anesthetics', strength: '2%', dosageForm: 'Cartridge', stockLevel: 500, unitPrice: 0.85, defaultDosage: 'For professional use only' },
];

const Pharmacy: React.FC = () => {
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<FormularyItem[]>(MOCK_FORMULARY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<FormularyItem> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FormularyItem | null>(null);

  // Derive categories dynamically from current items
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return ['All', ...Array.from(cats).sort()];
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FormularyItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: FormularyItem) => {
    setItemToDelete(item);
  };
  
  const handleSaveItem = (itemToSave: FormularyItem) => {
    if (editingItem?.id) {
      setItems(items.map(i => (i.id === itemToSave.id ? itemToSave : i)));
    } else {
      setItems([itemToSave, ...items]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      setItems(items.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const getStockBadge = (level: number) => {
    if (level <= 20) return 'bg-red-50 text-red-600 border-red-100';
    if (level <= 100) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Pharmacy & Formulary</h1>
          <p className="text-slate-500 font-medium text-sm">Managing the clinic's master medication database.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={18} /> Add New Medication
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inventory Items</p>
            <p className="text-2xl font-black text-slate-800">{items.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
            <p className="text-2xl font-black text-slate-800">{items.filter(i => i.stockLevel <= 100).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Prescriptions</p>
            <p className="text-2xl font-black text-slate-800">482</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search formulary..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">#</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Medication Detail</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Cost/Unit</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm">
                        <Pill size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.name} {item.strength}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.dosageForm}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStockBadge(item.stockLevel)}`}>
                       {item.stockLevel <= 20 ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                       {item.stockLevel} units
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-slate-900">RM{item.unitPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEditModal(item)} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white shadow-sm transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleOpenDeleteModal(item)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-white shadow-sm transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormularyItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        existingItems={items}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Delete Medication?"
        message={`Are you sure you want to permanently remove ${itemToDelete?.name} from the formulary? This action cannot be undone.`}
        confirmLabel="Confirm Deletion"
      />
    </div>
  );
};

export default Pharmacy;
