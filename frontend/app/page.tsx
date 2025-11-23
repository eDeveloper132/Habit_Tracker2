'use client';

import { useAuth } from './context/authContext';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Transform Your Habits with AI
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Our AI-powered habit tracker learns from your behavior to provide personalized recommendations and insights.
              </p>

              {!user && (
                <div className="mt-8 flex justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.username}!</h2>
                  <p className="mt-2 text-gray-600">Ready to build better habits today?</p>
                  <div className="mt-6">
                    <Link
                      href="/habits"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Your Habits
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">AI-Powered Insights</h3>
                <p className="mt-2 text-gray-600">
                  Get personalized recommendations based on your behavior patterns and AI analysis.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Smart Tracking</h3>
                <p className="mt-2 text-gray-600">
                  Track your habits with intelligent logging and predictive analytics.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Personalized Suggestions</h3>
                <p className="mt-2 text-gray-600">
                  AI suggests optimal times and habit combinations for maximum success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
