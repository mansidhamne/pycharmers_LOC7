'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-lg text-foreground">ExpenseFlow</span>
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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full shadow-md">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/01.png" alt="@username" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </nav>
  );
}
