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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  ChevronDown, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Search, 
  Trash, 
  XCircle 
} from 'lucide-react';
import { 
  getApplications, 
  getApplicationById, 
  updateApplication, 
  deleteApplication 
} from '@/app/actions/applications';
import { ApplicationResponse } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// 애플리케이션 타입 정의
interface Application {
  applicationId: number;
  name: string;
  cellPhone: string;
  email: string;
  interestRate?: number | null;
  fee?: number | null;
  maturity?: Date | null;
  hopeAmount?: number | null;
  appliedAt: Date;
  approvalAmount?: number | null;
  contractedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getApplications();
        
        // Add status field based on application data
        const appsWithStatus = data.map(app => ({
          ...app,
          status: app.contractedAt 
            ? 'approved' 
            : app.approvalAmount 
              ? 'approved' 
              : 'pending'
        } as Application));
        
        setApplications(appsWithStatus);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toString().includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && app.status === activeTab;
  });

  const handleViewApplication = async (applicationId: number) => {
    try {
      const result = await getApplicationById(applicationId.toString());
      
      if (result.error) {
        console.error(result.error);
        return;
      }
      
      if (result.application) {
        const application = result.application;
        setSelectedApplication({
          ...application,
          status: application.contractedAt 
            ? 'approved' 
            : application.approvalAmount 
              ? 'approved' 
              : 'pending'
        });
        setViewDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Failed to load application details. Please try again later.');
    }
  };

  const handleApproveApplication = (application: Application) => {
    setSelectedApplication(application);
    setApproveDialogOpen(true);
  };

  const handleRejectApplication = (application: Application) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedApplication) return;
    
    try {
      // In a real application, this would call an API to update the application status
      // For now, we'll just update the local state
      const updatedApplication = await updateApplication(
        selectedApplication.applicationId.toString(),
        { 
          approvalAmount: selectedApplication.hopeAmount || 0,
        }
      );
      
      // Update the applications list
      setApplications(prevApps => 
        prevApps.map(app => 
          app.applicationId === selectedApplication.applicationId 
            ? { 
                ...app, 
                ...updatedApplication, 
                status: 'approved',
                createdAt: app.createdAt,
                updatedAt: app.updatedAt,
                isDeleted: app.isDeleted
              } 
            : app
        )
      );
      
      setApproveDialogOpen(false);
    } catch (err) {
      console.error('Error approving application:', err);
      setError('Failed to approve application. Please try again later.');
    }
  };

  const confirmReject = async () => {
    if (!selectedApplication) return;
    
    try {
      // In a real application, this would call an API to update the application status
      // For now, we'll just update the local state
      const updatedApplication = await updateApplication(
        selectedApplication.applicationId.toString(),
        { 
          approvalAmount: 0,
        }
      );
      
      // Update the applications list
      setApplications(prevApps => 
        prevApps.map(app => 
          app.applicationId === selectedApplication.applicationId 
            ? { ...app, approvalAmount: 0, status: 'rejected' } 
            : app
        )
      );
      
      setRejectDialogOpen(false);
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application. Please try again later.');
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    try {
      await deleteApplication(applicationId.toString());
      
      // Update the applications list
      setApplications(prevApps => 
        prevApps.filter(app => app.applicationId !== applicationId)
      );
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again later.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Loan Applications</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Applications</CardTitle>
          <CardDescription>
            View and manage all loan applications in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all loan applications.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application) => (
                        <TableRow key={application.applicationId}>
                          <TableCell className="font-medium">{application.applicationId}</TableCell>
                          <TableCell>{application.name}</TableCell>
                          <TableCell>{application.email}</TableCell>
                          <TableCell>${application.hopeAmount?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === 'approved'
                                  ? 'default'
                                  : application.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {application.status?.charAt(0).toUpperCase() ?? ''}{application.status?.slice(1) ?? ''}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewApplication(application.applicationId)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {application.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApproveApplication(application)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRejectApplication(application)}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleDeleteApplication(application.applicationId)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Generate Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            {/* Other tabs would have similar content with filtered data */}
            {['pending', 'approved', 'rejected'].map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>A list of {status} loan applications.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No {status} applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((application) => (
                          <TableRow key={application.applicationId}>
                            <TableCell className="font-medium">{application.applicationId}</TableCell>
                            <TableCell>{application.name}</TableCell>
                            <TableCell>{application.email}</TableCell>
                            <TableCell>${application.hopeAmount?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  status === 'approved'
                                    ? 'default'
                                    : status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewApplication(application.applicationId)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleApproveApplication(application)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRejectApplication(application)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDeleteApplication(application.applicationId)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Detailed information about the loan application.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Application ID</Label>
                <div className="col-span-3">{selectedApplication.applicationId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedApplication.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{selectedApplication.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <div className="col-span-3">{selectedApplication.cellPhone}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hope Amount</Label>
                <div className="col-span-3">${selectedApplication.hopeAmount?.toLocaleString() || 'N/A'}</div>
              </div>
              {selectedApplication.approvalAmount !== undefined && selectedApplication.approvalAmount !== null && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Approval Amount</Label>
                  <div className="col-span-3">${selectedApplication.approvalAmount.toLocaleString()}</div>
                </div>
              )}
              {selectedApplication.interestRate !== undefined && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Interest Rate</Label>
                  <div className="col-span-3">{selectedApplication.interestRate}%</div>
                </div>
              )}
              {selectedApplication.maturity && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Maturity</Label>
                  <div className="col-span-3">{new Date(selectedApplication.maturity).toLocaleDateString()}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Applied At</Label>
                <div className="col-span-3">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</div>
              </div>
              {selectedApplication.contractedAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Contracted At</Label>
                  <div className="col-span-3">{new Date(selectedApplication.contractedAt).toLocaleDateString()}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge
                    variant={
                      selectedApplication.status === 'approved'
                        ? 'default'
                        : selectedApplication.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedApplication.status?.charAt(0).toUpperCase() ?? ''}{selectedApplication.status?.slice(1) ?? ''}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication && selectedApplication.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={() => {
                  setViewDialogOpen(false);
                  handleRejectApplication(selectedApplication);
                }}>
                  Reject
                </Button>
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  handleApproveApplication(selectedApplication);
                }}>
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Application Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this loan application?
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="py-4">
              <p><strong>Application ID:</strong> {selectedApplication.applicationId}</p>
              <p><strong>Applicant:</strong> {selectedApplication.name}</p>
              <p><strong>Amount:</strong> ${selectedApplication.hopeAmount?.toLocaleString() || 'N/A'}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this loan application?
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="py-4">
              <p><strong>Application ID:</strong> {selectedApplication.applicationId}</p>
              <p><strong>Applicant:</strong> {selectedApplication.name}</p>
              <p><strong>Amount:</strong> ${selectedApplication.hopeAmount?.toLocaleString() || 'N/A'}</p>
              <div className="mt-4">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Input id="rejection-reason" placeholder="Enter reason for rejection" className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 