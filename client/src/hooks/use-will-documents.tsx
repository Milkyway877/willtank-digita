import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Document } from "@shared/schema";

// Hook for managing documents for a specific will
export function useWillDocuments(willId: number) {
  const queryClient = useQueryClient();
  
  // Get documents for a specific will
  const {
    data: documents = [],
    isLoading,
    error,
    refetch
  } = useQuery<Document[]>({
    queryKey: ['/api/wills', willId, 'documents'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/wills/${willId}/documents`);
      return res.json();
    },
    enabled: !!willId,
  });

  // Upload document to a will
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest('POST', `/api/wills/${willId}/documents`, null, {
        headers: {}, // Let browser set content-type with boundary for FormData
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/wills', willId, 'documents']});
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      return false;
    },
  });

  // Delete document from a will
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await apiRequest('DELETE', `/api/wills/${willId}/documents/${documentId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/wills', willId, 'documents']});
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive",
      });
      return false;
    },
  });

  // Function to upload a document with categorization
  const uploadDocument = async (file: File, description: string, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('category', category);
    
    return uploadDocumentMutation.mutateAsync(formData);
  };

  // Function to delete a document
  const deleteDocument = async (documentId: number) => {
    return deleteDocumentMutation.mutateAsync(documentId);
  };

  return {
    documents,
    isLoading,
    error,
    refetch,
    uploadDocument,
    deleteDocument,
    uploading: uploadDocumentMutation.isPending,
    deleting: deleteDocumentMutation.isPending,
  };
}