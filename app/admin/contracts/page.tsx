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
  Download, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Search, 
  XCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  getContracts, 
  getContractById, 
  updateContract 
} from '@/app/actions/contracts';
import { getJudgmentById } from '@/app/actions/judgments';
import { getApplicationById } from '@/app/actions/applications';
import { ContractResponse } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

// 계약 타입 정의
interface Contract {
  contractId: number;
  applicationId: number;
  judgmentId: number;
  name?: string;
  amount: number;
  interestRate: number;
  term: number; // months
  status: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  signedAt?: Date;
  activatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [judgmentData, setJudgmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 계약 목록 가져오기
  useEffect(() => {
    fetchContracts();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContracts(contracts);
    } else {
      const filtered = contracts.filter(contract => 
        (contract.name && contract.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contract.applicationId.toString().includes(searchTerm) ||
        contract.contractId.toString().includes(searchTerm)
      );
      setFilteredContracts(filtered);
    }
  }, [searchTerm, contracts]);

  // 탭 변경 시 필터링
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredContracts(contracts);
    } else {
      setFilteredContracts(contracts.filter(contract => contract.status === activeTab));
    }
  }, [activeTab, contracts]);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getContracts();
      
      // 계약 데이터에 이름 추가 (API에서 제공하지 않는 경우)
      const contractsWithNames = await Promise.all(
        data.map(async (contract) => {
          try {
            const { application } = await getApplicationById(contract.applicationId.toString());
            return {
              ...contract,
              name: application?.name || 'Unknown'
            };
          } catch (err) {
            return {
              ...contract,
              name: 'Unknown'
            };
          }
        })
      );
      
      setContracts(contractsWithNames);
      setFilteredContracts(contractsWithNames);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = async (contractId: number) => {
    try {
      setIsLoading(true);
      const contract = await getContractById(contractId.toString());
      
      if (contract) {
        // 관련 애플리케이션 및 심사 데이터 가져오기
        const { application } = await getApplicationById(contract.applicationId.toString());
        const judgment = await getJudgmentById(contract.judgmentId.toString());
        
        setApplicationData(application);
        setJudgmentData(judgment);
        setSelectedContract({
          ...contract,
          name: application?.name || 'Unknown'
        });
        setViewDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching contract details:', err);
      toast({
        title: "Error",
        description: "Failed to load contract details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContract = (contract: Contract) => {
    setSelectedContract(contract);
    setUpdateDialogOpen(true);
  };

  const handleStatusChange = async (status: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled') => {
    if (!selectedContract) return;
    
    try {
      setIsProcessing(true);
      
      const updateData: any = { status };
      
      // 상태에 따라 날짜 필드 업데이트
      if (status === 'signed' && !selectedContract.signedAt) {
        updateData.signedAt = new Date();
      }
      
      if (status === 'active' && !selectedContract.activatedAt) {
        updateData.activatedAt = new Date();
      }
      
      await updateContract(selectedContract.contractId.toString(), updateData);
      
      toast({
        title: "Success",
        description: `Contract status updated to ${status}`,
      });
      
      setUpdateDialogOpen(false);
      fetchContracts();
    } catch (err) {
      console.error('Error updating contract:', err);
      toast({
        title: "Error",
        description: "Failed to update contract status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 계약 상태에 따른 진행률 계산
  const getProgressByStatus = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'signed': return 50;
      case 'active': return 75;
      case 'completed': return 100;
      case 'cancelled': return 100;
      default: return 0;
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
          <CardTitle>Loan Contracts</CardTitle>
          <CardDescription>
            Manage and track loan contracts
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[500px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="signed">Signed</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading contracts...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <XCircle className="h-8 w-8 mr-2" />
              {error}
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contracts found.
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
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.contractId}>
                    <TableCell>{contract.contractId}</TableCell>
                    <TableCell>{contract.applicationId}</TableCell>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>${contract.amount.toLocaleString()}</TableCell>
                    <TableCell>{contract.interestRate}%</TableCell>
                    <TableCell>{contract.term} months</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          contract.status === 'active' || contract.status === 'completed'
                            ? 'default' 
                            : contract.status === 'cancelled' 
                              ? 'destructive' 
                              : 'secondary'
                        }
                      >
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-[100px]">
                        <Progress value={getProgressByStatus(contract.status)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewContract(contract.contractId)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateContract(contract)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Contract
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

      {/* View Contract Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              View detailed information about this loan contract.
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Contract ID</Label>
                <div className="col-span-3">{selectedContract.contractId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Application ID</Label>
                <div className="col-span-3">{selectedContract.applicationId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Judgment ID</Label>
                <div className="col-span-3">{selectedContract.judgmentId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedContract.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount</Label>
                <div className="col-span-3">${selectedContract.amount.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Interest Rate</Label>
                <div className="col-span-3">{selectedContract.interestRate}%</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Term</Label>
                <div className="col-span-3">{selectedContract.term} months</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedContract.status === 'active' || selectedContract.status === 'completed'
                        ? 'default' 
                        : selectedContract.status === 'cancelled' 
                          ? 'destructive' 
                          : 'secondary'
                    }
                  >
                    {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created Date</Label>
                <div className="col-span-3">{format(new Date(selectedContract.createdAt || new Date()), 'PPP')}</div>
              </div>
              {selectedContract.signedAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Signed Date</Label>
                  <div className="col-span-3">{format(new Date(selectedContract.signedAt), 'PPP')}</div>
                </div>
              )}
              {selectedContract.activatedAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Activated Date</Label>
                  <div className="col-span-3">{format(new Date(selectedContract.activatedAt), 'PPP')}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Progress</Label>
                <div className="col-span-3">
                  <Progress value={getProgressByStatus(selectedContract.status)} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Pending</span>
                    <span>Signed</span>
                    <span>Active</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (selectedContract) {
                handleUpdateContract(selectedContract);
              }
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Contract Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Contract Status</DialogTitle>
            <DialogDescription>
              Change the status of this loan contract.
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Current Status</Label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedContract.status === 'active' || selectedContract.status === 'completed'
                        ? 'default' 
                        : selectedContract.status === 'cancelled' 
                          ? 'destructive' 
                          : 'secondary'
                    }
                  >
                    {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">New Status</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleStatusChange('pending')}
                      disabled={selectedContract.status === 'pending' || isProcessing}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleStatusChange('signed')}
                      disabled={selectedContract.status === 'signed' || isProcessing}
                    >
                      Signed
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleStatusChange('active')}
                      disabled={selectedContract.status === 'active' || isProcessing}
                    >
                      Active
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleStatusChange('completed')}
                      disabled={selectedContract.status === 'completed' || isProcessing}
                    >
                      Completed
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-destructive"
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={selectedContract.status === 'cancelled' || isProcessing}
                    >
                      Cancelled
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            {isProcessing && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 