'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from "lucide-react";

// Define the type for the server action prop
type ServerActionResult = {
  success: boolean;
  applicationId?: number;
  error?: string;
};

type ClientFormProps = {
  submitAction: (formData: FormData) => Promise<ServerActionResult>;
};

export default function ClientFormComponent({ submitAction }: ClientFormProps) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Wrapper function that handles the server action result
  async function handleFormSubmit(formData: FormData) {
    const result = await submitAction(formData);
    
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
    <>
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
    </>
  );
} 