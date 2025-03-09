'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { 
  Shield, 
  Menu, 
  X, 
  Home, 
  Info, 
  FileText, 
  CreditCard, 
  DollarSign, 
  FileSignature, 
  Carrot,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 현재 경로가 /admin으로 시작하는지 확인
  useEffect(() => {
    setIsAdmin(pathname?.startsWith('/admin') || false);
  }, [pathname]);

  // 어드민 모드 토글
  const toggleAdminMode = () => {
    if (isAdmin) {
      // 어드민 모드에서 유저 모드로 전환
      window.location.href = '/';
    } else {
      // 유저 모드에서 어드민 모드로 전환
      window.location.href = '/admin';
    }
  };

  // 어드민 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300",
        isScrolled 
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-sm" 
          : "bg-background/50 supports-[backdrop-filter]:bg-background/30"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pl-2 md:pl-4 flex items-center"
        >
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Carrot className="h-6 w-6 text-orange-500" />
            </motion.div>
            <span className="font-bold text-xl">
              <span className="text-orange-500">Carrot</span>
              <span className="text-green-600">Loan</span>
              {isAdmin && <span className="ml-1 text-sm text-gray-500">(Admin)</span>}
            </span>
          </Link>
        </motion.div>

        {/* 데스크톱 네비게이션 */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {isAdmin ? (
              // 어드민 메뉴
              <>
                <NavigationMenuItem>
                  <Link href="/admin" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Management</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li>
                        <Link href="/admin/applications" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Applications
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/judgments" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Judgments
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/contracts" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Contracts
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/repayments" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Repayments
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/users" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Users
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/terms" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Terms
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/admin/settings" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Settings
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            ) : (
              // 유저 메뉴
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-orange-50 to-orange-100 p-6 no-underline outline-none focus:shadow-md"
                            href="/applications"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-orange-600">
                              Loan Applications
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Apply for a loan or check your application status
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link href="/judgments" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Loan Judgments
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/contracts" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Loan Contracts
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/repayments" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Loan Repayments
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Terms & Conditions
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/counsel" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Consultation
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4 pr-2 md:pr-4">
          {/* 어드민/유저 모드 토글 스위치 */}
          <div className="hidden md:flex items-center space-x-2">
            <Label htmlFor="admin-mode" className={cn("text-xs", isAdmin ? "text-primary" : "text-muted-foreground")}>
              {isAdmin ? <Shield className="h-3 w-3 inline mr-1" /> : <User className="h-3 w-3 inline mr-1" />}
              {isAdmin ? "Admin" : "User"}
            </Label>
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={toggleAdminMode}
            />
          </div>

          {/* 모바일 메뉴 토글 버튼 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* 데스크톱 액션 버튼 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            {isAdmin ? (
              <Button asChild variant="default" className="backdrop-blur">
                <Link href="/">
                  <User className="h-4 w-4 mr-2" />
                  View Site
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default">
                <Link href="/counsel">
                  <Carrot className="h-4 w-4 mr-2" />
                  Apply Now
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t px-4 py-4 space-y-4 bg-background/95 backdrop-blur">
              {/* 어드민/유저 모드 토글 스위치 (모바일) */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="admin-mode-mobile" className="text-sm">
                  {isAdmin ? "Admin Mode" : "User Mode"}
                </Label>
                <Switch
                  id="admin-mode-mobile"
                  checked={isAdmin}
                  onCheckedChange={toggleAdminMode}
                />
              </div>

              <div className="space-y-2">
                {isAdmin ? (
                  // 어드민 모바일 메뉴
                  <>
                    <Link href="/admin" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Home className="h-4 w-4 mr-2" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/applications" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Applications</span>
                    </Link>
                    <Link href="/admin/judgments" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <FileSignature className="h-4 w-4 mr-2" />
                      <span>Judgments</span>
                    </Link>
                    <Link href="/admin/contracts" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Contracts</span>
                    </Link>
                    <Link href="/admin/repayments" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Repayments</span>
                    </Link>
                    <Link href="/admin/settings" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                  </>
                ) : (
                  // 유저 모바일 메뉴
                  <>
                    <Link href="/" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Home className="h-4 w-4 mr-2" />
                      <span>Home</span>
                    </Link>
                    <Link href="/applications" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Applications</span>
                    </Link>
                    <Link href="/judgments" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <FileSignature className="h-4 w-4 mr-2" />
                      <span>Judgments</span>
                    </Link>
                    <Link href="/contracts" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Contracts</span>
                    </Link>
                    <Link href="/repayments" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Repayments</span>
                    </Link>
                    <Link href="/about" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Info className="h-4 w-4 mr-2" />
                      <span>About</span>
                    </Link>
                    <Link href="/counsel" className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Carrot className="h-4 w-4 mr-2" />
                      <span>Apply Now</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;