# WillTank Production Deployment Guide

## Replit Deployment Instructions

### 1. Safe Deployment (Recommended)

We've created a special "safe mode" deployment script that works on any domain (including Replit). This approach removes Clerk domain restrictions and uses the legacy authentication system.

To deploy WillTank in safe mode:

```bash
node safe-deploy.js
```

This will:
1. Create a domain-agnostic version of the authentication system
2. Build the frontend with Vite in safe mode
3. Serve the compiled assets with Express on port 3000
4. Provide a public URL you can share with anyone
5. Use the legacy authentication system from the backend

### 2. Alternative: Standard Frontend Deployment

If you prefer the standard deployment (which might show Clerk errors on non-willtank.com domains):

```bash
node deploy-frontend.js
```

### 2. Environment Variables

Make sure these environment variables are set in your Replit:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsud2lsbHRhbmsuY29tJA
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

You can add them in the Replit interface under "Secrets" in the Tools panel.

### 3. Custom Domain Configuration (Optional)

If you want to use a custom domain (like willtank.com):

1. Go to your Replit project's "Deployments" tab
2. Click on "Domains" 
3. Add your custom domain
4. Update your DNS settings as instructed by Replit
5. For Clerk, make sure the domain is properly configured in Clerk dashboard

### 4. Authentication in Production

- Clerk authentication is restricted to approved domains (like willtank.com)
- Our code includes environment detection to handle both development and production:
  - For development (Replit preview URLs), legacy authentication will be used
  - For production on willtank.com, Clerk authentication will be used

### 5. Full Stack Deployment

If you need full API access (backend + frontend), you can still use the default:

```bash
npm run dev
```

This runs both frontend and backend together, but may expose schema files.

### 6. Troubleshooting

If you encounter issues:

1. Check console logs for errors
2. Verify environment variables are correctly set
3. Try clearing browser cache
4. Ensure the correct environment variables are set