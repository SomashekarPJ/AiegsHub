import { StormScenario, InfrastructureItem, ParametricContract, InspectionAsset } from '../types';

import sarMapImg from '../assets/images/sar_flood_map_gee_1790396598280.jpg';
import droneEmbankmentImg from '../assets/images/drone_coastal_embankment_1790396612994.jpg';
import hospitalShelterImg from '../assets/images/hospital_shelter_flooding_1790396629482.jpg';

export const DEFAULT_STORM_SCENARIOS: StormScenario[] = [
  {
    id: 'super-cyclone-mitha',
    name: 'Super Cyclone Mitha',
    category: 'Category 5 Super Cyclone',
    centralPressure: 920,
    maxWindSpeed: 235,
    peakSurgeHeight: 4.8,
    rainfallRate: 380,
    landfallTarget: 'Paradeep & Sundarbans Delta (Odisha / WB)',
    timeToLandfall: 'T-12 Hours',
    coordinates: { lat: 19.8, lng: 87.2 },
    trajectoryPoints: [
      { timeOffset: 'T-72h', lat: 14.5, lng: 89.2, windSpeed: 110, surgeHeight: 1.2, pressure: 980 },
      { timeOffset: 'T-48h', lat: 16.8, lng: 88.4, windSpeed: 165, surgeHeight: 2.4, pressure: 955 },
      { timeOffset: 'T-24h', lat: 18.6, lng: 87.6, windSpeed: 210, surgeHeight: 3.8, pressure: 932 },
      { timeOffset: 'T-12h', lat: 19.8, lng: 87.2, windSpeed: 235, surgeHeight: 4.8, pressure: 920 },
      { timeOffset: 'T-0h', lat: 20.3, lng: 86.9, windSpeed: 220, surgeHeight: 4.5, pressure: 925 },
      { timeOffset: 'T+24h', lat: 22.1, lng: 87.5, windSpeed: 85, surgeHeight: 1.8, pressure: 988 }
    ],
    affectedRegions: ['Jagatsinghpur', 'Kendrapara', 'Bhadrak', 'South 24 Parganas', 'Khulna']
  },
  {
    id: 'severe-cyclone-asani',
    name: 'Severe Cyclonic Storm Asani',
    category: 'Category 3 Very Severe Cyclone',
    centralPressure: 955,
    maxWindSpeed: 165,
    peakSurgeHeight: 3.2,
    rainfallRate: 260,
    landfallTarget: 'Visakhapatnam & Kakinada Coast (Andhra Pradesh)',
    timeToLandfall: 'T-18 Hours',
    coordinates: { lat: 17.2, lng: 83.8 },
    trajectoryPoints: [
      { timeOffset: 'T-72h', lat: 12.8, lng: 85.5, windSpeed: 85, surgeHeight: 0.8, pressure: 990 },
      { timeOffset: 'T-48h', lat: 14.6, lng: 84.8, windSpeed: 125, surgeHeight: 1.8, pressure: 975 },
      { timeOffset: 'T-24h', lat: 16.2, lng: 84.2, windSpeed: 155, surgeHeight: 2.7, pressure: 960 },
      { timeOffset: 'T-12h', lat: 17.2, lng: 83.8, windSpeed: 165, surgeHeight: 3.2, pressure: 955 },
      { timeOffset: 'T-0h', lat: 17.7, lng: 83.3, windSpeed: 150, surgeHeight: 2.9, pressure: 962 },
      { timeOffset: 'T+24h', lat: 18.9, lng: 82.8, windSpeed: 60, surgeHeight: 0.9, pressure: 996 }
    ],
    affectedRegions: ['Visakhapatnam', 'Anakapalli', 'Kakinada', 'East Godavari', 'Srikakulam']
  },
  {
    id: 'deep-depression-sitrang',
    name: 'Deep Depression Sitrang-II',
    category: 'Category 1 Cyclone / Monsoon Flash Flood',
    centralPressure: 985,
    maxWindSpeed: 105,
    peakSurgeHeight: 2.1,
    rainfallRate: 420,
    landfallTarget: 'Cox’s Bazar & Chittagong Delta (Bangladesh)',
    timeToLandfall: 'T-06 Hours',
    coordinates: { lat: 21.4, lng: 91.8 },
    trajectoryPoints: [
      { timeOffset: 'T-72h', lat: 16.2, lng: 90.1, windSpeed: 55, surgeHeight: 0.5, pressure: 1002 },
      { timeOffset: 'T-48h', lat: 18.1, lng: 90.8, windSpeed: 75, surgeHeight: 1.1, pressure: 994 },
      { timeOffset: 'T-24h', lat: 19.8, lng: 91.3, windSpeed: 90, surgeHeight: 1.6, pressure: 990 },
      { timeOffset: 'T-12h', lat: 20.8, lng: 91.6, windSpeed: 100, surgeHeight: 1.9, pressure: 987 },
      { timeOffset: 'T-0h', lat: 21.4, lng: 91.8, windSpeed: 105, surgeHeight: 2.1, pressure: 985 },
      { timeOffset: 'T+24h', lat: 22.8, lng: 92.4, windSpeed: 45, surgeHeight: 0.6, pressure: 1004 }
    ],
    affectedRegions: ['Cox’s Bazar', 'Chittagong', 'Noakhali', 'Teknaf Refugee Enclaves', 'Rakhine North']
  }
];

