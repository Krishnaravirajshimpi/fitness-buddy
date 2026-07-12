/**
 * Fitness Buddy AI — config.js
 * Frontend configuration for IBM Cloud / API integration.
 * This file is safe to commit; all secrets stay in .env on the server.
 */

window.FITNESS_CONFIG = {
  /**
   * Backend API base URL.
   * - Local development : leave as "" (empty string — same-origin requests to Flask)
   * - Render deployment : set to your Render service URL, e.g.
   *       "https://fitness-buddy-ai.onrender.com"
   *   OR set the environment variable VITE_API_BASE before build.
   *
   * The app.py Flask server serves index.html at "/" so same-origin
   * requests ("") work automatically for both local and Render.
   */
  apiBase: "",

  /**
   * App metadata
   */
  appName:    "Fitness Buddy AI",
  appVersion: "1.0.0",
  ibmModel:   "ibm/granite-13b-instruct-v2",

  /**
   * Feature flags — set to false to disable a feature in the UI
   */
  features: {
    workout:    true,
    nutrition:  true,
    motivation: true,
    bmi:        true,
    habits:     true,
    chat:       true,
    dashboard:  true,
  },
};
