import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle, ThumbsUp, CheckCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  // Parse URL params to get session_id
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  // Trigger confetti animation on load
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    // Create confetti animation
    const runConfetti = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#8b5cf6', '#3b82f6']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#8b5cf6', '#3b82f6']
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(runConfetti);
      }
    };
    
    runConfetti();
    
    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setLocation('/dashboard');
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [setLocation]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card text-card-foreground rounded-lg shadow-lg border p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-6 bg-green-100 p-3 rounded-full inline-block"
        >
          <CheckCircle className="h-12 w-12 text-green-600" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold mb-2"
        >
          Payment Successful!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          Thank you for your purchase. Your subscription has been activated and you now have access to all premium features.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-2 mb-6"
        >
          <div className="flex items-center px-4 py-2 rounded-md bg-muted/50">
            <CheckCheck className="text-green-500 mr-2 h-5 w-5" />
            <span className="text-sm">Subscription activated</span>
          </div>
          <div className="flex items-center px-4 py-2 rounded-md bg-muted/50">
            <CheckCheck className="text-green-500 mr-2 h-5 w-5" />
            <span className="text-sm">Payment processed</span>
          </div>
          <div className="flex items-center px-4 py-2 rounded-md bg-muted/50">
            <CheckCheck className="text-green-500 mr-2 h-5 w-5" />
            <span className="text-sm">Account updated</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p className="text-muted-foreground mb-4 text-sm">
            Redirecting to dashboard in {countdown} seconds...
          </p>
          
          <Button 
            onClick={() => setLocation('/dashboard')}
            className="w-full"
          >
            Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}