"use server";

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BACKEND_API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || "your-backend-api-key";

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${BACKEND_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getJWT(type: "flow" | "rt") {
  try {
    const response = await apiRequest("/api/jwt", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
    
    return response.jwt_token;
  } catch (error) {
    console.error("Failed to get JWT:", error);
    throw new Error("Failed to get JWT token from backend");
  }
}

export async function startConversation(config: {
  template_id: string;
  template_variables?: Record<string, any>;
  audio_format?: any;
}) {
  try {
    const response = await apiRequest("/api/conversation/start", {
      method: "POST",
      body: JSON.stringify({
        config: {
          template_id: config.template_id,
          template_variables: config.template_variables || {},
        },
        audio_format: config.audio_format,
      }),
    });
    
    return response;
  } catch (error) {
    console.error("Failed to start conversation:", error);
    throw new Error("Failed to start conversation");
  }
}

export async function endConversation(sessionId: string) {
  try {
    const response = await apiRequest(`/api/conversation/${sessionId}/end`, {
      method: "POST",
    });
    
    return response;
  } catch (error) {
    console.error("Failed to end conversation:", error);
    throw new Error("Failed to end conversation");
  }
}

export async function getConversationStatus(sessionId: string) {
  try {
    const response = await apiRequest(`/api/conversation/${sessionId}/status`);
    return response;
  } catch (error) {
    console.error("Failed to get conversation status:", error);
    throw new Error("Failed to get conversation status");
  }
}