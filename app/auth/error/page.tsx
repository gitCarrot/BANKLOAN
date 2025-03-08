'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An unknown error occurred during authentication.';
  
  // Map error codes to user-friendly messages
  if (error === 'AccessDenied') {
    errorMessage = 'Access denied. You do not have permission to access this resource.';
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  } else if (error === 'Verification') {
    errorMessage = 'The verification link may have expired or has already been used.';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Error in the OAuth sign-in process.';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Error in the OAuth callback process.';
  } else if (error === 'OAuthCreateAccount') {
    errorMessage = 'Could not create OAuth provider account.';
  } else if (error === 'EmailCreateAccount') {
    errorMessage = 'Could not create email provider account.';
  } else if (error === 'Callback') {
    errorMessage = 'Error in the callback handler.';
  } else if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'This email is already associated with another account.';
  } else if (error === 'EmailSignin') {
    errorMessage = 'The email could not be sent.';
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'The sign in attempt failed. Please check your credentials.';
  } else if (error === 'SessionRequired') {
    errorMessage = 'You must be signed in to access this page.';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
              {errorMessage}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/signin">
              <Button>
                Return to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 