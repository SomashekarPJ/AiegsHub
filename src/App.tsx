import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TelemetryTicker } from './components/TelemetryTicker';
import { InteractiveMap } from './components/InteractiveMap';
import { TimeSliderControl } from './components/TimeSliderControl';
import { HydrographDashboard } from './components/HydrographDashboard';
import { MultimodalInspector } from './components/MultimodalInspector';
import { ParametricInsurancePanel } from './components/ParametricInsurancePanel';
import { EarlyWarningAdvisory } from './components/EarlyWarningAdvisory';
import { InfrastructureMatrix } from './components/InfrastructureMatrix';
import { ScenarioControls } from './components/ScenarioControls';
import { SituationReportModal } from './components/SituationReportModal';

import { StormScenario, InfrastructureItem } from './types';
import { DEFAULT_STORM_SCENARIOS, DEFAULT_INFRASTRUCTURE } from './data/stormScenarios';

import { X, Send, Zap, Eye } from 'lucide-react';

export default function App() {
  const [scenarios, setScenarios] = useState<StormScenario[]>(DEFAULT_STORM_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<StormScenario>(DEFAULT_STORM_SCENARIOS[0]);
  const [currentTimeOffset, setCurrentTimeOffset] = useState<string>('T-12h');

  const [activeTab, setActiveTab] = useState<'map' | 'inspection' | 'parametric' | 'advisory' | 'matrix'>('map');

  const [infrastructure, setInfrastructure] = useState<InfrastructureItem[]>(DEFAULT_INFRASTRUCTURE);
  const [selectedInfra, setSelectedInfra] = useState<InfrastructureItem | null>(null);

  const [isCustomPhysicsOpen, setIsCustomPhysicsOpen] = useState<boolean>(false);
  const [isSitrepOpen, setIsSitrepOpen] = useState<boolean>(false);

  const timeOffsets = ['T-72h', 'T-48h', 'T-24h', 'T-12h', 'T-0h', 'T+24h'];

  const handleSelectScenario = (scenario: StormScenario) => {
    setSelectedScenario(scenario);
    setCurrentTimeOffset('T-12h');
  };

  const handleApplyCustomPhysics = (updatedScenario: StormScenario) => {
    setSelectedScenario(updatedScenario);
    setScenarios((prev) =>
      prev.map((s) => (s.id === updatedScenario.id ? updatedScenario : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-['Geist'] selection:bg-[#0f766e] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        onOpenCustomPhysics={() => setIsCustomPhysicsOpen(true)}
        onOpenSitrepModal={() => setIsSitrepOpen(true)}
      />

      {/* Real-time Telemetry Sensor Stream */}
      <TelemetryTicker />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* VIEW 1: TACTICAL GIS MAP, TIMELINE COMMAND & HYDROGRAPH */}
        <div className={activeTab === 'map' ? 'space-y-6 animate-fade-in' : 'hidden'}>
          {/* Interactive GIS Map Viewport */}
          <InteractiveMap
            scenario={selectedScenario}
            currentTimeOffset={currentTimeOffset}
            infrastructure={infrastructure}
            onSelectInfrastructure={(item) => setSelectedInfra(item)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            isActive={activeTab === 'map'}
          />

          {/* Anticipatory Action Timeline Slider */}
          <TimeSliderControl
            timeOffsets={timeOffsets}
            currentTimeOffset={currentTimeOffset}
            onChangeTimeOffset={(offset) => setCurrentTimeOffset(offset)}
            landfallTarget={selectedScenario.landfallTarget}
          />

          {/* Tidal Hydrograph & Non-Linear Surge Superposition Curve */}
          <HydrographDashboard
            scenario={selectedScenario}
            currentTimeOffset={currentTimeOffset}
            onChangeTimeOffset={(offset) => setCurrentTimeOffset(offset)}
          />

          {/* Quick Instrumentation Spec Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-2xl font-mono shadow-xs">
              <span className="text-[#64748b] text-[10px] uppercase block tracking-wider">Landfall Sector</span>
              <span className="text-sm font-bold text-[#0f172a] line-clamp-1">{selectedScenario.landfallTarget}</span>
              <span className="text-[10px] text-[#0f766e] font-semibold block mt-1">ETA: {selectedScenario.timeToLandfall}</span>
            </div>

            <div className="bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-2xl font-mono shadow-xs">
              <span className="text-[#64748b] text-[10px] uppercase block tracking-wider">Central Pressure</span>
              <span className="text-sm font-bold text-[#0f172a]">{selectedScenario.centralPressure} hPa</span>
              <span className="text-[10px] text-[#dc2626] font-semibold block mt-1">{selectedScenario.category}</span>
            </div>

            <div className="bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-2xl font-mono shadow-xs">
              <span className="text-[#64748b] text-[10px] uppercase block tracking-wider">Max Sustained Wind</span>
              <span className="text-sm font-bold text-[#0f172a]">{selectedScenario.maxWindSpeed} km/h</span>
              <span className="text-[10px] text-[#d97706] font-semibold block mt-1">Gusts to {Math.round(selectedScenario.maxWindSpeed * 1.25)} km/h</span>
            </div>

            <div className="bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-2xl font-mono shadow-xs">
              <span className="text-[#64748b] text-[10px] uppercase block tracking-wider">Peak Surge Inundation</span>
              <span className="text-sm font-bold text-[#dc2626]">{selectedScenario.peakSurgeHeight} meters</span>
              <span className="text-[10px] text-[#059669] font-semibold block mt-1">Tidal High Offset +1.2m</span>
            </div>
          </div>
        </div>

        {/* VIEW 2: MULTIMODAL AI VULNERABILITY RADAR */}
        {activeTab === 'inspection' && <MultimodalInspector />}

        {/* VIEW 3: PARAMETRIC LIQUIDITY FACILITY */}
        {activeTab === 'parametric' && (
          <ParametricInsurancePanel currentScenario={selectedScenario} />
        )}

        {/* VIEW 4: EARLY WARNING ADVISORY DISPATCH ENGINE */}
        {activeTab === 'advisory' && (
          <EarlyWarningAdvisory scenario={selectedScenario} />
        )}

        {/* VIEW 5: INFRASTRUCTURE STRESS TEST MATRIX */}
        {activeTab === 'matrix' && (
          <InfrastructureMatrix
            infrastructure={infrastructure}
            onSelectInfrastructure={(item) => setSelectedInfra(item)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Infrastructure Detail Modal with Cross-Tab Deep Linking */}
      {selectedInfra && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748b] block">
                  {selectedInfra.sector} Infrastructure
                </span>
                <h3 className="text-base font-bold text-[#0f172a] font-['Manrope']">
                  {selectedInfra.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfra(null)}
                className="p-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
              <div>
                <span className="text-[#64748b] text-[9px] uppercase block">Ground Elevation</span>
                <span className="text-[#0f172a] font-bold">{selectedInfra.elevationMeters} m ASL</span>
              </div>
              <div>
                <span className="text-[#64748b] text-[9px] uppercase block">Surge Exposure</span>
                <span className="text-[#dc2626] font-bold">{selectedInfra.surgeExposureMeters} m</span>
              </div>
              <div>
                <span className="text-[#64748b] text-[9px] uppercase block">Status</span>
                <span className="text-[#d97706] font-bold">{selectedInfra.status}</span>
              </div>
              <div>
                <span className="text-[#64748b] text-[9px] uppercase block">Asset Valuation</span>
                <span className="text-[#0f766e] font-bold">${(selectedInfra.replacementCostUSD / 1000000).toFixed(1)}M USD</span>
              </div>
            </div>

            <div className="text-xs text-[#334155] space-y-2">
              <div>
                <span className="text-[10px] font-mono text-[#64748b] uppercase block">Backup Power Readiness:</span>
                <p className="font-mono text-xs text-[#0f172a] mt-0.5">{selectedInfra.backupPower}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748b] uppercase block">Mitigation Directive:</span>
                <p className="text-[#0f172a] mt-0.5 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">{selectedInfra.recommendedAction}</p>
              </div>
            </div>

            {/* Cross-Module Operational Quick Triggers */}
            <div className="pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedInfra(null);
                  setActiveTab('advisory');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f766e] text-white font-bold font-mono text-xs hover:bg-[#0d655e] transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Draft Warning Directive</span>
              </button>

              <button
                onClick={() => {
                  setSelectedInfra(null);
                  setActiveTab('parametric');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#d97706] border border-[#cbd5e1] font-bold font-mono text-xs transition-all cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Verify Liquidity</span>
              </button>

              <button
                onClick={() => setSelectedInfra(null)}
                className="px-3 py-2 rounded-xl bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Situation Report & OASIS CAP-XML Modal */}
      <SituationReportModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        scenario={selectedScenario}
        currentTimeOffset={currentTimeOffset}
        infrastructure={infrastructure}
      />

      {/* Physics Calibration Modal */}
      <ScenarioControls
        isOpen={isCustomPhysicsOpen}
        onClose={() => setIsCustomPhysicsOpen(false)}
        activeScenario={selectedScenario}
        onApplyCustomPhysics={handleApplyCustomPhysics}
      />

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-[#ffffff] py-4 text-xs text-[#64748b] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AEGISBAY PRO · Bay of Bengal & APAC Anticipatory Disaster Modeling
          </div>
          <div className="text-[#94a3b8]">
            Powered by Google Earth Engine & Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
