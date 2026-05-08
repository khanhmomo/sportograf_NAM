import Link from 'next/link'
import { Calendar, Plane, Users } from 'lucide-react'

export default function NorthAmericaPage() {
  return (
    <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sportograf North America
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose events and submit travel information in one simple platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link 
            href="/na/events"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-2">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Browse Events
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              View available events and register for the ones you want to attend
            </p>
            <div className="text-blue-600 font-medium hover:text-blue-700 text-sm">
              Explore Events →
            </div>
          </Link>

          <Link 
            href="/na/travel"
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-2">
              <Plane className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Travel Form
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Submit your travel information for upcoming events
            </p>
            <div className="text-green-600 font-medium hover:text-green-700 text-sm">
              Submit Travel Info →
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
