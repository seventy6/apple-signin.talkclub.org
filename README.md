# Apple Sign-In Service for iOS (Cloudflare Workers)

Backend service for [Sign in with Apple plugin for Flutter](https://pub.dev/packages/sign_in_with_apple), deployed as a Cloudflare Worker.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up Cloudflare Worker secrets:
   ```
   wrangler secret put ANDROID_PACKAGE_IDENTIFIER
   wrangler secret put KEY_ID
   wrangler secret put TEAM_ID
   wrangler secret put SERVICE_ID
   wrangler secret put BUNDLE_ID
   wrangler secret put KEY_CONTENTS
   ```

3. Local development:
   ```
   npm start
   ```

4. Deploy to Cloudflare:
   ```
   npm run deploy
   ```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /callbacks/sign_in_with_apple` - Android callback endpoint
- `POST /sign_in_with_apple` - Sign-in endpoint for exchanging Apple code for session

For more information on how to use this with the Flutter plugin, see the [README of the plugin](https://pub.dev/packages/sign_in_with_apple#-readme-tab-).