export const DEFAULT_INFRASTRUCTURE: InfrastructureItem[] = [
  {
    id: 'paradeep-220kv-substation',
    name: 'Paradeep Port 220kV Main Grid Substation',
    sector: 'Power',
    coordinates: { lat: 20.27, lng: 86.67 },
    elevationMeters: 1.8,
    surgeExposureMeters: 3.4,
    status: 'At Risk',
    capacityOrPopulation: '450 MW Grid Node',
    backupPower: '2x 1.5MW Diesel Genset (Elevated +2.5m)',
    recommendedAction: 'Pre-emptive grid sectioning; deploy flood barrier walls.',
    replacementCostUSD: 14200000
  },
  {
    id: 'nh16-coastal-expressway',
    name: 'NH-16 Coastal Arterial Corridor (km 140-185)',
    sector: 'Transport',
    coordinates: { lat: 19.92, lng: 86.25 },
    elevationMeters: 2.1,
    surgeExposureMeters: 2.8,
    status: 'Inundated',
    capacityOrPopulation: '28,000 Vehicles/Day Evacuation Route',
    backupPower: 'N/A',
    recommendedAction: 'Reroute traffic to NH-55 Bypass; mobilize amphibian rescue crafts.',
    replacementCostUSD: 8500000
  },
  {
    id: 'visakhapatnam-district-hospital',
    name: 'Visakhapatnam Apex Medical Trauma Shelter',
    sector: 'Medical',
    coordinates: { lat: 17.72, lng: 83.31 },
    elevationMeters: 4.5,
    surgeExposureMeters: 1.1,
    status: 'Operational',
    capacityOrPopulation: '1,200 Beds + 8,000 Cyclone Evacuees',
    backupPower: '4x 2MW Solar-Diesel Microgrid (Roof Mounted)',
    recommendedAction: 'Stockpile 72h oxygen reserves; stage mobile triage tents.',
    replacementCostUSD: 28000000
  },
  {
    id: 'kakinada-water-desalination-plant',
    name: 'Kakinada Municipal Water Treatment & Intake',
    sector: 'Water',
    coordinates: { lat: 16.98, lng: 82.26 },
    elevationMeters: 1.2,
    surgeExposureMeters: 3.6,
    status: 'At Risk',
    capacityOrPopulation: '180 MLD Clean Water Supply',
    backupPower: '500kW Genset (Flood Risk High)',
    recommendedAction: 'Seal chemical storage vats; switch to secondary inland reservoir.',
    replacementCostUSD: 11500000
  },
  {
    id: 'sundarbans-embankment-breach-point',
    name: 'Gosaba Island Protective Sea Dike (Segment 04)',
    sector: 'Transport',
    coordinates: { lat: 21.91, lng: 88.81 },
    elevationMeters: 1.1,
    surgeExposureMeters: 4.2,
    status: 'Inundated',
    capacityOrPopulation: 'Protecting 42,000 Island Dwellers',
    backupPower: 'N/A',
    recommendedAction: 'IMMEDIATE EVACUATION ORDER; air-drop geotextile sandbags.',
    replacementCostUSD: 6200000
  },
  {
    id: 'coxs-bazar-coastal-telecom-hub',
    name: 'Cox’s Bazar Emergency Microwave & 5G Mast',
    sector: 'Telecom',
    coordinates: { lat: 21.43, lng: 91.97 },
    elevationMeters: 3.2,
    surgeExposureMeters: 1.8,
    status: 'Operational',
    capacityOrPopulation: 'Covering 1.2M Emergency Subscribers',
    backupPower: 'Lithium Battery Bank (48h Autonomy)',
    recommendedAction: 'Switch to emergency satellite backhaul link.',
    replacementCostUSD: 3100000
  }
];

