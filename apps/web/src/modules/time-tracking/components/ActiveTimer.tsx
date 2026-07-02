import React, { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { useActiveTimer, useTimerActions } from "../hooks/useTimeEntries";
import { TimerStatus } from "../types/time-entry.types";
import { formatTimerDuration } from "../utils/format.utils";

export const ActiveTimer: React.FC = () => {
  const { data: activeTimer, isLoading } = useActiveTimer();
  const { pauseTimer, resumeTimer, stopTimer } = useTimerActions();
  
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeTimer) {
      setLiveSeconds(0);
      return;
    }

    let initialSeconds = activeTimer.accumulatedSeconds || 0;
    
    // If it's running, calculate time since last resumed
    if (activeTimer.timerStatus === TimerStatus.RUNNING) {
      const resumedAt = activeTimer.lastResumedAt || activeTimer.timerStartedAt;
      if (resumedAt) {
        const diff = Math.floor((new Date().getTime() - new Date(resumedAt).getTime()) / 1000);
        initialSeconds += diff;
      }
    }
    
    setLiveSeconds(initialSeconds);

    let interval: NodeJS.Timeout;
    if (activeTimer.timerStatus === TimerStatus.RUNNING) {
      interval = setInterval(() => {
        setLiveSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  if (isLoading) return null;
  if (!activeTimer) return null;

  const isRunning = activeTimer.timerStatus === TimerStatus.RUNNING;

  return (
    <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-medium">{activeTimer.description || "No description"}</span>
        <span className={`text-lg font-mono font-semibold ${isRunning ? "text-indigo-600" : "text-gray-600"}`}>
          {formatTimerDuration(liveSeconds)}
        </span>
      </div>

      <div className="flex items-center space-x-1 pl-3 border-l border-gray-200">
        {isRunning ? (
          <button
            onClick={() => pauseTimer.mutate()}
            disabled={pauseTimer.isPending}
            className="p-1.5 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
            title="Pause Timer"
          >
            <Pause className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => resumeTimer.mutate()}
            disabled={resumeTimer.isPending}
            className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors"
            title="Resume Timer"
          >
            <Play className="w-5 h-5" />
          </button>
        )}
        
        <button
          onClick={() => stopTimer.mutate()}
          disabled={stopTimer.isPending}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Stop Timer"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
