import React, { useState } from 'react';
import { Character } from '../types/character';
import { loadRecords, getCurrentObjectives, collectObjectiveReward, DynamicObjective } from '../utils/storage';
import { Coins, CheckCircle, Target } from 'lucide-react';

interface RewardsPageProps {
  character: Character;
  streak: number;
  setCharacter: (character: Character) => void;
}

const RewardsPage: React.FC<RewardsPageProps> = ({ character, streak, setCharacter }) => {
  const [collecting, setCollecting] = useState<string | null>(null);
  
  const records = loadRecords();
  const objectives = getCurrentObjectives(records, streak);
  const currentEndolots = character.endolots || 0;

  const handleCollect = async (objectiveId: string, reward: number) => {
    setCollecting(objectiveId);
    
    // Simulate collection delay for UX
    setTimeout(() => {
      const success = collectObjectiveReward(objectiveId, reward, character);
      if (success) {
        // Update character with new endolots
        const updatedCharacter = { ...character, endolots: currentEndolots + reward };
        setCharacter(updatedCharacter);
      }
      setCollecting(null);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        {/* Simple Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Objectives
            </h2>
            <p className="text-gray-600 mt-1">Complete objectives to earn Endolots</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg border border-yellow-300">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-xl text-yellow-700">{currentEndolots}</span>
            <span className="text-yellow-600">Endolots</span>
          </div>
        </div>

        {/* Objectives List - Max 3 */}
        <div className="space-y-4">
          {objectives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>All objectives completed!</p>
              <p className="text-sm">Keep tracking to unlock new objectives.</p>
            </div>
          ) : (
            objectives.map((objective) => {
              const progress = Math.min((objective.current / objective.target) * 100, 100);
              const isCollecting = collecting === objective.id;
              
              return (
                <div key={objective.id} className={`rounded-xl p-5 border-2 transition-all ${
                  objective.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-bold text-lg ${
                        objective.completed ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {objective.title}
                      </h3>
                      <p className={`text-sm ${
                        objective.completed ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {objective.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-bold text-yellow-600">{objective.reward}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${
                        objective.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {objective.current}/{objective.target}
                      </span>
                      <span className={`text-xs ${
                        objective.completed ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${
                      objective.completed ? 'bg-green-200' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          objective.completed ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Collect Button or Status */}
                  <div className="flex justify-between items-center">
                    {objective.completed ? (
                      <button
                        onClick={() => handleCollect(objective.id, objective.reward)}
                        disabled={isCollecting}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          isCollecting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                        }`}
                      >
                        {isCollecting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Collecting...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Collect {objective.reward} Endolots
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Keep tracking to complete</span>
                      </div>
                    )}
                    
                    {objective.completed && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Simple Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Only 3 objectives shown at a time</li>
            <li>• Complete one to unlock the next</li>
            <li>• Click "Collect Endolots" when completed</li>
            <li>• Use Endolots to customize your Lotus</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage; 