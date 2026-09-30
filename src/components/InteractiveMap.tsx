import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StormScenario, InfrastructureItem } from '../types';
import { 
  Layers, 
  MapPin, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  Send,
  Zap,
  Eye,
  ArrowRight
} from 'lucide-react';

interface InteractiveMapProps {
  scenario: StormScenario;
  currentTimeOffset: string;
  infrastructure: InfrastructureItem[];
  onSelectInfrastructure: (item: InfrastructureItem) => void;
  onNavigateToTab?: (tab: 'inspection' | 'parametric' | 'advisory' | 'matrix') => void;
  isActive?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  scenario,
  currentTimeOffset,
  infrastructure,
  onSelectInfrastructure,
  onNavigateToTab,
  isActive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const probeMarkerRef = useRef<L.CircleMarker | null>(null);

  const [mapReady, setMapReady] = useState(false);

  // Basemap Choice: Esri Light Canvas, Esri Satellite, or OpenStreetMap
  const [basemapStyle, setBasemapStyle] = useState<'esri_light' | 'esri_sat' | 'osm'>('esri_light');

  // Layer Toggles
  const [showTrack, setShowTrack] = useState(true);
  const [showWindField, setShowWindField] = useState(true);
  const [showSurgeHeatmap, setShowSurgeHeatmap] = useState(true);
  const [showSarOverlay, setShowSarOverlay] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);

  // Inspection Probe State
  const [probeLocation, setProbeLocation] = useState<{
    lat: number;
    lng: number;
    surgeDepth: number;
    windSpeed: number;
    elevation: number;
    evacuationStatus: string;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentPointIndex = scenario.trajectoryPoints.findIndex(
    (p) => p.timeOffset === currentTimeOffset
  );
  const activeTrajectoryPoint =
    currentPointIndex >= 0
      ? scenario.trajectoryPoints[currentPointIndex]
      : scenario.trajectoryPoints[3] || scenario.trajectoryPoints[0];

  const activeTrajectoryPointRef = useRef(activeTrajectoryPoint);
  useEffect(() => {
    activeTrajectoryPointRef.current = activeTrajectoryPoint;
  }, [activeTrajectoryPoint]);

  const getBaseTileConfig = (style: 'esri_light' | 'esri_sat' | 'osm') => {
    switch (style) {
      case 'esri_sat':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: { maxZoom: 18, attribution: 'Esri World Imagery' },
          labelUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        };
      case 'osm':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: { maxZoom: 19, subdomains: 'abc', attribution: 'OpenStreetMap' },
          labelUrl: null,
        };
      case 'esri_light':
      default:
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          options: { maxZoom: 16, attribution: 'Esri Light Canvas' },
          labelUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        };
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [scenario.coordinates.lat, scenario.coordinates.lng],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      const config = getBaseTileConfig('esri_light');
      const baseTile = L.tileLayer(config.url, config.options).addTo(map);
      baseTileLayerRef.current = baseTile;

      if (config.labelUrl) {
        const labelTile = L.tileLayer(config.labelUrl, { maxZoom: 16, opacity: 0.85 }).addTo(map);
        labelTileLayerRef.current = labelTile;
      }

      L.control.zoom({ position: 'topright' }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const currentTargetPoint = activeTrajectoryPointRef.current;
        const eyeLat = currentTargetPoint.lat;
        const eyeLng = currentTargetPoint.lng;
        const distKm = Math.sqrt(
          Math.pow((lat - eyeLat) * 111, 2) + Math.pow((lng - eyeLng) * 111, 2)
        );

        const maxDist = 220;
        const proximityFactor = Math.max(0, 1 - distKm / maxDist);
        const estSurge = Number((currentTargetPoint.surgeHeight * proximityFactor * (1.15 - Math.random() * 0.25)).toFixed(1));
        const estWind = Math.round(currentTargetPoint.windSpeed * Math.max(0.35, proximityFactor));
        const estElevation = Number((1.5 + Math.sin(lat * 8) * 3 + Math.abs(lat - 20) * 1.5).toFixed(1));

        let evacStatus = 'STAGING_READY';
        if (estSurge > 3.0) evacStatus = 'MANDATORY_EVACUATION_ORDER';
        else if (estSurge > 1.5) evacStatus = 'PRECAUTIONARY_SHELTER_ALERT';

        setProbeLocation({
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          surgeDepth: estSurge,
          windSpeed: estWind,
          elevation: Math.max(0.4, estElevation),
          evacuationStatus: evacStatus,
        });

        if (probeMarkerRef.current) {
          probeMarkerRef.current.setLatLng([lat, lng]);
        } else {
          probeMarkerRef.current = L.circleMarker([lat, lng], {
            radius: 8,
            color: '#0f766e',
            fillColor: '#14b8a6',
            fillOpacity: 0.9,
            weight: 3,
          }).addTo(map);
        }
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        baseTileLayerRef.current = null;
        labelTileLayerRef.current = null;
        layersGroupRef.current = null;
        probeMarkerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapContainerRef.current) return;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(mapContainerRef.current);

    if (isActive) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      ro.disconnect();
    };
  }, [isActive, isFullscreen]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (labelTileLayerRef.current) {
      map.removeLayer(labelTileLayerRef.current);
      labelTileLayerRef.current = null;
    }

    const config = getBaseTileConfig(basemapStyle);
    const newBase = L.tileLayer(config.url, config.options).addTo(map);
    baseTileLayerRef.current = newBase;

    if (config.labelUrl) {
      const newLabel = L.tileLayer(config.labelUrl, { maxZoom: 18, opacity: 0.85 }).addTo(map);
      labelTileLayerRef.current = newLabel;
    }

    map.invalidateSize();
  }, [basemapStyle, mapReady]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup || !mapReady) return;

    layerGroup.clearLayers();

    map.panTo([activeTrajectoryPoint.lat, activeTrajectoryPoint.lng], {
      animate: true,
      duration: 0.8,
    });

    if (showTrack) {
      const trackCoords: [number, number][] = scenario.trajectoryPoints.map((p) => [
        p.lat,
        p.lng,
      ]);

      const conePoints: [number, number][] = [];
      scenario.trajectoryPoints.forEach((p, idx) => {
        const spread = (idx + 1) * 0.28;
        conePoints.push([p.lat + spread, p.lng + spread * 0.6]);
      });
      [...scenario.trajectoryPoints].reverse().forEach((p, idx) => {
        const revIdx = scenario.trajectoryPoints.length - 1 - idx;
        const spread = (revIdx + 1) * 0.28;
        conePoints.push([p.lat - spread, p.lng - spread * 0.6]);
      });

      const conePolygon = L.polygon(conePoints, {
        color: '#0f766e',
        weight: 1.5,
        fillColor: '#0f766e',
        fillOpacity: 0.12,
        dashArray: '4,4',
      });
      layerGroup.addLayer(conePolygon);

      const trackLine = L.polyline(trackCoords, {
        color: '#0f766e',
        weight: 3.5,
        opacity: 0.9,
      });
      layerGroup.addLayer(trackLine);

      scenario.trajectoryPoints.forEach((pt) => {
        const isCurrent = pt.timeOffset === currentTimeOffset;
        const markerCircle = L.circleMarker([pt.lat, pt.lng], {
          radius: isCurrent ? 11 : 6,
          color: isCurrent ? '#dc2626' : '#0f766e',
          fillColor: isCurrent ? '#dc2626' : '#0284c7',
          fillOpacity: 1,
          weight: isCurrent ? 3 : 1.5,
        });

        markerCircle.bindTooltip(
          `<div class="font-mono text-xs font-bold text-[#0f172a] bg-white px-2.5 py-1 rounded shadow-md border border-[#cbd5e1]">
            ${pt.timeOffset} · ${pt.windSpeed} km/h · ${pt.surgeHeight}m Surge
          </div>`,
          { permanent: false, direction: 'top' }
        );

        layerGroup.addLayer(markerCircle);
      });
    }

    if (showWindField) {
      const hurricaneRadiusM = (activeTrajectoryPoint.windSpeed / 200) * 85000;
      const galeRadiusM = (activeTrajectoryPoint.windSpeed / 200) * 190000;

      const r64 = L.circle([activeTrajectoryPoint.lat, activeTrajectoryPoint.lng], {
        radius: hurricaneRadiusM,
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '3,3',
      });

      const r34 = L.circle([activeTrajectoryPoint.lat, activeTrajectoryPoint.lng], {
        radius: galeRadiusM,
        color: '#d97706',
        fillColor: '#d97706',
        fillOpacity: 0.08,
        weight: 1,
      });

      layerGroup.addLayer(r34);
      layerGroup.addLayer(r64);
    }

    // Realistic Multi-Polygon Inundation Contours (Bathymetric Estuary Channels)
    if (showSurgeHeatmap) {
      // 1. Paradeep / Mahanadi Estuary Polygon
      const paradeepContour: [number, number][] = [
        [20.15, 86.50],
        [20.25, 86.58],
        [20.35, 86.72],
        [20.40, 86.85],
        [20.32, 86.92],
        [20.22, 86.78],
        [20.12, 86.62],
      ];

      // 2. Sundarbans Delta Channel System
      const sundarbansContour: [number, number][] = [
        [21.65, 88.40],
        [21.95, 88.65],
        [22.25, 89.10],
        [22.15, 89.45],
        [21.75, 89.20],
        [21.55, 88.75],
      ];

      // 3. Dhamra River Basin & Gahirmatha Inundation
      const dhamraContour: [number, number][] = [
        [20.70, 86.85],
        [20.88, 86.95],
        [21.05, 87.15],
        [20.95, 87.25],
        [20.75, 87.05],
      ];

      // 4. Chittagong / Karnaphuli Coastal Inlet
      const chittagongContour: [number, number][] = [
        [21.30, 91.80],
        [21.60, 91.95],
        [21.90, 91.85],
        [21.75, 92.15],
        [21.40, 92.05],
      ];

      const contours = [
        { points: paradeepContour, name: 'Mahanadi-Paradeep Estuary Corridor', depth: activeTrajectoryPoint.surgeHeight },
        { points: sundarbansContour, name: 'Sundarbans Mangrove Intertidal Flood Basin', depth: activeTrajectoryPoint.surgeHeight * 0.92 },
        { points: dhamraContour, name: 'Dhamra Port & Baitarani River Basin', depth: activeTrajectoryPoint.surgeHeight * 0.88 },
        { points: chittagongContour, name: 'Chittagong-Karnaphuli Surge Ingress', depth: activeTrajectoryPoint.surgeHeight * 0.82 },
      ];

      contours.forEach((c) => {
        const color = c.depth > 3.5 ? '#dc2626' : c.depth > 2.0 ? '#d97706' : '#0284c7';
        const poly = L.polygon(c.points, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.38,
        });

        poly.bindTooltip(
          `<div class="font-mono text-xs bg-white border border-[#cbd5e1] text-[#0f172a] px-3 py-1.5 rounded-lg shadow-lg">
            <span class="font-bold text-[#dc2626] uppercase">${c.name}</span><br/>
            Model Inundation Depth: <strong class="text-[#0f172a]">${c.depth.toFixed(1)}m</strong>
          </div>`,
          { permanent: false }
        );

        layerGroup.addLayer(poly);
      });
    }

    if (showSarOverlay) {
      const sarPolygon = L.polygon([
        [18.8, 84.8],
        [22.8, 87.2],
        [22.5, 92.6],
        [18.2, 90.2],
      ], {
        color: '#0f766e',
        weight: 1.5,
        fillColor: '#0f766e',
        fillOpacity: 0.1,
        dashArray: '6,6',
      });

      sarPolygon.bindTooltip(
        '<div class="font-mono text-xs text-[#0f766e] font-semibold bg-white border border-[#cbd5e1] px-2 py-1 rounded shadow-xs">GEE Sentinel-1 SAR Radar Backscatter Extent</div>'
      );

      layerGroup.addLayer(sarPolygon);
    }

    if (showInfrastructure) {
      infrastructure.forEach((item) => {
        const markerColor =
          item.status === 'Inundated'
            ? '#dc2626'
            : item.status === 'At Risk'
            ? '#d97706'
            : '#059669';

        const customHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center shadow-md transition-transform hover:scale-125 cursor-pointer" style="border-color: ${markerColor}">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${markerColor}"></span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-infra-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
          icon,
        });

        marker.on('click', () => {
          onSelectInfrastructure(item);
        });

        marker.bindTooltip(
          `<div class="font-sans text-xs bg-white border border-[#cbd5e1] p-3 rounded-xl shadow-xl text-[#0f172a] max-w-xs">
            <div class="font-bold text-[#0f172a] text-xs">${item.name}</div>
            <div class="text-[10px] text-[#64748b] font-mono mt-0.5">${item.sector} Sector · Elev ${item.elevationMeters}m · <span style="color:${markerColor}" class="font-semibold">${item.status}</span></div>
            <div class="text-[10px] text-[#0f766e] font-mono font-semibold mt-1">Click to open triage & emergency actions →</div>
          </div>`,
          { direction: 'top' }
        );

        layerGroup.addLayer(marker);
      });
    }
  }, [
    mapReady,
    scenario,
    currentTimeOffset,
    showTrack,
    showWindField,
    showSurgeHeatmap,
    showSarOverlay,
    showInfrastructure,
    infrastructure,
  ]);

  return (
    <div className={`relative w-full rounded-2xl border border-[#e2e8f0] bg-[#ffffff] overflow-hidden shadow-sm transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[640px]'}`}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Header HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto">
        <div className="bg-[#ffffff]/95 backdrop-blur-md border border-[#cbd5e1] rounded-xl p-3 text-xs shadow-md">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-1.5 font-bold text-[#0f172a]">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping"></span>
              <span>{scenario.name}</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/20 font-bold">
              {currentTimeOffset}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono mt-2 pt-2 border-t border-[#e2e8f0] text-[11px]">
            <div>
              <span className="text-[#64748b] text-[9px] uppercase block">Peak Wind</span>
              <span className="font-semibold text-[#0f172a]">{activeTrajectoryPoint.windSpeed} <span className="text-[9px] text-[#64748b]">km/h</span></span>
            </div>
            <div>
              <span className="text-[#64748b] text-[9px] uppercase block">Max Surge</span>
              <span className="font-semibold text-[#dc2626]">{activeTrajectoryPoint.surgeHeight} <span className="text-[9px] text-[#64748b]">m</span></span>
            </div>
            <div>
              <span className="text-[#64748b] text-[9px] uppercase block">Pressure</span>
              <span className="font-semibold text-[#0f172a]">{activeTrajectoryPoint.pressure} <span className="text-[9px] text-[#64748b]">hPa</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Layer Controls Panel */}
      <div className="absolute top-4 right-14 z-20 bg-[#ffffff]/95 backdrop-blur-md border border-[#cbd5e1] rounded-xl p-3 text-xs shadow-lg pointer-events-auto hidden sm:block max-w-[220px]">
        <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-[11px] mb-2 uppercase tracking-wider font-mono">
          <Layers className="w-3.5 h-3.5 text-[#0f766e]" />
          <span>GIS Layers</span>
        </div>

        <div className="flex flex-col gap-2 text-[11px]">
          {/* Basemap Switcher */}
          <div className="pb-2 border-b border-[#e2e8f0]">
            <span className="text-[9px] text-[#64748b] uppercase font-mono block mb-1">Basemap Style</span>
            <select
              value={basemapStyle}
              onChange={(e) => setBasemapStyle(e.target.value as any)}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] text-[11px] rounded-lg px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 cursor-pointer shadow-xs"
            >
              <option value="esri_light">Esri Light Canvas (Clean)</option>
              <option value="esri_sat">Esri Satellite Imagery</option>
              <option value="osm">OpenStreetMap Standard</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-[#334155] cursor-pointer hover:text-[#0f172a]">
            <input
              type="checkbox"
              checked={showTrack}
              onChange={(e) => setShowTrack(e.target.checked)}
              className="rounded text-[#0f766e] focus:ring-0"
            />
            <span>Storm Vector & Cone</span>
          </label>

          <label className="flex items-center gap-2 text-[#334155] cursor-pointer hover:text-[#0f172a]">
            <input
              type="checkbox"
              checked={showWindField}
              onChange={(e) => setShowWindField(e.target.checked)}
              className="rounded text-[#0f766e] focus:ring-0"
            />
            <span>Wind Field Radius</span>
          </label>

          <label className="flex items-center gap-2 text-[#334155] cursor-pointer hover:text-[#0f172a]">
            <input
              type="checkbox"
              checked={showSurgeHeatmap}
              onChange={(e) => setShowSurgeHeatmap(e.target.checked)}
              className="rounded text-[#0f766e] focus:ring-0"
            />
            <span>Delta Inundation Contours</span>
          </label>

          <label className="flex items-center gap-2 text-[#334155] cursor-pointer hover:text-[#0f172a]">
            <input
              type="checkbox"
              checked={showSarOverlay}
              onChange={(e) => setShowSarOverlay(e.target.checked)}
              className="rounded text-[#0f766e] focus:ring-0"
            />
            <span>GEE Sentinel-1 SAR Feed</span>
          </label>

          <label className="flex items-center gap-2 text-[#334155] cursor-pointer hover:text-[#0f172a]">
            <input
              type="checkbox"
              checked={showInfrastructure}
              onChange={(e) => setShowInfrastructure(e.target.checked)}
              className="rounded text-[#0f766e] focus:ring-0"
            />
            <span>Critical Infrastructure</span>
          </label>
        </div>
      </div>

      {/* Fullscreen Toggle Button */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-[#ffffff]/90 border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] transition-colors pointer-events-auto shadow-md"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Click Probe Details Drawer */}
      {probeLocation && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-[#ffffff]/95 backdrop-blur-md border border-[#cbd5e1] rounded-2xl p-4 text-xs shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0f766e]">
              <MapPin className="w-4 h-4" />
              <span>Coordinate Hydro Probe</span>
            </div>
            <button
              onClick={() => {
                setProbeLocation(null);
                if (probeMarkerRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(probeMarkerRef.current);
                  probeMarkerRef.current = null;
                }
              }}
              className="text-[#64748b] hover:text-[#0f172a] font-bold px-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2">
            <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[9px] uppercase">GPS Coordinates</span>
              <span className="text-[#0f172a]">{probeLocation.lat}°N, {probeLocation.lng}°E</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[9px] uppercase">Elevation (ASL)</span>
              <span className="text-[#0f172a]">{probeLocation.elevation} m</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[9px] uppercase">Predicted Inundation</span>
              <span className={`font-bold ${probeLocation.surgeDepth > 2.5 ? 'text-[#dc2626]' : 'text-[#d97706]'}`}>
                {probeLocation.surgeDepth} m
              </span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[9px] uppercase">Local Wind Gust</span>
              <span className="text-[#0f172a]">{probeLocation.windSpeed} km/h</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
              <span className="text-[#334155]">Evacuation Status: </span>
              <span className="font-bold text-[#d97706]">{probeLocation.evacuationStatus}</span>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('advisory')}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#0f766e] hover:underline"
              >
                <span>Draft Warning</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="absolute bottom-4 right-4 z-20 bg-[#ffffff]/90 backdrop-blur-md border border-[#cbd5e1] px-3 py-1.5 rounded-xl text-[10px] font-mono text-[#334155] flex items-center gap-4 hidden md:flex shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
          <span>Inundated (&gt;2.5m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
          <span>At Risk (1.0m - 2.5m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
          <span>Operational (&lt;1.0m)</span>
        </div>
      </div>
    </div>
  );
};
