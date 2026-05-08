import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AsiaPage() {
  return (
    <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sportograf Asia
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit your travel information for upcoming events
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Link 
            href="/asia/travel"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 block"
          >
            <div className="flex items-center mb-2">
              <Plane className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Travel Form
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Submit your travel information for upcoming events
            </p>
            <div className="text-red-600 font-medium hover:text-red-700 text-sm">
              Submit Travel Info →
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
