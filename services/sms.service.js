import axios from "axios";

/**
 * BestSMS Service - SMS Provider for OTP Authentication
 *
 * Environment Variables Required:
 * - BESTSMS_API_KEY: Your BestSMS API Key
 * - BESTSMS_SENDER_ID: Your approved sender ID (e.g., "GOLDAP")
 * - BESTSMS_API_URL: BestSMS API endpoint (provided by BestSMS)
 *
 * Optional:
 * - BESTSMS_TEMPLATE_ID: Template ID for OTP messages (if using templates)
 */

/**
 * Send OTP via BestSMS
 * @param {string} mobile - Mobile number (with or without country code)
 * @param {string} otp - The OTP to send
 * @returns {Promise<Object>} - Response from BestSMS API
 */
export const sendOtpSms = async (mobile, otp) => {
  try {
    const response = await axios.get(
      "http://control.bestsms.co.in/api/sendhttp.php",
      {
        params: {
          authkey: process.env.SMS_AUTH_KEY, // keep in .env
          mobiles: mobile,
          sender: "NSKFST",
          route: 4,
          country: 91,
          DLT_TE_ID: "1207162399931698582",
          message: `Dear User,
Your OTP is ${otp}. Valid for only 10 mins.
Agharkar Gold
Thank you
Call
-Nashik First`,
        },
      },
    );

    console.log("SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("SMS Error:", error.message);
    throw error;
  }
};

/**
 * Send OTP via BestSMS with retry logic
 * @param {string} mobile - Mobile number
 * @param {string} otp - The OTP to send
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} - Response from BestSMS API
 */
export const sendOtpSmsWithRetry = async (mobile, otp, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[BestSMS] Attempt ${attempt}/${maxRetries}`);
      return await sendOtpSms(mobile, otp);
    } catch (error) {
      lastError = error;
      console.warn(`[BestSMS] Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
};

/**
 * Verify BestSMS configuration
 * @returns {Object} - Configuration status
 */
export const verifyBestSMSConfig = () => {
  const config = {
    apiKey: !!process.env.BESTSMS_API_KEY,
    senderId: !!process.env.BESTSMS_SENDER_ID,
    apiUrl: !!process.env.BESTSMS_API_URL,
    templateId: !!process.env.BESTSMS_TEMPLATE_ID,
  };

  const isConfigured = config.apiKey && config.apiUrl;

  return {
    isConfigured,
    config,
    message: isConfigured
      ? "BestSMS is properly configured"
      : `Missing configuration: ${Object.entries(config)
          .filter(([, v]) => !v)
          .map(([k]) => k)
          .join(", ")}`,
  };
};

export default {
  sendOtpSms,
  sendOtpSmsWithRetry,
  verifyBestSMSConfig,
};
