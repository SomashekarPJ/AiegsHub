import React, { useState } from 'react';
import { InspectionAsset, AIVulnerabilityResult } from '../types';
import { SAMPLE_INSPECTION_ASSETS } from '../data/stormScenarios';
import { 
  Eye, 
  Upload, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert,
  Loader2,
  FileSearch,
  Activity
} from 'lucide-react';

export const MultimodalInspector: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<InspectionAsset>(SAMPLE_INSPECTION_ASSETS[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customMimeType, setCustomMimeType] = useState<string>('image/jpeg');
  const [promptInput, setPromptInput] = useState<string>(
    'Perform a comprehensive hydro-structural vulnerability inspection. Identify breaches, estimate flood depth, evaluate critical infrastructure exposure, and recommend immediate engineering mitigation.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIVulnerabilityResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setCustomImageBase64(evt.target.result as string);
        setAnalysisResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunInspection = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let imageBase64ToSend = '';
      if (customImageBase64) {
        imageBase64ToSend = customImageBase64;
      } else {
        const resp = await fetch(selectedAsset.imageUrl);
        const blob = await resp.blob();
        imageBase64ToSend = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/ai/analyze-vulnerability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64ToSend,
          mimeType: customImageBase64 ? customMimeType : 'image/jpeg',
          prompt: promptInput,
          locationContext: selectedAsset.location,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || 'Server returned error during AI analysis.');
      }

      const data: AIVulnerabilityResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('AI Inspection Error:', err);
      setErrorMessage(err.message || 'Failed to inspect imagery with Gemini 3.8 Flash.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeImageSrc = customImageBase64 || selectedAsset.imageUrl;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#0f766e]/10 border border-[#0f766e]/20 text-[#0f766e]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] font-['Manrope']">
                  Multimodal AI Vulnerability Radar
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20 px-2.5 py-0.5 rounded-full font-bold">
                  Gemini 3.8 Flash Vision
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Analyze SAR satellite radar backscatter, aerial drone embankment photos, and emergency hospital shelters for breach points and inundation pathways.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Feed selection & Image viewport */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Imagery Feed Selection */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 space-y-3 shadow-xs">
            <span className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider block">
              01. Select Telemetry / Imagery Source
            </span>

            <div className="space-y-2">
              {SAMPLE_INSPECTION_ASSETS.map((asset) => {
                const isSelected = !customImageBase64 && selectedAsset.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setCustomImageBase64(null);
                      setSelectedAsset(asset);
                      setAnalysisResult(null);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f0fdf4] border-[#0f766e] text-[#0f172a] shadow-xs'
                        : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-14 h-10 object-cover rounded-lg border border-[#cbd5e1] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate text-[#0f172a]">
                        {asset.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748b] truncate mt-0.5">
                        {asset.location}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Drone/SAR Upload */}
            <div className="pt-2 border-t border-[#e2e8f0]">
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] hover:border-[#0f766e] text-xs font-mono text-[#64748b] hover:text-[#0f766e] transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-[#0f766e]" />
                <span>Upload Drone or Field Camera Asset</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Active Image Viewport */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#cbd5e1] bg-[#0f172a]">
              <img
                src={activeImageSrc}
                alt="Active Target Asset"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#cbd5e1] text-[10px] font-mono text-[#0f766e] font-bold">
                {customImageBase64 ? 'CUSTOM USER ASSET' : selectedAsset.type}
              </div>
            </div>

            <div className="text-xs text-[#64748b] font-mono px-1">
              <span className="text-[#94a3b8] block uppercase text-[9px]">Location Target:</span>
              <span className="text-[#0f172a] font-semibold">
                {customImageBase64 ? 'User Submitted Geographic Area' : selectedAsset.location}
              </span>
            </div>
          </div>

          {/* Prompt Tuning & Trigger */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 space-y-3 shadow-xs">
            <span className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider block">
              02. Inspection Focus Prompt
            </span>

            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#0f766e] rounded-xl p-3 text-xs text-[#0f172a] font-mono focus:outline-none transition-all shadow-xs"
            />

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  setPromptInput(
                    'Evaluate earthen embankment erosion rate, breach potential, and geotextile failure points under 4m surge.'
                  )
                }
                className="text-[10px] font-mono bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] px-2.5 py-1 rounded-md border border-[#cbd5e1] transition-all cursor-pointer"
              >
                Embankment Failure
              </button>
              <button
                onClick={() =>
                  setPromptInput(
                    'Identify flooded roads, blocked evacuation routes, and water depth around emergency hospital generators.'
                  )
                }
                className="text-[10px] font-mono bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] px-2.5 py-1 rounded-md border border-[#cbd5e1] transition-all cursor-pointer"
              >
                Lifeline Isolation
              </button>
            </div>

            <button
              onClick={handleRunInspection}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white font-bold font-mono text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini Multimodal Reasoning in Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Execute Gemini 3.8 Flash Vision Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 7 Cols: AI Reasoning Results */}
        <div className="lg:col-span-7 space-y-4">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/30 text-[#dc2626] text-xs font-mono flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!analysisResult && !isLoading && !errorMessage && (
            <div className="h-full min-h-[460px] bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <div className="p-4 rounded-full bg-[#f8fafc] text-[#0f766e] border border-[#cbd5e1]">
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a] font-['Manrope']">
                Awaiting Inspection Telemetry
              </h3>
              <p className="text-xs text-[#64748b] max-w-md">
                Select an image source on the left and click <strong>"Execute Gemini 3.8 Flash Vision Inspection"</strong> to run multimodal damage vector and hydro-structural failure reasoning.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[460px] bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#0f766e]/20 border-t-[#0f766e] animate-spin"></div>
                <Activity className="w-5 h-5 text-[#0f766e] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] font-mono">
                  Synthesizing Radar & Drone Imagery
                </h3>
                <p className="text-xs text-[#64748b] max-w-md mt-1">
                  Gemini 3.8 Flash is calculating inundation depth vectors, structural breach thresholds, and priority evacuation countermeasures.
                </p>
              </div>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Scorecard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#64748b] block">
                    Calculated Vulnerability Risk
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-mono font-bold text-[#dc2626]">
                      {analysisResult.severityScore}<span className="text-[#94a3b8] text-sm">/100</span>
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-wide ${
                      analysisResult.riskLevel === 'Critical'
                        ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
                        : analysisResult.riskLevel === 'High'
                        ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20'
                        : 'bg-[#059669]/10 text-[#059669] border-[#059669]/20'
                    }`}>
                      {analysisResult.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t sm:border-t-0 sm:border-l border-[#e2e8f0] pt-3 sm:pt-0 sm:pl-4">
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block">Est. Inundation Depth</span>
                    <span className="font-semibold text-[#0f172a]">{analysisResult.estimatedInundationDepth}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block">Population Exposed</span>
                    <span className="font-semibold text-[#0f172a]">{analysisResult.populationAtRisk}</span>
                  </div>
                </div>
              </div>

              {/* Summary Block */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span>Multimodal Inspection Findings</span>
                </h4>
                <p className="text-xs text-[#334155] leading-relaxed bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Key Breach Points & Failure Mechanisms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
                  <h5 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">
                    Key Vulnerabilities Identified
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {analysisResult.keyVulnerabilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#d97706] font-mono mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
                  <h5 className="text-xs font-mono font-bold uppercase text-[#dc2626] tracking-wider">
                    Active Failure Mechanisms
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {analysisResult.failureMechanisms.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#dc2626] font-mono mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Engineering Countermeasures */}
              <div className="bg-[#059669]/5 p-4 rounded-xl border border-[#059669]/20 space-y-2">
                <h5 className="text-xs font-mono font-bold uppercase text-[#059669] tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Immediate Engineering Countermeasures</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-[#0f172a]">
                  {analysisResult.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#059669] font-bold font-mono">{idx + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
