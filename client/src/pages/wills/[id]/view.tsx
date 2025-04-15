import React, { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useWills } from "@/hooks/use-wills";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Edit, Printer, Download, Share, Lock, Unlock, AlertCircle, UserPlus, File, FileText, Info, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ViewWillPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const willId = parseInt(params.id);
  const { wills, isLoading, getWill, updateWillMutation } = useWills();
  const [activeTab, setActiveTab] = useState("overview");
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);

  const will = getWill(willId);

  // Template ID to template title mapping
  const getTemplateTitle = (templateId: number | null) => {
    switch (templateId) {
      case 1:
        return "Basic Will";
      case 2:
        return "Married Couple Will";
      case 3:
        return "Elder Care Will";
      case 4:
        return "Business Owner Will";
      default:
        return "Custom Will";
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate("/wills/manage");
  };

  // Handle edit button
  const handleEdit = () => {
    navigate(`/wills/${willId}/create`);
  };

  // Lock will
  const handleLockWill = async () => {
    await updateWillMutation.mutateAsync({
      id: willId,
      data: {
        status: "locked",
      }
    });
    setLockDialogOpen(false);
  };

  // Unlock will
  const handleUnlockWill = async () => {
    await updateWillMutation.mutateAsync({
      id: willId,
      data: {
        status: "completed",
      }
    });
    setUnlockDialogOpen(false);
  };

  // Show loading state
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
              The will you're trying to view doesn't exist or you don't have permission to access it.
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
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{will.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {getTemplateTitle(will.templateId)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={
                      will.status === "draft" ? "bg-yellow-100 text-yellow-800" : 
                      will.status === "completed" ? "bg-green-100 text-green-800" : 
                      will.status === "locked" ? "bg-blue-100 text-blue-800" : 
                      ""
                    }
                  >
                    {will.status?.charAt(0).toUpperCase() + will.status?.slice(1) || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {will.status !== "locked" && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            {will.status === "completed" ? (
              <Button variant="secondary" onClick={() => setLockDialogOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Lock Will
              </Button>
            ) : will.status === "locked" ? (
              <Button variant="secondary" onClick={() => setUnlockDialogOpen(true)}>
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Will
              </Button>
            ) : null}
          </div>
        </div>

        {/* Main content with tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Will Details</CardTitle>
                <CardDescription>
                  Created on {will.createdAt ? format(new Date(will.createdAt), 'PP') : 'Unknown'} 
                  {will.lastUpdated && ` • Last updated on ${format(new Date(will.lastUpdated), 'PP')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Will status */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Will Status</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {will.status === "draft" && "This will is currently in draft mode. You can continue editing it until it's ready to be finalized."}
                      {will.status === "completed" && "This will has been completed but can still be edited if needed. Consider locking your will once you're confident no further changes are needed."}
                      {will.status === "locked" && "This will has been locked to prevent further changes. You can unlock it if you need to make edits."}
                    </p>
                    {will.status === "completed" && (
                      <Button variant="outline" size="sm" onClick={() => setLockDialogOpen(true)}>
                        <Lock className="mr-2 h-3 w-3" />
                        Lock Will
                      </Button>
                    )}
                  </div>

                  {/* Will content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Will Content
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      {will.content ? (
                        <div className="whitespace-pre-wrap">{will.content}</div>
                      ) : (
                        <p className="text-muted-foreground italic">No content has been added to this will yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Video Testament */}
                  {will.videoRecordingUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Video Testament
                      </h3>
                      <div className="bg-muted/30 p-4 rounded-lg border">
                        <video 
                          controls 
                          src={will.videoRecordingUrl} 
                          className="w-full max-h-96 rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Timeline/Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Will Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium">Will Created</p>
                          <p className="text-sm text-muted-foreground">
                            {will.createdAt ? format(new Date(will.createdAt), 'PPpp') : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      
                      {will.lastUpdated && (
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Last Updated</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(will.lastUpdated), 'PPpp')}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {will.status === "completed" && (
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Will Completed</p>
                            <p className="text-sm text-muted-foreground">
                              Will has been marked as completed
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {will.status === "locked" && (
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Will Locked</p>
                            <p className="text-sm text-muted-foreground">
                              Will has been locked to prevent further changes
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Will Documents</CardTitle>
                <CardDescription>Supporting documents attached to this will</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  <File className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Documents Attached</h3>
                  <p className="mb-4">This will doesn't have any supporting documents attached.</p>
                  {will.status !== "locked" && (
                    <Button variant="outline" onClick={() => navigate(`/wills/${willId}/create`)}>
                      Add Documents
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Will Contacts</CardTitle>
                <CardDescription>People associated with this will</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">
                  <UserPlus className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Contacts Added</h3>
                  <p className="mb-4">No beneficiaries, executors or witnesses have been added to this will.</p>
                  {will.status !== "locked" && (
                    <Button variant="outline" onClick={() => navigate(`/wills/${willId}/create`)}>
                      Add Contacts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lock Will Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock this will?</AlertDialogTitle>
            <AlertDialogDescription>
              Locking your will prevents any further changes from being made. You'll still be able to
              unlock it later if needed, but it provides an extra layer of security to prevent accidental edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockWill}>
              <Lock className="mr-2 h-4 w-4" />
              Lock Will
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Will Dialog */}
      <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock this will?</AlertDialogTitle>
            <AlertDialogDescription>
              Unlocking your will allows you to make changes to it again. This should only be done
              if you need to update important information in your will.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlockWill}>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Will
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}