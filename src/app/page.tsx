import Link from 'next/link'
import { Calendar, Plane, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sportograf - Event Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose events and submit travel information in one simple platform
          </p>
        </div>

        {/* Region Selection */}
        <div className="flex flex-col sm:flex-row gap-6 max-w-5xl mx-auto mb-16">
          <Link
            href="/na"
            className="flex-1 bg-white rounded-lg shadow-lg p-12 hover:shadow-xl transition-all duration-300 text-center border-4 border-blue-500 hover:border-blue-600"
          >
            <h2 className="text-3xl font-bold text-blue-600 mb-2">
              North America
            </h2>
            <p className="text-gray-600">
              Request events and submit travel forms
            </p>
          </Link>

          <Link
            href="/sa"
            className="flex-1 bg-white rounded-lg shadow-lg p-12 hover:shadow-xl transition-all duration-300 text-center border-4 border-green-500 hover:border-green-600"
          >
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              South America
            </h2>
            <p className="text-gray-600">
              Submit travel forms
            </p>
          </Link>

          <Link
            href="/asia"
            className="flex-1 bg-white rounded-lg shadow-lg p-12 hover:shadow-xl transition-all duration-300 text-center border-4 border-purple-500 hover:border-purple-600"
          >
            <h2 className="text-3xl font-bold text-purple-600 mb-2">
              Asia
            </h2>
            <p className="text-gray-600">
              Submit travel forms
            </p>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link 
            href="/events"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Browse Events
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              View available events and register for the ones you want to attend
            </p>
            <div className="text-blue-600 font-medium hover:text-blue-700">
              Explore Events →
            </div>
          </Link>

          <Link 
            href="/travel"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <Plane className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Travel Form
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Submit your travel information for upcoming events
            </p>
            <div className="text-green-600 font-medium hover:text-green-700">
              Submit Travel Info →
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