export const DEFAULT_PARAMETRIC_CONTRACTS: ParametricContract[] = [
  {
    id: 'apdma-coastal-pool-2026',
    policyName: 'APDMA Coastal Resilience & Emergency Liquidity Facility',
    coveredAuthority: 'Andhra Pradesh State Disaster Management Authority',
    totalCoverageUSD: 25000000,
    windSpeedTrigger: 180,
    surgeDepthTrigger: 2.8,
    pressureTrigger: 945,
    payoutTriggered: true,
    settlementHash: '0x94f3a...8c21e7d',
    lastVerifiedTime: '2026-09-25 21:15 UTC',
    payoutBreakdown: [
      { category: 'Emergency Shelter Operations', recipient: 'AP Red Cross & NDRF', amountUSD: 10000000 },
      { category: 'Power Grid Rapid Restoration', recipient: 'AP Transco Power Corp', amountUSD: 9000000 },
      { category: 'Clean Water & Mobile Sanitation', recipient: 'Municipal Urban Water Board', amountUSD: 6000000 }
    ]
  },
  {
    id: 'osdma-cat-bond-v4',
    policyName: 'OSDMA Super Cyclone Parametric Catastrophe Facility',
    coveredAuthority: 'Odisha State Disaster Management Authority',
    totalCoverageUSD: 40000000,
    windSpeedTrigger: 200,
    surgeDepthTrigger: 3.5,
    pressureTrigger: 935,
    payoutTriggered: true,
    settlementHash: '0x18c4e...71b29a0',
    lastVerifiedTime: '2026-09-25 21:00 UTC',
    payoutBreakdown: [
      { category: 'Mass Evacuation Logistics', recipient: 'Odisha Fire & Emergency Services', amountUSD: 15000000 },
      { category: 'Coastal Embankment Armouring', recipient: 'Odisha Water Resources Dept', amountUSD: 15000000 },
      { category: 'Parametric Farmer Relief Dispatches', recipient: 'Direct Beneficiary Transfer (DBT)', amountUSD: 10000000 }
    ]
  },
  {
    id: 'cpp-bangladesh-delta-pool',
    policyName: 'Chittagong Port & Delta Parametric Liquidity Shield',
    coveredAuthority: 'Bangladesh Cyclone Preparedness Programme (CPP)',
    totalCoverageUSD: 30000000,
    windSpeedTrigger: 160,
    surgeDepthTrigger: 2.5,
    pressureTrigger: 960,
    payoutTriggered: false,
    settlementHash: '0x00000...PENDING',
    lastVerifiedTime: '2026-09-25 21:20 UTC',
    payoutBreakdown: [
      { category: 'Cyclone Shelter Stockpiling', recipient: 'CPP Volunteer Corps', amountUSD: 12000000 },
      { category: 'Port Maritime Infrastructure Repair', recipient: 'Chittagong Port Authority', amountUSD: 18000000 }
    ]
  }
];

export const SAMPLE_INSPECTION_ASSETS: InspectionAsset[] = [
  {
    id: 'sar-gee-flood-mask',
    title: 'Sentinel-1 SAR Radar Flood Mask (Sundarbans Delta)',
    type: 'SAR_RADAR',
    imageUrl: sarMapImg,
    location: 'Sundarbans Estuary (21.91°N, 88.81°E)',
    description: 'GEE Synthetic Aperture Radar Sentinel-1 backscatter feed capturing active river overflow, tidal surge propagation, and saturated earthen dikes.'
  },
  {
    id: 'drone-embankment-breach',
    title: 'Drone Aerial Surveillance: Coastal Dike Gap',
    type: 'DRONE_EMBANKMENT',
    imageUrl: droneEmbankmentImg,
    location: 'Gosaba Island Sea Wall Segment 04',
    description: 'High-resolution disaster drone feed showing localized wave overtopping, riprap displacement, and piping erosion under 4m surge.'
  },
  {
    id: 'shelter-hospital-water',
    title: 'Emergency Medical Hub Perimeter Assessment',
    type: 'SHELTER_PHOTO',
    imageUrl: hospitalShelterImg,
    location: 'Paradeep Coastal Medical Hub & Refuge',
    description: 'Drone inspection of emergency shelter, auxiliary diesel generator courtyard, and primary ambulance access road under rising flood level.'
  }
];
