'use client';

import { useState, useEffect } from 'react';
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
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createRepayment, getRepayments } from '@/app/actions/repayments';
import { getBalance } from '@/app/actions/balances';
import { getApplicationById } from '@/app/actions/applications';
import { getContractByApplicationId } from '@/app/actions/contracts';
import { format } from 'date-fns';

const repaymentFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
  repaymentAmount: z.coerce.number().min(1, {
    message: 'Repayment amount must be at least 1.',
  }),
});

const historyFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
});

export default function RepaymentsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [repaymentHistory, setRepaymentHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get('applicationId');
  
  const repaymentForm = useForm<z.infer<typeof repaymentFormSchema>>({
    resolver: zodResolver(repaymentFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
      repaymentAmount: 0,
    },
  });

  const historyForm = useForm<z.infer<typeof historyFormSchema>>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: {
      applicationId: applicationIdFromUrl || '',
    },
  });
  
  // URL에서 applicationId가 제공되면 자동으로 결제 내역 조회
  useEffect(() => {
    if (applicationIdFromUrl) {
      repaymentForm.setValue('applicationId', applicationIdFromUrl);
      historyForm.setValue('applicationId', applicationIdFromUrl);
      
      // 애플리케이션 정보 가져오기
      fetchApplicationData(applicationIdFromUrl);
      
      // 결제 내역 자동 조회
      fetchRepaymentHistory(applicationIdFromUrl);
    }
  }, [applicationIdFromUrl, repaymentForm, historyForm]);
  
  // 애플리케이션 정보 가져오기
  const fetchApplicationData = async (appId: string) => {
    try {
      setIsSubmitting(true);
      
      // 애플리케이션 정보 가져오기
      const { application, error } = await getApplicationById(appId);
      
      if (error || !application) {
        setNotification({
          type: 'error',
          message: error || 'Application not found',
        });
        return;
      }
      
      setApplicationData(application);
      
      // 계약 정보 가져오기
      try {
        const contract = await getContractByApplicationId(parseInt(appId));
        setContractData(contract);
        
        // 잔액 정보 가져오기
        if (contract && contract.status === 'active') {
          const balance = await getBalance(appId);
          setBalanceData(balance);
        }
      } catch (err) {
        console.log("Error fetching contract or balance:", err);
      }
    } catch (err) {
      console.error("Error fetching application data:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 결제 내역 가져오기
  const fetchRepaymentHistory = async (appId: string) => {
    try {
      setIsSubmitting(true);
      
      // 결제 내역 가져오기
      const repayments = await getRepayments(appId);
      
      if (repayments && repayments.length > 0) {
        setRepaymentHistory(repayments);
        setShowHistory(true);
      } else {
        setNotification({
          type: 'info',
          message: 'No repayment history found for this application.',
        });
        setRepaymentHistory([]);
        setShowHistory(false);
      }
    } catch (err: any) {
      console.error("Error fetching repayment history:", err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to fetch repayment history',
      });
      setRepaymentHistory([]);
      setShowHistory(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function onRepaymentSubmit(values: z.infer<typeof repaymentFormSchema>) {
    try {
      setIsSubmitting(true);
      
      // 결제 처리
      const repayment = await createRepayment(values.applicationId, values.repaymentAmount);
      
      // 성공 메시지 표시
      setNotification({
        type: 'success',
        message: `Successfully made a repayment of $${values.repaymentAmount.toLocaleString()} for application ID ${values.applicationId}.`,
      });
      
      // 폼 초기화
      repaymentForm.reset({
        applicationId: values.applicationId,
        repaymentAmount: 0,
      });
      
      // 결제 내역 다시 가져오기
      await fetchRepaymentHistory(values.applicationId);
      
      // 잔액 정보 다시 가져오기
      if (contractData && contractData.status === 'active') {
        const balance = await getBalance(values.applicationId);
        setBalanceData(balance);
      }
    } catch (error: any) {
      console.error('Error submitting repayment:', error);
      setNotification({
        type: 'error',
        message: error.message || 'There was a problem processing your repayment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }

  async function onHistorySubmit(values: z.infer<typeof historyFormSchema>) {
    await fetchRepaymentHistory(values.applicationId);
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
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Repayments</h1>
          <p className="mt-4 text-muted-foreground">
            Make a repayment on your loan or view your repayment history.
          </p>
        </div>

        {applicationData && contractData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Loan Information</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Applicant</p>
                    <p className="font-medium">{applicationData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">${contractData.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{contractData.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="font-medium">${balanceData ? balanceData.balance.toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
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

        <Tabs defaultValue="make-payment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="make-payment">Make a Payment</TabsTrigger>
            <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="make-payment">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Make a Repayment</CardTitle>
                  <CardDescription>
                    Enter your application ID and the amount you wish to repay.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...repaymentForm}>
                    <form onSubmit={repaymentForm.handleSubmit(onRepaymentSubmit)} className="space-y-6">
                      <FormField
                        control={repaymentForm.control}
                        name="applicationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your application ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={repaymentForm.control}
                        name="repaymentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repayment Amount</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the amount you wish to repay.
                              {balanceData && (
                                <span className="ml-1 text-primary">Current balance: ${balanceData.balance.toLocaleString()}</span>
                              )}
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
                          ) : "Make Payment"}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Your payment will be processed immediately and your balance will be updated.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="payment-history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>View Repayment History</CardTitle>
                  <CardDescription>
                    Enter your application ID to view your repayment history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...historyForm}>
                    <form onSubmit={historyForm.handleSubmit(onHistorySubmit)} className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3">
                          <FormField
                            control={historyForm.control}
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
                              Loading...
                            </>
                          ) : "View History"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-6"
                    >
                      <Table>
                        <TableCaption>A list of your recent repayments.</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repaymentHistory.length > 0 ? (
                            repaymentHistory.map((payment) => (
                              <TableRow key={payment.repaymentId}>
                                <TableCell>{payment.repaymentId}</TableCell>
                                <TableCell>{format(new Date(payment.createdAt), 'PPP')}</TableCell>
                                <TableCell>${payment.repaymentAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    Completed
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No repayment history found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      {repaymentHistory.length > 0 && balanceData && (
                        <div className="mt-4 p-4 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Repaid</p>
                              <p className="text-lg font-bold">
                                ${repaymentHistory.reduce((sum, payment) => sum + payment.repaymentAmount, 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Remaining Balance</p>
                              <p className="text-lg font-bold">${balanceData.balance.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 