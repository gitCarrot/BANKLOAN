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
  CheckCircle, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Search, 
  XCircle,
  Loader2
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { 
  getJudgments, 
  getJudgmentById, 
  createJudgment, 
  updateJudgment, 
  deleteJudgment 
} from '@/app/actions/judgments';
import { getApplicationById } from '@/app/actions/applications';
import { createContract } from '@/app/actions/contracts';
import { JudgmentResponse } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// 심사 타입 정의
interface Judgment {
  judgmentId: number;
  applicationId: number;
  name: string;
  approvalAmount: number;
  approvalInterestRate: number;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  reason?: string;
}

// 심사 폼 데이터 타입
interface JudgmentFormData {
  approvalAmount: number;
  approvalInterestRate: number;
  reason?: string;
}

export default function AdminJudgmentsPage() {
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [filteredJudgments, setFilteredJudgments] = useState<Judgment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJudgment, setSelectedJudgment] = useState<Judgment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState<JudgmentFormData>({
    approvalAmount: 0,
    approvalInterestRate: 0,
  });
  const [applicationId, setApplicationId] = useState<string>('');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 심사 목록 가져오기
  useEffect(() => {
    fetchJudgments();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJudgments(judgments);
    } else {
      const filtered = judgments.filter(judgment => 
        judgment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judgment.applicationId.toString().includes(searchTerm)
      );
      setFilteredJudgments(filtered);
    }
  }, [searchTerm, judgments]);

  // 탭 변경 시 필터링
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredJudgments(judgments);
    } else if (activeTab === 'pending') {
      setFilteredJudgments(judgments.filter(judgment => judgment.status === 'pending'));
    } else if (activeTab === 'approved') {
      setFilteredJudgments(judgments.filter(judgment => judgment.status === 'approved'));
    } else if (activeTab === 'rejected') {
      setFilteredJudgments(judgments.filter(judgment => judgment.status === 'rejected'));
    }
  }, [activeTab, judgments]);

  const fetchJudgments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getJudgments();
      
      // 심사 상태 추가 (API에서 제공하지 않는 경우)
      const judgmentsWithStatus = data.map(judgment => ({
        ...judgment,
        status: judgment.approvalAmount > 0 ? 'approved' as const : 
               judgment.approvalAmount === 0 ? 'pending' as const : 'rejected' as const
      }));
      
      setJudgments(judgmentsWithStatus);
      setFilteredJudgments(judgmentsWithStatus);
    } catch (err) {
      console.error('Error fetching judgments:', err);
      setError('Failed to load judgments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJudgment = async (judgmentId: number) => {
    try {
      setIsLoading(true);
      const judgment = await getJudgmentById(judgmentId.toString());
      if (judgment) {
        setSelectedJudgment({
          ...judgment,
          status: judgment.approvalAmount > 0 ? 'approved' as const : 
                 judgment.approvalAmount === 0 ? 'pending' as const : 'rejected' as const
        });
        setViewDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching judgment details:', err);
      toast({
        title: "Error",
        description: "Failed to load judgment details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditJudgment = (judgment: Judgment) => {
    setSelectedJudgment(judgment);
    setFormData({
      approvalAmount: judgment.status === 'pending' ? 10000 : judgment.approvalAmount,
      approvalInterestRate: judgment.status === 'pending' ? 5.0 : judgment.approvalInterestRate,
      reason: judgment.reason
    });
    setEditDialogOpen(true);
  };

  const handleCreateJudgment = async () => {
    setCreateDialogOpen(true);
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
      
      setApplicationData(application);
      setFormData({
        approvalAmount: application.hopeAmount || 0,
        approvalInterestRate: application.interestRate || 5.0,
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

  const handleSaveJudgment = async () => {
    if (!selectedJudgment) return;
    
    try {
      setIsProcessing(true);
      
      // 승인 또는 거절 여부 결정
      const isApproved = formData.approvalAmount > 0;
      
      // 심사 결과 업데이트
      await updateJudgment(selectedJudgment.judgmentId.toString(), {
        name: selectedJudgment.name,
        approvalAmount: isApproved ? formData.approvalAmount : 0,
        approvalInterestRate: isApproved ? formData.approvalInterestRate : 0,
        reason: formData.reason
      });
      
      toast({
        title: "Success",
        description: `Judgment ${isApproved ? 'approved' : 'rejected'} successfully`,
      });
      
      setEditDialogOpen(false);
      fetchJudgments();
    } catch (err) {
      console.error('Error updating judgment:', err);
      toast({
        title: "Error",
        description: "Failed to update judgment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitJudgment = async () => {
    if (!applicationData) return;
    
    try {
      setIsProcessing(true);
      
      await createJudgment({
        applicationId: applicationData.applicationId,
        name: applicationData.name,
        approvalAmount: formData.approvalAmount,
        approvalInterestRate: formData.approvalInterestRate,
        reason: formData.reason
      });
      
      toast({
        title: "Success",
        description: "Judgment created successfully",
      });
      
      setCreateDialogOpen(false);
      setApplicationData(null);
      setApplicationId('');
      fetchJudgments();
    } catch (err) {
      console.error('Error creating judgment:', err);
      toast({
        title: "Error",
        description: "Failed to create judgment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateContract = async (judgment: Judgment) => {
    try {
      setIsProcessing(true);
      
      await createContract({
        applicationId: judgment.applicationId,
        judgmentId: judgment.judgmentId,
        amount: judgment.approvalAmount,
        interestRate: judgment.approvalInterestRate,
        term: 36, // Default term (3 years)
      });
      
      toast({
        title: "Success",
        description: "Contract created successfully",
      });
      
      fetchJudgments();
    } catch (err) {
      console.error('Error creating contract:', err);
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
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
          <CardTitle>Loan Judgments</CardTitle>
          <CardDescription>
            Manage and review loan judgment requests
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
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={handleCreateJudgment}>New Judgment</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading judgments...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <XCircle className="h-8 w-8 mr-2" />
              {error}
            </div>
          ) : filteredJudgments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No judgments found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJudgments.map((judgment) => (
                  <TableRow key={judgment.judgmentId}>
                    <TableCell>{judgment.judgmentId}</TableCell>
                    <TableCell>{judgment.applicationId}</TableCell>
                    <TableCell>{judgment.name}</TableCell>
                    <TableCell>${judgment.approvalAmount.toLocaleString()}</TableCell>
                    <TableCell>{judgment.approvalInterestRate}%</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          judgment.status === 'approved' 
                            ? 'default' 
                            : judgment.status === 'rejected' 
                              ? 'destructive' 
                              : 'outline'
                        }
                      >
                        {judgment.status === 'approved' 
                          ? 'Approved' 
                          : judgment.status === 'rejected' 
                            ? 'Rejected' 
                            : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(judgment.createdAt || new Date()).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewJudgment(judgment.judgmentId)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditJudgment(judgment)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Edit Judgment
                          </DropdownMenuItem>
                          {judgment.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleCreateContract(judgment)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Create Contract
                            </DropdownMenuItem>
                          )}
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

      {/* View Judgment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Judgment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this loan judgment.
            </DialogDescription>
          </DialogHeader>
          {selectedJudgment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID</Label>
                <div className="col-span-3">{selectedJudgment.judgmentId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Application ID</Label>
                <div className="col-span-3">{selectedJudgment.applicationId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedJudgment.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount</Label>
                <div className="col-span-3">${selectedJudgment.approvalAmount.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Interest Rate</Label>
                <div className="col-span-3">{selectedJudgment.approvalInterestRate}%</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedJudgment.status === 'approved' 
                        ? 'default' 
                        : selectedJudgment.status === 'rejected' 
                          ? 'destructive' 
                          : 'outline'
                    }
                  >
                    {selectedJudgment.status === 'approved' 
                      ? 'Approved' 
                      : selectedJudgment.status === 'rejected' 
                        ? 'Rejected' 
                        : 'Pending'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <div className="col-span-3">{new Date(selectedJudgment.createdAt || new Date()).toLocaleString()}</div>
              </div>
              {selectedJudgment.reason && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Reason</Label>
                  <div className="col-span-3">{selectedJudgment.reason}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedJudgment && selectedJudgment.status === 'approved' && (
              <Button onClick={() => handleCreateContract(selectedJudgment)}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Create Contract</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Judgment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Judgment</DialogTitle>
            <DialogDescription>
              Update the judgment details for this loan application.
            </DialogDescription>
          </DialogHeader>
          {selectedJudgment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <div className="col-span-3">
                  <Input
                    id="amount"
                    type="number"
                    value={formData.approvalAmount}
                    onChange={(e) => setFormData({...formData, approvalAmount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interestRate" className="text-right">Interest Rate</Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[formData.approvalInterestRate]}
                      min={0}
                      max={20}
                      step={0.25}
                      onValueChange={(value) => setFormData({...formData, approvalInterestRate: value[0]})}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{formData.approvalInterestRate}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">Reason</Label>
                <div className="col-span-3">
                  <Input
                    id="reason"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveJudgment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Judgment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Judgment</DialogTitle>
            <DialogDescription>
              Create a new judgment for a loan application.
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

            {applicationData && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <div className="col-span-3">{applicationData.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Requested Amount</Label>
                  <div className="col-span-3">${applicationData.hopeAmount?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="approvalAmount" className="text-right">Approval Amount</Label>
                  <div className="col-span-3">
                    <Input
                      id="approvalAmount"
                      type="number"
                      value={formData.approvalAmount}
                      onChange={(e) => setFormData({...formData, approvalAmount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="interestRate" className="text-right">Interest Rate</Label>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[formData.approvalInterestRate]}
                        min={0}
                        max={20}
                        step={0.25}
                        onValueChange={(value) => setFormData({...formData, approvalInterestRate: value[0]})}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{formData.approvalInterestRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">Reason</Label>
                  <div className="col-span-3">
                    <Input
                      id="reason"
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
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
              setApplicationId('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitJudgment} 
              disabled={isProcessing || !applicationData}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Judgment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 