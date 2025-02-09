'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Plus, LogOut, Settings, User } from 'lucide-react';
import logo from '@/public/logo.png';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Navbar({ className }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthPage = ['/', '/login', '/register'].includes(pathname);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`px-8 sticky top-0 z-40 w-full transition-all duration-200 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Name - Always visible */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <Image src={logo} alt="Logo" className="h-10 w-16" />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Fraud Zero
          </span>
        </Link>

        {isAuthPage ? (
          // Auth pages navigation items
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign in
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        ) : (
          // Main app navigation items
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block w-full max-w-md">
              <button 
                onClick={() => setShowSearch(!showSearch)} 
                className="flex w-full items-center rounded-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search expenses...</span>
              </button>
              {showSearch && (
                <div className="absolute left-0 top-full mt-2 w-full p-3 bg-popover shadow-lg rounded-lg border">
                  <Input placeholder="Search expenses..." className="w-full" />
                </div>
              )}
            </div>

            {/* New Expense Button */}
            <Button 
              onClick={() => router.push('/expenses/upload')} 
              size="sm" 
              className="hidden sm:flex items-center rounded-full shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> New Expense
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {/* <AvatarImage src="/avatars/01.png" alt="@username" /> */}
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}