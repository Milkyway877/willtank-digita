import React, { useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailTest() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await apiRequest("POST", "/api/test-email", { email });
      const data = await response.json();
      
      if (response.ok) {
        setResult("Success: " + data.message);
        toast({
          title: "Email Sent Successfully",
          description: "Check your inbox for the test email",
        });
      } else {
        setResult("Error: " + data.message + (data.details ? ` (${data.details})` : ""));
        toast({
          title: "Failed to Send Email",
          description: data.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing email:", error);
      setResult("Error: Failed to connect to server");
      toast({
        title: "Connection Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Email System Test</CardTitle>
          <CardDescription>
            Send a test email to verify the email system is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Test Email"
              )}
            </Button>
            
            {result && (
              <div className={`mt-4 p-3 rounded-md ${result.startsWith("Success") ? "bg-green-100" : "bg-red-100"}`}>
                {result}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}