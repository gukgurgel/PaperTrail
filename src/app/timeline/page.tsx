// src/app/timeline/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppleGanttChart from '@/components/timeline/AppleGanttChart';
import { 
  PlusIcon as Plus,
  TrashIcon as Trash,
  CalendarIcon as Calendar,
  MapPinIcon as MapPin
} from '@heroicons/react/24/outline';

type SavedTimeline = {
  id: string;
  title: string;
  fromCountry: string;
  toCountry: string;
  purpose: string;
  createdAt: Date;
  tasks: any[];
  milestones: any[];
};

export default function TimelinePage() {
  const [savedTimelines, setSavedTimelines] = useState<SavedTimeline[]>([]);
  const [activeTimeline, setActiveTimeline] = useState<SavedTimeline | null>(null);
  const [showGantt, setShowGantt] = useState(false);

  useEffect(() => {
    // Load saved timelines from session storage
    const saved = sessionStorage.getItem('savedTimelines');
    if (saved) {
      const parsed = JSON.parse(saved).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }));
      setSavedTimelines(parsed);
      
      // If there's an active timeline from analysis page, show it
      const analysisData = sessionStorage.getItem('documentContext');
      if (analysisData) {
        const data = JSON.parse(analysisData);
        const timeline = createTimelineFromAnalysis(data);
        setActiveTimeline(timeline);
        setShowGantt(true);
      }
    }
  }, []);

  const createTimelineFromAnalysis = (analysisData: any): SavedTimeline => {
    const now = new Date();
    const timeline: SavedTimeline = {
      id: `timeline-${Date.now()}`,
      title: `${analysisData.originCountry} → ${analysisData.destinationCountry} Migration`,
      fromCountry: analysisData.originCountry,
      toCountry: analysisData.destinationCountry,
      purpose: analysisData.purpose,
      createdAt: now,
      tasks: [
        { id: 'visa', lane: 'Visa Application', startWeek: 27, endWeek: 31, urgency: 'urgent', label: 'Apply + interview' },
        { id: 'insurance', lane: 'Insurance', startWeek: 27, endWeek: 35, urgency: 'high', label: 'Buy & confirm' },
        { id: 'bank', lane: 'Bank', startWeek: 33, endWeek: 41, urgency: 'high', label: 'Statements & limits' },
        { id: 'proof', lane: 'Proof of Finance', startWeek: 37, endWeek: 41, urgency: 'medium', label: 'Docs & notarization' },
        { id: 'fly', lane: 'Fly', startWeek: 42, endWeek: 43, urgency: 'low', label: 'Travel window' },
      ],
      milestones: [
        { dateISO: '2024-07-15', label: 'Visa Interview' },
        { dateISO: '2024-09-02', label: 'Departure Date' },
      ]
    };

    // Save to session storage
    const updated = [...savedTimelines, timeline];
    setSavedTimelines(updated);
    sessionStorage.setItem('savedTimelines', JSON.stringify(updated));
    
    return timeline;
  };

  const deleteTimeline = (id: string) => {
    const updated = savedTimelines.filter(t => t.id !== id);
    setSavedTimelines(updated);
    sessionStorage.setItem('savedTimelines', JSON.stringify(updated));
    
    if (activeTimeline?.id === id) {
      setActiveTimeline(null);
      setShowGantt(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'UK': 'United Kingdom',
      'DE': 'Germany',
      'CA': 'Canada',
      'AU': 'Australia',
      'FR': 'France',
      'NL': 'Netherlands',
      'CH': 'Switzerland',
      'SG': 'Singapore',
      'JP': 'Japan',
      'AE': 'UAE',
    };
    return countries[code] || code;
  };

  const months = [
    { name: 'Jul' as const, startWeek: 27, endWeek: 31 },
    { name: 'Aug' as const, startWeek: 32, endWeek: 35 },
    { name: 'Sep' as const, startWeek: 36, endWeek: 40 },
    { name: 'Oct' as const, startWeek: 41, endWeek: 44 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Migration Timelines
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage all your migration journeys
          </p>
        </motion.div>

        {!showGantt ? (
          <div className="space-y-6">
            {/* Saved Timelines */}
            {savedTimelines.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savedTimelines.map((timeline) => (
                  <motion.div
                    key={timeline.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTimeline(timeline);
                      setShowGantt(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {timeline.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {getCountryName(timeline.fromCountry)} → {getCountryName(timeline.toCountry)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(timeline.createdAt)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTimeline(timeline.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 capitalize">
                        {timeline.purpose} migration
                      </span>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        View Timeline
                        <Plus className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Timelines Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start a migration plan to see your timeline here
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Planning
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setShowGantt(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Timelines
            </button>

            {/* Timeline Info */}
            {activeTimeline && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTimeline.title}
                    </h2>
                    <p className="text-gray-600">
                      Created on {formatDate(activeTimeline.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Purpose</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {activeTimeline.purpose}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gantt Chart */}
            {activeTimeline && (
              <AppleGanttChart
                year={2024}
                weeksRange={[27, 44]}
                months={months}
                tasks={activeTimeline.tasks}
                milestones={activeTimeline.milestones}
                todayISO="2024-08-15"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
