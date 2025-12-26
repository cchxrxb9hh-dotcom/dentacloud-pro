
import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Filter, 
  DollarSign, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Scissors,
  Smile,
  Activity,
  Edit2
} from 'lucide-react';
import { TreatmentService } from '../types';
import ServiceModal from '../components/ServiceModal';
import { useUser } from '../App';

const Treatments: React.FC = () => {
  const { services, addService, updateService } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<TreatmentService | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return ['All', ...Array.from(cats).sort()];
  }, [services]);

  const categoryOptions = useMemo(() => categories.filter(c => c !== 'All'), [categories]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: TreatmentService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = (serviceToSave: TreatmentService) => {
    if (editingService) {
      updateService(serviceToSave);
    } else {
      addService(serviceToSave);
    }
    setIsModalOpen(false);
    setEditingService(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Diagnostic': return <Activity size={12} />;
      case 'General': return <ShieldCheck size={12} />;
      case 'Cosmetic': return <Smile size={12} />;
      case 'Surgical': return <Scissors size={12} />;
      case 'Orthodontic': return <Zap size={12} />;
      default: return <Stethoscope size={12} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Diagnostic': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'General': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cosmetic': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Surgical': return 'bg-red-50 text-red-700 border-red-200';
      case 'Orthodontic': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Clinical Service Menu</h1>
          <p className="text-slate-500 text-sm font-medium">Standard professional fees and service durations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
          >
            <Plus size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search treatments or descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all border whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">#</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Service</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Fee</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.map((service, idx) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-8 py-5 max-w-sm">
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{service.name}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">{service.description}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getCategoryColor(service.category)}`}>
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Clock size={12} className="text-slate-400" />
                      {service.duration}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-emerald-600">RM{service.cost.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleOpenEditModal(service)}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white shadow-sm transition-all border border-transparent hover:border-slate-100"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                    <td colSpan={6}>
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">We couldn't find any treatments matching your current search or filters.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        service={editingService}
        categoryOptions={categoryOptions}
      />

      <div className="bg-blue-600 rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-200">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
          <DollarSign size={40} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Billing Policy Update</h3>
          <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-2xl">
            Professional fees listed are standardized estimates. Actual costs may vary depending on the clinical complexity and additional materials required during the procedure.
          </p>
        </div>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap">
          Update Pricing Table
        </button>
      </div>
    </div>
  );
};

export default Treatments;