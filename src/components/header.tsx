
"use client";

import { BrainCircuit, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
    { href: '#wawasan-pasar', label: 'Wawasan Pasar' },
    { href: '#pangsa-pasar', label: 'Pangsa Pasar' },
    { href: '#cek-strategi', label: 'Simulasi' },
    { href: '#hasil-simulasi', label: 'Hasil AI' },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-7xl">
        <div className="flex-1 flex items-center">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Petakan.ai</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="text-lg font-medium transition-colors hover:text-primary">{link.label}</Link>
                        </SheetClose>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
