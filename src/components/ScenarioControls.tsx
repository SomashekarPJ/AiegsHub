import React, { useState } from 'react';
import { StormScenario } from '../types';
import { SlidersHorizontal, Check, X, Wind, Waves, Gauge, Droplets } from 'lucide-react';

interface ScenarioControlsProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: StormScenario;
  onApplyCustomPhysics: (updatedScenario: StormScenario) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onApplyCustomPhysics,
}) => {
  const [windSpeed, setWindSpeed] = useState(activeScenario.maxWindSpeed);
  const [surgeHeight, setSurgeHeight] = useState(activeScenario.peakSurgeHeight);
  const [centralPressure, setCentralPressure] = useState(activeScenario.centralPressure);
  const [rainfallRate, setRainfallRate] = useState(activeScenario.rainfallRate);

  React.useEffect(() => {
    if (activeScenario) {
      setWindSpeed(activeScenario.maxWindSpeed);
      setSurgeHeight(activeScenario.peakSurgeHeight);
      setCentralPressure(activeScenario.centralPressure);
      setRainfallRate(activeScenario.rainfallRate);
    }
  }, [activeScenario, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: StormScenario = {
      ...activeScenario,
      maxWindSpeed: windSpeed,
      peakSurgeHeight: surgeHeight,
      centralPressure: centralPressure,
      rainfallRate: rainfallRate,
      trajectoryPoints: activeScenario.trajectoryPoints.map((pt) => ({
        ...pt,
        windSpeed: Math.round(windSpeed * (pt.windSpeed / activeScenario.maxWindSpeed)),
        surgeHeight: Number((surgeHeight * (pt.surgeHeight / activeScenario.peakSurgeHeight)).toFixed(1)),
        pressure: Math.round(centralPressure + (1000 - centralPressure) * (1 - pt.windSpeed / activeScenario.maxWindSpeed)),
      })),
    };
    onApplyCustomPhysics(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2 font-bold text-[#0f172a] font-['Manrope']">
            <SlidersHorizontal className="w-5 h-5 text-[#0f766e]" />
            <span>Calibrate Cyclone Hydro-Meteorological Physics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {/* Wind Speed */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] uppercase text-[10px] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#0f766e]" />
                <span>Maximum Sustained Wind Speed</span>
              </span>
              <span className="text-[#0f766e] font-bold text-sm">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="60"
              max="280"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-[#0f766e] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#94a3b8]">
              <span>60 km/h (Cat 1)</span>
              <span>180 km/h (Cat 4)</span>
              <span>280 km/h (Cat 5+)</span>
            </div>
          </div>

          {/* Surge Depth */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] uppercase text-[10px] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#dc2626]" />
                <span>Peak Storm Surge Inundation</span>
              </span>
              <span className="text-[#dc2626] font-bold text-sm">{surgeHeight} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.5"
              step="0.1"
              value={surgeHeight}
              onChange={(e) => setSurgeHeight(Number(e.target.value))}
              className="w-full accent-[#dc2626] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#94a3b8]">
              <span>0.5 m (Nominal)</span>
              <span>3.5 m (Critical)</span>
              <span>6.5 m (Extreme Catastrophe)</span>
            </div>
          </div>

          {/* Central Pressure */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] uppercase text-[10px] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Minimum Central Pressure</span>
              </span>
              <span className="text-[#0284c7] font-bold text-sm">{centralPressure} hPa</span>
            </div>
            <input
              type="range"
              min="900"
              max="1000"
              value={centralPressure}
              onChange={(e) => setCentralPressure(Number(e.target.value))}
              className="w-full accent-[#0284c7] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#94a3b8]">
              <span>900 hPa (Deep Eye)</span>
              <span>1000 hPa (Tropical Low)</span>
            </div>
          </div>

          {/* 24h Rain */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] uppercase text-[10px] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#0f766e]" />
                <span>24-Hour Rainfall Accumulation</span>
              </span>
              <span className="text-[#0f766e] font-bold text-sm">{rainfallRate} mm</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="10"
              value={rainfallRate}
              onChange={(e) => setRainfallRate(Number(e.target.value))}
              className="w-full accent-[#0f766e] cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] text-xs font-mono font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white text-xs font-mono font-bold shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
