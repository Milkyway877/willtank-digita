import { OpenAI } from 'openai';
import { InsertWillDocument } from '@shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for suggested document information
interface SuggestedDocument {
  filename: string;
  description: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Extract document suggestions from a conversation about a will
 * 
 * @param willId The will ID to associate with extracted documents
 * @param userId The user ID to associate with extracted documents
 * @param messages Array of conversation messages to analyze
 * @returns Array of document objects that should be suggested to the user
 */
export async function suggestDocumentsFromConversation(
  willId: number,
  userId: number,
  messages: { role: string; content: string }[]
): Promise<SuggestedDocument[]> {
  try {
    // Get content from all messages to provide context
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    if (!conversationText) {
      return [];
    }

    // Prepare prompt for document suggestions
    const prompt = `
      Based on the following conversation about a will, suggest relevant documents that should be attached to the will.
      
      Conversation:
      ${conversationText}
      
      For each document you suggest, provide:
      - filename: A descriptive filename (e.g., "property-deed-123-main-st.pdf")
      - description: A clear description of what the document is
      - category: One of "property", "financial", "identity", "medical", "insurance", "legal", or "other"
      - importance: Level of importance, one of "high", "medium", or "low"
      
      Format your response as a valid JSON array of document objects with the fields above.
      If no documents seem relevant, return an empty array.
      Don't include any explanations or text outside the JSON array.
    `;

    // Call OpenAI completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a precise document suggestion tool that only returns valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    return parsedResponse.documents || [];

  } catch (error) {
    console.error('Error suggesting documents:', error);
    return [];
  }
}

/**
 * Format suggested documents for the frontend
 * This doesn't actually create documents but returns properly formatted objects
 * for the UI to display as suggestions to the user
 */
/**
 * Format document suggestions to match the expected schema
 * Note: Since these are just suggestions, we're providing placeholder values for required fields
 */
export function formatDocumentSuggestions(
  willId: number,
  userId: number,
  suggestedDocs: SuggestedDocument[]
): Partial<InsertWillDocument>[] {
  return suggestedDocs.map(doc => ({
    willId,
    userId,
    name: doc.filename,
    fileName: doc.filename,
    fileType: 'application/octet-stream', // Placeholder since this is a suggestion
    description: doc.description,
    category: doc.category,
    // These would normally be required but we're not saving to DB so they're omitted
    // fileSize and fileUrl would need to be provided for actual document creation
    isSuggestion: true, // Custom field to mark as suggestion only
  }));
}