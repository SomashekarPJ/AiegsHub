import React, { useState } from 'react';
import { InfrastructureItem, SectorType } from '../types';
import { 
  Layers, 
  Zap, 
  Truck, 
  Hospital, 
  Droplet, 
  Radio,
  Send,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  AlertOctagon,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface InfrastructureMatrixProps {
  infrastructure: InfrastructureItem[];
  onSelectInfrastructure: (item: InfrastructureItem) => void;
  onNavigateToTab?: (tab: 'inspection' | 'parametric' | 'advisory' | 'matrix') => void;
}

export const InfrastructureMatrix: React.FC<InfrastructureMatrixProps> = ({
  infrastructure,
  onSelectInfrastructure,
  onNavigateToTab,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'severity' | 'surge' | 'valuation'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dynamic severity level calculation (0 to 100) & gradient styling helper
  const getSeverityData = (item: InfrastructureItem) => {
    const surge = item.surgeExposureMeters;
    const status = item.status;

    // Severity score (0-100)
    let score = Math.min(100, Math.round((surge / 4.5) * 100));
    if (status === 'Inundated') score = Math.max(score, 85);
    else if (status === 'At Risk') score = Math.max(score, 45);

    if (surge >= 3.2 || status === 'Inundated') {
      return {
        score,
        level: 'Critical Inundation',
        cardBgGradient: 'bg-gradient-to-br from-[#fef2f2] via-[#fee2e2] to-[#ffffff]',
        rowBgGradient: 'bg-gradient-to-r from-[#fee2e2]/80 via-[#fef2f2]/60 to-[#ffffff]',
        borderColor: 'border-[#fca5a5] hover:border-[#dc2626]',
        badgeBg: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/30',
        progressBarBg: 'bg-[#dc2626]',
        accentColor: '#dc2626',
        gradientHex: 'from-[#dc2626]',
      };
    } else if (surge >= 2.2) {
      return {
        score,
        level: 'High Surge Exposure',
        cardBgGradient: 'bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#ffffff]',
        rowBgGradient: 'bg-gradient-to-r from-[#ffedd5]/80 via-[#fff7ed]/60 to-[#ffffff]',
        borderColor: 'border-[#fdba74] hover:border-[#ea580c]',
        badgeBg: 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/30',
        progressBarBg: 'bg-[#ea580c]',
        accentColor: '#ea580c',
        gradientHex: 'from-[#ea580c]',
      };
    } else if (surge >= 1.0 || status === 'At Risk') {
      return {
        score,
        level: 'Moderate Advisory',
        cardBgGradient: 'bg-gradient-to-br from-[#fefce8] via-[#fef9c3] to-[#ffffff]',
        rowBgGradient: 'bg-gradient-to-r from-[#fef9c3]/70 via-[#fefce8]/50 to-[#ffffff]',
        borderColor: 'border-[#fde047] hover:border-[#d97706]',
        badgeBg: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30',
        progressBarBg: 'bg-[#d97706]',
        accentColor: '#d97706',
        gradientHex: 'from-[#d97706]',
      };
    } else {
      return {
        score,
        level: 'Nominal Operational',
        cardBgGradient: 'bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#ffffff]',
        rowBgGradient: 'bg-gradient-to-r from-[#dcfce7]/60 via-[#f0fdf4]/40 to-[#ffffff]',
        borderColor: 'border-[#86efac] hover:border-[#059669]',
        badgeBg: 'bg-[#059669]/10 text-[#059669] border-[#059669]/30',
        progressBarBg: 'bg-[#059669]',
        accentColor: '#059669',
        gradientHex: 'from-[#059669]',
      };
    }
  };

  const getSectorIcon = (sector: SectorType) => {
    switch (sector) {
      case 'Power':
        return <Zap className="w-4 h-4 text-[#d97706]" />;
      case 'Transport':
        return <Truck className="w-4 h-4 text-[#0284c7]" />;
      case 'Medical':
        return <Hospital className="w-4 h-4 text-[#dc2626]" />;
      case 'Water':
        return <Droplet className="w-4 h-4 text-[#0f766e]" />;
      case 'Telecom':
        return <Radio className="w-4 h-4 text-[#334155]" />;
    }
  };

  // Filter items
  const filtered = infrastructure.filter((item) => {
    if (selectedSector !== 'ALL' && item.sector !== selectedSector) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    return true;
  });

  // Sort items
  const sortedItems = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'severity') {
      const scoreA = getSeverityData(a).score;
      const scoreB = getSeverityData(b).score;
      comp = scoreA - scoreB;
    } else if (sortBy === 'surge') {
      comp = a.surgeExposureMeters - b.surgeExposureMeters;
    } else if (sortBy === 'valuation') {
      comp = a.replacementCostUSD - b.replacementCostUSD;
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  const totalExposedCost = sortedItems.reduce((acc, item) => acc + item.replacementCostUSD, 0);

  // Status breakdown counts
  const inundatedCount = infrastructure.filter((i) => i.status === 'Inundated' || i.surgeExposureMeters >= 3.2).length;
  const atRiskCount = infrastructure.filter((i) => (i.status === 'At Risk' || (i.surgeExposureMeters >= 1.0 && i.surgeExposureMeters < 3.2)) && i.status !== 'Inundated').length;
  const operationalCount = infrastructure.filter((i) => i.status === 'Operational' && i.surgeExposureMeters < 1.0).length;

  return (
    <div className="space-y-6">
      {/* Header Banner with Real-time Loss Summary */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#0f766e]/10 border border-[#0f766e]/20 text-[#0f766e]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] font-['Manrope']">
                  Critical Infrastructure Exposure & Vulnerability Matrix
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20 px-2.5 py-0.5 rounded-full font-bold">
                  Dynamic Gradient Severity Tiers
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Multi-sector stress test with dynamic green-to-red gradient intensity driven by simulated storm surge exposure and ground elevation.
              </p>
            </div>
          </div>

          <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] font-mono text-right shrink-0">
            <span className="text-[9px] text-[#64748b] uppercase block">Total Exposed Asset Valuation</span>
            <span className="text-xl font-bold text-[#0f766e]">
              ${(totalExposedCost / 1000000).toFixed(1)}M USD
            </span>
          </div>
        </div>

        {/* Dynamic Gradient Severity Scale Bar */}
        <div className="mt-5 pt-4 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div 
            onClick={() => setSelectedStatus('ALL')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'ALL' ? 'bg-[#f1f5f9] border-[#cbd5e1] font-bold shadow-xs' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b] mb-1">
              <span>All Monitored Assets</span>
              <span className="font-bold text-[#0f172a]">{infrastructure.length}</span>
            </div>
            <div className="h-1.5 w-full bg-[#cbd5e1] rounded-full overflow-hidden">
              <div className="h-full bg-[#0f766e] w-full"></div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus('Inundated')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'Inundated' ? 'bg-[#fee2e2] border-[#fca5a5] font-bold shadow-xs' : 'bg-gradient-to-r from-[#fee2e2]/60 to-[#fef2f2]/30 border-[#fecaca] text-[#dc2626] hover:border-[#dc2626]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] uppercase text-[#dc2626] mb-1 font-bold">
              <span>Critical Inundation (&gt;3.2m)</span>
              <span>{inundatedCount}</span>
            </div>
            <div className="h-1.5 w-full bg-[#fecaca] rounded-full overflow-hidden">
              <div className="h-full bg-[#dc2626] w-full"></div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus('At Risk')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'At Risk' ? 'bg-[#fef9c3] border-[#fde047] font-bold shadow-xs' : 'bg-gradient-to-r from-[#ffedd5]/60 to-[#fefce8]/30 border-[#fed7aa] text-[#d97706] hover:border-[#d97706]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] uppercase text-[#d97706] mb-1 font-bold">
              <span>At Risk (1.0m - 3.2m)</span>
              <span>{atRiskCount}</span>
            </div>
            <div className="h-1.5 w-full bg-[#fed7aa] rounded-full overflow-hidden">
              <div className="h-full bg-[#d97706] w-full"></div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus('Operational')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'Operational' ? 'bg-[#dcfce7] border-[#86efac] font-bold shadow-xs' : 'bg-gradient-to-r from-[#dcfce7]/60 to-[#f0fdf4]/30 border-[#bbf7d0] text-[#059669] hover:border-[#059669]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] uppercase text-[#059669] mb-1 font-bold">
              <span>Operational (&lt;1.0m)</span>
              <span>{operationalCount}</span>
            </div>
            <div className="h-1.5 w-full bg-[#bbf7d0] rounded-full overflow-hidden">
              <div className="h-full bg-[#059669] w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Sort & View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-2xl shadow-xs">
        {/* Sector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'Power', 'Transport', 'Medical', 'Water', 'Telecom'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedSector === sec
                  ? 'bg-[#f0fdf4] text-[#0f766e] border border-[#0f766e]/30 font-bold shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Sort & Layout Toggle Controls */}
        <div className="flex items-center gap-3">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748b]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 shadow-xs cursor-pointer"
            >
              <option value="severity">Sort by Severity (Green → Red)</option>
              <option value="surge">Sort by Surge Depth (m)</option>
              <option value="valuation">Sort by Asset Value ($)</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] text-[10px] font-mono font-bold uppercase cursor-pointer"
              title="Toggle Sort Order"
            >
              {sortOrder === 'desc' ? 'High→Low' : 'Low→High'}
            </button>
          </div>

          {/* Grid / Table View Switcher */}
          <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl border border-[#e2e8f0]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0f766e] shadow-xs font-bold' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="Table Row Matrix View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#0f766e] shadow-xs font-bold' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: DYNAMIC GRADIENT TABLE ROW VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Severity Gradient</th>
                  <th className="py-3.5 px-4 font-bold">Infrastructure Asset</th>
                  <th className="py-3.5 px-4 font-bold">Sector</th>
                  <th className="py-3.5 px-4 font-bold">Elevation ASL</th>
                  <th className="py-3.5 px-4 font-bold">Surge Inundation</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Asset Valuation</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {sortedItems.map((item) => {
                  const severity = getSeverityData(item);

                  return (
                    <tr
                      key={item.id}
                      className={`${severity.rowBgGradient} hover:brightness-95 transition-all cursor-pointer group`}
                      onClick={() => onSelectInfrastructure(item)}
                    >
                      {/* Severity Gradient Meter Cell */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: severity.accentColor }} />
                          <div className="w-24 bg-black/10 rounded-full h-2 overflow-hidden border border-black/5">
                            <div
                              className={`h-full ${severity.progressBarBg} transition-all duration-500`}
                              style={{ width: `${severity.score}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: severity.accentColor }}>
                            {severity.score}%
                          </span>
                        </div>
                      </td>

                      {/* Asset Name & Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0f172a] font-['Manrope'] text-xs">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                          {item.capacityOrPopulation}
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#334155]">
                          {getSectorIcon(item.sector)}
                          <span>{item.sector}</span>
                        </div>
                      </td>

                      {/* Elevation */}
                      <td className="py-3.5 px-4 font-mono text-[#0f172a] font-medium">
                        {item.elevationMeters} m
                      </td>

                      {/* Surge Exposure Meter */}
                      <td className="py-3.5 px-4 font-mono font-bold" style={{ color: severity.accentColor }}>
                        +{item.surgeExposureMeters} m
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${severity.badgeBg}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Asset Valuation */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0f766e]">
                        ${(item.replacementCostUSD / 1000000).toFixed(1)}M
                      </td>

                      {/* Action Triggers */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {onNavigateToTab && (
                            <>
                              <button
                                onClick={() => onNavigateToTab('advisory')}
                                className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#0f766e] border border-[#cbd5e1] hover:border-[#0f766e] transition-all shadow-xs cursor-pointer"
                                title="Draft Advisory Directive"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onNavigateToTab('parametric')}
                                className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#d97706] border border-[#cbd5e1] hover:border-[#d97706] transition-all shadow-xs cursor-pointer"
                                title="Fast-Track Parametric Liquidity"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onSelectInfrastructure(item)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#0f172a] border border-[#cbd5e1] hover:border-[#0f766e] transition-all shadow-xs cursor-pointer"
                            title="Inspect Details"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC GRADIENT CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((item) => {
            const severity = getSeverityData(item);

            return (
              <div
                key={item.id}
                className={`${severity.cardBgGradient} border-2 ${severity.borderColor} rounded-2xl p-5 space-y-3 shadow-xs transition-all flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md`}
              >
                <div className="space-y-3 cursor-pointer" onClick={() => onSelectInfrastructure(item)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs shrink-0">
                        {getSectorIcon(item.sector)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#64748b] uppercase block">
                          {item.sector} Sector
                        </span>
                        <h3 className="text-xs font-bold text-[#0f172a] line-clamp-1 font-['Manrope']">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${severity.badgeBg}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Gradient Severity Progress Bar */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-black/5 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#64748b] uppercase">Surge Risk Severity:</span>
                      <span className="font-bold" style={{ color: severity.accentColor }}>
                        {severity.score}% · {severity.level}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${severity.progressBarBg} transition-all duration-500`}
                        style={{ width: `${severity.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white/80 p-3 rounded-xl border border-black/5">
                    <div>
                      <span className="text-[#64748b] text-[9px] uppercase block">Elevation (ASL)</span>
                      <span className="text-[#0f172a] font-semibold">{item.elevationMeters} m</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] text-[9px] uppercase block">Surge Exposure</span>
                      <span className="font-bold" style={{ color: severity.accentColor }}>
                        +{item.surgeExposureMeters} m
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#64748b] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8] font-mono text-[10px]">Capacity / Exposure:</span>
                      <span className="text-[#0f172a] font-semibold">{item.capacityOrPopulation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8] font-mono text-[10px]">Asset Valuation:</span>
                      <span className="text-[#0f766e] font-bold font-mono">
                        ${(item.replacementCostUSD / 1000000).toFixed(1)}M USD
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/5 text-[11px]">
                    <span className="text-[9px] font-mono text-[#64748b] uppercase block">Recommended Action:</span>
                    <p className="text-[#334155] line-clamp-2 mt-0.5 text-[11px]">
                      {item.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Action Deep Links */}
                {onNavigateToTab && (
                  <div className="flex items-center gap-2 pt-3 border-t border-black/5">
                    <button
                      onClick={() => onNavigateToTab('advisory')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-[#f0fdf4] text-[#0f766e] text-[11px] font-mono font-semibold border border-[#cbd5e1] hover:border-[#0f766e] transition-all cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Draft Warning</span>
                    </button>
                    <button
                      onClick={() => onNavigateToTab('parametric')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-[#fefce8] text-[#d97706] text-[11px] font-mono font-semibold border border-[#cbd5e1] hover:border-[#d97706] transition-all cursor-pointer shadow-2xs"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Verify Payout</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
