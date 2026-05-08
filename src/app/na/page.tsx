import Link from 'next/link'
import { Calendar, Plane, Users } from 'lucide-react'

export default function NorthAmericaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sportograf North America - Event Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose events and submit travel information in one simple platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link 
            href="/na/events"
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
            href="/na/travel"
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
