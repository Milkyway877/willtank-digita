# WillTank Production Deployment Guide

## Vercel Deployment Configuration

### 1. Environment Variables

Make sure to set these environment variables in your Vercel project settings:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsud2lsbHRhbmsuY29tJA
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

### 2. Build Settings

The `vercel.json` file in this repository should handle most configuration automatically, but verify these settings in your Vercel dashboard:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Root Directory:** `/` (repository root)

### 3. Domain Configuration

1. Add your custom domain `willtank.com` in Vercel
2. Verify DNS is properly configured
3. This is critical for Clerk authentication which only works on the `willtank.com` domain

### 4. Handling Authentication

- Clerk production keys are restricted to `willtank.com`
- The code includes environment detection to handle both development and production
- For development environments, legacy authentication will be used
- For production on willtank.com, Clerk authentication will be used

### 5. Deployment Troubleshooting

If you encounter a black screen with Clerk errors:

1. Verify your domain is correctly set to `willtank.com`
2. Check that environment variables are correctly set
3. Try clearing browser cache or testing in an incognito window
4. Review Vercel deployment logs for any build errors
5. Ensure the "Root Directory" is set to use the frontend code

### 6. Cleaning Up Old Deployments

1. Go to Vercel > Project > Deployments
2. Delete all previous failed deployments
3. Redeploy with the new configuration