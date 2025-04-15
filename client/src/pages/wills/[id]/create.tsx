import React, { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, Save, Loader2, Upload, UserPlus, File, Send, VideoIcon, CheckCircle, Info, Sparkles, MessageSquare, Camera, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

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
  const { toggleSkyler, sendStreamingMessage, isLoading: skylerLoading, skylerResponse } = useSkyler();
  const [activeTab, setActiveTab] = useState("content");
  const [saving, setSaving] = useState(false);
  const [askingSkyler, setAskingSkyler] = useState(false);
  const [skylerPrompt, setSkylerPrompt] = useState("");
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Video testament state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['content', 'documents', 'contacts', 'video', 'finalize'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

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

  // Update content when Skyler responds
  useEffect(() => {
    if (skylerResponse && generatingWithAI) {
      form.setValue("content", skylerResponse);
      setGeneratingWithAI(false);
    }
  }, [skylerResponse, form, generatingWithAI]);

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
  
  // Generate content with Skyler
  const generateWillWithAI = () => {
    const templateName = will?.title.replace("My ", "") || "Basic Will";
    const prompt = `Please create a comprehensive legal will document based on the "${templateName}" template. Include all standard legal sections and clauses that would be found in a professional ${templateName.toLowerCase()}. Format it properly with sections for personal details, executor appointment, beneficiary designations, asset distribution, guardianship (if relevant), and final arrangements. Make it detailed enough to be legally sound but easy to understand.`;
    
    setGeneratingWithAI(true);
    sendStreamingMessage(prompt);
    
    toast({
      title: "Generating will content",
      description: "Skyler is drafting your will document based on your template choice...",
    });
  };
  
  // Video recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoUrl(url);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          // Auto-stop after 3 minutes (180 seconds)
          if (prev >= 180) {
            clearInterval(timer);
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Store the timer reference to clear on stop
      (window as any).recordingTimer = timer;
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera access failed",
        description: "Please make sure you have a camera connected and have granted permission to use it.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      clearInterval((window as any).recordingTimer);
      
      toast({
        title: "Recording saved",
        description: "Your video testament has been recorded successfully."
      });
    }
  };
  
  const resetRecording = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setRecordingTime(0);
  };
  
  // Format recording time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <TabsList className="grid grid-cols-5 lg:w-full md:w-2/3 sm:w-full">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="video">
              <div className="flex items-center">
                <VideoIcon className="h-4 w-4 mr-2" />
                <span>Video</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="finalize">Finalize</TabsTrigger>
          </TabsList>

          {/* Will Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle>Will Content</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-primary/5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> 
                    <span>AI-Powered</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-100 dark:border-purple-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 rounded-full p-3">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Introducing Skyler-Powered Will Creation</h3>
                      <p className="text-muted-foreground">
                        Experience our new AI-driven approach to creating wills. Chat with Skyler to build your will through natural conversation, making the process easier and more intuitive.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          className="mt-2" 
                          onClick={() => navigate(`/wills/${willId}/chat`)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" /> Create with Skyler Chat
                        </Button>
                        {(!will.content || will.content.trim() === "") && (
                          <Button 
                            className="mt-2"
                            variant="outline"
                            onClick={generateWillWithAI}
                            disabled={generatingWithAI}
                          >
                            {generatingWithAI ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                            ) : (
                              <><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Original AI generation button for empty content */}
                {!will.content || will.content.trim() === "" ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mb-6 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3">
                        <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Let Skyler Draft Your Will</h3>
                        <p className="text-muted-foreground">
                          Our AI assistant Skyler can write a complete, legally-sound will document based on your template choice. 
                          You'll be able to review and edit the generated content.
                        </p>
                        <Button 
                          className="mt-2" 
                          onClick={generateWillWithAI}
                          disabled={generatingWithAI}
                        >
                          {generatingWithAI ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating your will...</>
                          ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
                
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
                          <div className="flex justify-between items-center">
                            <FormLabel>Will Content</FormLabel>
                            {will.content && will.content.trim() !== "" && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={generateWillWithAI}
                                disabled={generatingWithAI}
                                className="h-8 px-3 text-xs"
                              >
                                {generatingWithAI ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="mr-1 h-3 w-3" />
                                )}
                                Regenerate with AI
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Textarea 
                                placeholder="Enter the content of your will" 
                                className="min-h-[400px] font-serif" 
                                {...field} 
                                ref={contentTextareaRef}
                              />
                              {generatingWithAI && (
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
                                  <div className="flex flex-col items-center space-y-2 p-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-center font-medium">Skyler is drafting your will...</p>
                                    <p className="text-xs text-muted-foreground text-center max-w-md">
                                      Creating legally sound language based on "{will.title}" template
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50 pt-4">
                <Button variant="outline" onClick={handleBack}>Cancel</Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleSkyler();
                      sendStreamingMessage("I need help editing my will content. Can you provide guidance?");
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask Skyler
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
                    Save
                  </Button>
                </div>
              </CardFooter>
            </Card>
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
          
          {/* Video Testament Tab */}
          <TabsContent value="video" className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle>Video Testament</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-primary/5">
                    <Camera className="h-3.5 w-3.5 text-primary" /> 
                    <span>Record</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Create a video testament to accompany your written will. This can help clarify your intentions
                    and provide a personal message to your loved ones.
                  </p>
                  
                  <div className="rounded-lg overflow-hidden border bg-card shadow-sm">
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      {videoUrl ? (
                        <video 
                          ref={videoRef}
                          src={videoUrl}
                          controls
                          className="absolute inset-0 w-full h-full"
                        />
                      ) : (
                        <>
                          <video 
                            ref={videoRef}
                            autoPlay 
                            muted
                            playsInline
                            className={`absolute inset-0 w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`}
                          />
                          
                          {!isRecording && !videoUrl && (
                            <div className="flex flex-col items-center justify-center">
                              <VideoIcon className="h-16 w-16 text-muted-foreground opacity-40 mb-4" />
                              <p className="text-muted-foreground text-sm">
                                No video recorded. Click the button below to start recording.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Recording indicator */}
                      {isRecording && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1"
                        >
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }}  
                            className="h-3 w-3 rounded-full bg-red-500"
                          />
                          <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        {videoUrl && !isRecording && (
                          <p className="text-sm text-muted-foreground">
                            Video testament recorded successfully
                          </p>
                        )}
                        {isRecording && (
                          <p className="text-sm text-muted-foreground animate-pulse">
                            Recording in progress...
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!isRecording && !videoUrl && (
                          <Button 
                            onClick={startRecording}
                            variant="default"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Start Recording
                          </Button>
                        )}
                        
                        {isRecording && (
                          <Button 
                            onClick={stopRecording} 
                            variant="destructive"
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Stop Recording
                          </Button>
                        )}
                        
                        {videoUrl && !isRecording && (
                          <>
                            <Button 
                              onClick={resetRecording} 
                              variant="outline"
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Record New Video
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                // In a real app, we would upload the video here
                                toast({
                                  title: "Video Testament Saved",
                                  description: "Your video testament has been attached to your will."
                                });
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Use This Video
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Tips for recording your video testament</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Find a quiet, well-lit space with minimal background noise</li>
                        <li>Speak clearly and at a normal pace</li>
                        <li>State your full name, the date, and that this is your video testament</li>
                        <li>Briefly explain your wishes regarding your estate and belongings</li>
                        <li>Consider adding a personal message to your loved ones</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
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
                          {videoUrl ? "Video testament recorded" : "No video testament recorded (optional)"}
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