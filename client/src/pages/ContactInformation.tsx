import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { saveWillProgress, WillCreationStep, getNextStep } from '@/lib/will-progress-tracker';
import { apiRequest } from '@/lib/queryClient';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

// Form validation schema
const contactFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postalCode: z.string().min(5, { message: "Postal code must be at least 5 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
  emergencyContactName: z.string().min(2, { message: "Emergency contact name is required." }),
  emergencyContactPhone: z.string().min(10, { message: "Please enter a valid emergency contact phone number." }),
  emergencyContactEmail: z.string().email({ message: "Please enter a valid emergency contact email." }).optional(),
  additionalNotes: z.string().optional(),
});

// Type for form values
type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactInformation = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [willId, setWillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      dateOfBirth: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactEmail: "",
      additionalNotes: "",
    },
  });

  // Load existing contact information if available
  useEffect(() => {
    const loadContactInfo = async () => {
      setIsLoading(true);
      try {
        // Get the current will ID from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('willId') || localStorage.getItem('currentWillId');
        setWillId(id);

        if (id) {
          // Load contact info from server
          const response = await apiRequest('GET', `/api/wills/${id}`);
          const willData = await response.json();
          
          if (willData && willData.contactInfo) {
            // Populate form with existing data
            form.reset({
              fullName: willData.contactInfo.fullName || "",
              email: willData.contactInfo.email || "",
              phone: willData.contactInfo.phone || "",
              address: willData.contactInfo.address || "",
              city: willData.contactInfo.city || "",
              state: willData.contactInfo.state || "",
              postalCode: willData.contactInfo.postalCode || "",
              country: willData.contactInfo.country || "United States",
              dateOfBirth: willData.contactInfo.dateOfBirth || "",
              emergencyContactName: willData.contactInfo.emergencyContactName || "",
              emergencyContactPhone: willData.contactInfo.emergencyContactPhone || "",
              emergencyContactEmail: willData.contactInfo.emergencyContactEmail || "",
              additionalNotes: willData.contactInfo.additionalNotes || "",
            });
          } else if (user) {
            // If no contact info but user is logged in, pre-fill with user data
            form.setValue('fullName', user.fullName || user.username || "");
            // Check if email property exists on user
            if ('email' in user && typeof user.email === 'string') {
              form.setValue('email', user.email);
            }
          }
        }
      } catch (error) {
        console.error('Error loading contact information:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your contact information. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContactInfo();
  }, [form, toast, user]);

  // Save contact information
  const saveContactInfo = async (data: ContactFormValues) => {
    if (!willId) {
      toast({
        title: 'Error',
        description: 'No will ID found. Please restart the will creation process.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update will with contact info
      await apiRequest('PUT', `/api/wills/${willId}`, {
        contactInfo: data,
      });
      
      // Update progress
      await apiRequest('POST', '/api/user/will-status', {
        willId: parseInt(willId),
        progress: WillCreationStep.CONTACT_INFO,
      });
      
      // Save progress locally
      saveWillProgress(WillCreationStep.CONTACT_INFO);
      
      toast({
        title: 'Success',
        description: 'Your contact information has been saved.',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving contact information:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your contact information. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: ContactFormValues) => {
    const saved = await saveContactInfo(data);
    if (saved) {
      // Navigate to next step
      const nextStep = getNextStep(WillCreationStep.CONTACT_INFO);
      navigate(`/${nextStep === WillCreationStep.VIDEO_RECORDING ? 'video-recording' : 'final-review'}?willId=${willId}`);
    }
  };

  // Handle going back
  const handleBack = async () => {
    // Save current form state before navigating back
    const formData = form.getValues();
    await saveContactInfo(formData);
    navigate(`/document-upload?willId=${willId}`);
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    const formData = form.getValues();
    const saved = await saveContactInfo(formData);
    if (saved) {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatedAurora />
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
              Contact Information
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Please provide your contact details and emergency contact information. This ensures your will can be properly
              executed when the time comes.
            </p>
          </div>

          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Personal and Emergency Contact Details</CardTitle>
              <CardDescription>
                All information is securely stored and only used for will execution purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium border-b pb-2">Emergency Contact</h3>
                    
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 987-6543" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergencyContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="jane.doe@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium border-b pb-2">Additional Notes</h3>
                    
                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Any Additional Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any additional information that might be relevant..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-wrap justify-between gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                        className="flex items-center"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save & Exit
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactInformation;