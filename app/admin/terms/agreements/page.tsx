'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Eye, 
  Search, 
  Loader2,
  UserCircle
} from 'lucide-react';
import { getUserTermsAgreements } from '@/app/actions/userTermsAgreements';
import { getTerms } from '@/app/actions/terms';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

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

interface UserAgreement {
  agreementId: number;
  userId: string;
  termsId: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  terms: Term;
}

// Type for grouping user terms agreements
interface UserAgreementGroup {
  userId: string;
  agreements: UserAgreement[];
  agreementCount: number;
  lastAgreedAt: Date;
}

export default function AdminTermsAgreementsPage() {
  const [userAgreements, setUserAgreements] = useState<UserAgreementGroup[]>([]);
  const [filteredAgreements, setFilteredAgreements] = useState<UserAgreementGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAgreementGroup | null>(null);
  const [allTerms, setAllTerms] = useState<Term[]>([]);
  
  const { toast } = useToast();
  
  // Define fetchData with useCallback
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all terms
      const termsData = await getTerms();
      setAllTerms(termsData);
      
      // Fetch user agreements - use 'all' as userId to get all agreements
      const agreementsData = await getUserTermsAgreements('all');
      
      // Group agreements by user
      const groupedAgreements: Record<string, UserAgreementGroup> = {};
      
      // Check if agreementsData is an array
      if (Array.isArray(agreementsData)) {
        agreementsData.forEach(agreement => {
          if (!groupedAgreements[agreement.userId]) {
            groupedAgreements[agreement.userId] = {
              userId: agreement.userId,
              agreements: [],
              agreementCount: 0,
              lastAgreedAt: new Date(0)
            };
          }
          
          groupedAgreements[agreement.userId].agreements.push(agreement);
          groupedAgreements[agreement.userId].agreementCount++;
          
          const agreedAt = new Date(agreement.createdAt || new Date());
          if (agreedAt > groupedAgreements[agreement.userId].lastAgreedAt) {
            groupedAgreements[agreement.userId].lastAgreedAt = agreedAt;
          }
        });
        
        const userAgreementsList = Object.values(groupedAgreements);
        setUserAgreements(userAgreementsList);
        setFilteredAgreements(userAgreementsList);
      } else {
        // Handle error case
        console.error('Error fetching agreements:', agreementsData.error);
        toast({
          title: 'Error',
          description: agreementsData.error || 'Failed to load terms agreements',
          variant: 'destructive'
        });
        setUserAgreements([]);
        setFilteredAgreements([]);
      }
    } catch (error: any) {
      console.error('Error fetching agreements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load terms agreements',
        variant: 'destructive'
      });
      setUserAgreements([]);
      setFilteredAgreements([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch terms agreements
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Filter by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgreements(userAgreements);
    } else {
      const filtered = userAgreements.filter(group => 
        group.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgreements(filtered);
    }
  }, [searchTerm, userAgreements]);
  
  const handleViewAgreements = (user: UserAgreementGroup) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };
  
  // Check if user has agreed to a specific term
  const hasAgreedToTerm = (agreements: UserAgreement[], termsId: number) => {
    return agreements.some(agreement => agreement.termsId === termsId);
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
            <CardTitle>Terms Agreements Status</CardTitle>
            <CardDescription>
              View terms agreements status by user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user ID..."
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
                    <TableHead>User ID</TableHead>
                    <TableHead>Agreed Terms Count</TableHead>
                    <TableHead>Last Agreement Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading terms agreements...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAgreements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No terms agreements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAgreements.map((group) => (
                      <TableRow key={group.userId}>
                        <TableCell className="font-medium">{group.userId}</TableCell>
                        <TableCell>{group.agreementCount}</TableCell>
                        <TableCell>{format(new Date(group.lastAgreedAt), 'PPP p')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewAgreements(group)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
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
      
      {/* User Terms Agreement Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserCircle className="h-5 w-5 mr-2" />
              User Terms Agreements - {selectedUser?.userId}
            </DialogTitle>
            <DialogDescription>
              List of terms agreed by the user. Last agreement date: {selectedUser && format(new Date(selectedUser.lastAgreedAt), 'PPP p')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Agreement Status</TableHead>
                    <TableHead>Agreement Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTerms.map((term) => {
                    const agreement = selectedUser.agreements.find(a => a.termsId === term.termsId);
                    const hasAgreed = !!agreement;
                    
                    return (
                      <TableRow key={term.termsId}>
                        <TableCell>{term.name}</TableCell>
                        <TableCell>{term.version || 'N/A'}</TableCell>
                        <TableCell>
                          {term.isRequired ? (
                            <Badge variant="default">Required</Badge>
                          ) : (
                            <Badge variant="outline">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasAgreed ? (
                            <Badge className="bg-green-500 text-white">Agreed</Badge>
                          ) : (
                            <Badge variant="destructive">Not Agreed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasAgreed ? (agreement.createdAt ? format(new Date(agreement.createdAt), 'PPP p') : 'N/A') : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 