'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  User, 
  LogIn,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

// Extended session user type
interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  id?: string;
}

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  // Type assertion for session user
  const user = session?.user as SessionUser | undefined;
  
  // Handle sign out
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ 
      redirect: true,
      callbackUrl: '/'
    });
  };

  // Debug session info
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
  }, [session, status]);

  const isAuthenticated = status === 'authenticated' && !!session?.user;

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pl-2 md:pl-4"
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">BankLoan</span>
          </Link>
        </motion.div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Home</Button>
                </Link>
                <Link href="/applications" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Loan Applications</Button>
                </Link>
                <Link href="/judgments" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Loan Judgments</Button>
                </Link>
                <Link href="/contracts" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Loan Contracts</Button>
                </Link>
                <Link href="/repayments" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Loan Repayments</Button>
                </Link>
                <Link href="/terms" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Terms & Conditions</Button>
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">About</Button>
                </Link>
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Contact</Button>
                </Link>
                
                <div className="mt-4">
                  {isAuthenticated ? (
                    <Button className="w-full" onClick={handleSignOut}>Sign Out</Button>
                  ) : (
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/counsel"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Loan Consultation
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Get personalized advice from our loan experts
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <Link href="/applications" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Loan Applications
                      </NavigationMenuLink>
                    </Link>
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
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4 pr-2 md:pr-4">
          {user?.role === 'admin' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="icon" className="mr-2">
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                  <span className="sr-only">Admin</span>
                </Link>
              </Button>
            </motion.div>
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/applications">My Applications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts">My Contracts</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Button asChild variant="default">
                <Link href="/auth/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button asChild variant="default">
              <Link href="/counsel">Apply Now</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar; 