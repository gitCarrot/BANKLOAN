'use client';

import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/container';
import { motion } from 'framer-motion';

// 메인 페이지 컴포넌트
export default function ApplicationsPage() {
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Applications</h1>
          <p className="mt-4 text-muted-foreground">
            Apply for a loan or check the status of your existing applications.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading application form...</div>}>
          <ApplicationForm />
        </Suspense>
      </motion.div>
    </PageContainer>
  );
}

// 분리된 클라이언트 컴포넌트
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createApplication, getApplicationById } from '@/app/actions/applications';
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  cellPhone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  hopeAmount: z.coerce.number().min(1000, {
    message: 'Loan amount must be at least 1,000.',
  }),
});

const statusFormSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required.',
  }),
});

function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cellPhone: '',
      email: '',
      hopeAmount: 10000,
    },
  });
  
  const statusForm = useForm<z.infer<typeof statusFormSchema>>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      applicationId: '',
    },
  });
  
  // Set default tab based on URL parameter
  const defaultTab = searchParams.get('tab') === 'status' ? 'status' : 'new';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const response = await createApplication(values);
      
      // Redirect to success page with application ID
      router.push(`/applications/success?id=${response.applicationId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setNotification({
        type: 'error',
        message: 'There was a problem submitting your application. Please try again.',
      });
      setIsSubmitting(false);
    }
  }
  
  async function onCheckStatus(values: z.infer<typeof statusFormSchema>) {
    try {
      setIsChecking(true);
      setApplicationStatus(null);
      setNotification(null);
      
      const { application, error } = await getApplicationById(values.applicationId);
      
      if (error) {
        setNotification({
          type: 'error',
          message: error,
        });
        return;
      }
      
      setApplicationStatus(application);
    } catch (error) {
      console.error('Error checking application status:', error);
      setNotification({
        type: 'error',
        message: 'There was a problem checking your application status. Please try again.',
      });
    } finally {
      setIsChecking(false);
    }
  }
  
  // Function to get status text and color
  const getStatusInfo = (application: any) => {
    if (!application) return { text: 'Unknown', color: 'text-gray-500' };
    
    if (application.contractedAt) {
      return { text: 'Approved & Contracted', color: 'text-green-600' };
    } else if (application.approvalAmount) {
      return { text: 'Approved', color: 'text-green-600' };
    } else {
      return { text: 'Under Review', color: 'text-amber-600' };
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
          <Alert variant={notification.type === 'success' ? 'default' : 'destructive'}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Application</TabsTrigger>
          <TabsTrigger value="status">Check Status</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Apply for a Loan</CardTitle>
              <CardDescription>
                Fill out the form below to submit a new loan application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cellPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hopeAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the amount you wish to borrow (minimum 1,000).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Application'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Check Application Status</CardTitle>
              <CardDescription>
                Enter your application ID to check the status of your loan application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(onCheckStatus)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
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
                  <Button type="submit" disabled={isChecking} className="w-full">
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : 'Check Status'}
                  </Button>
                </form>
              </Form>
              
              {applicationStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-4 border rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Application ID:</p>
                      <p className="text-sm font-medium">{applicationStatus.applicationId}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Name:</p>
                      <p className="text-sm font-medium">{applicationStatus.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Applied Date:</p>
                      <p className="text-sm font-medium">
                        {new Date(applicationStatus.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Requested Amount:</p>
                      <p className="text-sm font-medium">
                        ${applicationStatus.hopeAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-500">Status:</p>
                      <p className={`text-sm font-medium ${getStatusInfo(applicationStatus).color}`}>
                        {getStatusInfo(applicationStatus).text}
                      </p>
                    </div>
                    {applicationStatus.approvalAmount && (
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-gray-500">Approved Amount:</p>
                        <p className="text-sm font-medium">
                          ${applicationStatus.approvalAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
} 