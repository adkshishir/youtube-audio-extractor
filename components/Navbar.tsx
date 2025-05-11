import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            YouTube Audio Extractor
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary">
              Privacy Policy
            </Link>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon">
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
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 