import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

const PERMANENT_TEETH_DATA = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
    lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
};

const DECIDUOUS_TEETH_DATA = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [71, 72, 73, 74, 75],
    lowerRight: [81, 82, 83, 84, 85],
};


const CONDITIONS = [
  { name: 'Healthy', color: '#4ade80', textColor: '#ffffff' }, // green-400, white
  { name: 'Decay', color: '#f87171', textColor: '#ffffff' }, // red-400, white
  { name: 'Filling', color: '#60a5fa', textColor: '#ffffff' }, // blue-400, white
  { name: 'Crown', color: '#facc15', textColor: '#1f2937' }, // yellow-500, text-gray-800
  { name: 'Missing', color: '#e5e7eb', textColor: '#374151' }, // gray-200, text-gray-700
  { name: 'Extraction', color: '#4b5563', textColor: '#ffffff' }, // gray-600, white
];

type Surface = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';
type ToothStatus = Record<Surface, string>;

// Fixed: Changed to React.FC to properly handle React internal props like 'key'
const Tooth: React.FC<{ id: number, statuses: ToothStatus, onClick: (id: number, surface: Surface) => void, isSelected: boolean }> = ({ id, statuses, onClick, isSelected }) => {
    
    const getCondColor = (status: string) => (CONDITIONS.find(c => c.name.toLowerCase() === status) || CONDITIONS[0]).color;
    const isMissing = statuses.occlusal === 'missing';
    const isExtraction = statuses.occlusal === 'extraction';

    const renderSurface = (surface: Surface, gridClass: string) => {
        const isThisSelected = isSelected && onClick.toString().includes(`, '${surface}'`);
        return (
            <div
                onClick={() => !isMissing && !isExtraction && onClick(id, surface)}
                className={`transition-all duration-150 ${gridClass} ${isThisSelected ? 'ring-2 ring-blue-600 z-10' : ''}`}
                style={{ backgroundColor: getCondColor(statuses[surface]) }}
            />
        );
    }
    
    return (
        <div className="flex flex-col items-center">
            <div className={`relative w-11 h-11 border-2 rounded-lg overflow-hidden grid grid-cols-3 grid-rows-3 gap-px bg-slate-300 transition-all ${isSelected ? 'border-blue-600 scale-110 shadow-lg' : 'border-slate-300'} ${isMissing || isExtraction ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                {renderSurface('buccal', 'col-start-2')}
                {renderSurface('mesial', 'row-start-2')}
                {renderSurface('occlusal', 'row-start-2 col-start-2')}
                {renderSurface('distal', 'row-start-2 col-start-3')}
                {renderSurface('lingual', 'row-start-3 col-start-2')}
                
                {isExtraction && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <X size={32} className="text-red-500" strokeWidth={4} />
                    </div>
                )}
            </div>
            <span className="text-[9px] font-black text-slate-500 mt-1.5">{id}</span>
        </div>
    );
};

const DentalChart = ({ data, onChange }: { data: Record<string, ToothStatus>, onChange: (data: Record<string, ToothStatus>) => void }) => {
  const [selected, setSelected] = useState<{tooth: number, surface: Surface} | null>(null);
  const [view, setView] = useState<'permanent' | 'deciduous'>('permanent');

  const handleConditionSelect = (conditionName: string) => {
    if (selected) {
      const { tooth, surface } = selected;
      const currentToothData = data[tooth] || { buccal: 'healthy', lingual: 'healthy', mesial: 'healthy', distal: 'healthy', occlusal: 'healthy' };
      let newToothData;

      if (conditionName === 'missing' || conditionName === 'extraction' || conditionName === 'crown') {
        newToothData = { buccal: conditionName, lingual: conditionName, mesial: conditionName, distal: conditionName, occlusal: conditionName };
      } else {
        newToothData = { ...currentToothData, [surface]: conditionName };
      }
      
      onChange({ ...data, [tooth]: newToothData });
      setSelected(null);
    }
  };

  const renderQuadrant = (teeth: number[]) => (
    <div className="flex gap-1">
      {teeth.map(id => (
        <Tooth 
          key={id} 
          id={id} 
          statuses={data[id.toString()] || { buccal: 'healthy', lingual: 'healthy', mesial: 'healthy', distal: 'healthy', occlusal: 'healthy' }}
          onClick={(toothId, surface) => setSelected({ tooth: toothId, surface: surface })}
          isSelected={selected?.tooth === id}
        />
      ))}
    </div>
  );
  
  const currentTeeth = view === 'permanent' ? PERMANENT_TEETH_DATA : DECIDUOUS_TEETH_DATA;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-sm font-black uppercase tracking-[0.1em] text-slate-600">
            {view === 'permanent' ? 'Permanent Dentition' : 'Deciduous Dentition'}
        </h4>
        <button 
            onClick={() => setView(view === 'permanent' ? 'deciduous' : 'permanent')}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
        >
            <RefreshCw size={12} />
            Switch to {view === 'permanent' ? 'Deciduous' : 'Permanent'}
        </button>
      </div>
      
      <div className="flex flex-col items-center gap-6 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
        <div className="flex gap-2">
            {renderQuadrant(currentTeeth.upperRight)}
            {renderQuadrant(currentTeeth.upperLeft)}
        </div>
        <div className="flex gap-2">
            {renderQuadrant(currentTeeth.lowerRight.slice().reverse())}
            {renderQuadrant(currentTeeth.lowerLeft)}
        </div>
      </div>

      {selected && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 shadow-lg">
           <p className="text-xs font-black uppercase text-blue-800">
             Marking <span className="text-base">Tooth #{selected.tooth} ({selected.surface})</span>
           </p>
           <div className="flex gap-2 w-full">
            {CONDITIONS.map(c => (
              <button 
                key={c.name} 
                onClick={() => handleConditionSelect(c.name.toLowerCase())} 
                className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-sm"
                style={{ backgroundColor: c.color, color: c.textColor }}
              >
                {c.name}
              </button>
            ))}
           </div>
           <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors mt-2">
               <X size={16} className="text-slate-500"/>
           </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap pt-6 border-t border-slate-50">
        {CONDITIONS.map(c => (
          <div key={c.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DentalChart;