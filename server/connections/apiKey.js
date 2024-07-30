const axios = require("axios");

// Adam's personal API key server access
// Requires connection to private tailscale subnet.
// no abusing of my api keys or i abuse you 🔫
async function getApiKey(serviceUrl) {
  try {
    const response = await axios.get(
      "http://mommy.rya-orfe.ts.net:8069/" + serviceUrl
    );
    return response.data;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw error;
  }
}

module.exports = { getApiKey };
