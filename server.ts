import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { planContentSchema } from "./src/domain/schemas/planSchema";
import {
  PLANNING_MODEL,
  PLANNING_PROMPT_VERSION,
  PLANNING_RULES_VERSION,
  planningRequestSchema,
} from "./src/planning/contracts";
import { generateRulesBasedPlanEnvelope } from "./src/planning/fallbackPlan";
import { buildPlanningSafetyInstructions } from "./src/planning/safety";
import { assertPlanningOutputSafe } from "./src/planning/outputSafety";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate-plan", async (req, res) => {
    const parsedRequest = planningRequestSchema.safeParse(req.body || {});
    const generatedAt = new Date().toISOString();

    if (!parsedRequest.success) {
      res.status(400).json({
        ok: false,
        data: null,
        origin: "RULES_BASED_FALLBACK",
        promptVersion: PLANNING_PROMPT_VERSION,
        rulesVersion: PLANNING_RULES_VERSION,
        warnings: ["The planning request was incomplete or invalid. The saved record remains available for user-authored planning."],
        generatedAt,
        errorCode: "INVALID_REQUEST",
      });
      return;
    }

    const input = parsedRequest.data;

    try {
      const prompt = `
You are PrintPal 3D's bounded planning assistant for a technically capable 3D printing hobbyist or prosumer.

Saved Record Context:
- Project / Print Name: ${input.projectName}
- Print Intent: ${input.printGoal}
- Printer Technology: ${input.printerTech}
- Printer Name / Model: ${input.printerName || "Not specified"}
- Material or Resin: ${input.material}
- Print Purpose: ${input.purpose}
- Planning Emphasis: ${input.priority || "Meet the saved success criteria"}
- Known Concerns: ${input.concerns.join(", ") || "None recorded"}
- Success Criteria: ${input.successCriteria.join("; ") || "Not recorded"}
- User-Provided Source References: ${input.sourceReferenceSummaries.join("; ") || "None attached"}
- Additional User Context: ${input.notes || "None"}

Create a structured planning view. Separate assumptions from missing information. Include source-verification prompts only for authoritative source categories or source references explicitly supplied by the user. Do not claim to have opened or verified any document.

Safety And Source Rules:
- ${buildPlanningSafetyInstructions()}

Return JSON with exactly these fields:
- objectiveSummary: string
- readinessConsiderations: string[]
- printerWatchOuts: string[]
- materialWatchOuts: string[]
- assumptions: string[]
- missingInformation: string[]
- sourceChecks: string[]
- variablesToRecord: string[]
- expectedOutcomeCriteria: string[]
`;

      const response = await ai.models.generateContent({
        model: PLANNING_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objectiveSummary: { type: Type.STRING },
              readinessConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } },
              printerWatchOuts: { type: Type.ARRAY, items: { type: Type.STRING } },
              materialWatchOuts: { type: Type.ARRAY, items: { type: Type.STRING } },
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
              sourceChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              variablesToRecord: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedOutcomeCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "objectiveSummary",
              "readinessConsiderations",
              "printerWatchOuts",
              "materialWatchOuts",
              "assumptions",
              "missingInformation",
              "sourceChecks",
              "variablesToRecord",
              "expectedOutcomeCriteria",
            ],
          },
        },
      });

      const data = assertPlanningOutputSafe(planContentSchema.parse(JSON.parse(response.text?.trim() || "{}")));
      res.json({
        ok: true,
        data,
        origin: "AI_ASSISTED",
        model: PLANNING_MODEL,
        promptVersion: PLANNING_PROMPT_VERSION,
        rulesVersion: PLANNING_RULES_VERSION,
        warnings: [],
        generatedAt,
      });
    } catch {
      res.json(
        generateRulesBasedPlanEnvelope(input, {
          generatedAt,
          warning: "Gemini was unavailable or its output could not be validated. A labeled rules-based planning draft was generated.",
          errorCode: "AI_UNAVAILABLE_OR_INVALID",
        }),
      );
    }
  });

  app.post("/api/generate-failure-review", async (req, res) => {
    try {
      const { whatHappened, printerTech, material, whenAppeared, whatChanged, photosAvailable, whatTried } = req.body || {};

      const prompt = `
You are a thoughtful, friendly AI assistant helping a 3D printing hobbyist review a failed print.

User Inputs:
- What happened?: ${whatHappened}
- Printer Technology: ${printerTech}
- Material / Resin: ${material}
- When issue appeared: ${whenAppeared}
- What changed since last success: ${whatChanged}
- Photos available: ${photosAvailable}
- What user tried: ${whatTried}

Generate a cautious troubleshooting frame. Guidelines:
- Do NOT diagnose from images.
- Do NOT give repair instructions.
- Do NOT provide firmware, electrical, or hazardous-modification guidance.
- Do NOT provide procedural hazardous-material instructions.
- Do NOT provide resin wash/cure procedures as instructions.
- Do NOT prescribe PPE as a universal instruction; instead say to verify resin/material SDS and manufacturer handling guidance.
- Do NOT prescribe solvents, cleaning agents, curing workflows, exposure workflows, or disposal steps.
- Do NOT provide universal slicer, temperature, speed, exposure, layer height, wash, cure, support-density, or hardware-specific values.
- Frame resin, material, slicer, and post-processing content as "verify", "review", "document", or "check against official guidance".
- Manufacturer documentation, slicer documentation, material profiles, Technical Data Sheets, Safety Data Sheets, and printer manuals override PrintPal output.
- Focus on safe documentation and what to check in manufacturer docs next.

Return a JSON object with exactly:
- "likelyAreasToCheck": Array of strings (e.g. settings or physical factors to verify against manuals).
- "missingContext": Array of strings (what info is missing to make a better plan).
- "nextSafeDocumentationStep": A single string advising what they should write down or test next safely.
- "sourceCheckReminder": A single string reminding them to check specific manuals or data sheets.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              likelyAreasToCheck: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingContext: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextSafeDocumentationStep: { type: Type.STRING },
              sourceCheckReminder: { type: Type.STRING },
            },
            required: ["likelyAreasToCheck", "missingContext", "nextSafeDocumentationStep", "sourceCheckReminder"]
          }
        }
      });

      res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (error: any) {
      res.json({
        likelyAreasToCheck: ["Hardware configuration", "Slicer settings", "Material condition"],
        missingContext: ["Specific slicer values used", "Exact environmental conditions"],
        nextSafeDocumentationStep: "Document all current machine and slicer settings before making any changes.",
        sourceCheckReminder: "Check your printer's manual and material's TDS for standard baselines."
      });
    }
  });

  app.post("/api/generate-material-context", async (req, res) => {
    try {
      const { material, purpose, property, concerns } = req.body || {};

      const prompt = `
You are a thoughtful, friendly AI assistant helping a 3D printing hobbyist review material options.

User Inputs:
- Material/Resin: ${material}
- Print Purpose: ${purpose}
- Property that matters most: ${property}
- Environmental/Safety concerns: ${concerns}

Generate a cautious material context overview. Guidelines:
- Do NOT provide universal hard values for temperatures, speeds, exposure times, layer heights, wash/cure times, support-density, slicer settings, or hardware-specific values.
- Do NOT provide procedural hazardous-material instructions.
- Do NOT provide resin wash/cure procedures as instructions.
- Do NOT prescribe PPE as a universal instruction; instead say to verify resin/material SDS and manufacturer handling guidance.
- Do NOT prescribe solvents, cleaning agents, curing workflows, exposure workflows, or disposal steps.
- Frame resin, material, slicer, and post-processing content as "verify", "review", "document", or "check against official guidance".
- Manufacturer documentation, slicer documentation, material profiles, Technical Data Sheets, Safety Data Sheets, and printer manuals override PrintPal output.
- Be advisory, telling the user what to verify.
- Emphasize checking TDS and SDS.

Return a JSON object with exactly:
- "questionsToVerify": Array of strings (important questions the user should answer for themselves).
- "sourceDocsToCheck": Array of strings (what docs they need to find, e.g. "Brand X TDS").
- "materialBehavior": Array of strings (known characteristics of the material to watch out for).
- "documentationPrompts": Array of strings (what to document during their first test print).
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionsToVerify: { type: Type.ARRAY, items: { type: Type.STRING } },
              sourceDocsToCheck: { type: Type.ARRAY, items: { type: Type.STRING } },
              materialBehavior: { type: Type.ARRAY, items: { type: Type.STRING } },
              documentationPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["questionsToVerify", "sourceDocsToCheck", "materialBehavior", "documentationPrompts"]
          }
        }
      });

      res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (error: any) {
      res.json({
        questionsToVerify: ["Is your environment suitable for this material?", "Do you have the necessary ventilation?"],
        sourceDocsToCheck: ["Technical Data Sheet (TDS)", "Safety Data Sheet (SDS)"],
        materialBehavior: ["Review manufacturer guidance for warp, shrinkage, and adhesion tendencies."],
        documentationPrompts: ["Record ambient temperature.", "Record initial layer success.", "Note post-processing required."]
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
