// server.js - Backend for Graphy SSO and OTP operations
require('dotenv').config({ path: '../.env' }); // Load .env from root
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001; // You can set a different port via .env

// Middleware
app.use(cors()); // Enable CORS for all routes (for development)
// In production, configure CORS more restrictively:
// app.use(cors({ origin: 'https://your-frontend-domain.com' }));

app.use(bodyParser.json()); // Parse JSON request bodies

// Environment variable checks (basic)
const GRAPHY_API_TOKEN = process.env.GRAPHY_API_TOKEN;
const GRAPHY_MERCHANT_ID = process.env.GRAPHY_MERCHANT_ID;

if (!GRAPHY_API_TOKEN || !GRAPHY_MERCHANT_ID) {
  console.error("Error: Missing GRAPHY_API_TOKEN or GRAPHY_MERCHANT_ID in .env file");
  // process.exit(1); // Optional: exit if critical env vars are missing
}

// Simple root route
app.get('/', (req, res) => {
  res.send('Graphy SSO Backend is running!');
});

// ---- Routes will be added in subsequent steps ----

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
  if (!GRAPHY_API_TOKEN || !GRAPHY_MERCHANT_ID) {
    console.warn("Warning: GRAPHY_API_TOKEN or GRAPHY_MERCHANT_ID are not set. API calls to Graphy will fail.");
  }
});

// ---- Graphy OTP API Routes ----

// Send OTP Endpoint
app.post('/api/otp/send', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  if (!GRAPHY_API_TOKEN || !GRAPHY_MERCHANT_ID) {
    console.error('/api/otp/send - Missing Graphy credentials on backend');
    return res.status(500).json({ success: false, message: 'Backend configuration error.' });
  }

  try {
    const graphyPayload = {
      email: email,
      merchant_id: GRAPHY_MERCHANT_ID,
    };
    if (name) {
      graphyPayload.name = name;
    }

    console.log(`[Backend /api/otp/send] Calling Graphy /v2/otp/send for email: ${email}`);
    const response = await axios.post('https://api.graphy.com/v2/otp/send', graphyPayload, {
      headers: {
        'Authorization': `Bearer ${GRAPHY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Backend /api/otp/send] Graphy API Response Status:', response.status);
    console.log('[Backend /api/otp/send] Graphy API Response Data:', response.data);

    // Graphy's send OTP API typically returns a success message if the request format is okay
    // and the email is processed. It doesn't confirm OTP delivery itself in this response.
    if (response.status === 200 || response.status === 201) { // Check for appropriate success codes
      res.json({ success: true, message: response.data.message || 'OTP request processed by Graphy.' });
    } else {
      // This case might not be hit if axios throws for non-2xx codes, but good for robustness
      res.status(response.status).json({ success: false, message: response.data.message || 'Failed to send OTP via Graphy.', errorDetails: response.data });
    }
  } catch (error) {
    console.error('[Backend /api/otp/send] Error calling Graphy /v2/otp/send API:', error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response && error.response.data && error.response.data.message
                       ? error.response.data.message
                       : 'An error occurred while trying to send OTP via Graphy.';
    res.status(statusCode).json({ success: false, message: errorMessage, errorDetails: error.response ? error.response.data : null });
  }
});

// Login/Signup with OTP Endpoint
app.post('/api/otp/login-signup', async (req, res) => {
  const { email, otp, name, course_ids } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }
  if (!GRAPHY_API_TOKEN || !GRAPHY_MERCHANT_ID) {
    console.error('/api/otp/login-signup - Missing Graphy credentials on backend');
    return res.status(500).json({ success: false, message: 'Backend configuration error.' });
  }

  try {
    const graphyPayload = {
      email: email,
      otp: otp,
      merchant_id: GRAPHY_MERCHANT_ID,
    };
    if (name) { // Name is often useful for signup scenarios
      graphyPayload.name = name;
    }
    if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
      graphyPayload.course_ids = course_ids;
    }

    console.log(`[Backend /api/otp/login-signup] Calling Graphy /v2/otp/login for email: ${email}`);
    const response = await axios.post('https://api.graphy.com/v2/otp/login', graphyPayload, {
      headers: {
        'Authorization': `Bearer ${GRAPHY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Backend /api/otp/login-signup] Graphy API Response Status:', response.status);
    console.log('[Backend /api/otp/login-signup] Graphy API Response Data:', response.data);

    if (response.data && response.data.data && response.data.data.ssoToken) {
      res.json({
        success: true,
        ssoToken: response.data.data.ssoToken,
        message: response.data.message || 'Successfully logged in/signed up with Graphy.',
        user: response.data.data.user // Forward user details from Graphy if available
      });
    } else {
      // This handles cases where Graphy API call was 2xx but response format is unexpected
      // or ssoToken is missing.
      const errorMessage = response.data.message || 'Login/Signup with Graphy failed. Invalid OTP or other issue.';
      console.error('[Backend /api/otp/login-signup] Graphy login failed or ssoToken missing. Graphy response:', response.data);
      res.status(401).json({ success: false, message: errorMessage, errorDetails: response.data });
    }
  } catch (error) {
    console.error('[Backend /api/otp/login-signup] Error calling Graphy /v2/otp/login API:', error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    // Try to parse specific error message from Graphy if available
    const errorMessage = error.response && error.response.data && error.response.data.message
                       ? error.response.data.message
                       : 'An error occurred during OTP login/signup with Graphy.';
    res.status(statusCode).json({ success: false, message: errorMessage, errorDetails: error.response ? error.response.data : null });
  }
});


module.exports = app; // For potential testing or modularization later
