// This file defines routes that should be accessible without authentication
// The actual implementation is done in ClerkProvider using these same routes

// List of public routes that don't require authentication
export const publicRoutes = [
  "/", 
  "/sign-in", 
  "/sign-up", 
  "/about",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/auth/*",
  "/auth",
  "/email-test"
];

// Export for usage in other files
export default publicRoutes;