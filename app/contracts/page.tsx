'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContractByApplicationId, updateContract, createContract } from '@/app/actions/contracts';
import { getApplicationById } from '@/app/actions/applications';
import { getJudgmentByApplicationId } from '@/app/actions/judgments';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTerms } from '@/app/actions/terms';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const contractFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
  acceptTerms: z.boolean().refine(value => value === true, {
    message: 'You must accept the terms and conditions.',
  }),
  acceptPrivacy: z.boolean().refine(value => value === true, {
    message: 'You must accept the privacy policy.',
  }),
  acceptLoanAgreement: z.boolean().refine(value => value === true, {
    message: 'You must accept the loan agreement.',
  }),
});

const statusFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
});

// 메인 컴포넌트에서 Suspense로 감싸기
export default function ContractsPage() {
  return (
    <div className="container py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Contracts</h1>
          <p className="mt-4 text-muted-foreground">
            Sign your loan contract or check the status of an existing contract.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-10">Loading contract page...</div>}>
          <ContractContent />
        </Suspense>
      </motion.div>
    </div>
  );
}

// useSearchParams를 사용하는 컴포넌트 분리
function ContractContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [contractStatus, setContractStatus] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [judgmentData, setJudgmentData] = useState<any>(null);
  const [termsData, setTermsData] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allTermsDialogOpen, setAllTermsDialogOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get('applicationId');
  
  const contractForm = useForm<z.infer<typeof contractFormSchema>>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
      acceptTerms: false,
      acceptPrivacy: false,
      acceptLoanAgreement: false,
    },
  });

  const statusForm = useForm<z.infer<typeof statusFormSchema>>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
    },
  });
  
  // Update form values when URL parameters change
  useEffect(() => {
    if (applicationIdFromUrl) {
      contractForm.setValue('applicationId', applicationIdFromUrl);
      statusForm.setValue('applicationId', applicationIdFromUrl);
      
      // 자동으로 계약 상태 확인
      if (applicationIdFromUrl) {
        checkContractStatus(applicationIdFromUrl);
      }
    }
  }, [applicationIdFromUrl, contractForm, statusForm]);

  // 약관 데이터 가져오기
  useEffect(() => {
    async function fetchTerms() {
      try {
        const terms = await getTerms();
        setTermsData(terms);
      } catch (error) {
        console.error('Error fetching terms:', error);
      }
    }
    
    fetchTerms();
  }, []);
  
  const handleViewTerms = (termName: string) => {
    const term = termsData.find(t => t.name.toLowerCase().includes(termName.toLowerCase()));
    if (term) {
      setSelectedTerm(term);
      setDialogOpen(true);
    }
  };

  // 약관 전체 동의 처리 함수
  const handleAgreeAll = (checked: boolean) => {
    if (checked) {
      contractForm.setValue('acceptTerms', true);
      contractForm.setValue('acceptPrivacy', true);
      contractForm.setValue('acceptLoanAgreement', true);
    } else {
      contractForm.setValue('acceptTerms', false);
      contractForm.setValue('acceptPrivacy', false);
      contractForm.setValue('acceptLoanAgreement', false);
    }
  };

  // 모든 약관에 동의했는지 확인
  const isAllAgreed = () => {
    return (
      contractForm.watch('acceptTerms') &&
      contractForm.watch('acceptPrivacy') &&
      contractForm.watch('acceptLoanAgreement')
    );
  };

  // 모든 약관 보기 다이얼로그 열기
  const handleViewAllTerms = () => {
    setAllTermsDialogOpen(true);
  };

  // 계약 상태 확인 함수
  const checkContractStatus = async (appId: string) => {
    try {
      setIsSubmitting(true);
      
      // 애플리케이션 정보 가져오기
      const { application, error: appError } = await getApplicationById(appId);
      
      if (appError || !application) {
        setNotification({
          type: 'error',
          message: appError || 'Application not found. Please check the ID and try again.',
        });
        setContractStatus(null);
        setApplicationData(null);
        setJudgmentData(null);
        return;
      }
      
      setApplicationData(application);
      
      // 심사 정보 가져오기
      let judgment = null;
      try {
        judgment = await getJudgmentByApplicationId(parseInt(appId));
        setJudgmentData(judgment);
      } catch (err) {
        console.log("No judgment found for this application");
      }
      
      // 계약 정보 가져오기
      try {
        const contract = await getContractByApplicationId(parseInt(appId));
        
        if (contract) {
          setContractStatus({
            ...contract,
            details: {
              applicationId: contract.applicationId,
              name: application.name,
              amount: contract.amount,
              interestRate: contract.interestRate,
              term: contract.term,
              signedDate: contract.signedAt ? format(new Date(contract.signedAt), 'PPP') : undefined,
              activationDate: contract.activatedAt ? format(new Date(contract.activatedAt), 'PPP') : undefined,
            }
          });
        } else {
          // 계약이 없지만 심사가 있는 경우 (계약 생성 가능)
          if (judgment) {
            setNotification({
              type: 'info',
              message: 'Your loan has been approved. Please sign your contract to proceed.',
            });
          } else {
            setNotification({
              type: 'error',
              message: 'No contract found for this application. Your loan may still be under review.',
            });
          }
          setContractStatus(null);
        }
      } catch (err) {
        console.error("Error fetching contract:", err);
        setNotification({
          type: 'error',
          message: 'Failed to fetch contract information. Please try again later.',
        });
        setContractStatus(null);
      }
    } catch (err) {
      console.error("Error checking contract status:", err);
      setNotification({
        type: 'error',
        message: 'An error occurred while checking the contract status. Please try again.',
      });
      setContractStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function onContractSubmit(values: z.infer<typeof contractFormSchema>) {
    try {
      setIsSubmitting(true);
      
      // 애플리케이션 ID 확인
      const appId = parseInt(values.applicationId);
      if (isNaN(appId)) {
        throw new Error('Invalid Application ID');
      }
      
      // 애플리케이션 정보 가져오기
      const { application, error: appError } = await getApplicationById(values.applicationId);
      
      if (appError || !application) {
        throw new Error(appError || 'Application not found');
      }
      
      // 심사 정보 가져오기
      const judgment = await getJudgmentByApplicationId(appId);
      
      if (!judgment) {
        throw new Error('No judgment found for this application');
      }
      
      // 계약 정보 가져오기
      let contract = await getContractByApplicationId(appId);
      
      // 계약이 없는 경우 새로 생성
      if (!contract) {
        // 새 계약 생성
        contract = await createContract({
          applicationId: appId,
          judgmentId: judgment.judgmentId,
          amount: judgment.approvalAmount,
          interestRate: judgment.approvalInterestRate,
          term: 36 // 기본 대출 기간 (월)
        });
        
        console.log("New contract created:", contract);
      }
      
      // 계약 서명 (상태 업데이트)
      if (contract.status === 'pending') {
        contract = await updateContract(contract.contractId.toString(), {
          status: 'signed',
          signedAt: new Date()
        });
        
        setNotification({
          type: 'success',
          message: `Your loan contract for application ID ${values.applicationId} has been signed successfully.`,
        });
        
        // 계약 상태 업데이트
        await checkContractStatus(values.applicationId);
      } else {
        setNotification({
          type: 'info',
          message: `This contract has already been signed.`,
        });
      }
      
      contractForm.reset();
    } catch (error: any) {
      console.error('Error signing contract:', error);
      setNotification({
        type: 'error',
        message: error.message || 'There was a problem signing your contract. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }

  async function onStatusSubmit(values: z.infer<typeof statusFormSchema>) {
    try {
      await checkContractStatus(values.applicationId);
    } catch (error: any) {
      console.error('Error fetching contract status:', error);
      setNotification({
        type: 'error',
        message: error.message || 'There was a problem fetching your contract status. Please try again.',
      });
    }
  }

  return (
    <div className="container py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Contracts</h1>
          <p className="mt-4 text-muted-foreground">
            Sign your loan contract or check the status of an existing contract.
          </p>
        </div>

        {applicationIdFromUrl && judgmentData && !contractStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Loan Approved</AlertTitle>
              <AlertDescription>
                Your loan application (ID: {applicationIdFromUrl}) has been approved for ${judgmentData.approvalAmount.toLocaleString()}. Please review and sign your contract below.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Information'}
              </AlertTitle>
              <AlertDescription>
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Tabs defaultValue="sign" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign">Sign Contract</TabsTrigger>
            <TabsTrigger value="status">Contract Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sign Your Loan Contract</CardTitle>
                  <CardDescription>
                    Enter your application ID and review the terms before signing your loan contract.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...contractForm}>
                    <form onSubmit={contractForm.handleSubmit(onContractSubmit)} className="space-y-6">
                      <FormField
                        control={contractForm.control}
                        name="applicationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your application ID" {...field} />
                            </FormControl>
                            <FormDescription>
                              You can find your application ID in the confirmation email you received when your loan was approved.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4 rounded-md border p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Contract Terms</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleViewAllTerms}
                          >
                            View All Terms
                          </Button>
                        </div>
                        <Separator />
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <Checkbox 
                            id="agree-all" 
                            checked={isAllAgreed()}
                            onCheckedChange={handleAgreeAll}
                          />
                          <label htmlFor="agree-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I agree to all terms and conditions
                          </label>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="terms">
                            <AccordionTrigger className="text-base font-medium">
                              Terms and Conditions
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  By accepting these terms, you agree to be bound by all the conditions outlined in our loan agreement.
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewTerms('Terms of Service')}
                                >
                                  View Full Terms
                                </Button>
                                <FormField
                                  control={contractForm.control}
                                  name="acceptTerms"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          I accept the terms and conditions
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="privacy">
                            <AccordionTrigger className="text-base font-medium">
                              Privacy Policy
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  We will process your personal data in accordance with our privacy policy.
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewTerms('Privacy Policy')}
                                >
                                  View Full Policy
                                </Button>
                                <FormField
                                  control={contractForm.control}
                                  name="acceptPrivacy"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          I accept the privacy policy
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="loan">
                            <AccordionTrigger className="text-base font-medium">
                              Loan Agreement
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  By signing this agreement, you acknowledge that you have read and understood the loan terms.
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewTerms('Data Processing')}
                                >
                                  View Full Agreement
                                </Button>
                                <FormField
                                  control={contractForm.control}
                                  name="acceptLoanAgreement"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          I accept the loan agreement
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button type="submit" className="w-full" disabled={isSubmitting || !isAllAgreed()}>
                          {isSubmitting ? "Processing..." : "Sign Contract"}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Once signed, your contract will be processed within 1-2 business days.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="status">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Check Contract Status</CardTitle>
                  <CardDescription>
                    Enter your application ID to check the status of your loan contract.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...statusForm}>
                    <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3">
                          <FormField
                            control={statusForm.control}
                            name="applicationId"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Enter your application ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Loading..." : "Check Status"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  {contractStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-8 space-y-6"
                    >
                      <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-medium mb-4">Contract Details</h3>
                        <dl className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                            <dd className="col-span-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                contractStatus.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : contractStatus.status === 'signed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : contractStatus.status === 'completed'
                                      ? 'bg-purple-100 text-purple-800'
                                      : contractStatus.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contractStatus.status.charAt(0).toUpperCase() + contractStatus.status.slice(1)}
                              </span>
                            </dd>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Application ID</dt>
                            <dd className="col-span-2 text-sm">{contractStatus.applicationId}</dd>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Borrower Name</dt>
                            <dd className="col-span-2 text-sm">{applicationData?.name || 'N/A'}</dd>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Loan Amount</dt>
                            <dd className="col-span-2 text-sm">${contractStatus.amount.toLocaleString()}</dd>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Interest Rate</dt>
                            <dd className="col-span-2 text-sm">{contractStatus.interestRate}%</dd>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Term</dt>
                            <dd className="col-span-2 text-sm">{contractStatus.term} months</dd>
                          </div>
                          
                          {contractStatus.status !== 'pending' && contractStatus.signedAt && (
                            <div className="grid grid-cols-3 gap-4">
                              <dt className="text-sm font-medium text-muted-foreground">Signed Date</dt>
                              <dd className="col-span-2 text-sm">{format(new Date(contractStatus.signedAt), 'PPP')}</dd>
                            </div>
                          )}
                          
                          {contractStatus.status === 'active' && contractStatus.activatedAt && (
                            <div className="grid grid-cols-3 gap-4">
                              <dt className="text-sm font-medium text-muted-foreground">Activation Date</dt>
                              <dd className="col-span-2 text-sm">{format(new Date(contractStatus.activatedAt), 'PPP')}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                      
                      {contractStatus.status === 'pending' && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button className="w-full" onClick={() => {
                            contractForm.setValue('applicationId', contractStatus.applicationId.toString());
                            const tabElement = document.querySelector('[data-value="sign"]') as HTMLElement;
                            tabElement?.click();
                          }}>
                            Sign Contract Now
                          </Button>
                        </motion.div>
                      )}
                      
                      {contractStatus.status === 'signed' && (
                        <p className="text-sm text-center text-muted-foreground">
                          Your contract has been signed and is being processed. It will be activated within 1-2 business days.
                        </p>
                      )}
                      
                      {contractStatus.status === 'active' && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button className="w-full" variant="outline">
                            Download Contract
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        
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
            
            <div className="flex justify-end items-center mt-4">
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* All Terms Dialog */}
        <Dialog open={allTermsDialogOpen} onOpenChange={setAllTermsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>All Contract Terms</DialogTitle>
              <DialogDescription>
                Please review all terms and conditions before signing the contract
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh] mt-4">
              <div className="space-y-8 p-4">
                {termsData.map((term) => (
                  <div key={term.termsId} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{term.name} {term.version && `(v${term.version})`}</h3>
                      <Badge variant={term.isRequired ? "default" : "outline"}>
                        {term.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="markdown-content">
                      {term.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {term.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground">No content available.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree-all-dialog"
                  checked={isAllAgreed()}
                  onCheckedChange={handleAgreeAll}
                />
                <label
                  htmlFor="agree-all-dialog"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to all terms and conditions
                </label>
              </div>
              <Button onClick={() => setAllTermsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
} 