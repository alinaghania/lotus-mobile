import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface Task {
  key: string;
  label: string;
  completed: boolean;
}

interface TodoPostItProps {
  tasks: Task[];
  onQuickSleep?: () => void;
  onQuickSport?: () => void;
  showQuickActions?: boolean;
}

const TodoPostIt: React.FC<TodoPostItProps> = ({ tasks, onQuickSleep, onQuickSport, showQuickActions }) => {
  return (
    <div className="bg-yellow-200 p-2 rounded-xl shadow-lg w-40 rotate-2 select-none">
      <h3 className="text-xs font-semibold text-gray-900 mb-2">Today's To-Dos</h3>
      <ul className="space-y-1 text-gray-800 text-xs mb-0">
        {tasks.map(t => (
          <li key={t.key} className="flex items-center gap-1">
            {t.completed ? (
              <CheckSquare size={14} className="text-green-600" />
            ) : (
              <Square size={14} className="text-gray-400" />
            )}
            <span className={t.completed ? 'line-through opacity-70' : ''}>{t.label}</span>
          </li>
        ))}
      </ul>

      {showQuickActions && (
        <div className="space-y-2">
          {onQuickSleep && (
            <button onClick={onQuickSleep} className="w-full text-xs bg-gray-900 text-white py-1 rounded shadow hover:bg-gray-800">Same Sleep Routine</button>
          )}
          {onQuickSport && (
            <button onClick={onQuickSport} className="w-full text-xs bg-gray-900 text-white py-1 rounded shadow hover:bg-gray-800">Same Sport Routine</button>
          )}
        </div>
      )}
    </div>
  );
};

export type { Task };
export default TodoPostIt; 