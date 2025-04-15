import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { WillContact } from "@shared/schema";

// Contact form validation schema
export type ContactFormValues = {
  name: string;
  relationship: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  role: 'beneficiary' | 'executor' | 'witness' | 'other';
  notes?: string;
};

// Hook for managing contacts for a specific will
export function useWillContacts(willId: number) {
  const queryClient = useQueryClient();
  
  // Get contacts for a specific will
  const {
    data: contacts = [],
    isLoading,
    error,
    refetch
  } = useQuery<WillContact[]>({
    queryKey: ['/api/wills', willId, 'contacts'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/wills/${willId}/contacts`);
      return res.json();
    },
    enabled: !!willId,
  });

  // Add a contact to a will
  const addContactMutation = useMutation({
    mutationFn: async (contactData: ContactFormValues) => {
      const res = await apiRequest('POST', `/api/wills/${willId}/contacts`, contactData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact added",
        description: "The contact has been added to your will.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/wills', willId, 'contacts']});
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add contact",
        description: error.message || "There was an error adding the contact. Please try again.",
        variant: "destructive",
      });
      return false;
    },
  });

  // Update an existing contact
  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, data }: { contactId: number; data: ContactFormValues }) => {
      const res = await apiRequest('PUT', `/api/wills/${willId}/contacts/${contactId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "The contact information has been updated successfully.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/wills', willId, 'contacts']});
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update contact information. Please try again.",
        variant: "destructive",
      });
      return false;
    },
  });

  // Delete a contact
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const res = await apiRequest('DELETE', `/api/wills/${willId}/contacts/${contactId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "The contact has been removed from your will.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/wills', willId, 'contacts']});
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
      return false;
    },
  });

  // Add a contact to the will with validation
  const addContact = async (contactData: ContactFormValues) => {
    return addContactMutation.mutateAsync(contactData);
  };

  // Update a contact with validation
  const updateContact = async (contactId: number, contactData: ContactFormValues) => {
    return updateContactMutation.mutateAsync({ contactId, data: contactData });
  };

  // Delete a contact
  const deleteContact = async (contactId: number) => {
    return deleteContactMutation.mutateAsync(contactId);
  };

  return {
    contacts,
    isLoading,
    error,
    refetch,
    addContact,
    updateContact,
    deleteContact,
    adding: addContactMutation.isPending,
    updating: updateContactMutation.isPending,
    deleting: deleteContactMutation.isPending,
  };
}