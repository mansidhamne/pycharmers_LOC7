'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from 'lucide-react';
import Image from 'next/image';
import logo from '@/public/logo.png';

export function Navbar() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md shadow-md">
      <div className="container flex flex-row h-16 items-center justify-end mx-auto px-4">
        <Link href="/dashboard">
        <div className="flex flex-row items-center">
          <Image src={logo} alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-lg text-foreground">Fraud Zero</span>
        </div>
        </Link>
        <div className="relative w-full max-w-md">
          <button onClick={() => setShowSearch(!showSearch)} className="flex w-full items-center rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground shadow-md">
            <Search className="mr-2 h-4 w-4" />
            <span>Search expenses...</span>
          </button>
          {showSearch && (
            <div className="absolute left-0 top-full mt-2 w-full p-3 bg-popover shadow-lg rounded-lg">
              <Input placeholder="Search expenses..." className="w-full" />
            </div>
          )}
        </div>
        <Button onClick={() => router.push('/expenses/new')} size="sm" className="rounded-lg shadow-md bg-primary text-white hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> New Receipt
        </Button>
        <Button variant="ghost" className="relative shadow-md">
          {/* <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/01.png" alt="@username" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar> */}
          Logout
        </Button>
      </div>
    </nav>
  );
}
