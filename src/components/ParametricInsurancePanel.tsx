import React, { useState } from 'react';
import { ParametricContract, StormScenario } from '../types';
import { DEFAULT_PARAMETRIC_CONTRACTS } from '../data/stormScenarios';
import { 
  Zap, 
  ShieldCheck, 
  Loader2, 
  Lock
} from 'lucide-react';

interface ParametricInsurancePanelProps {
  currentScenario: StormScenario;
}

export const ParametricInsurancePanel: React.FC<ParametricInsurancePanelProps> = ({
  currentScenario,
}) => {
  const [contracts, setContracts] = useState<ParametricContract[]>(DEFAULT_PARAMETRIC_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<ParametricContract>(DEFAULT_PARAMETRIC_CONTRACTS[0]);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResponse, setAuditResponse] = useState<any>(null);

  const windTriggerMet = currentScenario.maxWindSpeed >= selectedContract.windSpeedTrigger;
  const surgeTriggerMet = currentScenario.peakSurgeHeight >= selectedContract.surgeDepthTrigger;
  const pressureTriggerMet = currentScenario.centralPressure <= selectedContract.pressureTrigger;

  const handleExecuteAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/parametric-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          observedWind: currentScenario.maxWindSpeed,
          observedSurge: currentScenario.peakSurgeHeight,
          observedPressure: currentScenario.centralPressure,
        }),
      });

      if (!res.ok) throw new Error('Failed to run parametric audit.');
      const data = await res.json();
      setAuditResponse(data);

      setContracts((prev) =>
        prev.map((c) =>
          c.id === selectedContract.id
            ? {
                ...c,
                payoutTriggered: data.triggersFired,
                settlementHash: '0x' + Math.random().toString(16).substring(2, 10) + '...f92a',
                lastVerifiedTime: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 text-[#d97706]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] font-['Manrope']">
                  Parametric Catastrophe Liquidity Facility
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 px-2.5 py-0.5 rounded-full font-bold">
                  Zero Loss-Adjustment Delay
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Automated pre-landfall capital release triggered by radar telemetry and offshore buoy thresholds for immediate evacuation funding.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Active Policies */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider block">
            Active Catastrophe Facilities
          </span>

          <div className="space-y-2">
            {contracts.map((contract) => {
              const isSelected = contract.id === selectedContract.id;
              return (
                <button
                  key={contract.id}
                  onClick={() => {
                    setSelectedContract(contract);
                    setAuditResponse(null);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f0fdf4] border-[#0f766e] text-[#0f172a] shadow-xs'
                      : 'bg-[#ffffff] border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#0f172a] truncate">
                      {contract.policyName}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase ${
                      contract.payoutTriggered
                        ? 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'
                        : 'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      {contract.payoutTriggered ? 'TRIGGERED' : 'MONITORING'}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-[#64748b] mb-2">
                    {contract.coveredAuthority}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] text-[11px] font-mono">
                    <span className="text-[#64748b]">Capital Pool:</span>
                    <span className="text-[#0f766e] font-bold">
                      ${(contract.totalCoverageUSD / 1000000).toFixed(1)}M USD
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Telemetry Audit & Verification */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748b] block">Target Facility</span>
                <h3 className="text-base font-bold text-[#0f172a] font-['Manrope'] mt-0.5">
                  {selectedContract.policyName}
                </h3>
                <span className="text-xs font-mono text-[#0284c7] block mt-0.5">
                  Beneficiary: {selectedContract.coveredAuthority}
                </span>
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] font-mono text-right shrink-0">
                <span className="text-[9px] text-[#64748b] uppercase block">Facility Capitalization</span>
                <span className="text-xl font-bold text-[#0f766e]">
                  ${(selectedContract.totalCoverageUSD / 1000000).toFixed(1)} Million
                </span>
              </div>
            </div>

            {/* Threshold Matrix Comparison */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-[#64748b] tracking-wider mb-3">
                Telemetry vs Parametric Threshold Verification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border font-mono transition-all ${
                  windTriggerMet
                    ? 'bg-[#dc2626]/10 border-[#dc2626]/30 text-[#0f172a]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                }`}>
                  <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b] mb-1">
                    <span>Peak Wind</span>
                    <span className={windTriggerMet ? 'text-[#dc2626] font-bold' : ''}>
                      {windTriggerMet ? '✓ TRIGGERED' : 'UNMET'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#0f172a]">
                    {currentScenario.maxWindSpeed} <span className="text-xs text-[#64748b]">km/h</span>
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-1">
                    Trigger: <strong className="text-[#0f172a]">≥ {selectedContract.windSpeedTrigger} km/h</strong>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border font-mono transition-all ${
                  surgeTriggerMet
                    ? 'bg-[#dc2626]/10 border-[#dc2626]/30 text-[#0f172a]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                }`}>
                  <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b] mb-1">
                    <span>Max Surge</span>
                    <span className={surgeTriggerMet ? 'text-[#dc2626] font-bold' : ''}>
                      {surgeTriggerMet ? '✓ TRIGGERED' : 'UNMET'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#0f172a]">
                    {currentScenario.peakSurgeHeight} <span className="text-xs text-[#64748b]">m</span>
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-1">
                    Trigger: <strong className="text-[#0f172a]">≥ {selectedContract.surgeDepthTrigger} m</strong>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border font-mono transition-all ${
                  pressureTriggerMet
                    ? 'bg-[#dc2626]/10 border-[#dc2626]/30 text-[#0f172a]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                }`}>
                  <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b] mb-1">
                    <span>Pressure Drop</span>
                    <span className={pressureTriggerMet ? 'text-[#dc2626] font-bold' : ''}>
                      {pressureTriggerMet ? '✓ TRIGGERED' : 'UNMET'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#0f172a]">
                    {currentScenario.centralPressure} <span className="text-xs text-[#64748b]">hPa</span>
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-1">
                    Trigger: <strong className="text-[#0f172a]">≤ {selectedContract.pressureTrigger} hPa</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Contract Audit Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleExecuteAudit}
                disabled={isAuditing}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white font-bold font-mono text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Telemetry & Executing Smart Contract...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>Execute Smart Contract Parametric Liquidity Audit</span>
                  </>
                )}
              </button>
            </div>

            {/* Settlement Output */}
            {auditResponse && (
              <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#0f766e]/30 space-y-4 font-mono text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                  <div className="flex items-center gap-2 text-[#0f766e] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SMART CONTRACT SETTLEMENT CERTIFICATE</span>
                  </div>
                  <span className="text-[10px] text-[#64748b] bg-white px-2.5 py-1 rounded-full border border-[#cbd5e1]">
                    Status: {auditResponse.smartContractStatus || 'EXECUTED_PAYOUT_SETTLED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block">Triggers Condition Matched</span>
                    <span className="text-[#059669] font-bold">
                      {auditResponse.triggersFired ? 'YES (CRITERIA SATISFIED)' : 'NO'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block">Disbursed Liquidity</span>
                    <span className="text-[#0f766e] font-bold text-sm">
                      ${(auditResponse.totalPayoutUSD || selectedContract.totalCoverageUSD).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block mb-2">Itemized Disbursements</span>
                  <div className="space-y-1.5">
                    {(auditResponse.allocationBreakdown || selectedContract.payoutBreakdown).map((alloc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#e2e8f0] text-[11px]">
                        <div>
                          <div className="font-bold text-[#0f172a]">{alloc.category}</div>
                          <div className="text-[9px] text-[#64748b]">{alloc.recipient}</div>
                        </div>
                        <div className="text-[#0f766e] font-bold">
                          ${(alloc.amountUSD || alloc.amount).toLocaleString()} USD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-[#64748b] bg-white p-3 rounded-lg border border-[#e2e8f0] leading-relaxed">
                  <span className="text-[#0f172a] font-bold">Legal Audit Summary: </span>
                  {auditResponse.legalAuditSummary || 'Parametric trigger criteria verified across satellite radar and offshore buoys. Liquidity transferred to municipal first-responder emergency escrow accounts.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
