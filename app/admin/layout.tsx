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
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
      title: 'Loan Contracts',
      href: '/admin/contracts',
      icon: <FileSignature className="h-5 w-5" />,
    },
    {
      title: 'Loan Repayments',
      href: '/admin/repayments',
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      title: 'Terms & Conditions',
      href: '/admin/terms',
      icon: <ScrollText className="h-5 w-5" />,
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

  // 유저 모드로 전환하는 함수
  const switchToUserMode = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        className={cn(
          'bg-background border-r flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out',
          collapsed ? 'w-[80px]' : 'w-[240px]'
        )}
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full p-4">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
              {!collapsed && (
                <Link href="/admin" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl">Admin</span>
                </Link>
              )}
              {collapsed && (
                <LayoutDashboard className="h-6 w-6 text-primary" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={collapsed ? "mx-auto" : ""}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 유저 모드 전환 토글 */}
          <div className={cn(
            "flex items-center mb-6 p-2 bg-muted/50 rounded-lg",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <Label htmlFor="user-mode" className="font-medium text-sm">
                  User
                </Label>
              </div>
            )}
            {collapsed && (
              <User className="h-5 w-5 text-primary" />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={switchToUserMode}
              className={cn(
                "flex items-center gap-2",
                collapsed ? "mt-2 px-2" : ""
              )}
            >
              {!collapsed ? "Go to User" : ""}
            </Button>
          </div>

          <Separator className="my-4" />

          {/* 네비게이션 메뉴 */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center py-2 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                  collapsed ? 'justify-center' : 'justify-start'
                )}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </div>
              </Link>
            ))}
          </nav>
          <Separator className="my-4" />
          <Button 
            variant="default" 
            className="w-full justify-start gap-2"
          >
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