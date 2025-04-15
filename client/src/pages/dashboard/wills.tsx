import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  FileText, 
  Edit,
  Clock, 
  Trash2, 
  Plus, 
  Check,
  Download,
  Search,
  Loader2,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { saveAs } from 'file-saver';

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  status?: 'draft' | 'completed' | 'locked';
}

interface WillDocument {
  id: number;
  willId: number;
  name: string;
  path: string;
  type: string;
  uploadDate: string;
  size: number;
}

const WillsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedWills, setSelectedWills] = useState<number[]>([]);
  const [willToDelete, setWillToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch user's wills
  const { 
    data: wills = [], 
    isLoading: isLoadingWills,
    isError: isWillsError,
    refetch: refetchWills
  } = useQuery<Will[]>({
    queryKey: ['/api/wills'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wills');
      if (!res.ok) {
        throw new Error('Failed to fetch wills');
      }
      return res.json();
    }
  });
  
  // Delete will mutation
  const deleteWillMutation = useMutation({
    mutationFn: async (willId: number) => {
      const res = await apiRequest('DELETE', `/api/wills/${willId}`);
      if (!res.ok) {
        throw new Error('Failed to delete will');
      }
      return willId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wills'] });
      toast({
        title: 'Will Deleted',
        description: 'The will has been successfully deleted.',
      });
      setWillToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete will: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle will deletion
  const handleDeleteWill = (willId: number) => {
    setWillToDelete(willId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteWill = () => {
    if (willToDelete) {
      deleteWillMutation.mutate(willToDelete);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get time since last update
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // Filter and sort wills
  const filteredWills = wills
    .filter(will => {
      // Apply search filter
      const titleMatch = will.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const contentMatch = will.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = titleMatch || contentMatch;
      
      // Apply status filter
      let statusMatch = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'draft') {
          statusMatch = !will.isComplete;
        } else if (statusFilter === 'completed') {
          statusMatch = will.isComplete;
        }
      }
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? (a.title || '').localeCompare(b.title || '') 
          : (b.title || '').localeCompare(a.title || '');
      } else if (sortBy === 'status') {
        return sortOrder === 'asc'
          ? (a.isComplete ? 1 : -1) 
          : (b.isComplete ? 1 : -1);
      } else {
        // Default sort by updatedAt
        return sortOrder === 'asc'
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredWills.length / itemsPerPage);
  const paginatedWills = filteredWills.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Download will as PDF
  const downloadWillAsPdf = async (willId: number) => {
    try {
      // Use fetch directly to handle blob responses
      const res = await fetch(`/api/wills/${willId}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      
      if (!res.ok) {
        throw new Error('Failed to download will as PDF');
      }
      
      const blob = await res.blob();
      const fileName = `will-${willId}.pdf`;
      saveAs(blob, fileName);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your will has been downloaded as a PDF.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download will as PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (action === 'download') {
      // Download selected wills as PDF
      selectedWills.forEach(willId => {
        downloadWillAsPdf(willId);
      });
    } else if (action === 'delete') {
      // Show confirmation for bulk delete
      toast({
        title: 'Bulk Delete Not Available',
        description: 'For security reasons, please delete wills individually.',
        variant: 'destructive',
      });
    }
    
    // Clear selection after action
    setSelectedWills([]);
  };
  
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWills(paginatedWills.map(will => will.id));
    } else {
      setSelectedWills([]);
    }
  };
  
  // Handle select individual will
  const handleSelectWill = (willId: number, checked: boolean) => {
    if (checked) {
      setSelectedWills([...selectedWills, willId]);
    } else {
      setSelectedWills(selectedWills.filter(id => id !== willId));
    }
  };
  
  // Create new will
  const handleCreateNewWill = () => {
    // Direct to the template selection to start the will creation process with Skyler
    navigate('/will-selection');
  };
  
  // Edit existing will
  const handleEditWill = (willId: number) => {
    // Store the will ID and navigate to AiChat to continue editing with Skyler
    localStorage.setItem('currentWillId', willId.toString());
    navigate('/create-will'); // This routes to AiChat which is renamed to create-will in the router
  };
  
  // View will details
  const handleViewWill = (willId: number) => {
    navigate(`/dashboard/will?id=${willId}`);
  };
  
  // Loading state
  if (isLoadingWills) {
    return (
      <DashboardLayout title="My Wills">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your wills...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (isWillsError) {
    return (
      <DashboardLayout title="My Wills">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Error Loading Wills
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load your wills. Please try again.
          </p>
          <Button onClick={() => refetchWills()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Wills">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>My Wills</CardTitle>
                <CardDescription>
                  Manage your wills and legal documents
                </CardDescription>
              </div>
              
              <Button onClick={handleCreateNewWill} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Create New Will
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search wills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleSort('title')}>
                      Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
                      Last Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedWills.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium mr-2">
                  {selectedWills.length} selected
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('download')}>
                      Download as PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 dark:text-red-400"
                    >
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedWills([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
            
            {/* Wills Table */}
            {paginatedWills.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={paginatedWills.length > 0 && selectedWills.length === paginatedWills.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          Title
                          {sortBy === 'title' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hidden md:table-cell"
                        onClick={() => handleSort('updatedAt')}
                      >
                        <div className="flex items-center">
                          Last Updated
                          {sortBy === 'updatedAt' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortBy === 'status' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWills.map((will) => (
                      <TableRow key={will.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedWills.includes(will.id)}
                            onCheckedChange={(checked) => 
                              handleSelectWill(will.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell 
                          className="font-medium cursor-pointer hover:text-primary"
                          onClick={() => handleViewWill(will.id)}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            {will.title || `Will #${will.id}`}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="hidden lg:inline">{formatDate(will.updatedAt)}</span>
                            <span className="lg:hidden">{getTimeSince(will.updatedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {will.isComplete ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <Check className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewWill(will.id)}
                              title="View Will"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditWill(will.id)}
                              title="Edit Will"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadWillAsPdf(will.id)}
                              title="Download Will"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteWill(will.id)}
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Will"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No wills found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No wills match your search filters. Try adjusting your search terms.'
                    : 'You haven\'t created any wills yet. Get started by creating your first will.'}
                </p>
                {!(searchTerm || statusFilter !== 'all') && (
                  <Button onClick={handleCreateNewWill}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Will
                  </Button>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis when there are gaps in the sequence
                        const showEllipsisBefore =
                          index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Will</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this will? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWill}
              disabled={deleteWillMutation.isPending}
            >
              {deleteWillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Will'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WillsPage;