'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Urgency = 'urgent' | 'high' | 'medium' | 'low';
type Status = 'completed' | 'in-progress' | 'pending';

type Stage = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  estimatedTime: number; // weeks
  status: Status;
  startDate: Date;
  endDate: Date;
  documents?: string[];
  links?: { name: string; url: string }[];
  flights?: any[];
};

type AnalysisGanttProps = {
  stages: Stage[];
  onStageClick: (stage: Stage) => void;
};

const AnalysisGanttChart: React.FC<AnalysisGanttProps> = ({ stages, onStageClick }) => {
  const [hoveredStage, setHoveredStage] = useState<Stage | null>(null);

  // Safety check for stages
  if (!stages || !Array.isArray(stages)) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  // Color system based on status
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed':
        return '#34C759'; // Green
      case 'in-progress':
        return '#FF9500'; // Orange
      case 'pending':
        return '#8E8E93'; // Grey
      default:
        return '#8E8E93';
    }
  };

  // Convert date to week position (simplified)
  const dateToWeekPosition = (date: Date) => {
    const startDate = new Date('2024-07-01'); // July 1st
    const diffTime = date.getTime() - startDate.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffWeeks);
  };

  // Get week position for timeline
  const getWeekPosition = (date: Date) => {
    const startDate = new Date('2024-07-01');
    const diffTime = date.getTime() - startDate.getTime();
    const diffWeeks = diffTime / (1000 * 60 * 60 * 24 * 7);
    return Math.max(0, diffWeeks);
  };

  // Calculate total timeline span
  const getTimelineSpan = () => {
    const allDates = stages.flatMap(stage => [stage.startDate, stage.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getTimelineSpan();
  const totalWeeks = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 2;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Migration Timeline
      </h2>
      
      {/* Timeline Header */}
      <div className="flex mb-6">
        <div className="w-64 flex-shrink-0"></div> {/* Spacer for stage labels */}
        <div className="flex-1 relative">
          <div className="h-8 flex items-center justify-between text-sm text-gray-500">
            <span>Start</span>
            <span>{totalWeeks} weeks total</span>
            <span>End</span>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          // Calculate position relative to the timeline start
          const startPosition = (getWeekPosition(stage.startDate) / totalWeeks) * 100;
          const endPosition = (getWeekPosition(stage.endDate) / totalWeeks) * 100;
          const stageWidth = Math.max(8, endPosition - startPosition); // Minimum width for visibility
          
          // Get color based on status
          const getStageColor = (status: Status) => {
            switch (status) {
              case 'completed': return '#10B981'; // green-500
              case 'in-progress': return '#F59E0B'; // amber-500
              case 'pending': return '#6B7280'; // gray-500
              default: return '#6B7280';
            }
          };
          
          const stageColor = getStageColor(stage.status);
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-center h-16"
            >
              {/* Stage Label */}
              <div className="w-64 flex-shrink-0 pr-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: stageColor }}
                  >
                    <stage.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{stage.title}</h3>
                    <p className="text-xs text-gray-600">{stage.estimatedTime} weeks</p>
                  </div>
                </div>
              </div>
              
              {/* Timeline Area */}
              <div className="flex-1 relative h-16 flex items-center">
                {/* Background Timeline Bar */}
                <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                
                {/* Segmented Progress Bar */}
                <div className="absolute inset-0 flex rounded-full overflow-hidden">
                  {/* Before Stage (Grey) */}
                  {startPosition > 0 && (
                    <div
                      className="h-full bg-gray-400"
                      style={{ width: `${startPosition}%` }}
                    />
                  )}
                  
                  {/* Current Stage (Colored) */}
                  <div
                    className="h-full cursor-pointer transition-all duration-200 hover:opacity-80"
                    style={{
                      width: `${stageWidth}%`,
                      backgroundColor: stageColor,
                    }}
                    onMouseEnter={() => setHoveredStage(stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => {
                      try {
                        onStageClick(stage);
                      } catch (error) {
                        console.error('Error clicking stage:', error);
                      }
                    }}
                    aria-label={`${stage.title}, ${formatDate(stage.startDate)} to ${formatDate(stage.endDate)}, status ${stage.status}`}
                  >
                    <div className="px-3 h-full flex items-center">
                      <span className="text-xs font-medium text-white truncate">
                        {stage.title}
                      </span>
                    </div>
                  </div>
                  
                  {/* After Stage (Grey) */}
                  {endPosition < 100 && (
                    <div
                      className="h-full bg-gray-400"
                      style={{ width: `${100 - endPosition}%` }}
                    />
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute right-0 top-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                    stage.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {stage.status === 'completed' ? 'Completed' :
                     stage.status === 'in-progress' ? 'In Progress' :
                     'Pending'}
                  </span>
                </div>
              </div>

              {/* View Details Button */}
              <div className="ml-4">
                <button
                  onClick={() => {
                    try {
                      onStageClick(stage);
                    } catch (error) {
                      console.error('Error clicking stage button:', error);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredStage && (
        <div className="fixed bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-50 shadow-lg">
          <div className="font-medium">{hoveredStage.title}</div>
          <div className="text-gray-300">
            {formatDate(hoveredStage.startDate)} - {formatDate(hoveredStage.endDate)}
          </div>
          <div className="text-gray-300 capitalize">
            {hoveredStage.status} status
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6">
        {(['completed', 'in-progress', 'pending'] as Status[]).map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(status) }}
            />
            <span className="text-xs text-gray-600 capitalize">
              {status === 'in-progress' ? 'In Progress' : status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisGanttChart;
