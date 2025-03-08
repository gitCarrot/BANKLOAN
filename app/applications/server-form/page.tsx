'use client';

import { createApplicationWithFormData } from '@/app/actions/form-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from 'react';
import { PageContainer } from '@/components/ui/container';

export default function ServerFormPage() {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Wrapper function that returns void to satisfy TypeScript
  async function handleFormSubmit(formData: FormData) {
    const result = await createApplicationWithFormData(formData);
    
    if (result.success) {
      setNotification({
        type: 'success',
        message: `Application submitted successfully. ID: ${result.applicationId}`
      });
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'An error occurred'
      });
    }
  }

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Application (Server Action)</h1>
          <p className="mt-4 text-muted-foreground">
            This form uses Next.js Server Actions
          </p>
        </div>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 inline-block mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 inline-block mr-2" />
              )}
              <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </span>
            </div>
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
            <form action={handleFormSubmit} className="space-y-6">
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
              
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How Server Actions Work</h2>
          <div className="space-y-4 text-sm">
            <p>
              This page uses Next.js Server Actions instead of React's <code>useState</code> for form handling.
            </p>
            <p>
              Server Actions are defined using the <code>'use server'</code> directive and passed directly to the form's <code>action</code> attribute.
            </p>
            <p>
              Server Actions automatically receive the <code>FormData</code> object, eliminating the need for client-side state management.
            </p>
            <p>
              For more complex form handling, you can use the <code>useFormState</code> and <code>useFormStatus</code> hooks.
            </p>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
} 