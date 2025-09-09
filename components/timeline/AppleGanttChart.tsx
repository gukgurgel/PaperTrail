'use client';

import React, { useState } from 'react';

type Urgency = 'urgent' | 'high' | 'medium' | 'low';

type Task = {
  id: string;
  lane: 'Visa Application' | 'Insurance' | 'Bank' | 'Proof of Finance' | 'Fly';
  label?: string;
  startWeek: number;
  endWeek: number;
  urgency: Urgency;
};

type Milestone = {
  dateISO: string;
  label: string;
};

type GanttProps = {
  year: 2024;
  weeksRange: [27, 44];
  months: Array<{ name: 'Jul'|'Aug'|'Sep'|'Oct'; startWeek: number; endWeek: number }>;
  tasks: Task[];
  milestones?: Milestone[];
  todayISO?: string;
};

const AppleGanttChart: React.FC<GanttProps> = ({
  year,
  weeksRange,
  months,
  tasks,
  milestones = [],
  todayISO
}) => {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);

  // Color system
  const urgencyToColor = (urgency: Urgency) => {
    switch (urgency) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#34C759';
      case 'low': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  // Convert week number to x position
  const weekToX = (weekNumber: number) => {
    const [startWeek, endWeek] = weeksRange;
    const totalWeeks = endWeek - startWeek + 1;
    const weekIndex = weekNumber - startWeek;
    return (weekIndex / (totalWeeks - 1)) * 100; // Percentage
  };

  // Convert ISO date to week number (approximate)
  const dateToWeekISO = (dateISO: string) => {
    const date = new Date(dateISO);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  // Get today's week position
  const todayWeek = todayISO ? dateToWeekISO(todayISO) : null;
  const todayX = todayWeek ? weekToX(todayWeek) : null;

  // Lane order
  const laneOrder: Task['lane'][] = ['Visa Application', 'Insurance', 'Bank', 'Proof of Finance', 'Fly'];

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Migration Timeline</h2>
        <p className="text-gray-600">Track your progress through each stage</p>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Month Headers */}
        <div className="flex mb-4">
          <div className="w-56 flex-shrink-0"></div> {/* Spacer for lane labels */}
          <div className="flex-1 relative">
            {months.map((month) => {
              const startX = weekToX(month.startWeek);
              const endX = weekToX(month.endWeek);
              const width = endX - startX;
              
              return (
                <div
                  key={month.name}
                  className="absolute top-0 h-12 flex items-center justify-center border-b border-gray-200"
                  style={{
                    left: `${startX}%`,
                    width: `${width}%`,
                  }}
                >
                  <span className="text-sm font-medium text-gray-700">{month.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week Numbers */}
        <div className="flex mb-6">
          <div className="w-56 flex-shrink-0"></div>
          <div className="flex-1 relative h-6">
            {Array.from({ length: weeksRange[1] - weeksRange[0] + 1 }, (_, i) => {
              const weekNum = weeksRange[0] + i;
              const x = weekToX(weekNum);
              
              return (
                <div
                  key={weekNum}
                  className="absolute top-0 h-6 flex items-center justify-center text-xs text-gray-500"
                  style={{ left: `${x}%` }}
                >
                  {weekNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today Line */}
        {todayX !== null && (
          <div
            className="absolute top-16 bottom-0 w-px border-l-2 border-dashed border-gray-400 opacity-40 z-10"
            style={{ left: `calc(14rem + ${todayX}%)` }}
          />
        )}

        {/* Lanes */}
        <div className="space-y-4">
          {laneOrder.map((laneName, laneIndex) => {
            const laneTasks = tasks.filter(task => task.lane === laneName);
            
            return (
              <div key={laneName} className="flex items-center h-16">
                {/* Lane Label */}
                <div className="w-56 flex-shrink-0 pr-4">
                  <span className="text-sm font-medium text-gray-900">{laneName}</span>
                </div>
                
                {/* Timeline Area */}
                <div className="flex-1 relative h-16 flex items-center">
                  {/* Grid Lines */}
                  {Array.from({ length: weeksRange[1] - weeksRange[0] + 1 }, (_, i) => {
                    const weekNum = weeksRange[0] + i;
                    const x = weekToX(weekNum);
                    
                    return (
                      <div
                        key={weekNum}
                        className="absolute top-0 bottom-0 w-px bg-gray-200 opacity-20"
                        style={{ left: `${x}%` }}
                      />
                    );
                  })}
                  
                  {/* Task Bars */}
                  {laneTasks.map((task) => {
                    const startX = weekToX(task.startWeek);
                    const endX = weekToX(task.endWeek);
                    const width = endX - startX;
                    const color = urgencyToColor(task.urgency);
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute h-4 rounded-full shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                        style={{
                          left: `${startX}%`,
                          width: `${width}%`,
                          backgroundColor: color,
                        }}
                        onMouseEnter={() => setHoveredTask(task)}
                        onMouseLeave={() => setHoveredTask(null)}
                        aria-label={`${task.lane}, weeks ${task.startWeek} to ${task.endWeek}, urgency ${task.urgency}`}
                      >
                        {task.label && (
                          <div className="px-2 h-full flex items-center">
                            <span className="text-xs font-medium text-white truncate">
                              {task.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mt-8 flex justify-center space-x-16">
            {milestones.map((milestone, index) => {
              const week = dateToWeekISO(milestone.dateISO);
              const x = weekToX(week);
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ marginLeft: `${x}%` }}
                >
                  <div className="w-3 h-3 bg-gray-800 transform rotate-45 mb-2"></div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-700">
                      {new Date(milestone.dateISO).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {milestone.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredTask && (
        <div className="fixed bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-50 shadow-lg">
          <div className="font-medium">{hoveredTask.lane}</div>
          <div className="text-gray-300">
            Weeks {hoveredTask.startWeek} - {hoveredTask.endWeek}
          </div>
          <div className="text-gray-300 capitalize">
            {hoveredTask.urgency} priority
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6">
        {(['urgent', 'high', 'medium', 'low'] as Urgency[]).map((urgency) => (
          <div key={urgency} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: urgencyToColor(urgency) }}
            />
            <span className="text-xs text-gray-600 capitalize">{urgency}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example data and demo
const months = [
  { name: 'Jul' as const, startWeek: 27, endWeek: 31 },
  { name: 'Aug' as const, startWeek: 32, endWeek: 35 },
  { name: 'Sep' as const, startWeek: 36, endWeek: 40 },
  { name: 'Oct' as const, startWeek: 41, endWeek: 44 },
];

const exampleTasks: Task[] = [
  { id: 'visa', lane: 'Visa Application', startWeek: 27, endWeek: 31, urgency: 'urgent', label: 'Apply + interview' },
  { id: 'insurance', lane: 'Insurance', startWeek: 27, endWeek: 35, urgency: 'high', label: 'Buy & confirm' },
  { id: 'bank', lane: 'Bank', startWeek: 33, endWeek: 41, urgency: 'high', label: 'Statements & limits' },
  { id: 'proof', lane: 'Proof of Finance', startWeek: 37, endWeek: 41, urgency: 'medium', label: 'Docs & notarization' },
  { id: 'fly', lane: 'Fly', startWeek: 42, endWeek: 43, urgency: 'low', label: 'Travel window' },
];

const exampleMilestones: Milestone[] = [
  { dateISO: '2024-07-15', label: 'Product Development' },
  { dateISO: '2024-09-02', label: 'Product Launch' },
];

// Demo component
export const AppleGanttDemo: React.FC = () => {
  return (
    <AppleGanttChart
      year={2024}
      weeksRange={[27, 44]}
      months={months}
      tasks={exampleTasks}
      milestones={exampleMilestones}
      todayISO="2024-08-15"
    />
  );
};

export default AppleGanttChart;
