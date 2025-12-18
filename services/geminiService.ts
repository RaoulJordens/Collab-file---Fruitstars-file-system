

import { GoogleGenAI, Type } from "@google/genai";
import type { Folder, Label } from '../types';
import { allLabels } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

function getSimpleFolderStructure(folder: Folder, path: string = ''): {id: string, path: string}[] {
  const currentPath = path ? `${path} > ${folder.name}` : folder.name;
  let structure = [{ id: folder.id, path: currentPath }];
  for (const sub of folder.subFolders) {
    structure = structure.concat(getSimpleFolderStructure(sub, currentPath));
  }
  return structure;
}

export async function suggestFilePlacement(
  fileName: string, 
  fileType: string,
  rootFolder: Folder
): Promise<{ suggestedFolderId: string | null; suggestedLabel: Label | null; }> {
  if (!ai) {
    throw new Error("Gemini API is not configured. Please set the API_KEY.");
  }
  
  const model = "gemini-2.5-flash";
  const folderStructure = getSimpleFolderStructure(rootFolder);

  const prompt = `
    You are an expert file organization assistant for a fruit import/export company called "Fruitstars".
    Your task is to suggest the best folder and label for a new file.

    File details:
    - Name: "${fileName}"
    - Type: "${fileType}"

    Here are the available folders. Only choose a folder from this list:
    ${JSON.stringify(folderStructure, null, 2)}

    Here are the available labels. Only choose a label from this list:
    ${JSON.stringify(allLabels.map(l => ({id: l.id, name: l.name, category: l.category})), null, 2)}

    Analyze the file name and type. Based on common document patterns in a fruit import/export business, determine the most appropriate folder and label.
    - If the file is a certificate like "GlobalGap", it belongs in a specific 'Supplier' folder.
    - If the file is a shipping document like "Bill of Lading" or involves an invoice number, it belongs in a specific 'Shipments' sub-folder (dossier).
    - If the file is a company profile, it could be for a 'Client' or 'Supplier'.
    - If no specific label fits, use the 'Other' label.

    Respond with a single, clean JSON object with the keys "suggestedFolderId" and "suggestedLabelId". Do not add any commentary or markdown formatting.
    For example: {"suggestedFolderId": "f2-1", "suggestedLabelId": "l-s-5"}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                suggestedFolderId: { type: Type.STRING },
                suggestedLabelId: { type: Type.STRING }
            },
            required: ['suggestedFolderId', 'suggestedLabelId']
        }
      }
    });
    
    // FIX: Per Gemini API guidelines, response.text is a getter property, not a function.
    const text = response.text;
    if (!text) {
        throw new Error("Empty response from AI.");
    }
    
    const result = JSON.parse(text.trim());

    const suggestedLabel = allLabels.find(l => l.id === result.suggestedLabelId) || null;
    
    return {
      suggestedFolderId: result.suggestedFolderId || null,
      suggestedLabel: suggestedLabel,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get AI suggestion.");
  }
}