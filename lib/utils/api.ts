// API integration utilities for timeline data
import { getCountryName } from './countries';

export interface ApiTimelineStep {
  dependencies: string[];
  description: string;
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  stepId: string;
  estimatedEndDate: string;
  estimatedStartDate: string;
}

export interface ApiJourney {
  destinationCountry: string;
  purpose: string;
  userId: string;
  timeline: ApiTimelineStep[];
  createdAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  originCountry: string;
  nationality: string;
  timelineStatus?: string;
  destinationEntity?: string;
}

// Robust step ID mapping to handle variations
export const STEP_ID_MAPPING: { [key: string]: string } = {
  // Visa Application variations
  'VISA_APPLICATION': 'visa',
  'VISA': 'visa',
  'VISAAPP': 'visa',
  'VISA_APP': 'visa',
  
  // Insurance variations
  'INSURANCE': 'insurance',
  'HEALTH_INSURANCE': 'insurance',
  'TRAVEL_INSURANCE': 'insurance',
  'HEALTHINSURANCE': 'insurance',
  'TRAVELINSURANCE': 'insurance',
  
  // Bank Account variations
  'BANKACCOUNT': 'bank',
  'BANK_ACCOUNT': 'bank',
  'BANK': 'bank',
  'BLOCKED_ACCOUNT': 'bank',
  'SPERRKONTO': 'bank',
  
  // Proof of Finance variations
  'PROOFFINANCE': 'proof',
  'PROOF_OF_FINANCE': 'proof',
  'PROOF_OF_INCOME': 'proof',
  'PROOFFUNDS': 'proof',
  'PROOF_OF_FUNDS': 'proof',
  'FINANCIAL_PROOF': 'proof',
  'FINANCIAL_DOCUMENTS': 'proof',
  
  // Flight variations
  'FLIGHT': 'flight',
  'FLIGHT_BOOKING': 'flight',
  'FLIGHTBOOKING': 'flight',
  'TRAVEL': 'flight',
  'TRAVEL_ARRANGEMENTS': 'flight',
};

// Status mapping from API to UI
export const STATUS_MAPPING: { [key: string]: 'completed' | 'in-progress' | 'pending' | 'modified' } = {
  'COMPLETED': 'completed',
  'IN_PROGRESS': 'in-progress',
  'NOT_STARTED': 'pending',
  'PENDING': 'pending',
};

// Icon mapping for different step types
export const STEP_ICON_MAPPING: { [key: string]: string } = {
  'visa': 'Document',
  'insurance': 'Shield',
  'bank': 'Banknotes',
  'proof': 'CurrencyDollar',
  'flight': 'PaperAirplane',
};

// Fetch all journeys from the API
export async function fetchAllJourneys(): Promise<ApiJourney[]> {
  try {
    const response = await fetch('https://europe-west1-tum-cdtm25mun-8742.cloudfunctions.net/get_all_journeys');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as ApiJourney[];
  } catch (error) {
    console.error('Error fetching journeys:', error);
    throw error;
  }
}

// Platform timeline descriptions (matching the analysis page exactly)
const PLATFORM_DESCRIPTIONS: { [key: string]: string } = {
  'visa': 'Submit your visa application and required documents',
  'insurance': 'Obtain mandatory health insurance coverage',
  'bank': 'Open a bank account in your destination country',
  'proof': 'Provide financial documentation and proof of funds',
  'flight': 'Book your flight and finalize travel arrangements',
};

// Convert API step to UI step format
export function convertApiStepToUI(apiStep: ApiTimelineStep, index: number) {
  const stepId = STEP_ID_MAPPING[apiStep.stepId] || 'unknown';
  const status = STATUS_MAPPING[apiStep.status] || 'pending';
  
  // Use platform description instead of API description
  const platformDescription = PLATFORM_DESCRIPTIONS[stepId] || apiStep.description;
  
  return {
    id: stepId,
    title: apiStep.title,
    description: platformDescription,
    startDate: new Date(apiStep.estimatedStartDate),
    endDate: new Date(apiStep.estimatedEndDate),
    status: status,
    dependencies: apiStep.dependencies,
    stepId: apiStep.stepId, // Keep original for reference
  };
}

// Convert API journey to UI timeline format
export function convertApiJourneyToTimeline(apiJourney: ApiJourney) {
  const timelineId = `timeline-${apiJourney.userId}-${Date.now()}`;
  
  return {
    id: timelineId,
    title: `${getCountryName(apiJourney.originCountry)} → ${getCountryName(apiJourney.destinationCountry)} Migration`,
    fromCountry: apiJourney.originCountry,
    toCountry: apiJourney.destinationCountry,
    purpose: apiJourney.purpose.toLowerCase(),
    createdAt: new Date(apiJourney.createdAt),
    status: apiJourney.status,
    destinationEntity: apiJourney.destinationEntity,
    tasks: apiJourney.timeline.map((step, index) => convertApiStepToUI(step, index)),
    milestones: [], // Can be added later if needed
  };
}

// Get step display name from step ID
export function getStepDisplayName(stepId: string): string {
  const mapping: { [key: string]: string } = {
    'visa': 'Visa Application',
    'insurance': 'Health Insurance',
    'bank': 'Bank Account',
    'proof': 'Proof of Income',
    'flight': 'Flight Booking',
  };
  
  return mapping[stepId] || stepId;
}

// Calculate total weeks for timeline
export function calculateTimelineWeeks(tasks: any[]): number {
  if (tasks.length === 0) return 4;
  
  const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  const diffTime = maxDate.getTime() - minDate.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return Math.max(4, diffWeeks); // Minimum 4 weeks
}
