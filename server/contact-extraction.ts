import OpenAI from "openai";
import { db } from "./db";
import { willContacts } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Contact extraction interface
interface ExtractedContact {
  name: string;
  relationship: string;
  role: 'beneficiary' | 'executor' | 'witness' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/**
 * Extract contacts from a conversation with Skyler
 * @param conversation The conversation history between the user and Skyler
 * @returns Array of extracted contacts
 */
export async function extractContactsFromConversation(conversation: Array<{ role: string, content: string }>): Promise<ExtractedContact[]> {
  try {
    // Initialize OpenAI prompt for contact extraction
    const systemPrompt = {
      role: "system", 
      content: `You are a specialized AI designed to extract contact information from conversations about wills and estate planning.
      
      1. Identify all people mentioned in the conversation.
      2. Categorize each person's role (beneficiary, executor, witness, or other).
      3. Extract any available contact details (name, relationship, email, phone, address).
      4. Infer the relationship to the will creator when mentioned.
      5. Format response as valid JSON with an array of objects containing: 
         {
           "name": "Full Name",
           "relationship": "Relationship to will creator",
           "role": "beneficiary|executor|witness|other",
           "email": "email@example.com", (if available)
           "phone": "phone number", (if available)
           "address": "physical address", (if available)
           "notes": "any additional information" (if available)
         }
      6. Only include people who are explicitly mentioned as beneficiaries, executors, witnesses or who will receive assets.
      7. Do not include the will creator themselves.

      Return an empty array if no contacts are found.`
    };

    // Create conversation messages
    const messages = [
      systemPrompt,
      ...conversation.filter(msg => msg.role === 'user' || msg.role === 'assistant'),
      {
        role: "user",
        content: "Based on our conversation about my will, please extract all the contacts I've mentioned including any beneficiaries, executors, or witnesses. Format the response as JSON."
      }
    ];

    // Call OpenAI API with response format set to JSON
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");

    // Extract contacts array from response
    const extractedContacts = jsonResponse.contacts || [];
    return extractedContacts as ExtractedContact[];

  } catch (error) {
    console.error("Error extracting contacts from conversation:", error);
    return [];
  }
}

/**
 * Process extracted contacts and save them to the database
 * @param willId The ID of the will
 * @param userId The ID of the user
 * @param contacts The extracted contacts
 * @returns Array of saved contact IDs
 */
export async function processAndSaveContacts(willId: number, userId: number, contacts: ExtractedContact[]): Promise<number[]> {
  try {
    // Array to store IDs of saved contacts
    const savedContactIds: number[] = [];

    // Process each contact
    for (const contact of contacts) {
      // Skip contacts without a name
      if (!contact.name) continue;

      try {
        // Insert contact into database
        const inserted = await db.insert(willContacts).values({
          willId,
          userId,
          name: contact.name,
          relationship: contact.relationship || "",
          role: contact.role || "beneficiary",
          email: contact.email || null,
          phone: contact.phone || null,
          address: contact.address || null,
          notes: contact.notes || null,
        }).returning({ id: willContacts.id });

        // Add ID to saved contacts array if insert was successful
        if (inserted && inserted.length > 0) {
          savedContactIds.push(inserted[0].id);
        }
      } catch (err) {
        console.error(`Error saving contact ${contact.name}:`, err);
      }
    }

    return savedContactIds;
  } catch (error) {
    console.error("Error processing and saving contacts:", error);
    return [];
  }
}

/**
 * Creates an AI prompt to ask for missing contact details
 * @param contact The contact with missing details
 * @returns A prompt for Skyler to ask for the missing details
 */
export function createContactDetailsPrompt(contact: ExtractedContact): string {
  let missingFields = [];
  
  if (!contact.email) missingFields.push("email address");
  if (!contact.phone) missingFields.push("phone number");
  if (!contact.address) missingFields.push("mailing address");
  
  if (missingFields.length === 0) {
    return "";
  }
  
  const fieldsText = missingFields.join(", ");
  return `I noticed you mentioned ${contact.name} as a ${contact.role} in your will. To properly document this, could you please provide their ${fieldsText}? This information will help ensure they can be properly notified when needed.`;
}