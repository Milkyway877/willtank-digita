import OpenAI from "openai";

// Create OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Handle chat completions with GPT-4o Mini
export async function getChatCompletion(messages: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. Using gpt-4o-mini for Skyler
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    return {
      success: true,
      data: response.choices[0].message.content
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: error.message || "Failed to get response from OpenAI"
    };
  }
}

// Handle streaming chat completions
export async function getStreamingChatCompletion(messages: any[]) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. Using gpt-4o-mini for Skyler
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true
    });

    return {
      success: true,
      stream
    };
  } catch (error: any) {
    console.error("OpenAI API streaming error:", error);
    return {
      success: false,
      error: error.message || "Failed to get streaming response from OpenAI"
    };
  }
}