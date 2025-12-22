
import { GoogleGenAI, Type } from "@google/genai";
import type { Folder, Label } from '../types';
import { allLabels } from '../constants';

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Upgrade to Gemini 3 Flash for better reasoning in logistics
  const model = "gemini-3-flash-preview";
  const folderStructure = getSimpleFolderStructure(rootFolder);

  const prompt = `
    You are an expert file organization assistant for a fruit import/export company called "Fruitstars".
    Analyze the following file and suggest the best folder and label from the provided lists.

    File details:
    - Name: "${fileName}"
    - Type: "${fileType}"

    Folders:
    ${JSON.stringify(folderStructure.slice(0, 100))}

    Labels:
    ${JSON.stringify(allLabels.map(l => ({id: l.id, name: l.name, category: l.category})))}

    Instructions:
    - Documents mentioning "GlobalGap", "Grasp", or "Smeta" belong in specific Supplier folders.
    - Documents with invoice numbers, container numbers (e.g. MSKU...), or "Bill of Lading" belong in Shipment Dossiers.
    - Use "Other" if no specific label matches perfectly.

    Respond ONLY in JSON.
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
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI.");
    
    const result = JSON.parse(text.trim());
    const suggestedLabel = allLabels.find(l => l.id === result.suggestedLabelId) || null;
    
    return {
      suggestedFolderId: result.suggestedFolderId || null,
      suggestedLabel: suggestedLabel,
    };

  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return { suggestedFolderId: null, suggestedLabel: null };
  }
}
