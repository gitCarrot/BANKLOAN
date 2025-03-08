'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { getTerms } from '@/app/actions/terms';
import { createUserTermsAgreement } from '@/app/actions/userTermsAgreements';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export default function TermsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreements, setAgreements] = useState<Record<number, boolean>>({});
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Define fetchTerms with useCallback
  const fetchTerms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTerms();
      setTerms(data);
      
      // Initialize agreement state (all false)
      const initialAgreements: Record<number, boolean> = {};
      data.forEach(term => {
        initialAgreements[term.termsId] = false;
      });
      setAgreements(initialAgreements);
    } catch (error) {
      console.error('Error fetching terms:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load terms. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch terms list
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);
  
  const handleViewTerms = (term: Term) => {
    setSelectedTerm(term);
    setDialogOpen(true);
  };
  
  const handleAgreementChange = (termsId: number, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [termsId]: checked
    }));
  };
  
  const handleAgreeAll = () => {
    const allAgreed: Record<number, boolean> = {};
    terms.forEach(term => {
      allAgreed[term.termsId] = true;
    });
    setAgreements(allAgreed);
  };
  
  const isAllRequiredAgreed = () => {
    return terms
      .filter(term => term.isRequired)
      .every(term => agreements[term.termsId]);
  };
  
  const handleSubmit = async () => {
    if (!isAllRequiredAgreed()) {
      toast({
        title: "Required Terms",
        description: "Please agree to all required terms.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create list of agreed terms IDs
      const agreedTermsIds = Object.entries(agreements)
        .filter(([_, agreed]) => agreed)
        .map(([termsId]) => parseInt(termsId));
      
      // Save user terms agreements
      await createUserTermsAgreement({
        userId: 'current-user', // In a real implementation, use the current user's ID
        termsIds: agreedTermsIds
      });
      
      toast({
        title: "Success",
        description: "Terms agreements saved successfully."
      });
      
      // Navigate to next step
      router.push('/counseling');
    } catch (error) {
      console.error('Error saving terms agreements:', error);
      toast({
        title: "Error",
        description: "Failed to save terms agreements. Please try again.",
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
            <CardDescription>
              Please review and agree to the terms and conditions to proceed.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading terms...</span>
              </div>
            ) : terms.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No terms available.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="agree-all" 
                      checked={Object.values(agreements).every(v => v === true) && Object.keys(agreements).length > 0}
                      onCheckedChange={handleAgreeAll}
                    />
                    <Label htmlFor="agree-all" className="font-semibold">
                      Agree to all terms
                    </Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  {terms.map((term) => (
                    <div key={term.termsId} className="flex items-start justify-between p-4 border rounded-md">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id={`term-${term.termsId}`} 
                          checked={agreements[term.termsId] || false}
                          onCheckedChange={(checked) => handleAgreementChange(term.termsId, checked === true)}
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={`term-${term.termsId}`} className="font-medium">
                            {term.name} {term.version && `(v${term.version})`}
                            {term.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {term.isRequired ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewTerms(term)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isAllRequiredAgreed()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Agree and Continue'
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Terms Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedTerm?.name} {selectedTerm?.version && `(v${selectedTerm.version})`}
            </DialogTitle>
            <DialogDescription>
              {selectedTerm?.isRequired ? 'Required agreement' : 'Optional agreement'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] mt-4 p-4 border rounded-md bg-muted/30">
            {selectedTerm?.content ? (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedTerm.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No content available.
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dialog-agree" 
                checked={selectedTerm ? agreements[selectedTerm.termsId] || false : false}
                onCheckedChange={(checked) => selectedTerm && handleAgreementChange(selectedTerm.termsId, checked === true)}
              />
              <Label htmlFor="dialog-agree">
                I agree to the {selectedTerm?.isRequired ? 'required' : 'optional'} terms
              </Label>
            </div>
            <Button onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 