'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Plus, LogOut, Settings, User } from 'lucide-react';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Navbar({ className }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
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
    <nav className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-background'
    } `}> 
      <div className="container flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            ExpenseFlow
          </span>
        </Link>

        {isAuthPage ? (
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-lg">
              Sign in
            </Button>
            <Button onClick={() => router.push('/register')} className="text-lg px-6 py-3 shadow-md">
              Get Started
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-80">
              <Input placeholder="Search expenses..." className="w-full rounded-full px-5 py-3 text-lg shadow-sm" />
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
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500" />
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
              <DropdownMenuContent align="end" className="w-56 shadow-lg rounded-lg">
                <DropdownMenuLabel className="text-lg">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-3 h-5 w-5" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-3 h-5 w-5" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-3 h-5 w-5" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
