'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addWeeks, startOfWeek, endOfWeek, differenceInWeeks } from 'date-fns';

type TaskStatus = 'completed' | 'in-progress' | 'pending' | 'modified';

type GanttTask = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  dependencies?: string[];
};

type GanttChartProps = {
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
  startDate?: Date;
  totalWeeks?: number;
};

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  onTaskClick,
  startDate = new Date(),
  totalWeeks = 12
}) => {
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);

  // Calculate the end date based on total weeks
  const endDate = addWeeks(startDate, totalWeeks);
  
  // Get the earliest start date and latest end date from tasks
  const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : startDate;
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : endDate;
  
  // Calculate the total timeline span
  const timelineStart = minDate < startDate ? minDate : startDate;
  const timelineEnd = maxDate > endDate ? maxDate : endDate;
  const totalTimelineWeeks = differenceInWeeks(timelineEnd, timelineStart) + 1;

  // Helper function to get task color based on status
  const getTaskColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return '#10B981'; // green-500
      case 'in-progress': return '#F59E0B'; // amber-500
      case 'modified': return '#F97316'; // orange-500
      case 'pending': return '#3B82F6'; // blue-500
      default: return '#6B7280'; // gray-500
    }
  };

  // Helper function to get task text color
  const getTaskTextColor = (status: TaskStatus) => {
    return status === 'completed' ? '#FFFFFF' : '#FFFFFF';
  };

  // Calculate position and width of a task bar
  const getTaskPosition = (task: GanttTask) => {
    const startOffset = differenceInWeeks(task.startDate, timelineStart);
    const taskDuration = differenceInWeeks(task.endDate, task.startDate) + 1;
    
    const leftPercent = (startOffset / totalTimelineWeeks) * 100;
    const widthPercent = (taskDuration / totalTimelineWeeks) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Generate week labels for the timeline
  const generateWeekLabels = () => {
    const weeks = [];
    for (let i = 0; i < totalTimelineWeeks; i += 2) { // Show every 2 weeks
      const weekDate = addWeeks(timelineStart, i);
      weeks.push({
        week: i + 1,
        date: weekDate,
        label: `W${i + 1}`,
      });
    }
    return weeks;
  };

  const weekLabels = generateWeekLabels();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Migration Timeline</h2>
        <p className="text-gray-600">
          {format(timelineStart, 'MMM d, yyyy')} - {format(timelineEnd, 'MMM d, yyyy')} 
          ({totalTimelineWeeks} weeks)
        </p>
      </div>

      {/* Timeline Header */}
      <div className="mb-4">
        <div className="flex">
          <div className="w-64 flex-shrink-0"></div> {/* Spacer for task labels */}
          <div className="flex-1 relative">
            <div className="flex">
              {weekLabels.map((week, index) => (
                <div
                  key={week.week}
                  className="flex-1 text-center text-xs text-gray-500 border-r border-gray-200 last:border-r-0"
                  style={{ minWidth: '60px' }}
                >
                  <div className="font-medium">{week.label}</div>
                  <div className="text-xs text-gray-400">
                    {format(week.date, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const position = getTaskPosition(task);
          const color = getTaskColor(task.status);
          const textColor = getTaskTextColor(task.status);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center h-16"
            >
              {/* Task Label */}
              <div className="w-64 flex-shrink-0 pr-4">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                  onClick={() => onTaskClick?.(task)}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-xs text-gray-600">{task.description}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Area */}
              <div className="flex-1 relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                {/* Task Bar */}
                <motion.div
                  className="absolute h-12 rounded-lg transition-all duration-200 flex items-center justify-between px-3"
                  style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: color,
                    color: textColor,
                  }}
                  onMouseEnter={() => setHoveredTask(task)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <div className="text-xs font-medium truncate">
                    {task.title}
                  </div>
                  <div className="text-xs opacity-80 ml-2">
                    {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                  </div>
                </motion.div>
              </div>

              {/* Status Badge */}
              <div className="ml-4 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                  task.status === 'modified' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status === 'completed' ? 'Completed' :
                   task.status === 'in-progress' ? 'In Progress' :
                   task.status === 'modified' ? 'Modified' :
                   'Pending'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Modified</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute z-10 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg"
          style={{
            left: '50%',
            top: '-50px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium">{hoveredTask.title}</div>
          <div className="text-xs opacity-80">
            {format(hoveredTask.startDate, 'MMM d, yyyy')} - {format(hoveredTask.endDate, 'MMM d, yyyy')}
          </div>
          <div className="text-xs opacity-80">
            {differenceInWeeks(hoveredTask.endDate, hoveredTask.startDate) + 1} weeks
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GanttChart;
