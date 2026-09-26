import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle } from 'lucide-react';

interface TimeSliderControlProps {
  timeOffsets: string[];
  currentTimeOffset: string;
  onChangeTimeOffset: (offset: string) => void;
  landfallTarget: string;
}

export const TimeSliderControl: React.FC<TimeSliderControlProps> = ({
  timeOffsets,
  currentTimeOffset,
  onChangeTimeOffset,
  landfallTarget,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = timeOffsets.indexOf(currentTimeOffset);
        const nextIndex = (currentIndex + 1) % timeOffsets.length;
        onChangeTimeOffset(timeOffsets[nextIndex]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTimeOffset, timeOffsets, onChangeTimeOffset]);

  const currentIndex = timeOffsets.indexOf(currentTimeOffset);

  const phaseDescriptors: Record<string, { label: string; action: string; color: string }> = {
    'T-72h': { label: 'Pre-Landfall Watch', action: 'Parametric contract activation & staging reserves', color: 'text-[#0284c7]' },
    'T-48h': { label: 'Cyclone Alert', action: 'Vulnerable barrier inspection & NDRF mobilizations', color: 'text-[#0f766e]' },
    'T-24h': { label: 'Mandatory Evacuation', action: 'Mass relocation of coastal populations to elevated cyclone shelters', color: 'text-[#d97706]' },
    'T-12h': { label: 'Facility Lockdown', action: 'Port shutdown, electrical grid isolation, sandbag barrier seal', color: 'text-[#dc2626]' },
    'T-0h': { label: 'Landfall Peak Surge', action: 'Catastrophic wave overtopping, emergency lifeline triage', color: 'text-[#dc2626]' },
    'T+24h': { label: 'Rapid Recovery', action: 'Automated parametric liquidity release & access route clearance', color: 'text-[#059669]' },
  };

  const currentPhase = phaseDescriptors[currentTimeOffset] || phaseDescriptors['T-12h'];

  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#f1f5f9] border border-[#cbd5e1] text-[#0f766e]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f172a] font-['Manrope']">
                Anticipatory Action Timeline
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                currentTimeOffset === 'T-0h' || currentTimeOffset === 'T-12h'
                  ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
                  : 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20'
              }`}>
                {currentTimeOffset} · {currentPhase.label}
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5 font-['Geist']">
              Recommended Protocol: <strong className="text-[#0f172a]">{currentPhase.action}</strong>
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-[#64748b] flex items-center gap-2 bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
          <span>Target Sector: <strong className="text-[#0f172a]">{landfallTarget}</strong></span>
        </div>
      </div>

      {/* Scrub Rail */}
      <div className="relative my-6 px-3">
        {/* Track Line */}
        <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0f766e] via-[#0284c7] to-[#dc2626] transition-all duration-300"
            style={{ width: `${(currentIndex / (timeOffsets.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {timeOffsets.map((offset, idx) => {
            const isActive = offset === currentTimeOffset;
            const isPassed = idx <= currentIndex;
            const isLandfall = offset === 'T-0h';

            return (
              <button
                key={offset}
                onClick={() => {
                  setIsPlaying(false);
                  onChangeTimeOffset(offset);
                }}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isLandfall
                      ? isActive
                        ? 'bg-[#dc2626] border-white ring-4 ring-[#dc2626]/20 scale-125'
                        : 'bg-[#ffffff] border-[#dc2626]'
                      : isActive
                      ? 'bg-[#0f766e] border-white ring-4 ring-[#0f766e]/20 scale-125 shadow-sm'
                      : isPassed
                      ? 'bg-[#ffffff] border-[#0f766e]'
                      : 'bg-[#f1f5f9] border-[#cbd5e1]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-white'
                        : isPassed
                        ? isLandfall
                          ? 'bg-[#dc2626]'
                          : 'bg-[#0f766e]'
                        : 'bg-[#94a3b8]'
                    }`}
                  />
                </div>

                <span
                  className={`mt-2 font-mono text-[11px] font-semibold transition-colors ${
                    isActive
                      ? isLandfall
                        ? 'text-[#dc2626] font-bold'
                        : 'text-[#0f766e] font-bold'
                      : isPassed
                      ? 'text-[#0f172a]'
                      : 'text-[#94a3b8]'
                  }`}
                >
                  {offset}
                </span>

                <span className="text-[9px] font-mono text-[#64748b] hidden sm:block uppercase">
                  {phaseDescriptors[offset]?.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Buttons & Progress */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/30'
                : 'bg-[#0f766e] text-white hover:bg-[#0d655e]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Progression</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Storm Motion</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onChangeTimeOffset(timeOffsets[0]);
            }}
            className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] border border-[#cbd5e1] transition-all cursor-pointer"
            title="Reset to T-72h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#64748b]">
          Sim Step: <strong className="text-[#0f172a]">{currentIndex + 1}</strong> of {timeOffsets.length}
        </div>
      </div>
    </div>
  );
};
