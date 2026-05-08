import Link from 'next/link'
import { Calendar, Plane, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sportograf - Digital Forms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose events and submit travel information in one simple platform
          </p>
        </div>

        {/* Region Selection */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-5xl mx-auto">
          <Link
            href="/na"
            className="flex-1 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center border-4 border-blue-500 hover:border-blue-600"
          >
            <h2 className="text-2xl font-bold text-blue-600 mb-1">
              North America
            </h2>
            <p className="text-sm text-gray-600">
              Request events and submit travel forms
            </p>
          </Link>

          <Link
            href="/sa"
            className="flex-1 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center border-4 border-green-500 hover:border-green-600"
          >
            <h2 className="text-2xl font-bold text-green-600 mb-1">
              South America
            </h2>
            <p className="text-sm text-gray-600">
              Submit travel forms
            </p>
          </Link>

          <Link
            href="/asia"
            className="flex-1 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center border-4 border-red-800 hover:border-red-900"
          >
            <h2 className="text-2xl font-bold text-red-800 mb-1">
              Asia
            </h2>
            <p className="text-sm text-gray-600">
              Submit travel forms
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
