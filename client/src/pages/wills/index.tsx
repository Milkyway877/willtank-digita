import React, { useState } from "react";
import { useLocation } from "wouter";
import { useWills } from "@/hooks/use-wills";
import { useSkyler } from "@/hooks/use-skyler";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, FileText, Users, Briefcase, Heart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Template IDs mapping
const TEMPLATE_ID_MAP = {
  basic: 1,
  married: 2,
  elder: 3,
  business: 4
};

export default function WillsPage() {
  const [, navigate] = useLocation();
  const { wills, isLoading, createWillMutation } = useWills();
  const { toggleSkyler } = useSkyler();
  const [creating, setCreating] = useState(false);

  const templates = [
    {
      id: "basic",
      title: "Basic Will",
      description: "A simple will covering your basic needs. Perfect for individuals with straightforward wishes.",
      icon: <FileText className="h-12 w-12 text-blue-500" />,
    },
    {
      id: "married",
      title: "Married Couple Will",
      description: "Designed for married couples to ensure assets are properly distributed between partners and dependents.",
      icon: <Heart className="h-12 w-12 text-red-500" />,
    },
    {
      id: "elder",
      title: "Elder Care Will",
      description: "Specialized will focused on elder care considerations, medical directives, and healthcare decisions.",
      icon: <Users className="h-12 w-12 text-green-500" />,
    },
    {
      id: "business",
      title: "Business Owner Will",
      description: "For entrepreneurs and business owners to address succession planning and business asset distribution.",
      icon: <Briefcase className="h-12 w-12 text-orange-500" />,
    },
  ];

  const handleCreateWill = async (templateId: string) => {
    setCreating(true);
    try {
      const newWill = await createWillMutation.mutateAsync({
        title: `My ${templates.find(t => t.id === templateId)?.title || "Will"}`,
        templateId: TEMPLATE_ID_MAP[templateId as keyof typeof TEMPLATE_ID_MAP] || 1,
        status: "draft",
        content: "",
        isReleased: false,
      });
      
      // Navigate to the will creation page
      navigate(`/wills/${newWill.id}/create`);
    } catch (error) {
      console.error("Failed to create will:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleManageWills = () => {
    navigate("/wills/manage");
  };

  return (
    <DashboardLayout>
      <div className="container px-4 py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Will Creation</h1>
            <p className="text-muted-foreground mt-1">
              Choose a template to begin creating your will
            </p>
          </div>
          
          {wills && wills.length > 0 && (
            <Button variant="outline" onClick={handleManageWills}>
              Manage Existing Wills
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {wills && wills.length > 0 && (
              <Alert>
                <AlertTitle>You have {wills.length} existing will{wills.length > 1 ? "s" : ""}</AlertTitle>
                <AlertDescription>
                  You can create a new will or manage your existing ones.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-4">
                    <div className="mb-2">{template.icon}</div>
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button 
                      onClick={() => handleCreateWill(template.id)} 
                      className="w-full"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                      )}
                      Create Will
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Need help choosing?</h3>
              <p className="mb-4">
                Unsure which template is right for you? Our AI assistant Skyler can help you determine the best option based on your situation.
              </p>
              <Button onClick={toggleSkyler} variant="secondary">
                Ask Skyler for Help
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}