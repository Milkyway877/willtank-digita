import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SignUpPage() {
  const [, navigate] = useLocation();
  
  // Temporarily redirect to legacy signup page
  useEffect(() => {
    navigate("/signup");
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to sign up page...</p>
    </div>
  );
}