import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AsiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sportograf Asia
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Submit your travel information for upcoming events
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Link 
            href="/asia/travel"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 block"
          >
            <div className="flex items-center mb-4">
              <Plane className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Travel Form
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Submit your travel information for upcoming events
            </p>
            <div className="text-red-600 font-medium hover:text-red-700">
              Submit Travel Info →
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
