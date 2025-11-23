'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import Navbar from '../components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2500/api';

export default function AIInsightsPage() {
  const { token, user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchInsights();
      fetchRecommendations();
    }
  }, [token]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else {
        throw new Error('Failed to fetch insights');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-600">AI is analyzing your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h1>
            <p className="mt-1 text-sm text-gray-600">Personalized recommendations based on your habit patterns</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Personalized Insights */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Personalized Insights</h2>
              
              {insights ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Consistency Pattern</h3>
                    <p className="mt-1 text-sm text-gray-500">{insights.consistencyPattern}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Areas for Improvement</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {insights.improvementAreas?.map((area: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-500">{area}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Success Factors</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {insights.successFactors?.map((factor: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-500">{factor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">AI Tips for You</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {insights.personalizedTips?.map((tip: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-500">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">AI is analyzing your data. Check back soon for personalized insights!</p>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h2>
              
              {recommendations ? (
                <div className="space-y-4">
                  {recommendations.recommendations.habitImprovements && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Habit Improvements</h3>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {recommendations.recommendations.habitImprovements.map((improvement: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-500">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.recommendations.newHabits && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Suggested New Habits</h3>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {recommendations.recommendations.newHabits.map((habit: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-500">{habit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.recommendations.timingSuggestions && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Optimal Timing</h3>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {recommendations.recommendations.timingSuggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-500">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.recommendations.habitCombinations && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Habit Combinations</h3>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {recommendations.recommendations.habitCombinations.map((combination: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-500">{combination}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.recommendations.warnings && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Potential Pitfalls</h3>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {recommendations.recommendations.warnings.map((warning: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-500">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">AI is analyzing your habits. Recommendations will appear here shortly!</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">About AI Insights</h2>
            <p className="text-sm text-gray-500">
              Our AI assistant analyzes your habit patterns, consistency, and success factors to provide personalized 
              recommendations. The insights are generated based on your unique behavior patterns and similar successful 
              users' data. The AI learns from your progress over time to make increasingly accurate suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}