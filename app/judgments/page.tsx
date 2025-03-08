'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getApplicationById } from '@/app/actions/applications';
import { getJudgmentByApplicationId, createJudgment } from '@/app/actions/judgments';
import { getContractByApplicationId } from '@/app/actions/contracts';
import { format } from 'date-fns';

const judgmentFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
});

const statusFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
});

export default function JudgmentsPage() {
  return (
    <div className="container py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Judgments</h1>
          <p className="mt-4 text-muted-foreground">
            Request a judgment for your loan application or check the status of an existing judgment.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-10">Loading judgment page...</div>}>
          <JudgmentContent />
        </Suspense>
      </motion.div>
    </div>
  );
}

function JudgmentContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [judgmentStatus, setJudgmentStatus] = useState<{
    status: 'pending' | 'approved' | 'rejected';
    progress: number;
    details?: {
      applicationId: string;
      name: string;
      approvalAmount?: number;
      approvalInterestRate?: number;
      reason?: string;
    };
  } | null>(null);
  const router = useRouter();
  
  const [judgmentData, setJudgmentData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [showJudgment, setShowJudgment] = useState(false);
  
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get('applicationId');
  
  const judgmentForm = useForm<z.infer<typeof judgmentFormSchema>>({
    resolver: zodResolver(judgmentFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
    },
  });

  const statusForm = useForm<z.infer<typeof statusFormSchema>>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
    },
  });
  
  // Define onStatusSubmit with useCallback
  const onStatusSubmit = useCallback(async (values: z.infer<typeof statusFormSchema>) => {
    try {
      setIsSubmitting(true);
      setNotification(null);
      
      // Check if application exists
      const { application, error } = await getApplicationById(values.applicationId);
      
      if (error) {
        setNotification({
          type: 'error',
          message: error,
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!application) {
        setNotification({
          type: 'error',
          message: 'Application not found',
        });
        setIsSubmitting(false);
        return;
      }
      
      setApplicationData(application);
      
      // Check if judgment exists
      const judgment = await getJudgmentByApplicationId(parseInt(values.applicationId));
      
      if (judgment) {
        setJudgmentData(judgment);
        setShowJudgment(true);
        
        // Set notification based on judgment status
        if (judgment.approvalAmount > 0) {
          setNotification({
            type: 'success',
            message: `Your loan application has been approved for $${judgment.approvalAmount.toLocaleString()} with an interest rate of ${judgment.approvalInterestRate}%.`,
          });
        } else {
          setNotification({
            type: 'error',
            message: judgment.reason 
              ? `Your loan application has been rejected. Reason: ${judgment.reason}`
              : 'Your loan application has been rejected.',
          });
        }
      } else {
        setShowJudgment(false);
        setNotification({
          type: 'info',
          message: 'Your application is still under review. Please check back later.',
        });
      }
    } catch (error) {
      console.error('Error checking judgment status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to check judgment status. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  useEffect(() => {
    if (applicationIdFromUrl) {
      judgmentForm.setValue('applicationId', applicationIdFromUrl);
      statusForm.setValue('applicationId', applicationIdFromUrl);
      
      // Automatically check status if applicationId is provided in URL
      if (applicationIdFromUrl) {
        onStatusSubmit({ applicationId: applicationIdFromUrl });
      }
    }
  }, [applicationIdFromUrl, judgmentForm, statusForm, onStatusSubmit]);

  async function onJudgmentSubmit(values: z.infer<typeof judgmentFormSchema>) {
    try {
      setIsSubmitting(true);
      setNotification(null);
      
      // Check if application exists
      const { application, error } = await getApplicationById(values.applicationId);
      
      if (error) {
        setNotification({
          type: 'error',
          message: error,
        });
        return;
      }
      
      if (!application) {
        setNotification({
          type: 'error',
          message: 'Application not found. Please check the ID and try again.',
        });
        return;
      }
      
      // Check if judgment already exists
      const existingJudgment = await getJudgmentByApplicationId(parseInt(values.applicationId));
      
      if (existingJudgment) {
        setNotification({
          type: 'error',
          message: 'A judgment request already exists for this application.',
        });
        return;
      }
      
      // Create a new judgment request with pending status (0 amount)
      await createJudgment({
        applicationId: parseInt(values.applicationId),
        name: application.name,
        approvalAmount: 0, // 0 amount indicates pending status
        approvalInterestRate: 0 // 0 rate indicates pending status
      });
      
      setNotification({
        type: 'success',
        message: `Your loan application (ID: ${values.applicationId}) has been submitted for judgment.`,
      });
      judgmentForm.reset();
    } catch (error) {
      console.error('Error submitting judgment request:', error);
      setNotification({
        type: 'error',
        message: 'There was a problem submitting your judgment request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }

  // Function to handle proceeding to contract
  const handleProceedToContract = () => {
    if (judgmentStatus?.details?.applicationId) {
      router.push(`/contracts?applicationId=${judgmentStatus.details.applicationId}`);
    }
  };

  return (
    <>
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
            ) : notification.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}
            </AlertTitle>
            <AlertDescription>
              {notification.message}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request Judgment</TabsTrigger>
          <TabsTrigger value="status">Check Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Request a Loan Judgment</CardTitle>
                <CardDescription>
                  Enter your application ID to request a judgment for your loan application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...judgmentForm}>
                  <form onSubmit={judgmentForm.handleSubmit(onJudgmentSubmit)} className="space-y-6">
                    <FormField
                      control={judgmentForm.control}
                      name="applicationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your application ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            You can find your application ID in the confirmation email you received when you applied for a loan.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : "Request Judgment"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  The judgment process typically takes 1-3 business days.
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
                <CardTitle>Check Judgment Status</CardTitle>
                <CardDescription>
                  Enter your application ID to check the status of your judgment request.
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
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : "Check Status"}
                      </Button>
                    </div>
                  </form>
                </Form>
                
                {showJudgment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Judgment Status</h3>
                        <Badge 
                          variant={
                            judgmentData.approvalAmount > 0 
                              ? 'default' 
                              : judgmentData.approvalAmount === 0 ? 'outline' 
                                : 'destructive'
                          }
                        >
                          {judgmentData.approvalAmount > 0 
                            ? 'Approved' 
                            : judgmentData.approvalAmount === 0 ? 'Pending' 
                              : 'Rejected'}
                        </Badge>
                      </div>
                      <Progress value={judgmentData.approvalAmount > 0 ? 100 : 30} className="h-2" />
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <dl className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-muted-foreground">Application ID</dt>
                          <dd className="col-span-2 text-sm">{judgmentData.applicationId}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-muted-foreground">Applicant Name</dt>
                          <dd className="col-span-2 text-sm">{applicationData?.name}</dd>
                        </div>
                        
                        {judgmentData.approvalAmount > 0 && (
                          <>
                            <div className="grid grid-cols-3 gap-4">
                              <dt className="text-sm font-medium text-muted-foreground">Approved Amount</dt>
                              <dd className="col-span-2 text-sm">${judgmentData.approvalAmount.toLocaleString()}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <dt className="text-sm font-medium text-muted-foreground">Interest Rate</dt>
                              <dd className="col-span-2 text-sm">{judgmentData.approvalInterestRate}%</dd>
                            </div>
                          </>
                        )}
                        
                        {judgmentData.approvalAmount === 0 && (
                          <div className="grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                            <dd className="col-span-2 text-sm">Your application is currently being reviewed by our underwriting team.</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {judgmentData.approvalAmount > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full"
                          onClick={handleProceedToContract}
                        >
                          Proceed to Contract
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
    </>
  );
} 