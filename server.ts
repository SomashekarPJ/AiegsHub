import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

// Server-side GoogleGenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// API Route 1: Multimodal Vulnerability Inspection
// Analyzes SAR satellite, drone photos, or shelter images
// -------------------------------------------------------------
app.post('/api/ai/analyze-vulnerability', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, locationContext } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 field is required' });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    };

    const textPart = {
      text: `Context: You are analyzing coastal disaster vulnerability for ${locationContext || 'Bay of Bengal coastal infrastructure'}.
Task: ${prompt || 'Perform a comprehensive structural and hydrological risk evaluation.'}

Provide output in JSON format with the following fields:
1. severityScore: number (0-100 risk score)
2. riskLevel: string ("Critical", "High", "Moderate", "Elevated", "Low")
3. summary: string (2-3 sentences overview)
4. keyVulnerabilities: array of strings (3-5 specific breach or risk points identified)
5. failureMechanisms: array of strings (e.g. "Embankment Piping", "Overtopping Erosion", "Substation Submersion")
6. recommendedActions: array of strings (immediate engineering or evacuation measures)
7. estimatedInundationDepth: string (e.g., "1.8m - 2.4m")
8. populationAtRisk: string (estimated count or density)`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severityScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyVulnerabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            failureMechanisms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedInundationDepth: { type: Type.STRING },
            populationAtRisk: { type: Type.STRING },
          },
          required: [
            'severityScore',
            'riskLevel',
            'summary',
            'keyVulnerabilities',
            'failureMechanisms',
            'recommendedActions',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsedData = JSON.parse(jsonText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in analyze-vulnerability:', error);
    return res.status(500).json({
      error: 'Failed to perform AI vulnerability analysis.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// API Route 2: Early Warning Advisory Dispatch Generator
// Produces official disaster advisory dispatches for authorities
// -------------------------------------------------------------
app.post('/api/ai/generate-advisory', async (req, res) => {
  try {
    const {
      authority,
      cycloneName,
      windSpeed,
      surgeHeight,
      location,
      timeframe,
      language,
    } = req.body;

    const systemPrompt = `You are the lead Disaster Mitigation Intelligence AI for the Bay of Bengal and Coastal APAC Early Warning System.
Generate an official Early Warning Advisory Dispatch for ${authority || 'State Disaster Management Authority'}.
Cyclone Details:
- Name: ${cycloneName || 'Super Cyclone Mitha'}
- Max Wind Speed: ${windSpeed || '220 km/h'}
- Max Storm Surge Inundation: ${surgeHeight || '3.8m'}
- Target Zone: ${location || 'Coastal Odisha & Sundarbans'}
- Time to Landfall: ${timeframe || 'T-24 Hours'}
- Output Language: ${language || 'English'}

Structure the advisory with:
1. Advisory Header (Reference Number, Urgency Level, Target Administrative Districts)
2. Meteorological Snapshot & Physics
3. Mandatory Evacuation Directives (Zone by Zone)
4. Critical Infrastructure Orders (Power grid shutoffs, Port closures, Hospital backup power checks)
5. Public Multilingual Warning Text snippet suitable for SMS/Radio broadcast.
6. Action Checklist for First Responders (NDRF / Coast Guard / CPP Volunteers)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        systemInstruction:
          'Act as an authoritative hydro-meteorological disaster response expert producing official emergency dispatches.',
      },
    });

    return res.json({ dispatchText: response.text });
  } catch (error: any) {
    console.error('Error in generate-advisory:', error);
    return res.status(500).json({
      error: 'Failed to generate advisory dispatch.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// API Route 3: Surge Pathway Simulation & Cascade Reasoning
// Computes damage pathways for given storm physics
// -------------------------------------------------------------
app.post('/api/ai/simulate-surge-pathway', async (req, res) => {
  try {
    const { scenarioName, windSpeed, centralPressure, surgeDepth, tideOffset } =
      req.body;

    const prompt = `Perform hydrological surge pathway modeling and cascading failure calculation for:
Scenario: ${scenarioName}
Wind Speed: ${windSpeed} km/h
Central Pressure: ${centralPressure} hPa
Max Surge Depth: ${surgeDepth} m
High Tide Alignment: ${tideOffset}

Return JSON with:
1. cascadeSequence: Array of objects with time ('T-12h', 'T-6h', 'T-0h', 'T+6h'), event, sector ('Energy', 'Transport', 'Healthcare', 'Water'), impactSeverity ('Critical', 'High', 'Moderate')
2. primaryFloodCorridors: Array of strings describing geographical water breaching channels
3. highRiskSubstations: Array of strings
4. estimatedRecoveryHours: number
5. economicLossEstimateMillionsUSD: number`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cascadeSequence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  event: { type: Type.STRING },
                  sector: { type: Type.STRING },
                  impactSeverity: { type: Type.STRING },
                },
                required: ['time', 'event', 'sector', 'impactSeverity'],
              },
            },
            primaryFloodCorridors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            highRiskSubstations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedRecoveryHours: { type: Type.NUMBER },
            economicLossEstimateMillionsUSD: { type: Type.NUMBER },
          },
          required: [
            'cascadeSequence',
            'primaryFloodCorridors',
            'highRiskSubstations',
            'estimatedRecoveryHours',
            'economicLossEstimateMillionsUSD',
          ],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in simulate-surge-pathway:', error);
    return res.status(500).json({
      error: 'Failed to simulate surge pathway.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// API Route 4: Parametric Insurance Audit Verification
// Evaluates parameters and executes automated liquidity payout proof
// -------------------------------------------------------------
app.post('/api/ai/parametric-audit', async (req, res) => {
  try {
    const { contractId, observedWind, observedSurge, observedPressure } =
      req.body;

    const prompt = `Evaluate parametric catastrophe insurance trigger compliance:
Contract ID: ${contractId}
Observed Peak Wind: ${observedWind} km/h
Observed Max Surge Inundation: ${observedSurge} m
Observed Minimum Central Pressure: ${observedPressure} hPa

Return JSON:
1. triggersFired: boolean
2. matchedConditions: array of strings showing which thresholds were crossed
3. totalPayoutUSD: number
4. allocationBreakdown: array of objects { recipient: string, category: string, amountUSD: number }
5. smartContractStatus: string ("EXECUTED_PAYOUT_SETTLED", "PENDING_TELEMETRY_CONFIRMATION", "TRIGGER_NOT_MET")
6. legalAuditSummary: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triggersFired: { type: Type.BOOLEAN },
            matchedConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            totalPayoutUSD: { type: Type.NUMBER },
            allocationBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  recipient: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amountUSD: { type: Type.NUMBER },
                },
                required: ['recipient', 'category', 'amountUSD'],
              },
            },
            smartContractStatus: { type: Type.STRING },
            legalAuditSummary: { type: Type.STRING },
          },
          required: [
            'triggersFired',
            'matchedConditions',
            'totalPayoutUSD',
            'allocationBreakdown',
            'smartContractStatus',
            'legalAuditSummary',
          ],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in parametric-audit:', error);
    return res.status(500).json({
      error: 'Failed to process parametric insurance audit.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// API Route 5: Official Situation Report (SITREP) Generator
// Compiles hydro-meteorological, lifeline, and evacuation SITREP
// -------------------------------------------------------------
app.post('/api/ai/generate-sitrep', async (req, res) => {
  try {
    const { scenario, timeOffset, impactedAssets, totalExposedUSD } = req.body;

    const prompt = `You are the Lead Situation Assessment Officer for the State Emergency Operation Centre (SEOC) and UN OCHA Disaster Coordination.
Generate an official Situation Report (SITREP #04) based on real-time hydro-meteorological simulation:

Cyclone: ${scenario?.name || 'Super Cyclone Mitha'}
Intensity Category: ${scenario?.category || 'Category 5 Super Cyclonic Storm'}
Landfall Location: ${scenario?.landfallTarget || 'Paradeep / Dhamra Coast, Odisha'}
Current Operational Phase: ${timeOffset || 'T-12h'} (ETA: ${scenario?.timeToLandfall || '12 Hours'})
Central Pressure: ${scenario?.centralPressure || 918} hPa
Max Sustained Wind: ${scenario?.maxWindSpeed || 235} km/h
Peak Surge Inundation: ${scenario?.peakSurgeHeight || 4.2} m
Estimated Asset Exposure: $${((totalExposedUSD || 380000000) / 1000000).toFixed(1)} Million USD
Key Critical Infrastructure at Risk: ${(impactedAssets || []).slice(0, 5).map((a: any) => `${a.name} (${a.status}, Elev ${a.elevationMeters}m)`).join('; ')}

Format the SITREP with high precision:
1. SITUATION OVERVIEW & EXECUTIVE BRIEFING
2. HYDROLOGICAL & METEOROLOGICAL TELEMETRY
3. SECTORAL IMPACT & CRITICAL INFRASTRUCTURE STATUS (Power, Transport, Medical, Water)
4. POPULATION EVACUATION & SHELTER OCCUPANCY
5. PARAMETRIC CONTINGENCY FUNDING & FIRST-RESPONDER LOGISTICS
6. IMMEDIATE PRIORITY ACTION DIRECTIVES (Next 12-24 Hours)
7. SIGN-OFF / AUTHORIZATION BLOCK`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Act as an authoritative disaster response coordinator generating formal, high-fidelity government SITREP documents.',
      },
    });

    return res.json({ sitrepText: response.text });
  } catch (error: any) {
    console.error('Error in generate-sitrep:', error);
    return res.status(500).json({
      error: 'Failed to generate SITREP report.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// API Route 6: OASIS CAP v1.2 XML Broadcast Generator
// Generates standard Common Alerting Protocol XML for sirens/SMS
// -------------------------------------------------------------
app.post('/api/ai/generate-cap-xml', async (req, res) => {
  try {
    const { scenario, timeOffset, targetArea } = req.body;

    const prompt = `Generate a valid, standards-compliant OASIS Common Alerting Protocol (CAP v1.2) XML payload for:
Cyclone: ${scenario?.name || 'Super Cyclone Mitha'}
Severity: Extreme / Immediate
Event: Cyclone Storm Surge Inundation & Destructive Winds
Urgency: Immediate
Certainty: Observed / Likely
Target Geographic Area: ${targetArea || scenario?.landfallTarget || 'Coastal Odisha, India'}
Time Horizon: ${timeOffset || 'T-12h'}

Include full <alert>, <info>, <area>, <circle> or <polygon>, and multilingual alert text elements. Return strictly valid CAP XML.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let capXml = response.text || '';
    // Strip markdown code fences if present
    capXml = capXml.replace(/```xml/gi, '').replace(/```/g, '').trim();

    return res.json({ capXml });
  } catch (error: any) {
    console.error('Error in generate-cap-xml:', error);
    return res.status(500).json({
      error: 'Failed to generate CAP XML broadcast.',
      details: error.message,
    });
  }
});

// Vite middleware in development vs static serving in production
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve(__dirname, 'index.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[AegisSurge Server] running on http://0.0.0.0:${PORT}`);
});
