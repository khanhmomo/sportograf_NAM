'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="https://www.sportograf.com/images/sg-logo-new-no-text.png" 
                alt="Sportograf Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Sportograf North America</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/events" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/events' 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Events
              </Link>
              <Link 
                href="/travel" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/travel' 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Travel Forms
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
