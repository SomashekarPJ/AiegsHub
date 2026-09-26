import React from 'react';
import { StormScenario } from '../types';
import { 
  ShieldAlert, 
  Map, 
  Eye, 
  Zap, 
  FileText, 
  Layers, 
  SlidersHorizontal,
  Radio,
  ChevronDown,
  FileCheck2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'inspection' | 'parametric' | 'advisory' | 'matrix';
  setActiveTab: (tab: 'map' | 'inspection' | 'parametric' | 'advisory' | 'matrix') => void;
  scenarios: StormScenario[];
  selectedScenario: StormScenario;
  onSelectScenario: (scenario: StormScenario) => void;
  onOpenCustomPhysics: () => void;
  onOpenSitrepModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  scenarios,
  selectedScenario,
  onSelectScenario,
  onOpenCustomPhysics,
  onOpenSitrepModal,
}) => {
  const tabs = [
    { id: 'map', label: 'Tactical GIS & Hydrograph', icon: Map, color: 'text-[#0f766e]' },
    { id: 'inspection', label: 'Multimodal AI Radar', icon: Eye, color: 'text-[#0284c7]' },
    { id: 'parametric', label: 'Parametric Liquidity', icon: Zap, color: 'text-[#d97706]' },
    { id: 'advisory', label: 'Early-Warning Dispatches', icon: FileText, color: 'text-[#059669]' },
    { id: 'matrix', label: 'Infrastructure Stress', icon: Layers, color: 'text-[#334155]' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#e2e8f0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('map')}>
              <div className="relative w-9 h-9 rounded-lg bg-[#f0fdf4] border border-[#0f766e]/30 flex items-center justify-center group-hover:border-[#0f766e] transition-all shadow-xs">
                <ShieldAlert className="w-5 h-5 text-[#0f766e]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#059669] ring-2 ring-white animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-[#0f172a] font-['Manrope'] leading-none">
                    AEGISBAY
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20 font-bold">
                    APAC PRO
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#64748b] block mt-1">
                  Anticipatory Coastal Intelligence
                </span>
              </div>
            </div>

            {/* Live Scenario Status Ticker (Desktop) */}
            <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-[#dc2626] animate-pulse" />
              <span className="text-[#0f172a] font-semibold">{selectedScenario.name}</span>
              <span className="text-[#94a3b8]">/</span>
              <span className="text-[#0f766e] font-bold">{selectedScenario.timeToLandfall}</span>
              <span className="text-[#94a3b8]">/</span>
              <span className="text-[#64748b]">{selectedScenario.maxWindSpeed} km/h</span>
            </div>
          </div>

          {/* Center: Precision Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ffffff] text-[#0f172a] border border-[#cbd5e1] font-semibold shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#ffffff]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-[#64748b]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions & Scenarios */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Situation Report / CAP Broadcast Trigger Button */}
            <button
              onClick={onOpenSitrepModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
              title="Generate Official SITREP & CAP-XML Alert"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#0f766e]" />
              <span className="hidden sm:inline">SITREP / CAP Alert</span>
            </button>

            {/* Scenario Picker */}
            <div className="relative">
              <select
                value={selectedScenario.id}
                onChange={(e) => {
                  const s = scenarios.find((item) => item.id === e.target.value);
                  if (s) onSelectScenario(s);
                }}
                className="bg-[#ffffff] hover:bg-[#f8fafc] border border-[#cbd5e1] hover:border-[#0f766e] text-[#0f172a] text-xs rounded-lg px-3 py-2 pr-8 font-mono appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 transition-all cursor-pointer shadow-xs"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#ffffff] text-[#0f172a]">
                    {s.name} ({s.category.split(' ')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748b]" />
            </div>

            {/* Custom Physics Calibration Trigger */}
            <button
              onClick={onOpenCustomPhysics}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold rounded-lg bg-[#0f766e] hover:bg-[#0d655e] text-white transition-all shadow-sm cursor-pointer"
              title="Calibrate Storm Inundation & Wind Physics"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Physics</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-between gap-1 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 text-[11px] font-mono text-center rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#ffffff] text-[#0f766e] border border-[#cbd5e1] font-bold shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {tab.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
