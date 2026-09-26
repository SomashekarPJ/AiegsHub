import React, { useState } from 'react';
import { StormScenario } from '../types';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Radio, 
  Download
} from 'lucide-react';

interface EarlyWarningAdvisoryProps {
  scenario: StormScenario;
}

export const EarlyWarningAdvisory: React.FC<EarlyWarningAdvisoryProps> = ({
  scenario,
}) => {
  const [authority, setAuthority] = useState('Odisha State Disaster Management Authority (OSDMA) & NDRF');
  const [language, setLanguage] = useState('English');
  const [timeframe, setTimeframe] = useState(scenario.timeToLandfall || 'T-18 Hours');

  const [isGenerating, setIsGenerating] = useState(false);
  const [advisoryOutput, setAdvisoryOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAdvisory = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authority,
          cycloneName: scenario.name,
          windSpeed: `${scenario.maxWindSpeed} km/h`,
          surgeHeight: `${scenario.peakSurgeHeight}m`,
          location: scenario.landfallTarget,
          timeframe,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate advisory dispatch.');
      const data = await res.json();
      setAdvisoryOutput(data.dispatchText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!advisoryOutput) return;
    navigator.clipboard.writeText(advisoryOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!advisoryOutput) return;
    const element = document.createElement('a');
    const file = new Blob([advisoryOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Advisory-${scenario.id}-${timeframe.replace(/\s+/g, '')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/20 text-[#059669]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] font-['Manrope']">
                  Early-Warning Advisory Dispatch Engine
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 px-2.5 py-0.5 rounded-full font-bold">
                  Multi-Agency / Multilingual
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Generate localized, actionable emergency dispatches for municipal authorities, disaster response forces, and multilingual public radio/SMS broadcasts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 cols) */}
        <div className="lg:col-span-4 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider block">
            Advisory Parameters
          </span>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[#64748b] text-[10px] uppercase block mb-1">
                Target Administrative Authority
              </label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 shadow-xs"
              >
                <option value="Odisha State Disaster Management Authority (OSDMA) & NDRF">
                  Odisha State Disaster Mgmt (OSDMA / NDRF)
                </option>
                <option value="Andhra Pradesh State Disaster Management Authority (APDMA)">
                  Andhra Pradesh Disaster Mgmt (APDMA)
                </option>
                <option value="Bangladesh Cyclone Preparedness Programme (CPP) & District Administration">
                  Bangladesh Cyclone Preparedness Programme (CPP)
                </option>
                <option value="West Bengal Disaster Management Department & Collectorates">
                  West Bengal Disaster Mgmt & Collectorates
                </option>
              </select>
            </div>

            <div>
              <label className="text-[#64748b] text-[10px] uppercase block mb-1">
                Output Language / Script
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 shadow-xs"
              >
                <option value="English">English (Official Multi-Agency Format)</option>
                <option value="Bengali">Bengali (বাংলা - Sundarbans & Bangladesh Delta)</option>
                <option value="Odia">Odia (ଓଡ଼ିଆ - Odisha Coastal Belt)</option>
                <option value="Telugu">Telugu (తెలుగు - Andhra Pradesh Coast)</option>
              </select>
            </div>

            <div>
              <label className="text-[#64748b] text-[10px] uppercase block mb-1">
                Landfall Time Window
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 shadow-xs"
              >
                <option value="T-48 Hours">T-48 Hours (Preparatory Staging)</option>
                <option value="T-24 Hours">T-24 Hours (Mandatory Evacuation Directive)</option>
                <option value="T-12 Hours">T-12 Hours (Shelter Lockdown & Final Alert)</option>
                <option value="T-0 Hours">T-0 Hours (Landfall Peak Surge Impact)</option>
              </select>
            </div>

            <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0] space-y-1.5 text-[11px]">
              <span className="text-[9px] text-[#64748b] uppercase block font-bold">Active Storm Physics</span>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Cyclone:</span>
                <span className="font-bold text-[#0f172a]">{scenario.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Max Sustained Wind:</span>
                <span className="font-bold text-[#0f172a]">{scenario.maxWindSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Surge Inundation:</span>
                <span className="font-bold text-[#dc2626]">{scenario.peakSurgeHeight}m</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateAdvisory}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white font-bold font-mono text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Official Advisory Dispatch...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Generate Official Early Warning Advisory</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!advisoryOutput && !isGenerating && (
            <div className="h-full min-h-[460px] bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <div className="p-4 rounded-full bg-[#f8fafc] text-[#059669] border border-[#cbd5e1]">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a] font-['Manrope']">
                Ready to Draft Advisory Dispatch
              </h3>
              <p className="text-xs text-[#64748b] max-w-md">
                Configure administrative target and language on the left and click <strong>"Generate Official Early Warning Advisory"</strong> to compose actionable instructions.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[460px] bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-full border-2 border-[#0f766e]/20 border-t-[#0f766e] animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] font-mono">
                  Synthesizing Hydro-Meteorological Emergency Dispatch
                </h3>
                <p className="text-xs text-[#64748b] max-w-md mt-1">
                  Gemini 3.8 Flash is drafting zone-by-zone evacuation directives, infrastructure orders, and public broadcast texts.
                </p>
              </div>
            </div>
          )}

          {advisoryOutput && !isGenerating && (
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#059669]">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>OFFICIAL DISASTER MANAGEMENT ADVISORY DISPATCH</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-mono transition-all border border-[#cbd5e1] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-mono transition-all border border-[#cbd5e1] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Formatted Advisory Content */}
              <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0] font-mono text-xs leading-relaxed text-[#0f172a] whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {advisoryOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
