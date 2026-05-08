'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <img 
              src="https://www.sportograf.com/images/sg-logo-new-no-text.png" 
              alt="Sportograf Logo" 
              className="h-6 md:h-8 w-auto"
            />
            <span className="text-base md:text-xl font-bold text-gray-900">Sportograf</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
