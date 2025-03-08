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
  Calendar, 
  CheckCircle, 
  CreditCard, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash, 
  XCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { getRepayments, createRepayment, deleteRepayment } from '@/app/actions/repayments';
import { getApplicationById, getApplications } from '@/app/actions/applications';
import { getContractByApplicationId } from '@/app/actions/contracts';
import { useToast } from '@/components/ui/use-toast';

// 상환 타입 정의
interface Repayment {
  repaymentId: number;
  applicationId: number;
  contractId?: number;
  name?: string;
  repaymentAmount: number;
  status?: 'pending' | 'completed' | 'failed';
  repaymentDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

// 상환 폼 데이터 타입
interface RepaymentFormData {
  applicationId: number;
  contractId?: number;
  repaymentAmount: number;
  repaymentDate?: Date;
}

export default function AdminRepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [filteredRepayments, setFilteredRepayments] = useState<Repayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepayment, setSelectedRepayment] = useState<Repayment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState<RepaymentFormData>({
    applicationId: 0,
    repaymentAmount: 0,
  });
  const [applicationId, setApplicationId] = useState<string>('');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 상환 목록 가져오기
  useEffect(() => {
    fetchAllRepayments();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRepayments(repayments);
    } else {
      const filtered = repayments.filter(repayment => 
        (repayment.name && repayment.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        repayment.applicationId.toString().includes(searchTerm) ||
        repayment.repaymentId.toString().includes(searchTerm)
      );
      setFilteredRepayments(filtered);
    }
  }, [searchTerm, repayments]);

  // 탭 변경 시 필터링
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredRepayments(repayments);
    } else {
      setFilteredRepayments(repayments.filter(repayment => repayment.status === activeTab));
    }
  }, [activeTab, repayments]);

  const fetchAllRepayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 모든 애플리케이션 가져오기 (getApplicationById('all') 대신 다른 방식 사용)
      // 여기서는 getApplications 함수를 사용한다고 가정합니다
      const applications = await getApplications();
      
      if (!applications || applications.length === 0) {
        setRepayments([]);
        setFilteredRepayments([]);
        return;
      }
      
      // 각 애플리케이션에 대한 상환 정보 가져오기
      const allRepayments: Repayment[] = [];
      
      for (const app of applications) {
        try {
          const appRepayments = await getRepayments(app.applicationId.toString());
          
          // 상환 데이터에 이름 추가
          const repaymentsWithNames = appRepayments.map(repayment => ({
            ...repayment,
            name: app.name,
            status: 'completed' as const,
            repaymentDate: repayment.createdAt
          }));
          
          allRepayments.push(...repaymentsWithNames);
        } catch (err) {
          console.error(`Error fetching repayments for application ${app.applicationId}:`, err);
        }
      }
      
      setRepayments(allRepayments);
      setFilteredRepayments(allRepayments);
    } catch (err) {
      console.error('Error fetching repayments:', err);
      setError('Failed to load repayments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRepayment = (repayment: Repayment) => {
    setSelectedRepayment(repayment);
    setViewDialogOpen(true);
  };

  const handleCreateRepayment = () => {
    setFormData({
      applicationId: 0,
      repaymentAmount: 0,
    });
    setApplicationId('');
    setApplicationData(null);
    setContractData(null);
    setCreateDialogOpen(true);
  };

  const handleDeleteRepayment = (repayment: Repayment) => {
    setSelectedRepayment(repayment);
    setDeleteDialogOpen(true);
  };

  const handleSearchApplication = async () => {
    if (!applicationId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an application ID",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const { application, error } = await getApplicationById(applicationId);
      
      if (error || !application) {
        toast({
          title: "Error",
          description: error || "Application not found",
          variant: "destructive"
        });
        return;
      }
      
      // 계약 정보 가져오기
      const contract = await getContractByApplicationId(application.applicationId);
      
      if (!contract) {
        toast({
          title: "Error",
          description: "No active contract found for this application",
          variant: "destructive"
        });
        return;
      }
      
      setApplicationData(application);
      setContractData(contract);
      setFormData({
        applicationId: application.applicationId,
        contractId: contract.contractId,
        repaymentAmount: Math.round(contract.amount / contract.term), // 월 상환액 계산 (간단한 예시)
        repaymentDate: new Date(),
      });
    } catch (err) {
      console.error('Error searching application:', err);
      toast({
        title: "Error",
        description: "Failed to search application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmCreate = async () => {
    try {
      setIsProcessing(true);
      
      await createRepayment(formData.applicationId.toString(), formData.repaymentAmount);
      
      toast({
        title: "Success",
        description: "Repayment created successfully",
      });
      
      setCreateDialogOpen(false);
      fetchAllRepayments();
    } catch (err) {
      console.error('Error creating repayment:', err);
      toast({
        title: "Error",
        description: "Failed to create repayment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedRepayment) return;
    
    try {
      setIsProcessing(true);
      
      await deleteRepayment(selectedRepayment.repaymentId.toString());
      
      toast({
        title: "Success",
        description: "Repayment deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      fetchAllRepayments();
    } catch (err) {
      console.error('Error deleting repayment:', err);
      toast({
        title: "Error",
        description: "Failed to delete repayment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-10"
    >
      <Card>
        <CardHeader>
          <CardTitle>Loan Repayments</CardTitle>
          <CardDescription>
            Manage and track loan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={handleCreateRepayment}>
              <Plus className="mr-2 h-4 w-4" />
              New Repayment
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading repayments...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <XCircle className="h-8 w-8 mr-2" />
              {error}
            </div>
          ) : filteredRepayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No repayments found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepayments.map((repayment) => (
                  <TableRow key={repayment.repaymentId}>
                    <TableCell>{repayment.repaymentId}</TableCell>
                    <TableCell>{repayment.applicationId}</TableCell>
                    <TableCell>{repayment.name || 'Unknown'}</TableCell>
                    <TableCell>${repayment.repaymentAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          repayment.status === 'completed' 
                            ? 'default' 
                            : repayment.status === 'failed' 
                              ? 'destructive' 
                              : 'secondary'
                        }
                      >
                        {repayment.status || 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(repayment.createdAt || new Date()), 'PPP')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewRepayment(repayment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRepayment(repayment)}>
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
        </CardContent>
      </Card>

      {/* View Repayment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Repayment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this loan repayment.
            </DialogDescription>
          </DialogHeader>
          {selectedRepayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Repayment ID</Label>
                <div className="col-span-3">{selectedRepayment.repaymentId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Application ID</Label>
                <div className="col-span-3">{selectedRepayment.applicationId}</div>
              </div>
              {selectedRepayment.contractId && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Contract ID</Label>
                  <div className="col-span-3">{selectedRepayment.contractId}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedRepayment.name || 'Unknown'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount</Label>
                <div className="col-span-3">${selectedRepayment.repaymentAmount.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedRepayment.status === 'completed' 
                        ? 'default' 
                        : selectedRepayment.status === 'failed' 
                          ? 'destructive' 
                          : 'secondary'
                    }
                  >
                    {selectedRepayment.status || 'Completed'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <div className="col-span-3">{format(new Date(selectedRepayment.createdAt || new Date()), 'PPP')}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedRepayment) {
                  handleDeleteRepayment(selectedRepayment);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Repayment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Repayment</DialogTitle>
            <DialogDescription>
              Create a new repayment for a loan application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="applicationId" className="text-right">Application ID</Label>
              <div className="col-span-3 flex space-x-2">
                <Input
                  id="applicationId"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  disabled={!!applicationData}
                />
                <Button 
                  variant="outline" 
                  onClick={handleSearchApplication}
                  disabled={isProcessing || !!applicationData}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>

            {applicationData && contractData && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <div className="col-span-3">{applicationData.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Contract ID</Label>
                  <div className="col-span-3">{contractData.contractId}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Loan Amount</Label>
                  <div className="col-span-3">${contractData.amount.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="repaymentAmount" className="text-right">Repayment Amount</Label>
                  <div className="col-span-3">
                    <Input
                      id="repaymentAmount"
                      type="number"
                      value={formData.repaymentAmount}
                      onChange={(e) => setFormData({...formData, repaymentAmount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setApplicationData(null);
              setContractData(null);
              setApplicationId('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmCreate} 
              disabled={isProcessing || !applicationData || !contractData}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Repayment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Repayment Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repayment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repayment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedRepayment && (
            <div className="py-4">
              <p><strong>Repayment ID:</strong> {selectedRepayment.repaymentId}</p>
              <p><strong>Application ID:</strong> {selectedRepayment.applicationId}</p>
              <p><strong>Amount:</strong> ${selectedRepayment.repaymentAmount.toLocaleString()}</p>
              <p><strong>Date:</strong> {format(new Date(selectedRepayment.createdAt || new Date()), 'PPP')}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 