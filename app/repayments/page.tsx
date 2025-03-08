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
import { Badge } from "@/components/ui/badge";
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

// SearchParams를 사용하는 컴포넌트를 분리
function RepaymentPageContent() {
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
      const appResponse = await getApplicationById(appId);
      setApplicationData(appResponse);
      
      // 계약 정보 가져오기
      const contractResponse = await getContractByApplicationId(parseInt(appId));
      setContractData(contractResponse);
      
      // 잔액 정보 가져오기
      const balanceResponse = await getBalance(appId);
      setBalanceData(balanceResponse);
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error fetching application data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch application data. Please try again.',
      });
      setIsSubmitting(false);
    }
  };
  
  // 결제 내역 조회
  const fetchRepaymentHistory = async (appId: string) => {
    try {
      setIsSubmitting(true);
      const response = await getRepayments(appId);
      
      if (response && response.length > 0) {
        setRepaymentHistory(response);
        setShowHistory(true);
      } else {
        setRepaymentHistory([]);
        setNotification({
          type: 'info',
          message: 'No repayment history found for this application.',
        });
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error fetching repayment history:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch repayment history. Please try again.',
      });
      setIsSubmitting(false);
    }
  };
  
  // 결제 제출
  async function onRepaymentSubmit(values: z.infer<typeof repaymentFormSchema>) {
    try {
      setIsSubmitting(true);
      setNotification(null);
      
      const repayment = await createRepayment(values.applicationId, values.repaymentAmount);
      
      setNotification({
        type: 'success',
        message: 'Repayment submitted successfully!',
      });
      
      // 결제 후 잔액 및 결제 내역 업데이트
      fetchApplicationData(values.applicationId);
      fetchRepaymentHistory(values.applicationId);
      
      // 결제 금액 초기화
      repaymentForm.setValue('repaymentAmount', 0);
    } catch (error) {
      console.error('Error submitting repayment:', error);
      setNotification({
        type: 'error',
        message: 'Failed to submit repayment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // 결제 내역 조회 제출
  async function onHistorySubmit(values: z.infer<typeof historyFormSchema>) {
    fetchRepaymentHistory(values.applicationId);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Loan Repayments</h1>
        
        {notification && (
          <Alert 
            variant={notification.type === 'error' ? 'destructive' : notification.type === 'success' ? 'default' : 'default'} 
            className={`mb-6 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : notification.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}`}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Information'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="repayment" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="repayment">Make a Repayment</TabsTrigger>
            <TabsTrigger value="history">Repayment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="repayment">
            <Card>
              <CardHeader>
                <CardTitle>Make a Repayment</CardTitle>
                <CardDescription>
                  Enter your application ID and repayment amount to make a payment.
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
                            <Input placeholder="Enter application ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {applicationData && (
                      <div className="p-4 bg-muted rounded-md">
                        <h3 className="font-medium mb-2">Application Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {applicationData.name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {applicationData.email}
                          </div>
                          <div>
                            <span className="font-medium">Loan Amount:</span> ${contractData?.amount?.toLocaleString() || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Interest Rate:</span> {contractData?.interestRate || 'N/A'}%
                          </div>
                          <div>
                            <span className="font-medium">Current Balance:</span> ${balanceData?.balance?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <FormField
                      control={repaymentForm.control}
                      name="repaymentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repayment Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the amount you wish to repay.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Submit Repayment'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Repayment History</CardTitle>
                <CardDescription>
                  View your repayment history by entering your application ID.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...historyForm}>
                  <form onSubmit={historyForm.handleSubmit(onHistorySubmit)} className="space-y-6">
                    <FormField
                      control={historyForm.control}
                      name="applicationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application ID</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input placeholder="Enter application ID" {...field} />
                            </FormControl>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Search'
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                
                {showHistory && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Repayment Records</h3>
                    {repaymentHistory.length > 0 ? (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {repaymentHistory.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                                <TableCell>${item.repaymentAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No repayment records found.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

// 메인 컴포넌트에서 Suspense로 감싸기
export default function RepaymentsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 px-4 text-center">Loading...</div>}>
      <RepaymentPageContent />
    </Suspense>
  );
} 