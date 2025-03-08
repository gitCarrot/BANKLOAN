'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/ui/container';

// 메인 페이지 컴포넌트
export default function ApplicationSuccessPage() {
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-12"
      >
        <Suspense fallback={<div>Loading application details...</div>}>
          <SuccessContent />
        </Suspense>
      </motion.div>
    </PageContainer>
  );
}

// 분리된 클라이언트 컴포넌트
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const applicationId = searchParams.get('id');
  
  useEffect(() => {
    if (!applicationId) {
      router.push('/applications');
    }
  }, [applicationId, router]);
  
  if (!applicationId) {
    return null;
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationId);
    toast({
      title: 'Application ID copied',
      description: 'Please keep it in a safe place.',
      duration: 3000,
    });
  };
  
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardHeader className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full p-3 w-16 h-16 flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </motion.div>
        <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
          Loan Application Successfully Submitted
        </CardTitle>
        <CardDescription className="text-green-600 dark:text-green-400">
          Please save your Application ID below. You will need it to check your application status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Application ID</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-mono font-bold">{applicationId}</p>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Next Steps</h3>
          <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">Document Review (1-2 days)</span>
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">Initial assessment based on the information you provided.</p>
            </li>
            <li>
              <span className="font-medium">Credit Evaluation (2-3 days)</span>
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">Analysis of your credit information to determine loan eligibility and limit.</p>
            </li>
            <li>
              <span className="font-medium">Decision Notification</span>
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">You will be notified of the decision via email and SMS.</p>
            </li>
            <li>
              <span className="font-medium">Contract Signing</span>
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">If approved, you can sign the contract online.</p>
            </li>
            <li>
              <span className="font-medium">Loan Disbursement</span>
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">The loan amount will be deposited to your designated account within 1-2 days after contract signing.</p>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Important:</strong> Your Application ID is required to check the status of your loan application. Please keep it in a safe place.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => router.push('/applications?tab=status')} 
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Check Application Status
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 