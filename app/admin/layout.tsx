'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ScrollText,
  Settings,
  Users,
  Scale,
  FileSignature,
  Receipt,
  FileCheck,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Loan Consultations',
      href: '/admin/counsels',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Loan Applications',
      href: '/admin/applications',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Loan Judgments',
      href: '/admin/judgments',
      icon: <Scale className="h-5 w-5" />,
    },
    {
      title: 'Contracts',
      href: '/admin/contracts',
      icon: <FileSignature className="h-5 w-5" />,
    },
    {
      title: 'Repayments',
      href: '/admin/repayments',
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      title: 'Terms Management',
      href: '/admin/terms',
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: 'Terms Agreements',
      href: '/admin/terms/agreements',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-20 flex h-full flex-col border-r bg-background"
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin" className="flex items-center gap-2">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold"
              >
                BankLoan Admin
              </motion.span>
            )}
            {collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold"
              >
                BL
              </motion.span>
            )}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                  item.href === '/admin' && 'bg-muted'
                )}
              >
                {item.icon}
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@bankloan.com</p>
                </div>
              </motion.div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? (
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
                  className="h-4 w-4"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : (
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
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              )}
            </Button>
          </div>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          collapsed ? 'ml-[80px]' : 'ml-[240px]'
        )}
      >
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 