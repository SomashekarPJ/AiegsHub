export type SeverityLevel = 'Critical' | 'High' | 'Moderate' | 'Elevated' | 'Low';

export type SectorType = 'Power' | 'Transport' | 'Medical' | 'Water' | 'Telecom';

export interface StormScenario {
  id: string;
  name: string;
  category: string; // e.g. "Category 5 Super Cyclone"
  centralPressure: number; // hPa
  maxWindSpeed: number; // km/h
  peakSurgeHeight: number; // meters
  rainfallRate: number; // mm / 24h
  landfallTarget: string; // e.g. "Paradeep Delta, Odisha"
  timeToLandfall: string; // e.g. "T-18 Hours"
  coordinates: {
    lat: number;
    lng: number;
  };
  trajectoryPoints: Array<{
    timeOffset: string; // e.g. "T-72h", "T-48h", "T-24h", "T-0h", "T+24h"
    lat: number;
    lng: number;
    windSpeed: number;
    surgeHeight: number;
    pressure: number;
  }>;
  affectedRegions: string[];
}

export interface InfrastructureItem {
  id: string;
  name: string;
  sector: SectorType;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  surgeExposureMeters: number;
  status: 'Operational' | 'At Risk' | 'Inundated' | 'Offline';
  capacityOrPopulation: string;
  backupPower: string;
  recommendedAction: string;
  replacementCostUSD: number;
}

export interface ParametricContract {
  id: string;
  policyName: string;
  coveredAuthority: string;
  totalCoverageUSD: number;
  windSpeedTrigger: number; // km/h
  surgeDepthTrigger: number; // meters
  pressureTrigger: number; // hPa
  payoutTriggered: boolean;
  settlementHash?: string;
  lastVerifiedTime?: string;
  payoutBreakdown: Array<{
    category: string;
    recipient: string;
    amountUSD: number;
  }>;
}

export interface InspectionAsset {
  id: string;
  title: string;
  type: 'SAR_RADAR' | 'DRONE_EMBANKMENT' | 'SHELTER_PHOTO';
  imageUrl: string;
  location: string;
  description: string;
}

export interface AIVulnerabilityResult {
  severityScore: number;
  riskLevel: SeverityLevel;
  summary: string;
  keyVulnerabilities: string[];
  failureMechanisms: string[];
  recommendedActions: string[];
  estimatedInundationDepth: string;
  populationAtRisk: string;
}
