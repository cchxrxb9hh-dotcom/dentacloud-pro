import React from 'react';
import { MedicationItem } from '../types';

interface VisualPrescriptionProps {
    patientName: string;
    data: {
        date: string;
        prescriberName: string;
        clinicAddress: string;
        items: MedicationItem[];
    };
    branchName?: string;
    serialNumber?: string;
}

const VisualPrescription: React.FC<VisualPrescriptionProps> = ({ patientName, data, branchName, serialNumber }) => {
    const hasItems = data.items.some(item => item.medication);
    return (
        <div className="bg-white flex-1 rounded-2xl shadow-inner border border-slate-100 p-8 font-serif text-slate-800 flex flex-col">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                <h4 className="text-xl font-black uppercase tracking-tighter italic">{branchName || 'DentaCloud Pro'}</h4>
                <p className="text-[9px] uppercase font-bold tracking-widest mt-1">{data.clinicAddress || 'Clinic Address...'}</p>
            </div>
            
            <div className="flex justify-between text-[10px] font-bold uppercase mb-8">
                <span>Date: {data.date}</span>
                {serialNumber && <span>Serial: {serialNumber}</span>}
                <span>Patient: {patientName}</span>
            </div>

            <div className="flex-1 space-y-6 mt-2">
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-black italic text-slate-900">Rx</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="pl-4 space-y-4">
                    {hasItems ? data.items.map((item, index) => (
                        item.medication && (
                            <div key={index}>
                                <p className="text-base font-bold text-slate-800">{index + 1}. {item.medication}</p>
                                <p className="text-sm italic text-slate-600 ml-4"><strong>Sig:</strong> {item.dosage}</p>
                            </div>
                        )
                    )) : (
                        <p className="text-sm italic text-slate-400">Medications will appear here...</p>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
                <div className="text-[9px] text-slate-400 uppercase font-black">
                    Dispensed by: {data.prescriberName}
                </div>
                <div className="w-32 h-1 border-b-2 border-slate-300 relative">
                    <span className="absolute -top-4 right-0 text-[8px] font-black uppercase text-slate-300">Signature</span>
                </div>
            </div>
        </div>
    );
};

export default VisualPrescription;