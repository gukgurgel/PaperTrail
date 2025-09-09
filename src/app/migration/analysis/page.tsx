'use client';

import { useState, useEffect } from 'react';
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
  MapPinIcon as MapPin
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import GanttChart from '@/components/timeline/GanttChart';
import { getLocationDisplay } from '@/lib/utils/countries';

const MIGRATION_STAGES = [
  {
    id: 'visa',
    title: 'Visa Application',
    description: 'Submit your visa application and required documents',
    icon: Document,
    color: 'blue',
    estimatedTime: 4, // weeks
    status: 'completed',
    startDate: new Date(),
    endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
    documents: [
      'Valid Passport',
      'Visa Application Form',
      'Passport Photos',
      'Financial Proof',
      'Travel Insurance',
      'Accommodation Proof',
      'Flight Itinerary'
    ],
    links: [
      { name: 'Official Visa Portal', url: 'https://visa-portal.example.com' },
      { name: 'Document Checklist', url: 'https://docs.example.com' },
      { name: 'Appointment Booking', url: 'https://appointments.example.com' }
    ]
  },
  {
    id: 'insurance',
    title: 'Health Insurance',
    description: 'Obtain mandatory health insurance coverage',
    icon: Shield,
    color: 'green',
    estimatedTime: 2,
    status: 'in-progress',
    startDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
    documents: [
      'Insurance Application',
      'Medical Certificate',
      'Passport Copy',
      'Proof of Address'
    ],
    links: [
      { name: 'Insurance Providers', url: 'https://insurance.example.com' },
      { name: 'Coverage Calculator', url: 'https://coverage.example.com' }
    ]
  },
  {
    id: 'bank',
    title: 'Bank Account',
    description: 'Open a bank account in your destination country',
    icon: Banknotes,
    color: 'purple',
    estimatedTime: 3,
    status: 'modified',
    startDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 7 * 24 * 60 * 60 * 1000),
    documents: [
      'Passport',
      'Visa',
      'Proof of Address',
      'Employment Letter',
      'Initial Deposit'
    ],
    links: [
      { name: 'Bank Comparison', url: 'https://banks.example.com' },
      { name: 'Online Application', url: 'https://bank-app.example.com' }
    ]
  },
  {
    id: 'income',
    title: 'Proof of Income',
    description: 'Provide financial documentation and proof of funds',
    icon: CurrencyDollar,
    color: 'orange',
    estimatedTime: 2,
    status: 'in-progress',
    startDate: new Date(Date.now() + 7 * 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 7 * 24 * 60 * 60 * 1000),
    documents: [
      'Bank Statements',
      'Employment Contract',
      'Salary Slips',
      'Tax Returns',
      'Financial Affidavit'
    ],
    links: [
      { name: 'Financial Requirements', url: 'https://finance.example.com' },
      { name: 'Document Templates', url: 'https://templates.example.com' }
    ]
  },
  {
    id: 'flight',
    title: 'Flight Booking',
    description: 'Book your flight and finalize travel arrangements',
    icon: PaperAirplane,
    color: 'indigo',
    estimatedTime: 1,
    status: 'in-progress',
    startDate: new Date(Date.now() + 9 * 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000),
    flights: [
      { airline: 'Lufthansa', price: '$450', duration: '8h 30m', stops: 'Direct', rating: 4.5 },
      { airline: 'Emirates', price: '$520', duration: '12h 15m', stops: '1 stop', rating: 4.7 },
      { airline: 'Air India', price: '$380', duration: '9h 45m', stops: 'Direct', rating: 4.2 },
      { airline: 'Turkish Airlines', price: '$420', duration: '11h 20m', stops: '1 stop', rating: 4.3 },
      { airline: 'British Airways', price: '$580', duration: '10h 10m', stops: '1 stop', rating: 4.4 }
    ],
    links: [
      { name: 'Flight Search', url: 'https://flights.example.com' },
      { name: 'Baggage Rules', url: 'https://baggage.example.com' }
    ]
  },
];

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
    from: 'German Consulate',
    subject: 'Visa Application Status Update',
    date: new Date(),
    impact: 'high',
    content: 'Your visa application is under review. Additional documents may be required.'
  },
  {
    id: 2,
    from: 'University Admissions',
    subject: 'Enrollment Confirmation',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    impact: 'medium',
    content: 'Your enrollment has been confirmed. Please proceed with visa application.'
  }
];

export default function AnalysisPage() {
  const router = useRouter();
  const [migrationData, setMigrationData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'news' | 'emails'>('timeline');
  const [selectedStage, setSelectedStage] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('documentContext');
    if (storedData) {
      setMigrationData(JSON.parse(storedData));
    } else {
      router.push('/');
    }

    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      // Save timeline to session storage
      saveTimelineToSession();
    }, 3000);
  }, [router]);

  const saveTimelineToSession = () => {
    if (!migrationData) return;
    
    const timeline = {
      id: `timeline-${Date.now()}`,
      title: `${migrationData.originCountry} → ${migrationData.destinationCountry} Migration`,
      fromCountry: migrationData.originCountry,
      toCountry: migrationData.destinationCountry,
      purpose: migrationData.purpose,
      createdAt: new Date(),
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

    // Get existing timelines
    const existing = sessionStorage.getItem('savedTimelines');
    const savedTimelines = existing ? JSON.parse(existing) : [];
    
    // Add new timeline
    savedTimelines.push(timeline);
    
    // Save back to session storage
    sessionStorage.setItem('savedTimelines', JSON.stringify(savedTimelines));
  };

  const getStageStatus = (stage: any) => {
    if (!analysisComplete) return 'pending';
    
    // Simple logic based on document status
    if (stage.id === 'visa') {
      if (migrationData?.visaStatus === 'yes') return 'completed';
      if (migrationData?.visaStatus === 'applied') return 'in-progress';
      return 'pending';
    }
    
    return 'pending';
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


  if (!migrationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              onClick={() => router.push('/migration/documents')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Documents
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
          {migrationData && (
            <p className="text-lg text-gray-600 mb-2">
              From {getLocationDisplay(migrationData.originCountry || '', migrationData.originCity || '')} to {getLocationDisplay(migrationData.destinationCountry || '', migrationData.destinationCity || '')}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Track your progress and stay on top of every step
          </p>
        </motion.div>

        {/* Analysis Status */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Migration Path
            </h3>
            <p className="text-gray-600">
              Our AI is creating your personalized migration timeline...
            </p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        {analysisComplete && (
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
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {analysisComplete && activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
                       <GanttChart
                         tasks={MIGRATION_STAGES.map(stage => ({
                           id: stage.id,
                           title: stage.title,
                           description: stage.description,
                           startDate: stage.startDate,
                           endDate: stage.endDate,
                           status: getStageStatus(stage) as 'completed' | 'in-progress' | 'pending' | 'modified',
                           dependencies: []
                         }))}
                         onTaskClick={(task) => {
                           try {
                             const stage = MIGRATION_STAGES.find(s => s.id === task.id);
                             if (stage) {
                               setSelectedStage(stage);
                             }
                           } catch (error) {
                             console.error('Error setting selected stage:', error);
                           }
                         }}
                         startDate={new Date()}
                         totalWeeks={12}
                       />
            </motion.div>
          )}

          {analysisComplete && activeTab === 'news' && (
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

          {analysisComplete && activeTab === 'emails' && (
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

              {/* Links Section */}
              {selectedStage.links && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Useful Links</h3>
                  <div className="space-y-2">
                    {selectedStage.links.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{link.name}</span>
                      </a>
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
