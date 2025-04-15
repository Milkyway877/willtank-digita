import OpenAI from "openai";

// Create OpenAI client with API key from environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables!");
}

console.log("Initializing OpenAI client with API key present:", !!process.env.OPENAI_API_KEY);
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Enhanced chat completion function that handles retries
export async function getChatCompletion(messages: any[], options = {}) {
  const MAX_RETRIES = 2;
  const defaultOptions = {
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    temperature: 0.7,
    max_tokens: 800,
    stream: false
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Retry logic
  let retries = 0;
  let lastError: any = null;
  
  while (retries <= MAX_RETRIES) {
    try {
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        stream: false
      });

      return {
        success: true,
        data: response.choices[0].message.content
      };
    } catch (error: any) {
      lastError = error;
      retries++;
      
      // Only log first error to avoid spamming console
      if (retries === 1) {
        console.error(`OpenAI API error (attempt ${retries}/${MAX_RETRIES + 1}):`, error);
      }
      
      // If it's a rate limit error, wait exponentially longer
      if (error.status === 429) {
        const waitTime = 1000 * Math.pow(2, retries);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (retries <= MAX_RETRIES) {
        // For other errors, wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`Failed after ${MAX_RETRIES + 1} attempts. Last error:`, lastError);
  return {
    success: false,
    error: lastError?.message || "Failed to get response from OpenAI after multiple attempts"
  };
}

// Enhanced streaming chat completion function
export async function getStreamingChatCompletion(messages: any[], options = {}) {
  const MAX_RETRIES = 2;
  const defaultOptions = {
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    temperature: 0.7,
    max_tokens: 800
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Retry logic
  let retries = 0;
  let lastError: any = null;
  
  while (retries <= MAX_RETRIES) {
    try {
      const stream = await openai.chat.completions.create({
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        stream: true
      });

      return {
        success: true,
        stream: stream
      } as const;
    } catch (error: any) {
      lastError = error;
      retries++;
      
      // Only log first error to avoid spamming console
      if (retries === 1) {
        console.error(`OpenAI streaming API error (attempt ${retries}/${MAX_RETRIES + 1}):`, error);
      }
      
      // If it's a rate limit error, wait exponentially longer
      if (error.status === 429) {
        const waitTime = 1000 * Math.pow(2, retries);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (retries <= MAX_RETRIES) {
        // For other errors, wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`Streaming failed after ${MAX_RETRIES + 1} attempts. Last error:`, lastError);
  return {
    success: false,
    error: lastError?.message || "Failed to get streaming response from OpenAI after multiple attempts"
  } as const;
}