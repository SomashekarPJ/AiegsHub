import React, { useEffect, useState } from 'react';
import { Radio, Waves, Wind, Gauge, Satellite } from 'lucide-react';

export const TelemetryTicker: React.FC = () => {
  const [telemetry, setTelemetry] = useState({
    buoySST: 29.8,
    buoyWaveHeight: 4.4,
    radarReflectivity: 53.2,
    tideGaugeOffset: 1.88,
    baroTrend: '-1.8 hPa/hr',
    sentinelPass: 'ONLINE (T-14m)',
  });

  // Simulated live sensor stream fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        buoySST: Number((29.8 + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        buoyWaveHeight: Number((4.4 + (Math.random() * 0.3 - 0.15)).toFixed(1)),
        radarReflectivity: Number((53.2 + (Math.random() * 0.5 - 0.25)).toFixed(1)),
        tideGaugeOffset: Number((1.88 + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        baroTrend: `${(-1.8 + (Math.random() * 0.2 - 0.1)).toFixed(1)} hPa/hr`,
        sentinelPass: 'ONLINE (ACTIVE)',
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#ffffff] border-b border-[#e2e8f0] px-4 py-2 font-mono text-xs overflow-x-auto no-scrollbar shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap">
        {/* Stream Status Kicker */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">
            Live Sensor Telemetry
          </span>
          <span className="text-[#cbd5e1]">/</span>
          <span className="text-[10px] text-[#64748b]">INCOIS & BMD REAL-TIME BUS</span>
        </div>

        {/* Telemetry Stream Units */}
        <div className="flex items-center gap-6 text-[11px] text-[#334155]">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-[#0f766e]" />
            <span className="text-[#64748b] uppercase text-[10px]">INCOIS BD-08 BUOY:</span>
            <span className="font-semibold text-[#0f172a]">SST {telemetry.buoySST}°C</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="text-[#0284c7] font-semibold">{telemetry.buoyWaveHeight}m SWH</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#d97706]" />
            <span className="text-[#64748b] uppercase text-[10px]">PARADEEP DOPPLER:</span>
            <span className="font-semibold text-[#d97706]">{telemetry.radarReflectivity} dBZ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#dc2626]" />
            <span className="text-[#64748b] uppercase text-[10px]">TIDE GAUGE 04:</span>
            <span className="font-semibold text-[#dc2626]">+{telemetry.tideGaugeOffset}m MLLW</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="text-[#64748b] uppercase text-[10px]">BAROMETRIC TENDENCY:</span>
            <span className="font-semibold text-[#0f172a]">{telemetry.baroTrend}</span>
          </div>
        </div>

        {/* Satellite Indicator */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Satellite className="w-3.5 h-3.5 text-[#0f766e]" />
          <span className="text-[10px] text-[#64748b] uppercase">GEE Sentinel-1 SAR:</span>
          <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-1.5 py-0.5 rounded-full border border-[#059669]/20">
            {telemetry.sentinelPass}
          </span>
        </div>
      </div>
    </div>
  );
};
