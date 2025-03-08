import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-4 md:px-6 lg:px-8 max-w-[1440px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageContainer({ children, className, ...props }: ContainerProps) {
  return (
    <div 
      className={cn(
        "py-10 md:py-16",
        className
      )}
      {...props}
    >
      <Container>
        {children}
      </Container>
    </div>
  );
}

export function SectionContainer({ children, className, ...props }: ContainerProps) {
  return (
    <section 
      className={cn(
        "py-12 md:py-16 lg:py-20",
        className
      )}
      {...props}
    >
      <Container>
        {children}
      </Container>
    </section>
  );
} 