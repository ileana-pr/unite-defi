import React from 'react'
import { Link } from 'react-router-dom'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎉 Frontend is Working!
        </h1>
        <p className="text-slate-300 mb-8">
          The React app is successfully running with routing and styling.
        </p>
        <div className="space-y-4">
          <Link 
            to="/" 
            className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            Go to Landing Page
          </Link>
          <Link 
            to="/swap" 
            className="block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            Go to Swap Page
          </Link>
        </div>
      </div>
    </div>
  )
} 