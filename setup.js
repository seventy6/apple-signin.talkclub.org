#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Setting up Apple Sign-In Cloudflare Worker...');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (e) {
  console.log('Installing Wrangler CLI...');
  execSync('npm install -g wrangler', { stdio: 'inherit' });
}

// Login to Cloudflare if needed
console.log('\nMaking sure you are logged in to Cloudflare...');
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✅ Already logged in to Cloudflare');
} catch (e) {
  console.log('Please login to Cloudflare:');
  execSync('wrangler login', { stdio: 'inherit' });
}

// Ask for secrets
const askForSecrets = () => {
  console.log('\nPlease provide your Apple Sign-In credentials:');
  const secrets = [
    'ANDROID_PACKAGE_IDENTIFIER',
    'KEY_ID',
    'TEAM_ID',
    'SERVICE_ID',
    'BUNDLE_ID',
    'KEY_CONTENTS'
  ];
  
  const askForSecret = (secretName, callback) => {
    rl.question(`${secretName}: `, (value) => {
      if (value.trim()) {
        try {
          console.log(`Setting secret: ${secretName}...`);
          execSync(`wrangler secret put ${secretName}`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
          console.log(`✅ Secret ${secretName} set successfully`);
          callback();
        } catch (e) {
          console.error(`Error setting secret ${secretName}. Please try again.`);
          askForSecret(secretName, callback);
        }
      } else {
        console.log(`Skipping empty secret: ${secretName}`);
        callback();
      }
    });
  };
  
  const processSecrets = (index) => {
    if (index < secrets.length) {
      askForSecret(secrets[index], () => processSecrets(index + 1));
    } else {
      console.log('\n✅ All secrets configured!');
      console.log('\nYou can now run:');
      console.log('  npm start     - to start the development server');
      console.log('  npm run deploy - to deploy to Cloudflare Workers');
      rl.close();
    }
  };
  
  processSecrets(0);
};

askForSecrets();
