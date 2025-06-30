// Authentication service for Graphy SSO integration.
// Handles OTP flow by calling our backend, which then calls Graphy.
// OAuth flow remains mocked client-side for now, or can be updated to call a backend similarly.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Calls the backend to request an OTP from Graphy.
 * @param {string} email - The user's email.
 * @param {string} [name] - The user's name (optional).
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const generateOtp = async (email, name) => {
  console.log(`[AuthService] Requesting OTP for email: ${email}, name: ${name}`);
  try {
    const payload = { email };
    if (name) {
      payload.name = name;
    }
    const response = await fetch(`${API_BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("[AuthService] Failed to send OTP via backend:", data);
      throw new Error(data.message || `Failed to send OTP. Status: ${response.status}`);
    }
    console.log("[AuthService] OTP request successful via backend:", data);
    return data; // Expected: { success: true, message: "..." }
  } catch (error) {
    console.error("[AuthService] Error in generateOtp:", error);
    return { success: false, message: error.message || "An unexpected error occurred while sending OTP." };
  }
};

/**
 * Calls the backend to log in or sign up a user with Graphy using OTP.
 * The backend handles the call to Graphy's /v2/otp/login API.
 * @param {string} email - The user's email.
 * @param {string} otp - The OTP entered by the user.
 * @param {string} [name] - The user's name (optional, useful for signup).
 * @param {string[]} [course_ids] - Array of course IDs for auto-enrollment (optional).
 * @returns {Promise<{success: boolean, ssoToken?: string, message: string, user?: object}>}
 */
export const loginSignupWithOtp = async (email, otp, name, course_ids) => {
  console.log(`[AuthService] Attempting login/signup with OTP for email: ${email}`);
  try {
    const payload = { email, otp };
    if (name) {
      payload.name = name;
    }
    if (course_ids && Array.isArray(course_ids)) {
      payload.course_ids = course_ids;
    }

    const response = await fetch(`${API_BASE_URL}/otp/login-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("[AuthService] Failed to login/signup with OTP via backend:", data);
      throw new Error(data.message || `OTP Login/Signup failed. Status: ${response.status}`);
    }

    console.log("[AuthService] OTP login/signup successful via backend:", data);
    // Expected data: { success: true, ssoToken: "...", message: "...", user: {...} }
    return data;
  } catch (error) {
    console.error("[AuthService] Error in loginSignupWithOtp:", error);
    return { success: false, message: error.message || "An unexpected error occurred during OTP login/signup." };
  }
};


// OAuth flow remains mocked for now, as the primary request was for real-time OTP.
// To make OAuth real-time, a similar backend integration would be needed for the code exchange part.
const MOCK_API_LATENCY = 500; // milliseconds (only for mocked OAuth)

/**
 * Simulates exchanging an OAuth authorization code for a Graphy token. (MOCKED)
 * In a real backend, this would involve a server-to-server call to Graphy's /sso/login endpoint.
 * @param {string} code - The authorization code from the OAuth provider (Google/GitHub).
 * @param {string} provider - The OAuth provider ('google' or 'github').
 * @returns {Promise<{success: boolean, token?: string, message: string, user?: object}>}
 */
export const exchangeCodeForToken = (code, provider) => {
  console.log(`[MockAuthService] exchangeCodeForToken called for provider: ${provider}, code: ${code}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!code || !provider) {
        // console.error("[MockAuthService] Missing code or provider for exchangeCodeForToken.");
        reject({ success: false, message: "Missing authorization code or provider (mocked error)." });
        return;
      }
      if (code === "error_code") { // Simulate an error during exchange
          // console.warn("[MockAuthService] Simulating error for code 'error_code'.");
          reject({ success: false, message: "Failed to exchange code with Graphy (mocked error)." });
          return;
      }

      // Simulate a successful exchange and return a dummy Graphy token
      // This dummy token is NOT a real Graphy token.
      const dummyGraphyToken = `graphy_dummy_token_${provider}_${Date.now()}`;
      const mockUser = {
        id: "mockUserId123",
        email: `mockuser_${provider}@example.com`,
        name: "Mock OAuth User",
      };

      // console.log("[MockAuthService] Mock code exchanged successfully. Generated dummy Graphy token:", dummyGraphyToken);
      resolve({
        success: true,
        token: dummyGraphyToken,
        user: mockUser,
        message: "OAuth flow successful (mocked). Token received.",
      });
    }, MOCK_API_LATENCY);
  });
};

// TODO: When backend is ready:
// 1. Remove all mock logic from these functions.
// 2. Implement actual `fetch` calls to your backend endpoints defined in `backend/API_DEFINITIONS.md`.
//    Example for verifyOtp:
//    const response = await fetch('/api/auth/otp/verify', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, otp })
//    });
//    if (!response.ok) {
//      const errorData = await response.json();
//      throw new Error(errorData.message || 'OTP verification failed');
//    }
//    return await response.json(); // { success: true, ssoToken: "...", message: "..." }
// 3. Ensure proper error handling for network issues and API error responses.
// 4. Make sure the backend correctly handles secrets and signs JWTs as required.
