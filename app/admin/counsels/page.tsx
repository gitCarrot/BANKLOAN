'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  Eye, 
  MoreHorizontal, 
  Search, 
  Trash, 
  XCircle 
} from 'lucide-react';
import { 
  getCounsels, 
  getCounselById, 
  updateCounsel, 
  deleteCounsel 
} from '@/app/actions/counsels';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

// Define counsel interface
interface Counsel {
  counselId: number;
  name: string;
  cellPhone: string;
  email: string;
  memo?: string;
  address?: string;
  addressDetail?: string;
  zipCode?: string;
  appliedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  id?: string;
}

export default function AdminCounselsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [counsels, setCounsels] = useState<Counsel[]>([]);
  const [selectedCounsel, setSelectedCounsel] = useState<Counsel | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounsels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use real API call
        const data = await getCounsels();
        setCounsels(data);
      } catch (err) {
        console.error('Error fetching counsels:', err);
        setError('Failed to load consultation records. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounsels();
  }, []);

  const handleViewCounsel = async (counselId: number) => {
    try {
      // Use real API call
      const counsel = await getCounselById(counselId.toString());
      
      if (counsel) {
        setSelectedCounsel(counsel);
        setViewDialogOpen(true);
      } else {
        setError('Counsel not found');
      }
    } catch (err) {
      console.error('Error fetching counsel details:', err);
      setError('Failed to load consultation details. Please try again later.');
    }
  };

  const handleDeleteCounsel = (counsel: Counsel) => {
    setSelectedCounsel(counsel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCounsel) return;
    
    try {
      // Use real API call
      await deleteCounsel(selectedCounsel.counselId.toString());
      
      // Remove deleted counsel from the list
      setCounsels(prevCounsels => 
        prevCounsels.filter(counsel => counsel.counselId !== selectedCounsel.counselId)
      );
      setDeleteDialogOpen(false);
      setSelectedCounsel(null);
    } catch (err) {
      console.error('Error deleting counsel:', err);
      setError('Failed to delete consultation. Please try again later.');
    }
  };

  // Search and filter
  const filteredCounsels = counsels.filter(counsel => {
    const matchesSearch = 
      counsel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsel.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsel.cellPhone.includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && new Date(counsel.appliedAt) >= oneWeekAgo;
    }
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Loan Consultation Management</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Consultation List</CardTitle>
          <CardDescription>
            Manage customer loan consultation requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="recent">Last 7 Days</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone"
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                        <div className="mt-2">Loading data...</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCounsels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCounsels.map((counsel) => (
                      <TableRow key={counsel.counselId}>
                        <TableCell>{counsel.counselId}</TableCell>
                        <TableCell>{counsel.name}</TableCell>
                        <TableCell>{counsel.cellPhone}</TableCell>
                        <TableCell>{counsel.email}</TableCell>
                        <TableCell>{format(new Date(counsel.appliedAt), 'yyyy-MM-dd')}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {counsel.memo || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewCounsel(counsel.counselId)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteCounsel(counsel)}>
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
          </div>
        </CardContent>
      </Card>

      {/* Counsel Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>
              Consultation ID: {selectedCounsel?.counselId}
            </DialogDescription>
          </DialogHeader>
          {selectedCounsel && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 rounded-md border">{selectedCounsel.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="p-2 rounded-md border">{selectedCounsel.cellPhone}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 rounded-md border">{selectedCounsel.email}</div>
              </div>
              <div className="space-y-2">
                <Label>Application Date</Label>
                <div className="p-2 rounded-md border">
                  {format(new Date(selectedCounsel.appliedAt), 'yyyy-MM-dd HH:mm')}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Address</Label>
                <div className="p-2 rounded-md border">
                  {selectedCounsel.zipCode && `(${selectedCounsel.zipCode}) `}
                  {selectedCounsel.address} {selectedCounsel.addressDetail}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Memo</Label>
                <div className="p-2 rounded-md border min-h-[100px]">
                  {selectedCounsel.memo || 'No memo'}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this consultation record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 