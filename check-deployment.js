#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function checkUrl(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`${colors.green}✅ ${name}: ${url} - Status: ${res.statusCode}${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}⚠️  ${name}: ${url} - Status: ${res.statusCode}${colors.reset}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`${colors.red}❌ ${name}: ${url} - Error: ${err.message}${colors.reset}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log(`${colors.red}❌ ${name}: ${url} - Timeout${colors.reset}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkDeployment() {
  console.log(`${colors.blue}🔍 Checking Vivento Campus Events Platform Deployment...${colors.reset}\n`);

  // Add your actual deployment URLs here after deployment
  const urls = [
    { url: 'https://vivento-backend.onrender.com', name: 'Backend API' },
    { url: 'https://vivento-backend.onrender.com/api', name: 'Backend API Endpoint' },
    { url: 'https://vivento-campus-events.netlify.app', name: 'Frontend App' }
  ];

  console.log('📋 Checking deployment status...\n');

  let allGood = true;
  for (const { url, name } of urls) {
    const result = await checkUrl(url, name);
    if (!result) allGood = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log(`${colors.green}🎉 All services are running successfully!${colors.reset}`);
    console.log(`${colors.blue}🚀 Your Vivento Campus Events Platform is live!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Some services may need attention.${colors.reset}`);
    console.log(`${colors.blue}📖 Check DEPLOYMENT.md for troubleshooting steps.${colors.reset}`);
  }

  console.log('\n📱 Test your app:');
  console.log('1. Visit your frontend URL');
  console.log('2. Register a new account');
  console.log('3. Create a club and event');
  console.log('4. Test the full workflow\n');
}

// Run the check
checkDeployment().catch(console.error);