'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon as ArrowLeft, 
  ArrowRightIcon as ArrowRight, 
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  ExclamationTriangleIcon as AlertTriangle,
  DocumentTextIcon as Document,
  ShieldCheckIcon as Shield,
  BanknotesIcon as Banknotes,
  CurrencyDollarIcon as CurrencyDollar,
  PaperAirplaneIcon as PaperAirplane,
  ArrowPathIcon as Loader2,
  NewspaperIcon as Newspaper,
  EnvelopeIcon as Envelope,
  XMarkIcon as XMark,
  CalendarIcon as Calendar,
  MapPinIcon as MapPin,
  TrashIcon as Trash,
  PlusIcon as Plus
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import GanttChart from '@/components/timeline/GanttChart';
import { getLocationDisplay, getTimelineLocationDisplay } from '@/lib/utils/countries';
import { 
  fetchAllJourneys, 
  convertApiJourneyToTimeline, 
  calculateTimelineWeeks,
  type ApiJourney 
} from '@/lib/utils/api';

type SavedTimeline = {
  id: string;
  title: string;
  fromCountry: string;
  toCountry: string;
  purpose: string;
  createdAt: Date;
  status: string;
  destinationEntity?: string;
  tasks: any[];
  milestones: any[];
};

type MigrationStage = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  estimatedTime: number;
  status: string;
  startDate: Date;
  endDate: Date;
  documents?: string[];
  links?: { name: string; url: string }[];
  flights?: any[];
};

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Germany Extends Student Visa Processing Times',
    date: new Date(),
    impact: 'high',
    description: 'Processing times increased by 2-3 weeks due to high demand'
  },
  {
    id: 2,
    title: 'New Health Insurance Requirements for 2024',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    impact: 'medium',
    description: 'Updated coverage requirements for international students'
  },
  {
    id: 3,
    title: 'Bank Account Opening Process Simplified',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    impact: 'low',
    description: 'New digital process reduces paperwork by 50%'
  }
];

const MOCK_EMAILS = [
  {
    id: 1,
    subject: 'Visa Application Status Update',
    from: 'German Consulate',
    date: new Date(),
    impact: 'high',
    content: 'Your visa application has been received and is under review. Expected processing time: 6-8 weeks.'
  },
  {
    id: 2,
    subject: 'Health Insurance Confirmation',
    from: 'TK Health Insurance',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    impact: 'medium',
    content: 'Your health insurance application has been approved. Please download your insurance certificate.'
  },
  {
    id: 3,
    subject: 'Bank Account Opening Instructions',
    from: 'Deutsche Bank',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    impact: 'low',
    content: 'Please visit our branch with the required documents to complete your account opening.'
  }
];

