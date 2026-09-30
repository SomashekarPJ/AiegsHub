import React, { useState } from 'react';
import { StormScenario } from '../types';
import { Activity, Waves, Wind, Gauge, AlertTriangle, Info } from 'lucide-react';

interface HydrographDashboardProps {
  scenario: StormScenario;
  currentTimeOffset: string;
  onChangeTimeOffset: (offset: string) => void;
}

export const HydrographDashboard: React.FC<HydrographDashboardProps> = ({
  scenario,
  currentTimeOffset,
  onChangeTimeOffset,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Generate 12-step realistic astronomical tide + meteorological surge time-series
  const points = scenario?.trajectoryPoints || [];
  const peakSurge = Number(scenario?.peakSurgeHeight) || 3.5;
  const maxWind = Number(scenario?.maxWindSpeed) || 180;
  const centralPressure = Number(scenario?.centralPressure) || 940;

  // Build high-resolution simulated curve points (24 hours timeline interpolation)
  const timeSteps = [
    { label: 'T-72h', t: 0, tide: 0.8, surgeFactor: 0.15, windFactor: 0.45, pressOffset: 80 },
    { label: 'T-60h', t: 1, tide: 1.4, surgeFactor: 0.22, windFactor: 0.52, pressOffset: 70 },
    { label: 'T-48h', t: 2, tide: 0.6, surgeFactor: 0.35, windFactor: 0.62, pressOffset: 55 },
    { label: 'T-36h', t: 3, tide: 1.5, surgeFactor: 0.48, windFactor: 0.74, pressOffset: 40 },
    { label: 'T-24h', t: 4, tide: 0.9, surgeFactor: 0.68, windFactor: 0.85, pressOffset: 25 },
    { label: 'T-18h', t: 5, tide: 1.6, surgeFactor: 0.82, windFactor: 0.92, pressOffset: 15 },
    { label: 'T-12h', t: 6, tide: 1.2, surgeFactor: 0.91, windFactor: 0.96, pressOffset: 8 },
    { label: 'T-6h', t: 7, tide: 1.7, surgeFactor: 0.97, windFactor: 0.99, pressOffset: 3 },
    { label: 'T-0h', t: 8, tide: 1.8, surgeFactor: 1.0, windFactor: 1.0, pressOffset: 0 },
    { label: 'T+6h', t: 9, tide: 0.7, surgeFactor: 0.72, windFactor: 0.78, pressOffset: 18 },
    { label: 'T+12h', t: 10, tide: 1.4, surgeFactor: 0.45, windFactor: 0.60, pressOffset: 38 },
    { label: 'T+24h', t: 11, tide: 0.8, surgeFactor: 0.20, windFactor: 0.40, pressOffset: 65 },
  ].map((step) => {
    const astroTide = Number(step.tide.toFixed(2));
    const windSurge = Number((peakSurge * step.surgeFactor).toFixed(2));
    const totalWaterLevel = Number((astroTide + windSurge).toFixed(2));
    const wind = Math.round(maxWind * step.windFactor);
    const pressure = Math.round(centralPressure + step.pressOffset);

    return {
      ...step,
      astroTide,
      windSurge,
      totalWaterLevel,
      wind,
      pressure,
    };
  });

  const maxWaterLevel = Math.max(...timeSteps.map((d) => d.totalWaterLevel)) + 0.8;
  const criticalThreshold = 3.2; // 3.2m Embankment Top Crest Level

  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (timeSteps.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxWaterLevel) * chartHeight;

  // Build SVG path strings
  const totalWaterPath = timeSteps
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.totalWaterLevel)}`)
    .join(' ');

  const totalWaterArea = `${totalWaterPath} L ${getX(timeSteps.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  const astroTidePath = timeSteps
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.astroTide)}`)
    .join(' ');

  // Active step index
  const activeStepIdx = timeSteps.findIndex((s) => s.label === currentTimeOffset);
  const activeStep = activeStepIdx >= 0 ? timeSteps[activeStepIdx] : timeSteps[6];

  const displayData = hoveredPoint || activeStep;

  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#0f766e]/10 border border-[#0f766e]/20 text-[#0f766e]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0f172a] font-['Manrope']">
                Coastal Surge Hydrograph & Tidal Superposition
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20 font-bold">
                SLOSH / ADCIRC Coupled
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Astronomical High Tide + Non-Linear Wind Surge Set-up vs 3.2m Embankment Crest Threshold.
            </p>
          </div>
        </div>

        {/* Real-time Hover / Active Metric Telemetry HUD */}
        <div className="flex items-center gap-4 bg-[#f8fafc] px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-mono">
          <div>
            <span className="text-[#64748b] text-[9px] uppercase block">Timestamp</span>
            <span className="font-bold text-[#0f172a]">{displayData.label}</span>
          </div>
          <div>
            <span className="text-[#64748b] text-[9px] uppercase block">Total Water Elev</span>
            <span className={`font-bold ${displayData.totalWaterLevel >= criticalThreshold ? 'text-[#dc2626]' : 'text-[#0f766e]'}`}>
              {displayData.totalWaterLevel} m
            </span>
          </div>
          <div>
            <span className="text-[#64748b] text-[9px] uppercase block">Astronomical Tide</span>
            <span className="font-semibold text-[#0284c7]">+{displayData.astroTide} m</span>
          </div>
          <div>
            <span className="text-[#64748b] text-[9px] uppercase block">Wind Surge</span>
            <span className="font-semibold text-[#d97706]">+{displayData.windSurge} m</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Hydrograph */}
      <div className="relative w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 select-none"
        >
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="surgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="breachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1.5, 3.0, 4.5, 6.0].map((val) => {
            if (val > maxWaterLevel) return null;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={getY(val)}
                  x2={svgWidth - paddingRight}
                  y2={getY(val)}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={paddingLeft - 8}
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="Geist"
                  fill="#94a3b8"
                >
                  {val.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Critical Embankment Crest Threshold Line (3.2m) */}
          <line
            x1={paddingLeft}
            y1={getY(criticalThreshold)}
            x2={svgWidth - paddingRight}
            y2={getY(criticalThreshold)}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text
            x={svgWidth - paddingRight - 4}
            y={getY(criticalThreshold) - 5}
            textAnchor="end"
            fontSize="9"
            fontFamily="Geist"
            fontWeight="bold"
            fill="#dc2626"
          >
            CRITICAL BARRIER CREST LEVEL (3.2m ASL)
          </text>

          {/* Shaded Area for Total Surge Level */}
          <path d={totalWaterArea} fill="url(#surgeGradient)" />

          {/* Astronomical Baseline Tide Curve */}
          <path
            d={astroTidePath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="3,3"
          />

          {/* Total Surge Hydrograph Curve */}
          <path
            d={totalWaterPath}
            fill="none"
            stroke="#0f766e"
            strokeWidth="3"
          />

          {/* Vertical Time Step Markers & Hover Interactivity */}
          {timeSteps.map((step, idx) => {
            const x = getX(idx);
            const y = getY(step.totalWaterLevel);
            const isActive = step.label === currentTimeOffset;
            const isBreached = step.totalWaterLevel >= criticalThreshold;

            return (
              <g
                key={step.label}
                className="cursor-pointer group"
                onClick={() => onChangeTimeOffset(step.label)}
                onMouseEnter={() => setHoveredPoint(step)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Active time vertical hairline */}
                {isActive && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={svgHeight - paddingBottom}
                    stroke="#0f766e"
                    strokeWidth="2"
                  />
                )}

                {/* Data point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 4}
                  fill={isBreached ? '#dc2626' : isActive ? '#0f766e' : '#ffffff'}
                  stroke={isBreached ? '#dc2626' : '#0f766e'}
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-transform group-hover:scale-150"
                />

                {/* X-axis time label */}
                <text
                  x={x}
                  y={svgHeight - paddingBottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="Geist Mono"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fill={isActive ? '#0f766e' : '#64748b'}
                >
                  {step.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Insight */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#e2e8f0] text-xs font-mono text-[#64748b]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0f766e]"></span>
            <span>Total Water Level (Tide + Surge)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0284c7] border-b border-dashed"></span>
            <span>Astronomical Tide Only</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#dc2626]"></span>
            <span>Barrier Crest (3.2m)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#0f172a] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
          <Info className="w-3.5 h-3.5 text-[#0f766e]" />
          <span>Peak Surge coincides with astronomical High Tide at <strong>T-0h Landfall (+{scenario.peakSurgeHeight}m)</strong></span>
        </div>
      </div>
    </div>
  );
};
