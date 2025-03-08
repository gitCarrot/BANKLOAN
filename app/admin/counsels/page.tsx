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

// 상담 타입 정의
interface Counsel {
  counselId: number;
  name: string;
  cellPhone: string;
  email: string;
  memo?: string | null;
  address?: string | null;
  addressDetail?: string | null;
  zipCode?: string | null;
  appliedAt: Date;
  createdAt?: Date;  // optional로 변경
  updatedAt?: Date;  // optional로 변경
  isDeleted?: boolean; // optional로 변경
  id?: string; // MongoDB ObjectId
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
      const result = await getCounselById(counselId.toString());
      
      if (result.error) {
        console.error(result.error);
        return;
      }
      
      if (result.counsel) {
        setSelectedCounsel(result.counsel);
        setViewDialogOpen(true);
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
      const result = await deleteCounsel(selectedCounsel.counselId.toString());
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.success) {
        // Remove deleted counsel from the list
        setCounsels(prevCounsels => 
          prevCounsels.filter(counsel => counsel.counselId !== selectedCounsel.counselId)
        );
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error('Error deleting counsel:', err);
      setError('Failed to delete consultation. Please try again later.');
    }
  };

  const filteredCounsels = counsels.filter(counsel => {
    // 검색어 필터링
    const matchesSearch = 
      counsel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsel.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsel.cellPhone.includes(searchTerm);
    
    // 탭 필터링
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Loan Consultation Management</CardTitle>
          <CardDescription>
            Manage customer loan consultation requests and view detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <div className="w-[400px]">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
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
          
          <div className="mt-6">
            {activeTab === 'all' && (
              <>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading...</p>
                  </div>
                ) : filteredCounsels.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No consultation records found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Total {filteredCounsels.length} consultation records</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCounsels.map((counsel) => (
                        <TableRow key={counsel.counselId}>
                          <TableCell>{counsel.counselId}</TableCell>
                          <TableCell>{counsel.name}</TableCell>
                          <TableCell>{counsel.cellPhone}</TableCell>
                          <TableCell>{counsel.email}</TableCell>
                          <TableCell>{format(new Date(counsel.appliedAt), 'yyyy-MM-dd')}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewCounsel(counsel.counselId)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCounsel(counsel)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
            
            {activeTab === 'recent' && (
              <>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading...</p>
                  </div>
                ) : filteredCounsels.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No recent consultation records found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Recent consultation records</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCounsels
                        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                        .slice(0, 10)
                        .map((counsel) => (
                          <TableRow key={counsel.counselId}>
                            <TableCell>{counsel.counselId}</TableCell>
                            <TableCell>{counsel.name}</TableCell>
                            <TableCell>{counsel.cellPhone}</TableCell>
                            <TableCell>{counsel.email}</TableCell>
                            <TableCell>{format(new Date(counsel.appliedAt), 'yyyy-MM-dd')}</TableCell>
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
                                  <DropdownMenuItem onClick={() => handleViewCounsel(counsel.counselId)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteCounsel(counsel)}
                                    className="text-red-600"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Counsel Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>
              View detailed information about this loan consultation request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCounsel && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedCounsel.name}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <div className="col-span-3">{selectedCounsel.cellPhone}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{selectedCounsel.email}</div>
              </div>
              
              {selectedCounsel.address && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Address</Label>
                  <div className="col-span-3">
                    {selectedCounsel.zipCode && `(${selectedCounsel.zipCode}) `}
                    {selectedCounsel.address}
                    {selectedCounsel.addressDetail && `, ${selectedCounsel.addressDetail}`}
                  </div>
                </div>
              )}
              
              {selectedCounsel.memo && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Memo</Label>
                  <div className="col-span-3 whitespace-pre-wrap">{selectedCounsel.memo}</div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Application Date</Label>
                <div className="col-span-3">
                  {format(new Date(selectedCounsel.appliedAt), 'yyyy-MM-dd HH:mm')}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedCounsel && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setViewDialogOpen(false);
                  handleDeleteCounsel(selectedCounsel);
                }}
              >
                Delete
              </Button>
            )}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 