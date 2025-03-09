'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getApplicationById } from "@/app/actions/applications";
import { getJudgmentByApplicationId } from "@/app/actions/judgments";
import { getContractByApplicationId } from "@/app/actions/contracts";
import { getBalance } from "@/app/actions/balances";
import { getRepayments } from "@/app/actions/repayments";
import { Loader2, CheckCircle, AlertCircle, Clock, FileText, CreditCard, DollarSign, FileSignature, BanknoteIcon, PieChart, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, addMonths } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [applicationId, setApplicationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [judgmentStatus, setJudgmentStatus] = useState<any>(null);
  const [contractStatus, setContractStatus] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [repaymentsData, setRepaymentsData] = useState<any[]>([]);
  const [loanStats, setLoanStats] = useState<{
    remainingBalance: number;
    totalPaid: number;
    monthlyPayment: number;
    totalInterest: number;
    remainingMonths: number;
    completionPercentage: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApplicationStatus = async () => {
    if (!applicationId.trim()) {
      setError("Please enter an Application ID");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setJudgmentStatus(null);
      setContractStatus(null);
      setBalanceData(null);
      setRepaymentsData([]);
      setLoanStats(null);
      
      const { application, error: apiError } = await getApplicationById(applicationId);
      
      if (apiError) {
        setError(apiError);
        setApplicationStatus(null);
        return;
      }
      
      if (!application) {
        setError("Application not found. Please check the ID and try again.");
        setApplicationStatus(null);
        return;
      }
      
      setApplicationStatus(application);
      
      // 심사 정보 가져오기
      try {
        const judgment = await getJudgmentByApplicationId(parseInt(applicationId));
        setJudgmentStatus(judgment);
      } catch (err) {
        console.log("No judgment found for this application");
      }
      
      // 계약 정보 가져오기
      try {
        const contract = await getContractByApplicationId(parseInt(applicationId));
        setContractStatus(contract);
        
        // 계약이 있고 active 상태인 경우 잔액과 상환 정보 가져오기
        if (contract && (contract.status === 'active' || contract.status === 'signed')) {
          try {
            // 잔액 정보 가져오기
            const balance = await getBalance(applicationId);
            setBalanceData(balance);
            
            // 상환 정보 가져오기
            const repayments = await getRepayments(applicationId);
            setRepaymentsData(repayments);
            
            // 대출 통계 계산
            calculateLoanStats(contract, balance, repayments);
          } catch (err) {
            console.log("Error fetching balance or repayments:", err);
          }
        }
      } catch (err) {
        console.log("No contract found for this application");
      }
      
    } catch (err) {
      console.error("Error checking application status:", err);
      setError("An error occurred while checking the application status. Please try again.");
      setApplicationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 대출 통계 계산 함수
  const calculateLoanStats = (contract: any, balance: any, repayments: any[]) => {
    if (!contract) return;
    
    // 총 대출 금액
    const totalAmount = contract.amount;
    
    // 남은 잔액 (잔액 정보가 있으면 사용, 없으면 총 대출 금액 사용)
    const remainingBalance = balance ? balance.balance : totalAmount;
    
    // 총 상환 금액
    const totalPaid = totalAmount - remainingBalance;
    
    // 월 상환액 계산 (원리금균등상환 방식)
    const monthlyRate = contract.interestRate / 100 / 12;
    const monthlyPayment = totalAmount * (monthlyRate * Math.pow(1 + monthlyRate, contract.term)) / 
                          (Math.pow(1 + monthlyRate, contract.term) - 1);
    
    // 총 이자 금액
    const totalInterest = (monthlyPayment * contract.term) - totalAmount;
    
    // 남은 개월 수 계산
    const remainingMonths = Math.ceil(remainingBalance / monthlyPayment);
    
    // 완료 비율 계산
    const completionPercentage = Math.min(100, Math.round((totalPaid / totalAmount) * 100));
    
    setLoanStats({
      remainingBalance,
      totalPaid,
      monthlyPayment,
      totalInterest,
      remainingMonths,
      completionPercentage
    });
  };

  // Function to determine the current step in the loan process
  const getCurrentStep = () => {
    if (!applicationStatus) return 0;
    
    // 대출금 지급 완료
    if (applicationStatus.contractedAt) return 5;
    
    // 계약 체결됨
    if (contractStatus && contractStatus.status === 'signed') return 4;
    
    // 계약 대기 중
    if (judgmentStatus && judgmentStatus.approvalAmount > 0) return 3;
    
    // 심사 중
    if (applicationStatus.appliedAt && !judgmentStatus) return 2;
    
    // 신청 완료
    return 1;
  };

  const currentStep = getCurrentStep();
  
  // 상태에 따른 배지 색상 및 텍스트
  const getStatusBadge = () => {
    switch(currentStep) {
      case 1:
        return <Badge className="bg-blue-500">Application Submitted</Badge>;
      case 2:
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case 3:
        return <Badge className="bg-green-500">Approved</Badge>;
      case 4:
        return <Badge className="bg-purple-500">Contract Signed</Badge>;
      case 5:
        return <Badge className="bg-emerald-500">Loan Disbursed</Badge>;
      default:
        return null;
    }
  };

  // 예상 상환 완료일 계산
  const getEstimatedCompletionDate = () => {
    if (!contractStatus || !contractStatus.activatedAt || !loanStats) return 'N/A';
    
    const activationDate = new Date(contractStatus.activatedAt);
    return format(addMonths(activationDate, loanStats.remainingMonths), 'PPP');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1440px]">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <motion.div 
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Modern Banking Solutions for Your Financial Needs
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Get the loan you need with our streamlined application process and competitive rates.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg">
                    <Link href="/counsel">Apply for a Loan</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild variant="default" size="lg">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 to-green-100 p-8 flex items-center justify-center">
                <motion.div 
                  className="absolute"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.5,
                    rotate: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 5
                    }
                  }}
                >
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-orange-500 fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                    </svg>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-16 bg-green-500 rounded-t-full"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-8 h-8 bg-green-600 rounded-full transform rotate-45"></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-12 right-12"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, y: [0, -10, 0] }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.8,
                    y: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 3
                    }
                  }}
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-green-600 fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12.31 11.14c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                    </svg>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute top-12 left-12"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 0] }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1,
                    rotate: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 4
                    }
                  }}
                >
                  <div className="relative w-20 h-20 md:w-28 md:h-28">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-500 fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-orange-600">
                    Carrot<span className="text-green-600">Loan</span>
                  </h2>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Status Tracker Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1440px]">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Track Your Application</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Enter your Application ID to check the status of your loan application
              </p>
            </div>
            
            <div className="w-full max-w-md mx-auto mt-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter your Application ID"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={checkApplicationStatus} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : "Check Status"}
                </Button>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </motion.div>
              )}
            </div>
            
            {applicationStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl mx-auto mt-6"
              >
                <Card className="overflow-hidden border-2">
                  <div className="bg-primary text-primary-foreground p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">
                        Application #{applicationStatus.applicationId}
                      </h3>
                      {getStatusBadge()}
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      Applied on {format(new Date(applicationStatus.appliedAt || new Date()), 'PPP')}
                    </p>
                  </div>
                  
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-8">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Applicant</p>
                        <p className="font-medium">{applicationStatus.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Requested Amount</p>
                        <p className="font-medium">${applicationStatus.hopeAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Approved Amount</p>
                        <p className="font-medium">
                          {judgmentStatus ? 
                            `$${judgmentStatus.approvalAmount.toLocaleString()}` : 
                            applicationStatus.approvalAmount ? 
                              `$${applicationStatus.approvalAmount.toLocaleString()}` : 
                              'Pending'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">
                          {judgmentStatus ? 
                            `${judgmentStatus.approvalInterestRate}%` : 
                            applicationStatus.interestRate ? 
                              `${applicationStatus.interestRate}%` : 
                              'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative mb-10">
                      {/* Progress bar */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
                      <div className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 bg-primary transition-all duration-500`} 
                           style={{ width: `${(currentStep - 1) * 25}%` }}></div>
                      
                      {/* Steps */}
                      <div className="relative z-10 flex justify-between">
                        {/* Step 1: Application Submitted */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            currentStep >= 1 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {currentStep > 1 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Application<br />Submitted</span>
                        </div>
                        
                        {/* Step 2: Under Review */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            currentStep >= 2 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {currentStep > 2 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : currentStep === 2 ? (
                              <Clock className="h-5 w-5 animate-pulse" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Under<br />Review</span>
                        </div>
                        
                        {/* Step 3: Approved */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            currentStep >= 3 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {currentStep > 3 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : currentStep === 3 ? (
                              <CreditCard className="h-5 w-5" />
                            ) : (
                              <CreditCard className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Approved</span>
                        </div>
                        
                        {/* Step 4: Contract Signed */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            currentStep >= 4 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {currentStep > 4 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : currentStep === 4 ? (
                              <FileSignature className="h-5 w-5" />
                            ) : (
                              <FileSignature className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Contract<br />Signed</span>
                        </div>
                        
                        {/* Step 5: Loan Disbursed */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            currentStep >= 5 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {currentStep === 5 ? (
                              <BanknoteIcon className="h-5 w-5" />
                            ) : (
                              <BanknoteIcon className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Loan<br />Disbursed</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 상태별 추가 정보 및 액션 버튼 */}
                    <div className="mt-6 border-t pt-6">
                      {currentStep === 1 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">Your application has been submitted and is waiting for review.</p>
                          <Button asChild variant="outline">
                            <Link href={`/judgments?applicationId=${applicationStatus.applicationId}`}>
                              Check Judgment Status
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {currentStep === 2 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">Your application is currently under review. We'll notify you once the review is complete.</p>
                          <Button asChild variant="outline">
                            <Link href={`/judgments?applicationId=${applicationStatus.applicationId}`}>
                              Check Judgment Status
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {currentStep === 3 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Congratulations! Your loan has been approved for ${judgmentStatus?.approvalAmount.toLocaleString() || applicationStatus.approvalAmount?.toLocaleString()}.
                          </p>
                          <Button asChild>
                            <Link href={`/contracts?applicationId=${applicationStatus.applicationId}`}>
                              Proceed to Contract
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {currentStep === 4 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Your contract has been signed. The loan will be disbursed soon.
                          </p>
                          <Button asChild>
                            <Link href={`/contracts?applicationId=${applicationStatus.applicationId}`}>
                              View Contract Details
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {currentStep === 5 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Your loan has been disbursed. You can now view your repayment schedule.
                          </p>
                          <Button asChild>
                            <Link href={`/repayments?applicationId=${applicationStatus.applicationId}`}>
                              View Repayment Schedule
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 계약 상태 카드 - 계약이 있을 경우에만 표시 */}
            {contractStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-3xl mx-auto mt-6"
              >
                <Card className="overflow-hidden border-2 border-primary/20">
                  <div className="bg-secondary text-secondary-foreground p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">
                        Contract Details
                      </h3>
                      <Badge className={cn(
                        contractStatus.status === 'pending' && "bg-yellow-500",
                        contractStatus.status === 'signed' && "bg-purple-500",
                        contractStatus.status === 'active' && "bg-green-500",
                        contractStatus.status === 'completed' && "bg-blue-500",
                        contractStatus.status === 'cancelled' && "bg-red-500"
                      )}>
                        {contractStatus.status.charAt(0).toUpperCase() + contractStatus.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      Contract #{contractStatus.contractId}
                    </p>
                  </div>
                  
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 mb-8">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Loan Amount</p>
                        <p className="font-medium">${contractStatus.amount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{contractStatus.interestRate}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Term</p>
                        <p className="font-medium">{contractStatus.term} months</p>
                      </div>
                    </div>
                    
                    {/* 대출 통계 정보 - active 상태일 때만 표시 */}
                    {contractStatus.status === 'active' && loanStats && (
                      <div className="mb-8 border rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-4">Loan Statistics</h4>
                        
                        <div className="space-y-6">
                          {/* 상환 진행률 */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Repayment Progress</span>
                              <span className="font-medium">{loanStats.completionPercentage}%</span>
                            </div>
                            <Progress value={loanStats.completionPercentage} className="h-2" />
                          </div>
                          
                          {/* 통계 그리드 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                              <div className="mt-0.5">
                                <BanknoteIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Remaining Balance</p>
                                <p className="text-lg font-bold">${loanStats.remainingBalance.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                              <div className="mt-0.5">
                                <TrendingUp className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Monthly Payment</p>
                                <p className="text-lg font-bold">${Math.round(loanStats.monthlyPayment).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                              <div className="mt-0.5">
                                <PieChart className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Total Interest</p>
                                <p className="text-lg font-bold">${Math.round(loanStats.totalInterest).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                              <div className="mt-0.5">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Remaining Time</p>
                                <p className="text-lg font-bold">{loanStats.remainingMonths} months</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* 예상 완료일 */}
                          <div className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                              Estimated completion date: <span className="font-medium">{getEstimatedCompletionDate()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 계약 진행 상태 */}
                    <div className="relative mb-10">
                      {/* Progress bar */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
                      <div className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 bg-secondary transition-all duration-500`} 
                           style={{ 
                             width: contractStatus.status === 'pending' ? '25%' : 
                                    contractStatus.status === 'signed' ? '50%' : 
                                    contractStatus.status === 'active' ? '75%' : 
                                    contractStatus.status === 'completed' ? '100%' : '0%' 
                           }}></div>
                      
                      {/* Steps */}
                      <div className="relative z-10 flex justify-between">
                        {/* Step 1: Contract Created */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            ['pending', 'signed', 'active', 'completed'].includes(contractStatus.status)
                              ? "bg-secondary text-secondary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {['signed', 'active', 'completed'].includes(contractStatus.status) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Contract<br />Created</span>
                        </div>
                        
                        {/* Step 2: Contract Signed */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            ['signed', 'active', 'completed'].includes(contractStatus.status)
                              ? "bg-secondary text-secondary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {['active', 'completed'].includes(contractStatus.status) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : contractStatus.status === 'signed' ? (
                              <FileSignature className="h-5 w-5" />
                            ) : (
                              <FileSignature className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Contract<br />Signed</span>
                        </div>
                        
                        {/* Step 3: Loan Activated */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            ['active', 'completed'].includes(contractStatus.status)
                              ? "bg-secondary text-secondary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            {contractStatus.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : contractStatus.status === 'active' ? (
                              <BanknoteIcon className="h-5 w-5" />
                            ) : (
                              <BanknoteIcon className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs text-center font-medium">Loan<br />Activated</span>
                        </div>
                        
                        {/* Step 4: Loan Completed */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            contractStatus.status === 'completed'
                              ? "bg-secondary text-secondary-foreground shadow-lg" 
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                          )}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <span className="text-xs text-center font-medium">Loan<br />Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 계약 상태별 추가 정보 */}
                    <div className="mt-6 border-t pt-6">
                      {contractStatus.status === 'pending' && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">Your contract has been created and is waiting for your signature.</p>
                          <Button asChild>
                            <Link href={`/contracts?applicationId=${applicationStatus.applicationId}`}>
                              Review and Sign Contract
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {contractStatus.status === 'signed' && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Your contract has been signed on {contractStatus.signedAt ? format(new Date(contractStatus.signedAt), 'PPP') : 'N/A'}.
                            The loan will be activated soon.
                          </p>
                          <Button asChild>
                            <Link href={`/contracts?applicationId=${applicationStatus.applicationId}`}>
                              View Contract Details
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {contractStatus.status === 'active' && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Your loan was activated on {contractStatus.activatedAt ? format(new Date(contractStatus.activatedAt), 'PPP') : 'N/A'}.
                            You can now view your repayment schedule.
                          </p>
                          <Button asChild>
                            <Link href={`/repayments?applicationId=${applicationStatus.applicationId}`}>
                              View Repayment Schedule
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {contractStatus.status === 'completed' && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Congratulations! Your loan has been fully repaid.
                          </p>
                          <Button asChild variant="outline">
                            <Link href={`/repayments?applicationId=${applicationStatus.applicationId}`}>
                              View Repayment History
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {contractStatus.status === 'cancelled' && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            This contract has been cancelled.
                          </p>
                          <Button asChild variant="outline">
                            <Link href="/counsel">
                              Apply for a New Loan
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1440px]">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Services</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We offer a range of financial services to meet your needs
              </p>
            </motion.div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <motion.div 
              className="flex flex-col items-center space-y-4 rounded-lg border p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M5 22h14"></path>
                  <path d="M5 2h14"></path>
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Loan Consultation</h3>
              <p className="text-center text-muted-foreground">
                Get expert advice on the best loan options for your specific needs.
              </p>
              <Button asChild variant="link">
                <Link href="/counsel">Learn More</Link>
              </Button>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center space-y-4 rounded-lg border p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M16 2v5h5"></path>
                  <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z"></path>
                  <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15"></path>
                  <path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Loan Applications</h3>
              <p className="text-center text-muted-foreground">
                Apply for a loan with our streamlined application process.
              </p>
              <Button asChild variant="link">
                <Link href="/applications">Learn More</Link>
              </Button>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center space-y-4 rounded-lg border p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Repayment Options</h3>
              <p className="text-center text-muted-foreground">
                Flexible repayment options to fit your financial situation.
              </p>
              <Button asChild variant="link">
                <Link href="/repayments">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1440px]">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Apply for a loan today and get the funds you need.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg">
                <Link href="/counsel">Apply Now</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
