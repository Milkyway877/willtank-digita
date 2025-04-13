import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, CreditCard, Lock, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

// Define plan type
type PricingInterval = 'month' | 'year' | 'lifetime';

// Define subscription plan type
interface Plan {
  id: string;
  name: string;
  description: string;
  prices: {
    month: number | string;
    year: number | string;
    lifetime: number | string;
  };
  features: string[];
}

// Define enterprise contact form type
interface EnterpriseContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function PricingPage() {
  const [selectedInterval, setSelectedInterval] = useState<PricingInterval>('month');
  const [isEnterpriseDialogOpen, setIsEnterpriseDialogOpen] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState<EnterpriseContactForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch subscription plans
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/subscription/plans');
      return res.json();
    }
  });

  // Create checkout session mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ planType, interval }: { planType: string, interval: PricingInterval }) => {
      const res = await apiRequest('POST', '/api/subscription/checkout', {
        planType,
        interval,
        successUrl: window.location.origin + '/subscription/success',
        cancelUrl: window.location.origin + '/pricing'
      });
      return res.json();
    },
    onSuccess: (data) => {
      // If it's an enterprise plan, show the dialog
      if (data.type === 'enterprise') {
        setIsEnterpriseDialogOpen(true);
        return;
      }
      
      // Otherwise, redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: error.message || 'Failed to create checkout session'
      });
    }
  });

  // Enterprise contact mutation
  const enterpriseContactMutation = useMutation({
    mutationFn: async (formData: EnterpriseContactForm) => {
      const res = await apiRequest('POST', '/api/support/enterprise', formData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request submitted',
        description: 'Our team will contact you shortly.',
      });
      setIsEnterpriseDialogOpen(false);
      setEnterpriseForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message || 'Failed to submit enterprise request'
      });
    }
  });

  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    // For enterprise plans, show the contact dialog
    if (planId === 'enterprise') {
      setIsEnterpriseDialogOpen(true);
      return;
    }
    
    // Otherwise, create a checkout session
    checkoutMutation.mutate({
      planType: planId,
      interval: selectedInterval
    });
  };

  // Handle enterprise form submission
  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enterpriseContactMutation.mutate(enterpriseForm);
  };

  // Handle enterprise form input changes
  const handleEnterpriseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnterpriseForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate savings percentage for yearly plans
  const calculateSavings = (plan: Plan): number => {
    if (typeof plan.prices.month === 'number' && typeof plan.prices.year === 'number') {
      return Math.round(100 - ((plan.prices.year / (plan.prices.month * 12)) * 100));
    }
    return 0;
  };

  // Format price display
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'number') {
      return `$${price}`;
    }
    return String(price);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan that fits your needs and secure your legacy with WillTank's premium features.
        </p>
      </motion.div>
      
      {/* Pricing interval selector */}
      <Tabs 
        defaultValue="month" 
        onValueChange={(value) => setSelectedInterval(value as PricingInterval)}
        className="w-full max-w-3xl mx-auto mb-12"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">
            Yearly
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save up to 20%</Badge>
          </TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
        </TabsList>

        {/* Pricing plans grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-48 bg-gray-200" />
                <CardContent className="h-64 bg-gray-100" />
                <CardFooter className="h-16 bg-gray-200" />
              </Card>
            ))
          ) : (
            // Actual plans
            plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: plans.indexOf(plan) * 0.1 }}
              >
                <Card className={`flex flex-col h-full ${plan.id === 'platinum' ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader>
                    {plan.id === 'platinum' && (
                      <Badge className="self-start mb-2">Most Popular</Badge>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="text-3xl font-bold">
                        {formatPrice(plan.prices[selectedInterval])}
                        {selectedInterval !== 'lifetime' && (
                          <span className="text-lg font-normal text-muted-foreground">
                            /{selectedInterval === 'month' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                      
                      {selectedInterval === 'year' && typeof plan.prices.month === 'number' && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {calculateSavings(plan)}% compared to monthly
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={plan.id === 'platinum' ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          {plan.id === 'enterprise' ? 'Contact Us' : 'Select Plan'}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </Tabs>
      
      {/* Security and guarantee message */}
      <div className="text-center mt-12 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          <span className="text-sm">Secure payment via Stripe</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <span className="text-sm">You can cancel your subscription at any time</span>
        </div>
      </div>
      
      {/* Enterprise contact dialog */}
      <Dialog open={isEnterpriseDialogOpen} onOpenChange={setIsEnterpriseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enterprise Plan Inquiry</DialogTitle>
            <DialogDescription>
              Fill out this form and our team will contact you with custom pricing and features tailored to your organization's needs.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={enterpriseForm.name}
                onChange={handleEnterpriseInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={enterpriseForm.email}
                onChange={handleEnterpriseInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={enterpriseForm.phone}
                onChange={handleEnterpriseInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                name="company"
                value={enterpriseForm.company}
                onChange={handleEnterpriseInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                value={enterpriseForm.message}
                onChange={handleEnterpriseInputChange}
                required
                placeholder="Tell us about your organization and requirements"
              />
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                disabled={enterpriseContactMutation.isPending}
                className="w-full"
              >
                {enterpriseContactMutation.isPending ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}