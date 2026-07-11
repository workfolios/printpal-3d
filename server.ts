import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function generateFallbackCard(inputs: any) {
  const {
    projectName,
    printGoal,
    printerTech,
    printerName,
    material,
    purpose,
    priority,
    concerns,
    notes
  } = inputs;

  let techConsiderations = "Verify manufacturer guidelines for your selected technology.";
  if (printerTech === "Bed Slinger FDM") {
    techConsiderations = "Bed Slingers have a moving Y-axis. Consider part orientation to minimize wobble and ensure adequate bed adhesion.";
  } else if (printerTech === "CoreXY / Enclosed FDM") {
    techConsiderations = "Enclosed CoreXY systems manage heat well, but ensure the ambient temperature does not cause heat creep in the hotend.";
  } else if (printerTech === "LCD Resin" || printerTech === "SLA Resin" || printerTech === "DLP Resin") {
    techConsiderations = "Resin printing requires careful handling. Ensure your vat, build platform, and resin condition are optimal, and verify manufacturer post-processing workflows.";
  }

  const baseAssumptions = [
    !printerName && "Printer model was not specified.",
    "Exact material brand is unknown.",
    "Slicer profile, environmental conditions, and end-use requirements are assumed to be standard unless specified.",
    notes ? `Note provided: "${notes}". Further specifics may need verification.` : null
  ].filter(Boolean) as string[];

  const readinessChecklist = [
    "Verify the build surface is clean and ready.",
    "Check that your material/resin is in good condition.",
    "Compare your slicer settings to the manufacturer recommendations."
  ];

  if (notes) {
    readinessChecklist.push("Review your additional notes against official documentation before proceeding.");
  }

  return {
    quickRead: `You are printing "${projectName || 'a project'}" in ${material || 'the selected material'} with a focus on ${priority || 'the main priority'}. The goal is to produce a ${purpose ? purpose.toLowerCase() : 'custom'} part for: ${printGoal || 'your stated purpose'}. Please proceed cautiously and follow standard preparations.`,
    printerTechConsiderations: techConsiderations,
    materialWatchOuts: `For ${material || 'this material'}, always consult the manufacturer's Technical Data Sheet for optimal handling and environmental requirements. Watch for moisture or deterioration.`,
    riskFlags: [
      `Priority is ${priority || 'noted'}, which may require tuning specific slicer parameters.`,
      ...(concerns || []).map((c: string) => `Monitored concern: ${c}. Review slicing strategy for this area.`)
    ],
    readinessChecklist,
    postPrintNotes: [
      "Allow parts to cool or drain completely before removal.",
      "Follow safe handling procedures during post-processing and cleanup.",
      "Avoid rushing support removal to prevent part damage."
    ],
    whatToDocument: [
      "Document the ambient temperature and humidity.",
      "Note the exact material brand and color used.",
      "Record any anomalies during the first layers."
    ],
    assumptionsAndGaps: baseAssumptions.length > 0 ? baseAssumptions : ["No major missing information detected."],
    friendlyNote: "Planning is the best way to avoid failed prints. Take your time setting up, and happy printing!"
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate-plan", async (req, res) => {
    try {
      const body = req.body || {};
      const {
        projectName,
        printGoal,
        printerTech,
        printerName,
        material,
        purpose,
        priority,
        concerns,
        notes
      } = body;

      const prompt = `
You are a thoughtful, friendly AI assistant for a technically capable 3D printing hobbyist. They are using your help to plan a 3D print.

User Inputs:
- Project / Print Name: ${projectName}
- What are you trying to print?: ${printGoal}
- Printer Technology: ${printerTech}
- Printer Name / Model: ${printerName || "Not specified"}
- Material or Resin: ${material}
- Print Purpose: ${purpose}
- Top Priority: ${priority}
- Known Concerns: ${(concerns || []).join(", ") || "None selected"}
- Additional Notes: ${notes || "None"}

Please generate a detailed Print Planning Card based on these inputs. Follow these strict guidelines:
- Be clear, practical, and cautious.
- Do NOT provide universal hard values for temperatures, speeds, exposure times, wash/cure times, layer heights, support-density, slicer settings, or hardware-specific values.
- Do NOT provide advice on electrical wiring, firmware changes, printer modifications, or hazardous chemical procedures.
- Do NOT provide resin wash/cure procedures as instructions.
- Do NOT prescribe solvents, cleaning agents, curing workflows, exposure workflows, or disposal steps.
- Do NOT prescribe PPE as a universal instruction; instead say to verify resin/material SDS and manufacturer handling guidance.
- Frame resin, material, slicer, and post-processing content as "verify", "review", "document", or "check against official guidance".
- Manufacturer documentation, slicer documentation, material profiles, Technical Data Sheets, Safety Data Sheets, and printer manuals override PrintPal output.
- Do NOT claim parts are load-bearing, food-safe, watertight, chemically resistant, etc.
- Remind the user to consult manufacturer data sheets and manual recommendations.
- Keep the tone calm, professional but friendly, not a gaming/hacker site.

Return a JSON object with exactly these fields:
- "quickRead": A 2-3 sentence overview of the plan and major watch-outs.
- "printerTechConsiderations": Considerations specific to the selected printer technology. (String)
- "materialWatchOuts": Things to watch out for with the specified material/resin. (String)
- "riskFlags": An array of strings identifying the largest risks for this print.
- "readinessChecklist": An array of strings describing practical preparation checks.
- "postPrintNotes": An array of strings with safe post-processing thoughts.
- "whatToDocument": An array of strings describing what to record after printing.
- "assumptionsAndGaps": An array of strings identifying information that is missing or assumed.
- "friendlyNote": A short encouraging or grounding sign-off note.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quickRead: { type: Type.STRING },
              printerTechConsiderations: { type: Type.STRING },
              materialWatchOuts: { type: Type.STRING },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              readinessChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              postPrintNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
              whatToDocument: { type: Type.ARRAY, items: { type: Type.STRING } },
              assumptionsAndGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              friendlyNote: { type: Type.STRING },
            },
            required: [
              "quickRead", "printerTechConsiderations", "materialWatchOuts", 
              "riskFlags", "readinessChecklist", "postPrintNotes", 
              "whatToDocument", "assumptionsAndGaps", "friendlyNote"
            ]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json(data);
    } catch (error: any) {
      const fallbackCard = generateFallbackCard(req.body);
      res.json(fallbackCard);
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
