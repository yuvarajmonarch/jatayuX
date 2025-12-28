import { useRef, useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ShieldCheck, Cpu, X, Wind, Satellite, Navigation, BarChart3, TrendingUp, Zap } from 'lucide-react';

interface ReportData {
  summary?: string;
  riskLevel?: string;
  locationName?: string;
  sources?: string[];
  dataPoints?: Array<{ label: string; value: string | number; unit?: string }>;
  modules?: {
    atmospheric: { 
      temp: number | string;
      humidity?: string | number;
    };
    environmental?: { 
      aqi: number; 
      status: string; 
    };
    satellite?: { 
      lastScan: string; 
      coordinates: string; 
    };
  };
  ndviVegetationAnalysis?: {
    totalChange: string;
    vegetationChange: string;
    urbanChange: string;
    changeIntensity: string;
  };
  terraMindInsights?: {
    insights?: Array<{ type: string; description: string; confidence: string }>;
  };
}

interface ReportModalProps {
  isOpen: boolean;
  data: ReportData | null;
  onClose: () => void;
}

export const ReportModal = ({ isOpen, data, onClose }: ReportModalProps) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!data) return null;

  const handleDownloadPDF = async () => {
    const element = reportContentRef.current;
    if (!element) return;
    setIsGenerating(true);

    const options = {
      margin: 10,
      filename: `Jatayu_Intelligence_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="w-full max-w-3xl bg-slate-900 border border-sky-500/30 p-8 rounded-2xl shadow-2xl relative"
          >
            {/* Modal UI Controls - Not Printed */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-sky-400" size={20} />
                <h2 className="text-white font-bold uppercase tracking-wider text-sm">Report Preview</h2>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            {/* --- START OF THE PRINTABLE CONTENT --- */}
            <div ref={reportContentRef} className="bg-slate-950 p-10 text-white rounded-lg overflow-y-auto max-h-[60vh] custom-report-scrollbar border border-slate-800">
              
              {/* Report Header Area (Visual Use of Icons) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-500/20 rounded-lg">
                  <Cpu className="text-sky-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight underline decoration-sky-500">INTELLIGENCE BRIEF</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-4 mb-6">
                <Navigation size={16} className="text-sky-500" />
                <span className="text-sm font-medium">{data.locationName || "Target Perimeter Alpha"}</span>
              </div>
              
              <div className="flex justify-between items-start border-b-2 border-sky-500 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter">JATAYU SYSTEM REPORT</h1>
                  <p className="text-sky-400 font-mono text-xs mt-1 tracking-[0.2em] uppercase">Security Level: Classified</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Summary Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3 text-sky-400">
                  <TrendingUp size={16} />
                  <h3 className="text-xs font-bold uppercase">Executive Summary</h3>
                </div>
                <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 italic text-sm leading-relaxed text-slate-300">
                  "{data.summary || "No automated summary available for this perimeter."}"
                </div>
              </div>

              {/* Data Grid: Atmospheric & Environment */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative overflow-hidden">
                   <Wind className="absolute -right-4 -bottom-4 text-slate-800" size={80} />
                   <h4 className="text-[10px] text-sky-500 uppercase font-bold mb-2">Primary Metrics</h4>
                   <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-400">Temperature</span>
                        <span className="text-lg font-mono">{data.modules?.atmospheric.temp || 'N/A'}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Security Risk</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${data.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {data.riskLevel || 'Low'}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative overflow-hidden">
                   <BarChart3 className="absolute -right-4 -bottom-4 text-slate-800" size={80} />
                   <h4 className="text-[10px] text-emerald-500 uppercase font-bold mb-2">Environmental Index</h4>
                   <div className="grid grid-cols-2 gap-2 relative z-10">
                      {data.dataPoints?.slice(0, 4).map((point, idx) => (
                        <div key={idx} className="bg-black/20 p-2 rounded">
                          <p className="text-[8px] text-slate-500 uppercase">{point.label}</p>
                          <p className="text-xs font-bold">{point.value}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Satellite Analysis Section */}
              {data.ndviVegetationAnalysis && (
                <div className="mb-8 p-6 bg-slate-900 border-l-4 border-emerald-500 rounded-r-lg">
                   <div className="flex items-center gap-2 mb-4 text-emerald-400">
                      <Satellite size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Orbital Analysis (NDVI)</h3>
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">Vegetation Shift</p>
                        <p className="text-sm font-mono text-emerald-400 font-bold">{data.ndviVegetationAnalysis.vegetationChange}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">Urban Expansion</p>
                        <p className="text-sm font-mono text-white font-bold">{data.ndviVegetationAnalysis.urbanChange}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">Intensity</p>
                        <p className="text-sm font-mono text-white font-bold">{data.ndviVegetationAnalysis.changeIntensity}</p>
                      </div>
                   </div>
                </div>
              )}

              {/* AI Insights Section */}
              {data.terraMindInsights?.insights && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 text-purple-400">
                    <Zap size={16} />
                    <h3 className="text-xs font-bold uppercase">TerraMind AI synthesis</h3>
                  </div>
                  <div className="space-y-2">
                    {data.terraMindInsights.insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-purple-500/5 p-3 rounded border border-purple-500/20">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <p className="text-[11px] text-slate-300 leading-tight">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Attribution - Part of Print */}
              <div className="border-t border-slate-800 pt-6 flex justify-between items-end text-[9px] text-slate-500 font-mono">
                <div>
                  <p>COORDINATES: {data.modules?.satellite?.coordinates || 'LOCKED'}</p>
                  <p>SOURCES: {data.sources?.join(', ') || 'Global Intelligence Network'}</p>
                </div>
                <div className="text-right uppercase">
                  <p className="text-sky-500 font-bold tracking-widest">JATAYUX ENCRYPTION ACTIVE</p>
                  <p>© 2025 Orbital Defense Systems</p>
                </div>
              </div>
            </div>
            {/* --- END OF THE PRINTABLE CONTENT --- */}

            <button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download size={20} />}
              {isGenerating ? "Synthesizing PDF Document..." : "Download Full Intelligence brief"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};