export default function TimelinePage() {
  const [savedTimelines, setSavedTimelines] = useState<SavedTimeline[]>([]);
  const [activeTimeline, setActiveTimeline] = useState<SavedTimeline | null>(null);
  const [showGantt, setShowGantt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'news' | 'emails'>('timeline');
  const [selectedStage, setSelectedStage] = useState<MigrationStage | null>(null);
  const router = useRouter();

  // Fetch real timeline data from API
  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiJourneys = await fetchAllJourneys();
      const timelines = apiJourneys
        .filter(journey => journey.timeline && journey.timeline.length > 0)
        .map(convertApiJourneyToTimeline);
      
      setSavedTimelines(timelines);
      
      // Check if there's analysis data from session storage
      const analysisData = sessionStorage.getItem('documentContext');
      if (analysisData) {
        const data = JSON.parse(analysisData);
        const timeline = createTimelineFromAnalysis(data);
        setActiveTimeline(timeline);
        setShowGantt(true);
        sessionStorage.removeItem('documentContext'); // Clear after use
      }
    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError('Failed to load timeline data. Please try again.');
      
      // Fallback to session storage data
      const saved = sessionStorage.getItem('savedTimelines');
      if (saved) {
        const parsed = JSON.parse(saved).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }));
        setSavedTimelines(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
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
      status: 'IN_PROGRESS',
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
    return timeline;
  };

  const deleteTimeline = (timelineId: string) => {
    const updated = savedTimelines.filter(t => t.id !== timelineId);
    setSavedTimelines(updated);
    
    if (activeTimeline?.id === timelineId) {
      setActiveTimeline(null);
      setShowGantt(false);
    }
    
    // Update session storage
    sessionStorage.setItem('savedTimelines', JSON.stringify(updated));
  };

  const getStageStatus = (stage: any) => {
    if (!activeTimeline) return 'pending';
    
    // Map API status to UI status
    const statusMapping: { [key: string]: string } = {
      'COMPLETED': 'completed',
      'IN_PROGRESS': 'in-progress',
      'NOT_STARTED': 'pending',
      'PENDING': 'pending',
    };
    
    return statusMapping[stage.status] || 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'in-progress':
        return 'text-blue-700';
      case 'pending':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Convert API timeline tasks to migration stages for modal
  const convertTasksToStages = (tasks: any[]): MigrationStage[] => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      icon: Document, // Default icon
      color: 'blue',
      estimatedTime: Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      status: getStageStatus(task),
      startDate: task.startDate,
      endDate: task.endDate,
      documents: [
        'Valid Passport',
        'Application Forms',
        'Required Certificates',
        'Financial Documents'
      ],
      links: [
        { name: 'Official Portal', url: 'https://portal.example.com' },
        { name: 'Document Checklist', url: 'https://checklist.example.com' }
      ]
    }));
  };

  if (!showGantt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Migration Timelines
              </h1>
              <button
                onClick={fetchTimelineData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
            <p className="text-lg text-gray-600">
              Track and manage all your migration journeys
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading timeline data...</p>
              </div>
            )}
            
            {/* Saved Timelines */}
            {!isLoading && savedTimelines.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savedTimelines.map((timeline) => (
                  <motion.div
                    key={timeline.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTimeline(timeline);
                      setShowGantt(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{timeline.title}</h3>
                          <p className="text-sm text-gray-600">Created {formatDate(timeline.createdAt)}</p>
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
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Purpose</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{timeline.purpose}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          timeline.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          timeline.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {timeline.status.replace('_', ' ')}
                        </span>
                      </div>
                      {timeline.destinationEntity && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Institution</span>
                          <span className="text-sm font-medium text-gray-900">{timeline.destinationEntity}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Your Migration Journey Timeline under it: from {getTimelineLocationDisplay(timeline.fromCountry)} to {getTimelineLocationDisplay(timeline.toCountry)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : !isLoading && (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setShowGantt(false)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Timelines
            </button>
            <div className="text-sm text-gray-600">
              Migration Timeline
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Migration Journey Timeline
          </h1>
          {activeTimeline && (
            <p className="text-lg text-gray-600 mb-2">
              From {getTimelineLocationDisplay(activeTimeline.fromCountry)} to {getTimelineLocationDisplay(activeTimeline.toCountry)}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Track your progress and stay on top of every step
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'news'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Newspaper className="w-4 h-4 inline mr-2" />
              News
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'emails'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Envelope className="w-4 h-4 inline mr-2" />
              Emails
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GanttChart
                tasks={activeTimeline?.tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  startDate: task.startDate,
                  endDate: task.endDate,
                  status: getStageStatus(task) as 'completed' | 'in-progress' | 'pending' | 'modified',
                  dependencies: task.dependencies || []
                })) || []}
                onTaskClick={(task) => {
                  const stages = convertTasksToStages(activeTimeline?.tasks || []);
                  const stage = stages.find(s => s.id === task.id);
                  if (stage) {
                    setSelectedStage(stage);
                  }
                }}
                startDate={activeTimeline?.tasks && activeTimeline.tasks.length > 0 ? activeTimeline.tasks[0].startDate : new Date()}
                totalWeeks={calculateTimelineWeeks(activeTimeline?.tasks || [])}
              />
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Migration News & Updates
              </h2>
              
              <div className="space-y-4">
                {MOCK_NEWS.map((news) => (
                  <div key={news.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{news.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(news.impact)}`}>
                        {news.impact} impact
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{news.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(news.date)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'emails' && (
            <motion.div
              key="emails"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Important Emails
              </h2>
              
              <div className="space-y-4">
                {MOCK_EMAILS.map((email) => (
                  <div key={email.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                        <p className="text-sm text-gray-600">From: {email.from}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(email.impact)}`}>
                        {email.impact} priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{email.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(email.date)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage Detail Modal */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(getStageStatus(selectedStage))}`}>
                    <selectedStage.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStage.title}</h2>
                    <p className="text-gray-600">{selectedStage.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMark className="w-6 h-6" />
                </button>
              </div>

              {/* Documents Section */}
              {selectedStage.documents && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Documents</h3>
                  <ul className="space-y-2">
                    {selectedStage.documents.map((doc: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Document className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Links Section */}
              {selectedStage.links && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Useful Links</h3>
                  <div className="space-y-2">
                    {selectedStage.links.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span>{link.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights Section */}
              {selectedStage.flights && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Flight Options</h3>
                  <div className="space-y-3">
                    {selectedStage.flights.map((flight: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{flight.airline}</h4>
                          <span className="text-lg font-bold text-green-600">{flight.price}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{flight.duration}</span>
                          <span>{flight.stops}</span>
                          <span>★ {flight.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}