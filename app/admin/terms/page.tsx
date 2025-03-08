'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Edit, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash,
  Loader2
} from 'lucide-react';
import { createTerms, getTerms, getTermsById, updateTerms, deleteTerms } from '@/app/actions/terms';
import { Terms } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 약관 타입 정의
interface Term {
  termsId: number;
  name: string;
  termsDetailUrl: string;
  content?: string;
  version?: string;
  isRequired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

// 새 약관 생성 및 수정을 위한 타입
interface TermFormData {
  name: string;
  termsDetailUrl: string;
  content: string;
  version: string;
  isRequired: boolean;
}

export default function AdminTermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<Term[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [formData, setFormData] = useState<TermFormData>({
    name: '',
    termsDetailUrl: '',
    content: '',
    version: '1.0',
    isRequired: true
  });
  
  const { toast } = useToast();
  
  // Define fetchTerms with useCallback
  const fetchTerms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTerms();
      setTerms(data);
      setFilteredTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load terms',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // 약관 목록 가져오기
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);
  
  // 검색어 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTerms(terms);
    } else {
      const filtered = terms.filter(term => 
        term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.termsDetailUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (term.version && term.version.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTerms(filtered);
    }
  }, [searchTerm, terms]);
  
  const handleViewTerm = async (term: Term) => {
    setSelectedTerm(term);
    setViewDialogOpen(true);
  };
  
  const handleEditTerm = (term: Term) => {
    setSelectedTerm(term);
    setFormData({
      name: term.name,
      termsDetailUrl: term.termsDetailUrl,
      content: term.content || '',
      version: term.version || '1.0',
      isRequired: term.isRequired
    });
    setEditDialogOpen(true);
  };
  
  const handleDeleteTerm = (term: Term) => {
    setSelectedTerm(term);
    setDeleteDialogOpen(true);
  };
  
  const handleCreateTerm = () => {
    setSelectedTerm(null);
    setFormData({
      name: '',
      termsDetailUrl: '',
      content: '',
      version: '1.0',
      isRequired: true
    });
    setEditDialogOpen(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isRequired: checked
    }));
  };
  
  const handleUpdateTerm = async () => {
    try {
      setIsSubmitting(true);
      
      if (!formData.name || !formData.termsDetailUrl) {
        toast({
          title: "Validation Error",
          description: "Name and URL are required fields.",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedTerm) {
        // 기존 약관 수정
        await updateTerms(selectedTerm.termsId.toString(), formData);
        toast({
          title: "Success",
          description: "Terms updated successfully."
        });
      } else {
        // 새 약관 생성
        await createTerms(formData);
        toast({
          title: "Success",
          description: "New terms created successfully."
        });
      }
      
      setEditDialogOpen(false);
      fetchTerms();
    } catch (error) {
      console.error('Error updating/creating terms:', error);
      toast({
        title: "Error",
        description: "Failed to save terms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedTerm) return;
    
    try {
      setIsSubmitting(true);
      const result = await deleteTerms(selectedTerm.termsId.toString());
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Success",
        description: "Terms deleted successfully."
      });
      
      setDeleteDialogOpen(false);
      fetchTerms();
    } catch (error: any) {
      console.error('Error deleting terms:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete terms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Terms & Conditions Management</CardTitle>
                <CardDescription>
                  Manage the terms and conditions for your application
                </CardDescription>
              </div>
              <Button onClick={handleCreateTerm}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Terms
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terms..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading terms...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTerms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No terms found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTerms.map((term) => (
                      <TableRow key={term.termsId}>
                        <TableCell>{term.termsId}</TableCell>
                        <TableCell>{term.name}</TableCell>
                        <TableCell>{term.version || 'N/A'}</TableCell>
                        <TableCell>
                          {term.isRequired ? (
                            <Badge variant="default">Required</Badge>
                          ) : (
                            <Badge variant="outline">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>{term.updatedAt ? format(new Date(term.updatedAt), 'PPP') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewTerm(term)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTerm(term)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTerm(term)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* View Terms Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Terms & Conditions</DialogTitle>
            <DialogDescription>
              Viewing details for {selectedTerm?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTerm && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/50">
                    {selectedTerm.name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/50">
                    {selectedTerm.version || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">URL</Label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50 break-all">
                  <a 
                    href={selectedTerm.termsDetailUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedTerm.termsDetailUrl}
                  </a>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Required</Label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  {selectedTerm.isRequired ? 'Yes' : 'No'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-1 p-4 border rounded-md bg-muted/50 max-h-[300px] overflow-y-auto">
                  {selectedTerm.content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {selectedTerm.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No content available</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/50">
                    {selectedTerm.createdAt ? format(new Date(selectedTerm.createdAt), 'PPP p') : 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/50">
                    {selectedTerm.updatedAt ? format(new Date(selectedTerm.updatedAt), 'PPP p') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit/Create Terms Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTerm ? 'Edit Terms & Conditions' : 'Create New Terms & Conditions'}
            </DialogTitle>
            <DialogDescription>
              {selectedTerm 
                ? `Update the details for ${selectedTerm.name}`
                : 'Fill in the details to create new terms and conditions'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="e.g. Privacy Policy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  name="version" 
                  value={formData.version} 
                  onChange={handleFormChange} 
                  placeholder="e.g. 1.0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="termsDetailUrl">URL</Label>
              <Input 
                id="termsDetailUrl" 
                name="termsDetailUrl" 
                value={formData.termsDetailUrl} 
                onChange={handleFormChange} 
                placeholder="e.g. /terms/privacy-policy"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isRequired" 
                checked={formData.isRequired} 
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isRequired">Required for user agreement</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                name="content" 
                value={formData.content} 
                onChange={handleFormChange} 
                placeholder="Enter the full terms and conditions text here..."
                className="min-h-[300px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTerm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                selectedTerm ? 'Update Terms' : 'Create Terms'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the terms "{selectedTerm?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 