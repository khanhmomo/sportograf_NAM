'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-8">
            <Link href="/" className="flex items-center space-x-2 md:space-x-3">
              <img 
                src="https://www.sportograf.com/images/sg-logo-new-no-text.png" 
                alt="Sportograf Logo" 
                className="h-6 md:h-8 w-auto"
              />
              <span className="text-base md:text-xl font-bold text-gray-900">Sportograf North America</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/events" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  pathname === '/events' 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Events
              </Link>
              <Link 
                href="/travel" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  pathname === '/travel' 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Travel Forms
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
