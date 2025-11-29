/**
 * Keep-alive utility to prevent Render free tier cold starts
 * Pings the server every 14 minutes to keep it awake
 */

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

/**
 * Start self-ping to prevent cold starts
 * Only runs in production on Render
 */
export const startKeepAlive = (serverUrl) => {
  // Only run in production and if server URL is provided
  if (process.env.NODE_ENV !== 'production' || !serverUrl) {
    console.log('Keep-alive disabled (not in production or no URL provided)');
    return;
  }

  console.log(`Keep-alive enabled: pinging ${serverUrl} every 14 minutes`);

  setInterval(async () => {
    try {
      const response = await fetch(`${serverUrl}/api/ping`);
      if (response.ok) {
        console.log(`Keep-alive ping successful at ${new Date().toISOString()}`);
      } else {
        console.log(`Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Keep-alive ping error:', error.message);
    }
  }, PING_INTERVAL);

  // Initial ping after 1 minute
  setTimeout(async () => {
    try {
      const response = await fetch(`${serverUrl}/api/ping`);
      console.log(`Initial keep-alive ping: ${response.ok ? 'success' : 'failed'}`);
    } catch (error) {
      console.error('Initial keep-alive ping error:', error.message);
    }
  }, 60000);
};
