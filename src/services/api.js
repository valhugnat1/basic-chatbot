// src/services/api.js
import OpenAI from "openai";

// Environment variables for the backend URL and a client-specific API key.
const BASE_URL = process.env.VUE_APP_BACKEND_BASE_URL;
const CLIENT_API_KEY = process.env.VUE_APP_CLIENT_API_KEY;

// Module-level variables to cache the access token and conversation ID.
let accessToken = null;
let conversationId = null;

/**
 * Generates a standard RFC4122 version 4 UUID.
 * @returns {string} A new UUID.
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Resets the cached access token and conversation ID, forcing a new token fetch on the next API call.
 */
export function resetToken() {
  accessToken = null;
  conversationId = null;
}

/**
 * Fetches an access token from the backend.
 * Caches the token and conversation ID to avoid redundant requests.
 * @returns {Promise<{accessToken: string, conversationId: string}>} The access token and conversation ID.
 */
export async function getAccessToken() {
  // Return the cached token if it already exists.
  if (accessToken) {
    return { accessToken, conversationId };
  }

  // Generate a new conversation ID for the new session.
  conversationId = generateUUID();

  const response = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_api_key: CLIENT_API_KEY,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  // Cache the new access token.
  accessToken = data.access_token;
  return { accessToken, conversationId };
}

export async function getChatStream(messages, onMessageParsed) {
  await getAccessToken();

  const openai = new OpenAI({
    apiKey: accessToken, // Use the module-level accessToken here.
    baseURL: BASE_URL,
    dangerouslyAllowBrowser: true, // This should be true only for client-side browser environments.
  });

  try {
    console.log("[API] getChatStream called with messages:", messages);

    const stream = await openai.chat.completions.create({
      model: "gpt-4", // It's best to specify a model, e.g., "gpt-4" or "gpt-3.5-turbo".
      messages: messages,
      stream: true,
      conversation_id: conversationId,
    });

    for await (const chunk of stream) {
      console.log("[API] Received chunk:", chunk);
      onMessageParsed({
        done: false,
        data: chunk,
      });
    }

    // Signal that streaming is complete.
    onMessageParsed({
      done: true,
      data: null,
    });
  } catch (error) {
    console.error("[API] Error in getChatStream:", error);
    throw error;
  }
}
