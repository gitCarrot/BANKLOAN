'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { ArrowUpRight, CreditCard, DollarSign, FileText, Users } from 'lucide-react';
import { getApplications } from '@/app/actions/applications';
import { getJudgments } from '@/app/actions/judgments';
import { getContracts } from '@/app/actions/contracts';
import { getRepayments } from '@/app/actions/repayments';
import { getCounsels } from '@/app/actions/counsels';

// 타입 정의
interface PieChartLabelProps {
  name: string;
  percent: number;
}

interface DashboardStats {
  totalConsultations: number;
  totalApplications: number;
  activeLoans: number;
  totalRevenue: number;
  activeUsers: number;
  consultationsData: { name: string; count: number }[];
  applicationsData: { name: string; count: number }[];
  loanStatusData: { name: string; value: number }[];
  revenueData: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    totalApplications: 0,
    activeLoans: 0,
    totalRevenue: 0,
    activeUsers: 0,
    consultationsData: [],
    applicationsData: [],
    loanStatusData: [],
    revenueData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [applications, judgments, contracts, repayments, counsels] = await Promise.all([
          getApplications(),
          getJudgments(),
          getContracts(),
          getRepayments('all'),
          getCounsels()
        ]);
        
        // Calculate total consultations
        const totalConsultations = counsels.length;
        
        // Calculate total applications
        const totalApplications = applications.length;
        
        // Calculate active loans (contracts that are active)
        const activeLoans = contracts.filter(contract => 
          !contract.isDeleted
        ).length;
        
        // Calculate total revenue (sum of all repayments)
        const totalRevenue = repayments.reduce((sum, repayment) => 
          sum + repayment.repaymentAmount, 0
        );
        
        // Calculate active users (unique users from applications)
        const uniqueUsers = new Set(applications.map(app => app.email));
        const activeUsers = uniqueUsers.size;
        
        // Prepare monthly consultation data
        const consultationsData = prepareMonthlyData(counsels);
        
        // Prepare monthly application data
        const applicationsData = prepareMonthlyData(applications);
        
        // Prepare loan status data
        const approvedCount = judgments.filter(j => j.approvalAmount > 0).length;
        const pendingCount = applications.length - judgments.length;
        const rejectedCount = judgments.filter(j => j.approvalAmount === 0).length;
        
        const loanStatusData = [
          { name: 'Approved', value: approvedCount },
          { name: 'Pending', value: pendingCount },
          { name: 'Rejected', value: rejectedCount }
        ];
        
        // Prepare monthly revenue data
        const revenueData = prepareMonthlyRevenueData(repayments);
        
        setStats({
          totalConsultations,
          totalApplications,
          activeLoans,
          totalRevenue,
          activeUsers,
          consultationsData,
          applicationsData,
          loanStatusData,
          revenueData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  // Helper function to prepare monthly data
  function prepareMonthlyData(data: any[]) {
    const currentYear = new Date().getFullYear();
    const monthlyData = MONTHS.map(month => ({ name: month, count: 0 }));
    
    data.forEach(item => {
      const date = new Date(item.appliedAt || item.createdAt);
      if (date && date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].count += 1;
        }
      }
    });
    
    // Return only the last 7 months
    return monthlyData.slice(0, 7);
  }
  
  // Helper function to prepare monthly revenue data
  function prepareMonthlyRevenueData(repayments: any[]) {
    const currentYear = new Date().getFullYear();
    const monthlyData = MONTHS.map(month => ({ name: month, value: 0 }));
    
    repayments.forEach(repayment => {
      const date = new Date(repayment.createdAt);
      if (date && date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].value += repayment.repaymentAmount;
        }
      }
    });
    
    // Return only the last 7 months
    return monthlyData.slice(0, 7);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Loan Consultations</CardTitle>
                <CardDescription>
                  Number of loan consultations per month
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.consultationsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loan Status</CardTitle>
                <CardDescription>
                  Distribution of loan statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.loanStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.loanStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>
                  Number of loan applications per month
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.applicationsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>
                  Monthly revenue from loan repayments
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.revenueData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics content */}
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          {/* Reports content */}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 