'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  FileText, 
  CreditCard, 
  DollarSign, 
  FileSignature, 
  BanknoteIcon, 
  Clock, 
  ArrowRight,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React from 'react';

// 타입 정의
interface DetailItem {
  icon: React.ReactNode;
  title: string;
  content?: string;
  list?: string[];
}

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: DetailItem[];
  isLast?: boolean;
}

interface TipProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// 애니메이션 변수
const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 프로세스 단계 컴포넌트
const ProcessStep: React.FC<ProcessStepProps> = ({ 
  number, 
  title, 
  description, 
  icon, 
  details, 
  isLast = false 
}) => {
  return (
    <motion.div 
      className="relative mb-12 last:mb-0"
      variants={itemAnimation}
    >
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-primary/5"></div>
      )}
      <div className="flex">
        <div className="flex-shrink-0 z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            {number}
          </div>
        </div>
        <div className="ml-8">
          <div className="flex items-center">
            {icon && <span className="mr-2 text-primary">{icon}</span>}
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map((detail, index) => (
              <div 
                key={index} 
                className="bg-card p-4 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h4 className="font-medium flex items-center text-primary">
                  {detail.icon}
                  {detail.title}
                </h4>
                {detail.list ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {detail.list.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <ChevronRight className="h-3 w-3 mr-1 mt-1 text-primary/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm">
                    {detail.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 팁 컴포넌트
const Tip: React.FC<TipProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-card p-4 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <h4 className="font-medium text-primary">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground pl-8">
        {description}
      </p>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-12 text-center">
          <Badge className="mb-4 px-3 py-1 text-sm font-medium" variant="outline">BANK LOAN</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            About Our <span className="text-primary">Loan Process</span>
          </h1>
          <p className="mt-6 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Learn how our streamlined loan application and approval process works to get you the funding you need quickly and efficiently.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="px-6">
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-6">
              Contact Us
            </Button>
          </div>
        </div>

        <Card className="mb-10 border-border/30 shadow-sm">
          <CardContent className="p-6 flex items-start">
            <Info className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Our loan process is designed to be transparent, efficient, and customer-friendly. We've broken it down into simple steps so you know exactly what to expect at each stage. If you have any questions, our support team is available to assist you.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="application" className="w-full">
          <TabsList className="w-full mb-8 flex justify-center">
            <TabsTrigger value="application" className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Application Process
            </TabsTrigger>
            <TabsTrigger value="contract" className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Contract Process
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="application">
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerAnimation}
              className="space-y-10"
            >
              <Card className="border-border/30 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/20">
                  <CardTitle className="flex items-center text-2xl">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Loan Application Process
                  </CardTitle>
                  <CardDescription>
                    From consultation to approval, here's how our loan application process works.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-12">
                    {/* Process Timeline */}
                    <div className="relative">
                      <ProcessStep
                        number="1"
                        title="Loan Consultation"
                        description="Begin by submitting a consultation request with your basic information. Our team will review your initial request to understand your financial needs."
                        icon={<FileText className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "What You Need to Provide",
                            list: [
                              "Personal information (name, contact details)",
                              "Brief description of loan purpose",
                              "Preferred contact method"
                            ]
                          },
                          {
                            icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
                            title: "Expected Timeline",
                            content: "Consultation requests are typically reviewed within 1-2 business days. You'll receive a confirmation email immediately after submission."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="2"
                        title="Formal Application"
                        description="After consultation, you'll complete a formal application with detailed financial information and submit required documentation."
                        icon={<FileSignature className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Required Documentation",
                            list: [
                              "Proof of identity (government ID)",
                              "Proof of income (pay stubs, tax returns)",
                              "Bank statements (last 3 months)",
                              "Employment verification"
                            ]
                          },
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Terms Acceptance",
                            content: "During application, you'll review and accept our terms and conditions, privacy policy, and loan agreement terms."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="3"
                        title="Application Review & Judgment"
                        description="Our underwriting team reviews your application, verifies documentation, and makes a loan decision based on our criteria."
                        icon={<CreditCard className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "What We Evaluate",
                            list: [
                              "Credit history and score",
                              "Income and employment stability",
                              "Debt-to-income ratio",
                              "Loan purpose and amount"
                            ]
                          },
                          {
                            icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
                            title: "Review Timeline",
                            content: "The review process typically takes 3-5 business days. You can check your application status at any time through your account."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="4"
                        title="Loan Approval"
                        description="If approved, you'll receive a loan offer with details on the approved amount, interest rate, and term. You can then proceed to the contract phase."
                        icon={<CheckCircle className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Approval Details",
                            list: [
                              "Approved loan amount",
                              "Interest rate",
                              "Loan term (duration)",
                              "Estimated monthly payment"
                            ]
                          },
                          {
                            icon: <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />,
                            title: "Next Steps",
                            content: "After approval, you'll be directed to review and sign your loan contract. This is the final step before loan disbursement."
                          }
                        ]}
                        isLast={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Application Tips */}
              <Card className="border-border/30 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/20">
                  <CardTitle className="flex items-center text-xl">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    Tips for a Successful Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Be Thorough and Accurate"
                      description="Ensure all information provided is accurate and complete to avoid delays in processing."
                    />
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Submit All Required Documents"
                      description="Have all required documentation ready before starting your application."
                    />
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Check Your Application Status"
                      description="Regularly check your application status and respond promptly to any requests for additional information."
                    />
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Ask Questions"
                      description="Don't hesitate to contact our support team if you have questions about the application process."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="contract">
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerAnimation}
              className="space-y-10"
            >
              <Card className="border-border/30 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/20">
                  <CardTitle className="flex items-center text-2xl">
                    <FileSignature className="h-5 w-5 mr-2 text-primary" />
                    Loan Contract Process
                  </CardTitle>
                  <CardDescription>
                    From contract signing to repayment, here's how our loan contract process works.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-12">
                    {/* Process Timeline */}
                    <div className="relative">
                      <ProcessStep
                        number="1"
                        title="Contract Creation"
                        description="After your loan is approved, we create a personalized loan contract with all the terms and conditions based on your approved application."
                        icon={<FileText className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Contract Details",
                            list: [
                              "Loan amount and purpose",
                              "Interest rate and APR",
                              "Loan term and payment schedule",
                              "Fees and penalties",
                              "Borrower and lender obligations"
                            ]
                          },
                          {
                            icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
                            title: "Timeline",
                            content: "Contract creation typically occurs within 1 business day after loan approval. You'll receive a notification when your contract is ready for review."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="2"
                        title="Contract Signing"
                        description="Review your contract carefully and sign it electronically through our secure platform. This legally binds you to the terms of the loan."
                        icon={<FileSignature className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Signing Process",
                            list: [
                              "Review all contract terms",
                              "Accept terms and conditions",
                              "Provide electronic signature",
                              "Receive signed copy via email"
                            ]
                          },
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Important Considerations",
                            content: "Take time to understand all terms before signing. You can contact our support team if you have questions about any contract terms."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="3"
                        title="Loan Activation & Disbursement"
                        description="After signing, your loan is activated and funds are disbursed to your designated bank account according to the agreed terms."
                        icon={<BanknoteIcon className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Disbursement Process",
                            list: [
                              "Verification of signed contract",
                              "Funds transfer to your account",
                              "Confirmation of disbursement",
                              "Initial balance creation"
                            ]
                          },
                          {
                            icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
                            title: "Timeline",
                            content: "Funds are typically disbursed within 1-3 business days after contract signing. You'll receive a notification when the funds are transferred."
                          }
                        ]}
                      />
                      
                      <ProcessStep
                        number="4"
                        title="Loan Repayment"
                        description="Make regular payments according to your repayment schedule until the loan is fully repaid. Track your progress and manage your loan through your account."
                        icon={<DollarSign className="h-5 w-5" />}
                        details={[
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Repayment Options",
                            list: [
                              "Online payments through your account",
                              "Automatic payments (recommended)",
                              "Bank transfers",
                              "Early repayment options"
                            ]
                          },
                          {
                            icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
                            title: "Tracking & Management",
                            content: "Monitor your loan balance, payment history, and upcoming payments through your account dashboard. Set up payment reminders to avoid late fees."
                          }
                        ]}
                        isLast={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contract Tips */}
              <Card className="border-border/30 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/20">
                  <CardTitle className="flex items-center text-xl">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    Tips for Managing Your Loan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Set Up Automatic Payments"
                      description="Avoid missed payments by setting up automatic payments from your bank account."
                    />
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Pay More Than the Minimum"
                      description="When possible, pay more than the minimum payment to reduce interest costs and pay off your loan faster."
                    />
                    <Tip 
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Monitor Your Loan Regularly"
                      description="Check your loan status regularly to track your progress and ensure payments are being applied correctly."
                    />
                    <Tip 
                      icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                      title="Contact Us If You Have Difficulties"
                      description="If you're having trouble making payments, contact us immediately to discuss options."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        
        <Card className="mt-12 border-border/30 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our team is ready to help you through every step of the loan process. Apply now or contact us with any questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="px-6 bg-primary hover:bg-primary/90">
                Apply for a Loan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="px-6 border-primary text-primary hover:bg-primary/10">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 