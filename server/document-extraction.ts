import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Interface for document suggestion
export interface DocumentSuggestion {
  documentType: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Extract document suggestions from will content
 * @param willContent The content of the will document
 * @returns Array of suggested documents
 */
export async function extractDocumentSuggestions(willContent: string): Promise<DocumentSuggestion[]> {
  try {
    // Skip extraction if content is too short
    if (!willContent || willContent.length < 100) {
      return [];
    }

    // Initialize OpenAI prompt
    const systemPrompt = {
      role: "system", 
      content: `You are a specialized AI for estate planning document analysis. Your task is to analyze will content and identify supporting documents that would be important to include with the will.

      For the given will content:
      1. Identify specific assets mentioned (real estate, vehicles, financial accounts, businesses, etc.)
      2. Identify specific arrangements (guardianship, trusts, special bequests, etc.)
      3. Recommend supporting documents that should be included with the will.
      4. Format your response as valid JSON with an array of document suggestions:
      
      {
        "suggestions": [
          {
            "documentType": "Document Category/Type",
            "description": "Specific description of the document",
            "importance": "high|medium|low",
            "reason": "Why this document is important for this will"
          }
        ]
      }
      
      Common document types include: 
      - Property deeds
      - Vehicle titles
      - Financial account statements
      - Business ownership documents
      - Insurance policies
      - Birth certificates
      - Marriage certificates
      - Tax returns
      - Medical directives
      - Power of attorney documents

      Focus only on documents specifically relevant to assets or arrangements mentioned in the will.`
    };

    // Create message array
    const messages = [
      systemPrompt,
      {
        role: "user",
        content: `Please analyze this will content and suggest supporting documents that should be included:\n\n${willContent}`
      }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    // Extract suggested documents
    return jsonResponse.suggestions || [];

  } catch (error) {
    console.error("Error extracting document suggestions:", error);
    return [];
  }
}

/**
 * Creates an AI prompt to ask users to upload specific documents
 * @param suggestions Array of document suggestions
 * @returns A prompt for Skyler to ask the user to upload documents
 */
export function createDocumentUploadPrompt(suggestions: DocumentSuggestion[]): string {
  if (!suggestions || suggestions.length === 0) {
    return "Based on your will, you might want to upload supporting documents like property deeds, financial statements, or other important papers. These documents will help ensure your will can be properly executed.";
  }

  // Sort by importance (high first)
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  // Take only top 3-5 suggestions to avoid overwhelming the user
  const topSuggestions = sortedSuggestions.slice(0, Math.min(5, sortedSuggestions.length));
  
  let prompt = "Based on your will, I recommend uploading the following supporting documents:\n\n";
  
  topSuggestions.forEach((suggestion, index) => {
    prompt += `${index + 1}. **${suggestion.documentType}**: ${suggestion.description}${suggestion.importance === 'high' ? ' (Important)' : ''}\n`;
  });
  
  prompt += "\nWould you like to upload any of these documents now?";
  
  return prompt;
}