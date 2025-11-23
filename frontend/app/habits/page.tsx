'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Habit } from '../types';
import Navbar from '../components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2500/api';

export default function HabitsPage() {
  const { token, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target: 1,
    reminderTime: ''
  });

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/habits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
      } else {
        throw new Error('Failed to fetch habits');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHabit)
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabits([...habits, data.habit]);
        setNewHabit({
          name: '',
          description: '',
          frequency: 'daily',
          target: 1,
          reminderTime: ''
        });
        setShowForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTrackHabit = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/track/${habitId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed })
      });
      
      if (response.ok) {
        // Update the habit status in the UI
        await fetchHabits(); // Refresh the list to reflect changes
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-600">Loading your habits...</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Habits</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Habit
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {showForm && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Habit</h2>
              <form onSubmit={handleCreateHabit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value as any})}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                      Target
                    </label>
                    <input
                      type="number"
                      name="target"
                      id="target"
                      min="1"
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700">
                      Reminder Time (optional)
                    </label>
                    <input
                      type="time"
                      name="reminderTime"
                      id="reminderTime"
                      value={newHabit.reminderTime}
                      onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          )}

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No habits</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first habit.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Habit
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <div key={habit._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
                    {habit.description && <p className="mt-1 text-sm text-gray-500">{habit.description}</p>}
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Frequency:</span>
                        <span className="font-medium text-gray-900 capitalize">{habit.frequency}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Target:</span>
                        <span className="font-medium text-gray-900">{habit.target} time(s)</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Current Streak:</span>
                        <span className="font-medium text-gray-900">{habit.streak} day(s)</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleTrackHabit(habit._id, true)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleTrackHabit(habit._id, false)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}