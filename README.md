# 🌊 AegisBay Pro — Anticipatory Coastal Disaster Intelligence & Parametric Risk Modeling

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/Google_Gemini-3.8_Flash_Vision-emerald.svg)](https://ai.google.dev/)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Leaflet_%2B_Esri-green.svg)](https://leafletjs.com/)

**AegisBay Pro** is an AI-powered anticipatory coastal disaster intelligence, cyclone storm surge modeling, and parametric catastrophe insurance settlement platform tailored for the **Bay of Bengal & APAC coastal basin**. 

Bridging hydro-meteorological physics, Google Earth Engine satellite telemetry, and multimodal vision AI, AegisBay shortens the disaster response lifecycle from days to seconds—automating critical asset evacuation directives, government SITREPs, and pre-landfall parametric liquidity release.

---

## 🌟 Key Capabilities

### 1. 🗺️ Tactical GIS Map & Multi-Polygon Delta Inundation
* **Watermark-Free Tactical Base Layers**: Esri Light Canvas, Esri High-Resolution Satellite, and OpenStreetMap.
* **Realistic Coastal Delta Flood Corridors**: Multi-polygon bathymetric flood basins across the *Mahanadi-Paradeep Estuary*, *Sundarbans Mangrove Intertidal Basin*, *Dhamra Port Basin*, and *Chittagong Surge Ingress*.
* **Dynamic Storm Vectoring**: Visualizes cone of uncertainty, R34/R64 wind field radii, and GEE Sentinel-1 SAR synthetic aperture radar telemetry footprints.
* **Interactive Coordinate Hydro Probe**: Click anywhere on the coastal grid to calculate localized storm surge depth, elevation above sea level (ASL), wind gusts, and evacuation readiness.

### 2. 📈 Coupled Tidal Hydrograph & Non-Linear Surge Superposition
* **Astronomical Tide + Wind Surge Coupling**: Visualizes the non-linear superposition of the M2/S2 semi-diurnal tidal cycle against peak wind surge set-up.
* **Barrier Crest Threshold Warning**: Real-time crosshair metric tracking against the 3.2m embankment crest level.
* **Interactive Timeline Scrubber**: Bi-directional scrubbing across 6 operational phases (`T-72h`, `T-48h`, `T-24h`, `T-12h`, `T-0h Landfall`, and `T+24h Recovery`).

### 3. 👁️ Multimodal AI Vulnerability Radar (Gemini 3.8 Flash Vision)
* **SAR & Drone Inspection**: Analyzes Sentinel-1 SAR backscatter radar, aerial drone embankment imagery, and hospital lifeline substations.
* **Failure Mechanism Detection**: Identifies geotechnical piping, overtopping erosion, geotextile failure, and electrical transformer submersion risks with structured severity scores (0-100).
* **Immediate Engineering Countermeasures**: Recommends prioritized containment directives (geotextile sandbag berms, portable pump staging).

### 4. ⚡ Parametric Catastrophe Liquidity Facility (Smart Contracts)
* **Zero Loss-Adjustment Delay**: Automated smart contract liquidity triggers based on real-time radar wind speed ($\ge 200\text{ km/h}$), offshore buoy surge ($\ge 3.0\text{m}$), and central pressure drop ($\le 930\text{ hPa}$).
* **Pre-Landfall Capital Disbursement**: Instant itemized emergency escrow release for municipal evacuation fuel, emergency mobile hospitals, and search & rescue staging.

### 5. 📋 Official Government Situation Reports (SITREP) & OASIS CAP v1.2 XML
* **UN OCHA & State Emergency Briefing (SITREP #04)**: Generates complete, printable situation dossiers for District Collectors, Chief Ministers, and NDMA/BMD officials.
* **OASIS CAP v1.2 XML Emergency Broadcasts**: Outputs standards-compliant Common Alerting Protocol XML formatted for cellular emergency broadcast towers and siren networks.

### 6. 🏗️ Infrastructure Stress Matrix with Dynamic Green $\rightarrow$ Red Severity Gradients
* **Dynamic Gradient Tiers**: Rows and cards dynamically calculate a color-coded gradient (Emerald Green $\rightarrow$ Amber Yellow $\rightarrow$ Deep Orange $\rightarrow$ Crimson Red) based on live surge depth exposure and operational status.
* **Dual Viewport**: Toggle between detailed sortable Data Table matrix and geometric Card Grid views.
* **Cross-Tab Deep Linking**: 1-click action buttons to transition from an exposed asset directly into an emergency advisory dispatch or insurance claim.

### 7. 🗣️ Multilingual Early-Warning Advisory Engine
* Generates localized emergency orders formatted for administrative bodies (**OSDMA**, **APDMA**, **Bangladesh CPP**, **West Bengal Disaster Management**) in **English**, **Bengali (বাংলা)**, **Odia (ଓଡ଼ିଆ)**, and **Telugu (తెలుగు)**.

---

## 🛠️ Architecture & Tech Stack

```
aegisbay/
├── server.ts                       # Express full-stack API server + Gemini 3.8 Flash routes
├── src/
│   ├── App.tsx                     # Master state controller & view switcher
│   ├── components/
│   │   ├── Navbar.tsx              # Brand header & scenario controls
│   │   ├── TelemetryTicker.tsx     # Real-time sensor stream simulator
│   │   ├── InteractiveMap.tsx      # Leaflet GIS engine with multi-polygon flood zones
│   │   ├── HydrographDashboard.tsx # Coupled astronomical tide & surge SVG chart
│   │   ├── MultimodalInspector.tsx # Gemini 3.8 Flash vision vulnerability inspector
│   │   ├── ParametricInsurancePanel.tsx # Smart contract audit & payout simulator
│   │   ├── EarlyWarningAdvisory.tsx# Multi-agency / multilingual dispatch generator
│   │   ├── InfrastructureMatrix.tsx# Dynamic green-to-red gradient stress matrix
│   │   ├── ScenarioControls.tsx    # Hydro-meteorological physics calibration modal
│   │   └── SituationReportModal.tsx# Government SITREP & OASIS CAP-XML modal
│   ├── data/
│   │   └── stormScenarios.ts       # Calibrated historical benchmark datasets
│   └── types/                      # TypeScript definitions & schemas
```

* **Frontend**: React 18, TypeScript, Tailwind CSS, Leaflet GIS, Lucide Icons.
* **Typography**: *Manrope* (Architectural Headers) + *Geist / Geist Mono* (Telemetry & Tabular Data).
* **Backend**: Node.js, Express, Vite middleware mode.
* **AI Engine**: Google Gen AI SDK (`@google/genai`) using `gemini-3.8-flash` with JSON Schema constraint outputs (`responseMimeType: 'application/json'`).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **yarn**
* **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aegisbay.git
   cd aegisbay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/ai/analyze-vulnerability` | `POST` | Executes multimodal vision inspection on SAR radar / drone imagery. |
| `/api/ai/generate-advisory` | `POST` | Generates official multi-agency early warning dispatches (multilingual). |
| `/api/ai/generate-sitrep` | `POST` | Compiles comprehensive government Situation Reports (SITREP #04). |
| `/api/ai/generate-cap-xml` | `POST` | Generates OASIS CAP v1.2 standard XML payload for cellular broadcasts. |
| `/api/ai/simulate-surge-pathway`| `POST` | Calculates cascading infrastructure failure pathways. |
| `/api/ai/parametric-audit` | `POST` | Verifies telemetry against smart contract catastrophe thresholds. |

---

## 🎨 AegisBay Design System

AegisBay adheres to a high-precision maritime aesthetic engineered for continuous operational monitoring:

* **Canvas**: `#f8f9ff` (Soft Maritime Ice)
* **Surface Containers**: `#ffffff` (Pure Operational White) with `1px solid #e2e8f0` hairline borders
* **Primary Brand**: `#0f766e` (Deep Oceanic Teal)
* **Secondary Trajectory**: `#0284c7` (Maritime Navigation Blue)
* **Threshold Accents**:
  * Nominal / Operational: `#059669` (Emerald)
  * Rising Advisory / At Risk: `#d97706` (Amber)
  * Imminent Catastrophe / Inundated: `#dc2626` (Crimson)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
