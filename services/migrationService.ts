

export interface MappingSuggestion {
  sourceField: string;
  targetField: string;
  confidence: number;
  reason: string;
}

export const startMigration = async (
  onProgress: (progress: { stage: string; percent: number }) => void
): Promise<void> => {
  const stages = [
    { name: 'Analyzing SQL Dump', duration: 1500 },
    { name: 'Parsing Patient Table', duration: 2500 },
    { name: 'Reconstructing Progress Notes (procnote)', duration: 3000 },
    { name: 'Mapping Appointments & Schedules', duration: 2000 },
    { name: 'Finalizing Relational Integrity', duration: 1000 }
  ];

  let currentPercent = 0;
  for (const stage of stages) {
    onProgress({ stage: stage.name, percent: currentPercent });
    
    const steps = 10;
    const stepDuration = stage.duration / steps;
    const stepIncrement = (100 / stages.length) / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(r => setTimeout(r, stepDuration));
      currentPercent += stepIncrement;
      onProgress({ stage: stage.name, percent: Math.min(Math.round(currentPercent), 100) });
    }
  }
};