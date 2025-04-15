import React, { useState } from "react";
import { useLocation } from "wouter";
import { useWills } from "@/hooks/use-wills";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Edit, Trash2, FileText, Eye, ArrowLeft, Clock, CheckCircle, AlertTriangle, LockIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ManageWillsPage() {
  const [, navigate] = useLocation();
  const { wills, isLoading, deleteWillMutation } = useWills();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusIcons = {
    draft: <Clock className="h-4 w-4 text-yellow-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    locked: <LockIcon className="h-4 w-4 text-blue-500" />,
  };

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    locked: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

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

  const handleEdit = (willId: number) => {
    navigate(`/wills/${willId}/edit`);
  };

  const handleView = (willId: number) => {
    navigate(`/wills/${willId}/view`);
  };

  const handleCreateNew = () => {
    navigate("/wills");
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteWillMutation.mutateAsync(deleteId);
        setDeleteDialogOpen(false);
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete will:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/wills")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">My Wills</h1>
            </div>
            <p className="text-muted-foreground mt-1">Manage your existing wills and documents</p>
          </div>
          <Button onClick={handleCreateNew}>Create New Will</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wills && wills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wills.map((will) => (
              <Card key={will.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{will.title}</CardTitle>
                    <Badge 
                      className={statusColors[will.status as keyof typeof statusColors] || "bg-gray-100"}
                      variant="outline"
                    >
                      <span className="flex items-center gap-1">
                        {statusIcons[will.status as keyof typeof statusIcons] || <AlertTriangle className="h-4 w-4" />}
                        {will.status?.charAt(0).toUpperCase() + will.status?.slice(1) || "Unknown"}
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>
                    {getTemplateTitle(will.templateId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Created: {will.createdAt ? format(new Date(will.createdAt), 'PP') : 'Unknown'}</p>
                    <p>Last updated: {will.lastUpdated ? format(new Date(will.lastUpdated), 'PP') : 'Unknown'}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(will.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {will.status !== "locked" && (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(will.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setDeleteId(will.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Wills Found</h3>
            <p className="text-muted-foreground">You haven't created any wills yet.</p>
            <Button onClick={handleCreateNew}>Create Your First Will</Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your will
              and remove all associated documents and contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              {deleteWillMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Will
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}