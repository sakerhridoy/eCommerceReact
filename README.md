Exclusive E-Commerce - Full Stack Deployment Summary

This document summarizes the deployment architecture, environment configurations, and major bug fixes implemented to successfully deploy the "Exclusive" e-commerce platform.

🌐 Live Links

Frontend (Vercel): https://e-commerce-react-omega-ten.vercel.app

Backend (Render): https://exclucive-backend.onrender.com

🏗 Architecture & Hosting

Frontend: React.js + Vite (Hosted on Vercel)

Backend: Node.js + Express.js (Hosted on Render)

Database: MongoDB Atlas

Authentication: JWT (httpOnly Cookies) + Google OAuth + Firebase

Payment Gateway: SSLCommerz

🛠 Major Bug Fixes & Implementations

1. Frontend Crash Fixes (Cannot read properties of undefined)

Issue: The React UI was crashing when rendering arrays (map, slice) because the backend response was wrapped in a { success, data, meta } object.

Fix: Updated the api.js service to safely extract payload data using optional chaining (?.) and fallback arrays (|| []). Implemented a normalizeProduct function to ensure all product objects have consistent properties before rendering.

2. Authentication & First-Party Cookies (Safari/Firefox Fix)

Issue: Cross-domain API calls (Vercel to Render) caused auth cookies to be blocked as "third-party" in strict browsers like Safari.

Fix: Implemented a Vercel proxy via vercel.json (/api/* rewrites to Render). By leaving VITE_API_URL empty, the frontend calls the same origin, keeping cookies first-party and securing the login flow.

3. Google OAuth Login Crash (Missing required parameter client_id)

Issue: Login page crashed immediately upon loading due to missing Google Client ID in the production build.

Fix: Re-configured Vercel Environment Variables to ensure variables like VITE_GOOGLE_CLIENT_ID and VITE_FIREBASE_* were applied to the Production environment, not just "Development".

4. Multer Upload Error (ENOENT) on Render

Issue: Image uploads failed because the uploads directory is gitignored and didn't exist on Render's ephemeral filesystem.

Fix: Added fs.mkdirSync(uploadDir, { recursive: true }) inside upload.js to dynamically create the folder if it's missing.

5. Multi-Origin CORS & Payment Gateway (SSLCommerz)

Issue: CORS was restricted to a single origin, breaking Vercel preview links. SSLCommerz was failing to update order status due to a missing IPN route.

Fix:

Updated Express CORS middleware to dynamically accept origins from a comma-separated CORS_ORIGIN env string.

Configured proper SSLCommerz environment variables and added the /api/v1/payments/ipn route to handle successful payment callbacks.

⚙️ Environment Variables Guide

Backend (Render)

Ensure the following variables are set in the Render dashboard:

NODE_ENV=production
PORT=5000
MONGO_URI=<Your_MongoDB_Connection_String>
CORS_ORIGIN=https://e-commerce-react-omega-ten.vercel.app
FRONTEND_URL=https://e-commerce-react-omega-ten.vercel.app
API_BASE_URL=https://exclucive-backend.onrender.com/api/v1
JWT_ACCESS_SECRET=<Your_Secret>
COOKIE_SECRET=<Your_Secret>
SSLCOMMERZ_STORE_ID=<Your_Store_ID>
SSLCOMMERZ_STORE_PASSWORD=<Your_Store_Password>
SSLCOMMERZ_SANDBOX=true # Set to false for live transactions


Frontend (Vercel)

Ensure the following variables are set in the Vercel dashboard and assigned to the Production environment:

VITE_API_URL= # Leave EMPTY to use vercel.json proxy
VITE_GOOGLE_CLIENT_ID=<Your_Google_Client_ID>
VITE_FIREBASE_API_KEY=<Your_Firebase_Key>
VITE_FIREBASE_AUTH_DOMAIN=<Your_Firebase_Domain>
VITE_FIREBASE_PROJECT_ID=<Your_Firebase_Project_ID>


🚀 Deployment Workflow

Push code changes to the master branch on GitHub.

Render will automatically detect backend changes and redeploy (if auto-deploy is on) or require a manual deploy.

Vercel will automatically build and deploy frontend changes.

Note: Always trigger a manual Redeploy in Vercel if you change Environment Variables.
