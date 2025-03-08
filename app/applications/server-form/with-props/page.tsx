'use client';

import { createApplicationWithFormData } from '@/app/actions/form-actions';
import dynamic from 'next/dynamic';
import { PageContainer } from '@/components/ui/container';

// Use dynamic import to resolve the module not found issue
const ClientFormComponent = dynamic(() => import('./client-form'), {
  ssr: false,
});

export default function ServerFormWithPropsPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Loan Application (Props)</h1>
          <p className="mt-4 text-muted-foreground">
            This example demonstrates passing server actions as props to client components
          </p>
        </div>
        
        <ClientFormComponent submitAction={createApplicationWithFormData} />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Passing Server Actions as Props</h2>
          <div className="space-y-4 text-sm">
            <p>
              This example shows how to pass a server action to a client component as a prop.
            </p>
            <p>
              The server action is defined in a separate file with the <code>'use server'</code> directive at the top.
            </p>
            <p>
              The client component receives the server action as a prop and uses it in the form's <code>action</code> attribute.
            </p>
            <p>
              This pattern allows for better separation of concerns and reusability of client components.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 