import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SignInPage() {
  const [, navigate] = useLocation();
  
  // Temporarily redirect to legacy login page
  useEffect(() => {
    navigate("/login");
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to sign in page...</p>
    </div>
  );
}