import React from 'react';
import { Coffee, Utensils, Moon, Check, Palette } from 'lucide-react';
import { MealData } from '../types/character';
import { mealOptions, snackOptions, drinkTypes } from '../constants/meals';
import MultiSelect from '../components/MultiSelect';
import TabNav from '../components/TabNav';
import { updateDailyRecord } from '../utils/storage';

interface TrackingPageProps {
  dailyProgress: number;
  setDailyProgress: (n: number) => void;
  mealData: MealData;
  setMealData: React.Dispatch<React.SetStateAction<MealData>>;
  setCurrentPage: (page: string) => void;
  selectedDate: Date;
  hideTabs?: string[];
}

type MealKey = keyof MealData;

const TrackingPage: React.FC<TrackingPageProps> = ({ dailyProgress, setDailyProgress, mealData, setMealData, setCurrentPage, selectedDate, hideTabs=[] }) => {
  const [saved, setSaved] = React.useState(false);
  const sections = [
    { icon: Coffee, title: 'Morning', key: 'morning', type: 'meal' as const },
    { icon: Utensils, title: 'Afternoon', key: 'afternoon', type: 'meal' as const },
    { icon: Moon, title: 'Evening', key: 'evening', type: 'meal' as const },
    { icon: Palette, title: 'Snacks', key: 'snack', type: 'snack' as const },
    { icon: Coffee, title: 'Drinks', key: 'drinks', type: 'drink' as const },
  ];
  const [sectionIndex, setSectionIndex] = React.useState(0);

  const handleSave = () => {
    updateDailyRecord(selectedDate, { meals: mealData, mealsSaved: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
  <div className="space-y-6">
    {saved && (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
        Data saved successfully!
      </div>
    )}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">What did you eat today?</h2>
      <p className="text-gray-600 mb-4">Log your meals for the day</p>
      <TabNav current="track" setPage={setCurrentPage} hide={hideTabs} />
      <div className="space-y-6">
        {(() => {
          const { icon: Icon, title, key, type } = sections[sectionIndex];
          return (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="text-gray-700" size={24} />
                <h3 className="font-medium text-gray-900">{title}</h3>
              </div>
              {type === 'meal' && (() => {
                const mealVal = mealData[key as MealKey] as string;
                const isFasting = mealVal === 'Fasting';
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isFasting}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMealData((prev) => ({ ...prev, [key]: 'Fasting' }));
                            } else {
                              setMealData((prev) => ({ ...prev, [key]: '' }));
                            }
                          }}
                        />
                        Fasting
                      </label>
                    </div>
                    <MultiSelect
                      key={`${key}-${isFasting}`}
                      label={title}
                      options={key === 'morning' ? mealOptions.breakfast : key === 'afternoon' ? mealOptions.lunch : mealOptions.dinner}
                      value={isFasting ? [] : mealVal.split(',').filter(Boolean)}
                      onChange={(vals) => {
                        const filtered = vals.filter((v) => v !== 'Fasting');
                        const unique = Array.from(new Set(filtered));
                        setMealData((prev) => ({ ...prev, [key]: unique.join(',') }));
                      }}
                      allowOther
                      disabled={isFasting}
                    />
                  </>
                );
              })()}

              {type === 'snack' && (
                <MultiSelect
                  label="snack"
                  options={snackOptions}
                  value={mealData.snack.split(',').filter(Boolean)}
                  onChange={(vals) => {
                    const unique = Array.from(new Set(vals));
                    setMealData((prev) => ({ ...prev, snack: unique.join(',') }));
                  }}
                  allowOther
                />
              )}

              {type === 'drink' && (
                <>
                  <MultiSelect
                    label="drink type"
                    options={drinkTypes}
                    value={mealData.drinkType.split(',').filter(Boolean)}
                    onChange={(vals) => {
                      const unique = Array.from(new Set(vals));
                      setMealData((prev) => {
                        const newQ = { ...prev.drinkQuantities };
                        Object.keys(newQ).forEach((k) => {
                          if (!unique.includes(k)) delete newQ[k];
                        });
                        unique.forEach((d) => {
                          if (!(d in newQ)) newQ[d] = 0;
                        });
                        return { ...prev, drinkType: unique.join(','), drinkQuantities: newQ };
                      });
                    }}
                    allowOther
                  />
                  <div className="mt-2 space-y-2">
                    {mealData.drinkType.split(',').filter(Boolean).map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{item}</span>
                        <input
                          type="number"
                          min={0}
                          value={mealData.drinkQuantities[item] ?? 0}
                          onChange={(e) => {
                            const qty = +e.target.value;
                            setMealData((prev) => ({
                              ...prev,
                              drinkQuantities: { ...prev.drinkQuantities, [item]: qty },
                            }));
                          }}
                          className="w-16 border border-gray-300 rounded px-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {(type==='snack' || type==='meal') && (()=>{
                  const raw = mealData[(type==='snack'?'snack':key) as MealKey] as string;
                  if(raw==='Fasting') return [<span key="fast" className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">Fasting <button onClick={()=> setMealData(prev=>({ ...prev,[key]:'' }))}>&times;</button></span>];
                  return Array.from(new Set(raw.split(',').filter(Boolean))).map((item)=>(
                    <span key={item} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      {item}
                      <button
                        onClick={() => {
                          const prop = type==='snack' ? 'snack' : key;
                          const items = (mealData[prop as MealKey] as string).split(',').filter((m) => m !== item);
                          setMealData((prev) => ({ ...prev, [prop]: items.join(',') }));
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  ));
                })()}
              </div>
            </div>
          );
        })()}

        <div className="flex justify-between">
          <button
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
            className={`px-4 py-2 rounded ${sectionIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Prev
          </button>
          {sectionIndex < sections.length - 1 ? (
            <button onClick={() => setSectionIndex((i) => Math.min(sections.length - 1, i + 1))} className="px-4 py-2 bg-gray-900 text-white rounded">
              Next
            </button>
          ) : (
            <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded">
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default TrackingPage; 