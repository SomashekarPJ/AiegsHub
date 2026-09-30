import React, { useState } from 'react';
import { StormScenario, InfrastructureItem } from '../types';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  X, 
  Printer, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  Code
} from 'lucide-react';

interface SituationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: StormScenario;
  currentTimeOffset: string;
  infrastructure: InfrastructureItem[];
}

export const SituationReportModal: React.FC<SituationReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  currentTimeOffset,
  infrastructure,
}) => {
  const [activeMode, setActiveMode] = useState<'sitrep' | 'cap_xml'>('sitrep');
  const [isLoading, setIsLoading] = useState(false);
  const [sitrepContent, setSitrepContent] = useState<string | null>(null);
  const [capXmlContent, setCapXmlContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalExposedUSD = infrastructure.reduce((acc, item) => acc + item.replacementCostUSD, 0);
  const impactedAssets = infrastructure.filter((item) => item.status !== 'Operational');

  const handleGenerateSITREP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-sitrep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          timeOffset: currentTimeOffset,
          impactedAssets,
          totalExposedUSD,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate SITREP report.');
      const data = await res.json();
      setSitrepContent(data.sitrepText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCAP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-cap-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          timeOffset: currentTimeOffset,
          targetArea: scenario.landfallTarget,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate CAP XML.');
      const data = await res.json();
      setCapXmlContent(data.capXml);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = activeMode === 'sitrep' ? sitrepContent : capXmlContent;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeMode === 'sitrep' ? sitrepContent : capXmlContent;
    if (!content) return;
    const ext = activeMode === 'sitrep' ? 'md' : 'xml';
    const mime = activeMode === 'sitrep' ? 'text/markdown' : 'application/xml';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEGISBAY-SITREP-${scenario.id}-${currentTimeOffset}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0f766e]/10 border border-[#0f766e]/20 text-[#0f766e]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0f172a] font-['Manrope']">
                  Official Situation Assessment & Alerting Payload
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 font-bold uppercase">
                  UN OCHA & OASIS CAP Standard
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Generate high-fidelity briefing dossiers for state emergency operation centres and standard CAP-XML for emergency cellular broadcasts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#e2e8f0] bg-white">
          <div className="flex items-center gap-2 bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0]">
            <button
              onClick={() => setActiveMode('sitrep')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeMode === 'sitrep'
                  ? 'bg-white text-[#0f766e] border border-[#cbd5e1] font-bold shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>State SITREP Dossier</span>
            </button>
            <button
              onClick={() => setActiveMode('cap_xml')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeMode === 'cap_xml'
                  ? 'bg-white text-[#0284c7] border border-[#cbd5e1] font-bold shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>OASIS CAP-XML Broadcast</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(activeMode === 'sitrep' ? sitrepContent : capXmlContent) ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-mono border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-mono border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {activeMode === 'sitrep' ? 'MD' : 'XML'}</span>
                </button>

                {activeMode === 'sitrep' && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-mono border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Dossier</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={activeMode === 'sitrep' ? handleGenerateSITREP : handleGenerateCAP}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white font-bold font-mono text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Intelligence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {activeMode === 'sitrep' ? 'SITREP #04 Dossier' : 'OASIS CAP Payload'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
          {isLoading && (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#0f766e]/20 border-t-[#0f766e] animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-[#0f172a] font-mono">
                  Synthesizing Mission-Critical Intelligence
                </h4>
                <p className="text-xs text-[#64748b] max-w-md mt-1">
                  Gemini Flash is calculating exposed asset valuations, tidal hydrographs, and inter-agency action matrices.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !sitrepContent && !capXmlContent && (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-white p-8 rounded-xl border border-[#e2e8f0]">
              <div className="p-3 rounded-full bg-[#f1f5f9] text-[#0f766e]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-[#0f172a] font-['Manrope']">
                Ready to Compile Government Situation Report
              </h4>
              <p className="text-xs text-[#64748b] max-w-lg">
                Click <strong>"Generate SITREP #04 Dossier"</strong> above to aggregate active trajectory physics, {impactedAssets.length} high-risk infrastructure nodes, and population shelter quotas into an official briefing document.
              </p>
            </div>
          )}

          {!isLoading && activeMode === 'sitrep' && sitrepContent && (
            <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] font-mono text-xs leading-relaxed text-[#0f172a] whitespace-pre-wrap shadow-xs">
              {sitrepContent}
            </div>
          )}

          {!isLoading && activeMode === 'cap_xml' && capXmlContent && (
            <div className="bg-[#0f172a] p-6 rounded-xl border border-[#334155] font-mono text-xs leading-relaxed text-[#00e5be] whitespace-pre-wrap shadow-inner overflow-x-auto">
              {capXmlContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
