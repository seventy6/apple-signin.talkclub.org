// Cloudflare Worker for Apple Sign-In
import { AppleAuth } from 'apple-auth';
import jwt from 'jsonwebtoken';

// Helper function to parse form data
async function parseFormData(request) {
  const formData = await request.formData();
  const params = {};
  
  for (const [key, value] of formData.entries()) {
    params[key] = value;
  }
  
  return params;
}

// Helper function to parse URL query parameters
function parseQueryParams(url) {
  const params = {};
  const searchParams = new URL(url).searchParams;
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Home route
    if (path === '/' && request.method === 'GET') {
      return new Response('HOW ARE YOU? OUT OF 10?', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Android callback route
    if (path === '/callbacks/sign_in_with_apple' && request.method === 'POST') {
      try {
        const formData = await parseFormData(request);
        
        const redirect = `intent://callback?${new URLSearchParams(formData).toString()}#Intent;package=${
          env.ANDROID_PACKAGE_IDENTIFIER
        };scheme=signinwithapple;end`;
        
        console.log(`Redirecting to ${redirect}`);
        
        return Response.redirect(redirect, 307);
      } catch (error) {
        return new Response(`Error processing request: ${error.message}`, { status: 500 });
      }
    }
    
    // Sign in with Apple endpoint
    if (path === '/sign_in_with_apple' && request.method === 'POST') {
      try {
        const params = parseQueryParams(request.url);
        
        const auth = new AppleAuth(
          {
            client_id: 
              params.useBundleId === "true"
                ? env.BUNDLE_ID
                : env.SERVICE_ID,
            team_id: env.TEAM_ID,
            redirect_uri: "https://apple-signin-talkclub-org.glitch.me/callbacks/sign_in_with_apple",
            key_id: env.KEY_ID
          },
          env.KEY_CONTENTS.replace(/\|/g, "\n"),
          "text"
        );
        
        console.log(params);
        
        const accessToken = await auth.accessToken(params.code);
        const idToken = jwt.decode(accessToken.id_token);
        
        const userID = idToken.sub;
        
        console.log(idToken);
        
        const userEmail = idToken.email;
        const userName = `${params.firstName} ${params.lastName}`;
        
        // 👷🏻‍♀️ TODO: Use the values provided create a new session for the user in your system
        const sessionID = `NEW SESSION ID for ${userID} / ${userEmail} / ${userName}`;
        
        console.log(`sessionID = ${sessionID}`);
        
        return new Response(
          JSON.stringify({ sessionId: sessionID }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        return new Response(`Error processing sign in: ${error.message}`, { status: 500 });
      }
    }
    
    // Handle 404 for any other routes
    return new Response('Not found', { status: 404 });
  }
};
