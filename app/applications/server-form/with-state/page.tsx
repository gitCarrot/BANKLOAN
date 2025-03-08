'use client';

import { createApplicationWithFormData } from '@/app/actions/form-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from 'react-dom';
import { PageContainer } from '@/components/ui/container';

// Define the state type
type FormState = {
  success: boolean;
  error: string | null;
  applicationId: number | null;
};

// Initial state with proper typing
const initialState: FormState = {
  success: false,
  error: null,
  applicationId: null
};

// Server action wrapper function with proper typing
async function createApplicationWithState(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createApplicationWithFormData(formData);
  
  if (result.success) {
    return {
      success: true,
      error: null,
      applicationId: result.applicationId ?? null
    };
  } else {
    return {
      success: false,
      error: result.error || 'Unknown error',
      applicationId: null
    };
  }
}

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Submit Application'
      )}
    </Button>
  );
}

export default function ServerFormWithStatePage() {
  // Use FormState with proper typing
  const [state, formAction] = useFormState(createApplicationWithState, initialState);
  
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Application (State Management)</h1>
          <p className="mt-4 text-muted-foreground">
            This form uses useFormState and useFormStatus hooks
          </p>
        </div>

        {state.success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Application Submitted</AlertTitle>
              <AlertDescription className="text-green-700">
                Your loan application has been successfully submitted. Application ID: {state.applicationId}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {state.error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
            <CardDescription>
              Fill out the form below to apply for a loan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cellPhone">Phone Number</Label>
                  <Input
                    id="cellPhone"
                    name="cellPhone"
                    placeholder="01012345678"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@example.com"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="hopeAmount">Loan Amount</Label>
                  <Input
                    id="hopeAmount"
                    name="hopeAmount"
                    type="number"
                    min="1000"
                    defaultValue="10000"
                    required
                  />
                </div>
              </div>
              
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Using useFormState and useFormStatus</h2>
          <div className="space-y-4 text-sm">
            <p>
              This page uses React's <code>useFormState</code> and <code>useFormStatus</code> hooks to manage form state.
            </p>
            <p>
              <code>useFormState</code> manages the result of the server action as state, used to display results after form submission.
            </p>
            <p>
              <code>useFormStatus</code> tracks the form's submission state (pending) to display loading states.
            </p>
            <p>
              This approach allows you to use server actions in client components while still benefiting from state management.
            </p>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
} 