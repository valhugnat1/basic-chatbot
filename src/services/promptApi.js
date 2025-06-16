// The base URL for the backend API.
const BASE_URL = process.env.VUE_APP_BACKEND_BASE_URL;
// The static API key for authorization.
const ADMIN_API_KEY = process.env.VUE_APP_ADMIN_API_KEY;

/**
 * Creates a standard set of headers for API requests.
 * @returns {Headers} A Headers object with the Authorization token.
 */
function getAuthHeaders() {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${ADMIN_API_KEY}`);
  return headers;
}

/**
 * Fetches the current system prompt.
 * @returns {Promise<string>} The content of the current prompt.
 */
export async function getSystemPrompt() {
  const response = await fetch(`${BASE_URL}/prompt`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch system prompt.");
  }
  return response.text();
}

/**
 * Updates the system prompt.
 * @param {string} newContent - The new content for the prompt.
 * @returns {Promise<string>} The result message from the server.
 */
export async function updateSystemPrompt(newContent) {
  const headers = getAuthHeaders();
  headers.append("Content-Type", "text/plain");

  const response = await fetch(`${BASE_URL}/prompt`, {
    method: "PUT",
    headers: headers,
    body: newContent,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update system prompt.");
  }
  return response.text();
}

/**
 * Lists all available prompt versions.
 * @returns {Promise<string[]>} An array of version names.
 */
export async function listPromptVersions() {
  const response = await fetch(`${BASE_URL}/prompt/versions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to list prompt versions.");
  }
  return response.json();
}

/**
 * Retrieves the content of a specific prompt version.
 * @param {string} versionName - The name of the version to fetch.
 * @returns {Promise<string>} The content of the specified prompt version.
 */
export async function getSpecificPromptVersion(versionName) {
  const response = await fetch(`${BASE_URL}/prompt/versions/${versionName}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch version: ${versionName}`);
  }
  return response.text();
}

/**
 * Rolls back the current prompt to a specified version.
 * @param {string} versionName - The name of the version to roll back to.
 * @returns {Promise<string>} The result message from the server.
 */
export async function rollbackPrompt(versionName) {
  const response = await fetch(`${BASE_URL}/prompt/rollback/${versionName}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to roll back to version: ${versionName}`
    );
  }
  return response.text();
}
