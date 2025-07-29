import React, { useState, useMemo } from 'react';
import { loadRecords, DailyRecord } from '../utils/storage';
import { computeKPIs } from '../utils/stats';
import { topFoods, symptomsTrend, issuesTrend, symptomMonthlyRecurrence, rollingIssuesAvg } from '../utils/stats';
import MiniLineChart from '../components/MiniLineChart';
import MiniBar from '../components/MiniBar';
import SymptomBar from '../components/SymptomBar';
import FilterSelector from '../components/FilterSelector';

interface AnalyticsPageProps {
  streak: number;
  selectedFilter: 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months';
  setSelectedFilter: (filter: 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months') => void;
}

const filterToDays = {
  'Last 3 Days': 3,
  'Last Week': 7,
  'Last Month': 30,
  'Last 2 Months': 60,
  'Last 6 Months': 180,
};

const flattenMeals = (meals: DailyRecord['meals']): string[] => {
  const list: string[] = [];
  Object.values(meals).forEach((v) => {
    if (typeof v === 'string') {
      const parts = v.split(',').filter(Boolean);
      list.push(...parts);
    }
  });
  return list;
};

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ streak, selectedFilter, setSelectedFilter }) => {
  // Get all records and filter them based on selected time range
  const allRecords = useMemo(() => loadRecords(), []);

  const filteredRecordsObj = useMemo(() => {
    const today = new Date();
    let start = new Date();
    const days = filterToDays[selectedFilter];
    start = new Date(today.getTime() - days * 86400000);
    const end = today;
    
    const filtered: Record<string, DailyRecord> = {};
    Object.entries(allRecords).forEach(([date, record]) => {
        const d = new Date(date);
      if (d >= start && d <= end) {
        filtered[date] = record;
      }
    });
    return filtered;
  }, [allRecords, selectedFilter]);

  const records = useMemo(() => {
    return Object.values(filteredRecordsObj);
  }, [filteredRecordsObj]);

  const correlation = useMemo(() => {
    const counts: Record<string, { withSymptom: number; total: number }> = {};
    records.forEach((rec) => {
      const foods = flattenMeals(rec.meals);
      const hasIssue = rec.symptoms.includes('Digestive Issues');
      foods.forEach((food) => {
        if (!counts[food]) counts[food] = { withSymptom: 0, total: 0 };
        counts[food].total += 1;
        if (hasIssue) counts[food].withSymptom += 1;
      });
    });
    const table = Object.entries(counts).map(([food, c]) => ({
      food,
      ratio: c.total ? Math.round((c.withSymptom / c.total) * 100) : 0,
      total: c.total,
    }));
    return table.sort((a, b) => b.ratio - a.ratio).slice(0, 20);
  }, [records]);

  // Calculate all stats using filtered data
  const kpi = useMemo(() => computeKPIs(filteredRecordsObj), [filteredRecordsObj]);
  const top = useMemo(() => topFoods(filteredRecordsObj, 5), [filteredRecordsObj]);
  const trend = useMemo(() => symptomsTrend(filteredRecordsObj), [filteredRecordsObj]);
  const issues = useMemo(() => issuesTrend(filteredRecordsObj), [filteredRecordsObj]);
  const rollAvg = useMemo(() => rollingIssuesAvg(filteredRecordsObj, 7), [filteredRecordsObj]);
  
  const SYMPT_LIST = ['Headache','Fatigue','Bloating','Nausea','Joint Pain','Skin Issues','Mood Changes','Sleep Issues','Digestive Issues','Energy Levels','Concentration','Stress'];
  const [selectedSym, setSelectedSym] = useState<string>(SYMPT_LIST[0]);
  const recur = useMemo(() => symptomMonthlyRecurrence(filteredRecordsObj, selectedSym), [filteredRecordsObj, selectedSym]);
  const periodic = recur.counts.filter(c=>c>0).length>=2;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Health Analytics Dashboard
        </h2>
        <p className="text-gray-600 mb-4">Explore the key patterns emerging from your tracked data</p>
        <FilterSelector selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />

        {/* KPI cards */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Overall KPIs</h3>
          <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Days Tracked', value: kpi.daysTracked.toFixed(0) },
            { label: 'Avg Sleep (h)', value: kpi.avgSleep.toFixed(1) },
            { label: 'Avg Sport (min)', value: kpi.avgSportMin.toFixed(0) },
            { label: 'Avg Symptoms/day', value: kpi.avgSymptoms.toFixed(1) },
          ].map((card,idx)=>{
            const pastel=['bg-pink-100','bg-amber-100','bg-lime-100','bg-sky-100'];
            return (
              <div key={card.label} className={`${pastel[idx%4]} rounded-2xl p-4 border border-orange-200 text-center`}>
                <div className="text-xs text-gray-600 mb-1">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Symptoms trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Number of Symptoms Over Time</h3>
        <SymptomBar values={trend.counts} labels={trend.labels} />
          <div className="text-xs text-gray-500 mt-2">Last {trend.counts.length} days</div>
        </div>

        {/* Digestive issues trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Digestive Issues Days Trend</h3>
        <MiniLineChart points={issues.counts} labels={issues.labels} color="#fdba74" height={60} />
          <div className="text-xs text-gray-500 mt-2">Last {issues.counts.length} days</div>
        </div>

        {/* Recurrence per symptom */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-red-500 inline-block">
            Symptom Recurrence Analysis
          </h3>
          
          {/* Symptom Selector */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Select a symptom to analyze:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {SYMPT_LIST.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => setSelectedSym(symptom)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
                    selectedSym === symptom
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-100 hover:shadow-md border border-gray-200'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
            
            {/* Periodic Indicator */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium text-gray-900">
                  <span className="text-blue-600">"{selectedSym}"</span> appears to be periodic:
                </div>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  periodic ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {periodic ? 'Yes' : 'No'}
                </span>
              </div>
              {periodic && (
                <div className="text-xs text-green-600 font-medium">
                  Pattern detected across multiple months
                </div>
              )}
            </div>
          </div>
          
          {/* Chart Section - Only show if periodic */}
          {periodic && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Monthly occurrences of <span className="text-blue-600 font-bold">{selectedSym}</span>
              </h4>
        <MiniBar values={recur.counts} labels={recur.labels} color="#38bdf8" height={60}/>
              <div className="text-xs text-gray-500 mt-2 text-center">Month →</div>
            </div>
          )}
          
          {/* No pattern message */}
          {!periodic && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-gray-600 text-sm">
                No clear periodic pattern detected for <span className="font-semibold text-blue-600">{selectedSym}</span>.
                <br />
                <span className="text-xs text-gray-500 mt-1 block">Try selecting a different symptom or track more data over time.</span>
              </div>
            </div>
          )}
        </div>

        {/* Top foods */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Top Foods Logged</h3>
          <div className="space-y-1">
          {top.map(([f,c],idx)=>{
              const max= top[0]?.[1] as number || 1;
            const pct=Math.round((c as number)/max*100);
            return (
              <div key={f} className="flex items-center gap-2 text-xs capitalize">
                <span className="w-20">{f}</span>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div className="h-2 rounded bg-orange-500" style={{width:`${pct}%`}}></div>
                </div>
                <span>{c}</span>
              </div>
            )})}
        </div>
        </div>

        {/* Food Correlation Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Food Correlation Analysis</h3>
          
          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 How to read this analysis:</h4>
            <p className="text-xs text-blue-700">
              This shows the percentage of days when eating each food coincided with digestive issues. 
              Higher percentages suggest a potential correlation (not necessarily causation).
            </p>
          </div>

          {/* Risk Categories */}
          <div className="grid gap-4">
            {/* High Risk Foods */}
            {correlation.filter(row => row.ratio > 60).length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                  🚨 High Risk Foods (&gt;60% correlation)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {correlation.filter(row => row.ratio > 60).map((row) => (
                    <div key={row.food} className="bg-white rounded-lg p-3 shadow-sm border border-red-300">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 capitalize">{row.food}</span>
                        <span className="text-red-600 font-bold">{row.ratio}%</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Eaten on {row.total} days
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${row.ratio}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Risk Foods */}
            {correlation.filter(row => row.ratio > 30 && row.ratio <= 60).length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  ⚠️ Medium Risk Foods (30-60% correlation)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {correlation.filter(row => row.ratio > 30 && row.ratio <= 60).map((row) => (
                    <div key={row.food} className="bg-white rounded-lg p-3 shadow-sm border border-yellow-300">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 capitalize">{row.food}</span>
                        <span className="text-yellow-600 font-bold">{row.ratio}%</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Eaten on {row.total} days
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${row.ratio}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Risk Foods */}
            {correlation.filter(row => row.ratio <= 30).length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                  ✅ Low Risk Foods (≤30% correlation)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {correlation.filter(row => row.ratio <= 30).slice(0, 8).map((row) => (
                    <div key={row.food} className="bg-white rounded-lg p-2 shadow-sm border border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 capitalize">{row.food}</span>
                        <span className="text-green-600 font-bold text-sm">{row.ratio}%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {row.total} days
                      </div>
                    </div>
              ))}
                </div>
                {correlation.filter(row => row.ratio <= 30).length > 8 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    ... and {correlation.filter(row => row.ratio <= 30).length - 8} more low-risk foods
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-red-500 inline-block">Health Insights Dashboard</h3>
          <div className="border-2 border-red-300 bg-red-50 rounded-xl p-4">
          {(()=>{
              const alerts: string[] = [];
              if(kpi.avgSleep < 6) alerts.push('Average sleep below 6 hours — consider improving your sleep routine.');
              if(kpi.avgSportMin < 20) alerts.push('Low average daily sport duration — try to be more active.');
            const highCorr = correlation[0];
              if(highCorr && highCorr.ratio > 60) alerts.push(`Strong link between "${highCorr.food}" and digestive issues (${highCorr.ratio}% of days). Consider reducing it.`);
              if(kpi.avgSymptoms > 3) alerts.push('High average symptoms per day — monitor your health closely.');
              const recentIssues = issues.counts.slice(-7).reduce((a: number, b: number) => a + b, 0);
              if(recentIssues >= 3) alerts.push('Digestive issues have appeared in 3 or more of the last 7 days.');
            return alerts.length ? (
                <ul className="list-disc ml-5 text-sm text-red-700">{alerts.map(a => <li key={a}>{a}</li>)}</ul>
            ) : (
              <p className="text-sm text-green-700">All metrics look good! Keep up the good work 🙌</p>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 