import { OpenAI } from 'openai';
import { InsertWillContact } from '@shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for extracted contact information
interface ExtractedContact {
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  role: 'beneficiary' | 'executor' | 'witness' | 'other';
  notes?: string;
}

/**
 * Extract contacts from a conversation by analyzing Skyler's responses
 * 
 * @param willId The will ID to associate with extracted contacts
 * @param userId The user ID to associate with extracted contacts
 * @param messages Array of conversation messages to analyze
 * @returns Array of contact objects ready to be inserted into the database
 */
export async function extractContactsFromConversation(
  willId: number,
  userId: number,
  messages: { role: string; content: string }[]
): Promise<InsertWillContact[]> {
  try {
    // Get content from assistant messages only
    const assistantMessages = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n');

    if (!assistantMessages) {
      return [];
    }

    // Prepare prompt for contact extraction
    const prompt = `
      Based on the following conversation with a user about their will, identify all people mentioned who are relevant to the will.
      Extract each person as a separate contact with as much detail as available.
      
      Conversation:
      ${assistantMessages}
      
      For each person mentioned, extract the following information:
      - name (required): The person's full name
      - relationship (required): The relationship to the will creator (e.g., spouse, child, friend)
      - email (optional): Email address if mentioned
      - phone (optional): Phone number if mentioned
      - address (optional): Physical address if mentioned
      - country (optional): Country of residence if mentioned
      - role (required): Must be one of 'beneficiary', 'executor', 'witness', or 'other'
      - notes (optional): Any additional details about this person
      
      Format your response as a valid JSON array of contact objects with the fields above.
      If no contacts are mentioned, return an empty array.
      Don't include any explanations or text outside the JSON array.
    `;

    // Call OpenAI completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a precise contact extraction tool that only returns valid JSON." },
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
    const extractedContacts: ExtractedContact[] = parsedResponse.contacts || [];

    // Convert to InsertWillContact format and add willId and userId
    return extractedContacts.map(contact => ({
      willId,
      userId,
      name: contact.name,
      relationship: contact.relationship || 'unknown',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      country: contact.country || '',
      role: contact.role || 'other',
      notes: contact.notes || '',
    }));

  } catch (error) {
    console.error('Error extracting contacts:', error);
    return [];
  }
}