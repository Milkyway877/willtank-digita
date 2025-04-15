import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useWills } from "@/hooks/use-wills";
import { useSkyler } from "@/hooks/use-skyler";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Save, Loader2, Upload, UserPlus, File, Send, VideoIcon, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Will content schema
const willContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

type WillContentFormValues = z.infer<typeof willContentSchema>;

export default function CreateWillPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const willId = parseInt(params.id);
  const { wills, isLoading, getWill, updateWillMutation } = useWills();
  const { toast } = useToast();
  const { toggleSkyler } = useSkyler();
  const [activeTab, setActiveTab] = useState("content");
  const [saving, setSaving] = useState(false);

  const will = getWill(willId);

  // Create form with defaults from existing will
  const form = useForm<WillContentFormValues>({
    resolver: zodResolver(willContentSchema),
    defaultValues: {
      title: will?.title || "",
      content: will?.content || "",
    },
  });

  // Update form values when will data is loaded
  useEffect(() => {
    if (will) {
      form.reset({
        title: will.title,
        content: will.content || "",
      });
    }
  }, [will, form]);

  // Go back to wills list
  const handleBack = () => {
    navigate("/wills/manage");
  };

  // Handle form submission
  const onSubmit: SubmitHandler<WillContentFormValues> = async (data) => {
    setSaving(true);
    try {
      await updateWillMutation.mutateAsync({
        id: willId,
        data: {
          title: data.title,
          content: data.content,
        },
      });

      toast({
        title: "Will saved successfully",
        description: "Your will has been updated.",
      });
    } catch (error) {
      console.error("Failed to save will:", error);
      toast({
        title: "Failed to save will",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while will data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show error if will not found
  if (!will) {
    return (
      <DashboardLayout>
        <div className="container px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Will not found</AlertTitle>
            <AlertDescription>
              The will you're trying to edit doesn't exist or you don't have permission to access it.
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Wills
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container px-4 py-6">
        {/* Header with back button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{will.title}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Create your will by filling out the necessary information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleSkyler}
            >
              <Info className="mr-2 h-4 w-4" />
              Ask Skyler for Help
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Will
            </Button>
          </div>
        </div>

        {/* Main content with tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:w-full md:w-2/3 sm:w-full">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="finalize">Finalize</TabsTrigger>
          </TabsList>

          {/* Will Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Will Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Will Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter a title for your will" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Will Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the content of your will" 
                              className="min-h-[300px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Cancel</Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </CardFooter>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Need help with your will content?</AlertTitle>
              <AlertDescription>
                Our AI assistant Skyler can help you draft appropriate language for your will
                based on your specific situation and needs.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Will Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upload any supporting documents for your will, such as property deeds, financial statements, or other important papers.
                </p>
                
                <div className="grid gap-4">
                  <div className="border border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                        Click to upload a document
                      </Label>
                      <Input id="file-upload" type="file" className="hidden" />
                      <p className="text-sm text-muted-foreground">
                        Support for PDF, DOCX, JPEG, and PNG files.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center text-muted-foreground p-4">
                    <File className="h-8 w-8 mx-auto mb-2" />
                    <p>No documents uploaded yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Will Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Add contacts related to your will, such as beneficiaries, executors, and witnesses.
                </p>
                
                <div className="grid gap-4">
                  <Button className="w-full py-6" variant="outline">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Contact
                  </Button>
                  
                  <div className="text-center text-muted-foreground p-4">
                    <UserPlus className="h-8 w-8 mx-auto mb-2" />
                    <p>No contacts added yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finalize Tab */}
          <TabsContent value="finalize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Finalize Your Will</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important Information</AlertTitle>
                    <AlertDescription>
                      Before finalizing your will, ensure that all information is accurate and complete.
                      Once finalized, your will can be printed, shared with designated contacts, or stored securely for future access.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Will Content</h3>
                        <p className="text-sm text-muted-foreground">
                          {will.content ? "Completed" : "Not completed - please add content to your will"}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Supporting Documents</h3>
                        <p className="text-sm text-muted-foreground">
                          No documents attached (optional)
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Contacts</h3>
                        <p className="text-sm text-muted-foreground">
                          No contacts added (optional)
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <VideoIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Video Testament</h3>
                        <p className="text-sm text-muted-foreground">
                          No video testament recorded (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!will.content}
                  onClick={() => {
                    updateWillMutation.mutate({
                      id: willId,
                      data: {
                        status: "completed",
                      }
                    });
                    toast({
                      title: "Will completed",
                      description: "Your will has been finalized successfully.",
                    });
                    // Redirect to view page after successful completion
                    navigate(`/wills/${willId}/view`);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Will
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}