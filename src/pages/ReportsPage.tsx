import React, { useState, useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import FilterSelector from '../components/FilterSelector';
import { loadRecords } from '../utils/storage';
import { topFoods, symptomsTrend, issuesTrend, symptomMonthlyRecurrence } from '../utils/stats';
import jsPDF from 'jspdf';

interface ReportsPageProps {}

const ReportsPage: React.FC<ReportsPageProps> = () => {
  // Fix the type to match FilterSelector expectations
  const [selectedFilter, setSelectedFilter] = useState<'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months'>('Last Month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const allRecords = loadRecords();
  
  // Filter records based on selected period
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedFilter) {
      case 'Last 3 Days':
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'Last 2 Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        break;
      case 'Last 6 Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    const filtered: Record<string, any> = {};
    Object.entries(allRecords).forEach(([dateKey, record]) => {
      const recordDate = new Date(dateKey);
      if (recordDate >= startDate && recordDate <= now) {
        filtered[dateKey] = record;
      }
    });
    return filtered;
  }, [allRecords, selectedFilter]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const recordsArray = Object.entries(filteredRecords);
    const totalDays = recordsArray.length;
    const dateRange = selectedFilter === 'Last 3 Days' ? 3 
      : selectedFilter === 'Last Week' ? 7 
      : selectedFilter === 'Last Month' ? 30 
      : selectedFilter === 'Last 2 Months' ? 60 
      : 180;
    
    const missingDays = Math.max(0, dateRange - totalDays);
    const trackingRegularity = totalDays > 0 ? ((totalDays / dateRange) * 100).toFixed(1) : '0';
    
    // Tracking statistics
    const sleepTracked = recordsArray.filter(([, rec]) => rec.sleepSaved).length;
    const mealsTracked = recordsArray.filter(([, rec]) => rec.mealsSaved).length;
    const sportsTracked = recordsArray.filter(([, rec]) => rec.sportSaved).length;
    const symptomsTracked = recordsArray.filter(([, rec]) => rec.symptomsSaved).length;
    
    // Hydration analysis
    const drinkData = recordsArray.map(([, rec]) => rec.meals?.drinkType || 'not-specified');
    const hydrationTypes = drinkData.reduce((acc: Record<string, number>, drink) => {
      acc[drink] = (acc[drink] || 0) + 1;
      return acc;
    }, {});
    
    // Symptoms analysis
    const allSymptoms = recordsArray.flatMap(([, rec]) => rec.symptoms || []);
    const symptomFrequency = allSymptoms.reduce((acc: Record<string, number>, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {});
    
    const topSymptoms = Object.entries(symptomFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Food correlations
    const topFoodsList = topFoods(filteredRecords);
    const correlationRisk = topFoodsList.slice(0, 3).map(([food, count]) => {
      const correlation = allSymptoms.length > 0 ? ((count / totalDays) * 50).toFixed(1) : '0';
      return { food, correlation: `${correlation}%` };
    });
    
    // Sleep analysis
    const sleepHours = recordsArray
      .filter(([, rec]) => rec.sleepHours && rec.sleepHours > 0)
      .map(([, rec]) => rec.sleepHours);
    const avgSleep = sleepHours.length > 0 ? (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1) : 'N/A';
    
    // Digestive issues
    const digestiveIssues = issuesTrend(filteredRecords);
    const digestiveFrequency = digestiveIssues.counts.filter(v => v > 0).length;
    
    return {
      totalDays,
      missingDays,
      trackingRegularity,
      sleepTracked,
      mealsTracked,
      sportsTracked,
      symptomsTracked,
      hydrationTypes,
      topSymptoms,
      correlationRisk,
      avgSleep,
      digestiveFrequency,
      dateRange
    };
  }, [filteredRecords, selectedFilter]);

  // Add error handling and logging
  const generatePDF = async () => {
    setIsGenerating(true);
    console.log('PDF generation started');
    try {
      // Simulate PDF generation delay
      setTimeout(() => {
        try {
          downloadPDF();
          console.log('PDF downloaded successfully');
        } catch (error) {
          console.error('Error downloading PDF:', error);
        }
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  // Remove all special characters and condense content
  const downloadPDF = () => {
    try {
      console.log('Starting PDF download...');
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      
      const now = new Date();
      const periodText = selectedFilter;
      
      console.log('Period text:', periodText);
      
      let yPosition = 20;
      const lineHeight = 6;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Helper function to add text with automatic page breaks
      const addText = (text: string, size: number = 10, style: string = 'normal', color: number[] = [0, 0, 0]) => {
        try {
          doc.setFontSize(size);
          doc.setFont('helvetica', style);
          doc.setTextColor(color[0], color[1], color[2]);
          
          const lines = doc.splitTextToSize(text, maxWidth);
          
          lines.forEach((line: string) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        } catch (error) {
          console.error('Error in addText:', error);
          throw error;
        }
      };

      const addSection = (title: string, content: string) => {
        try {
          yPosition += 3;
          addText(title, 11, 'bold', [0, 0, 0]);
          yPosition += 1;
          addText(content, 9, 'normal', [0, 0, 0]);
          yPosition += 3;
        } catch (error) {
          console.error('Error in addSection:', error);
          throw error;
        }
      };

      console.log('Adding header...');
      // Header - Clean and professional
      addText('MEDICAL TRACKING REPORT', 16, 'bold', [0, 0, 0]);
      yPosition += 2;
      addText(`Period: ${periodText} | Generated: ${now.toLocaleDateString()}`, 10, 'normal', [0, 0, 0]);
      yPosition += 1;
      addText('_'.repeat(60), 10, 'normal', [0, 0, 0]); // Line separator
      yPosition += 6;

      console.log('Adding overview...');
      // Overview - Very compact
      const overviewContent = `Data Coverage: ${analytics.totalDays}/${analytics.dateRange} days (${analytics.trackingRegularity}%)
Sleep: ${analytics.sleepTracked} entries | Meals: ${analytics.mealsTracked} entries | Sport: ${analytics.sportsTracked} entries | Symptoms: ${analytics.symptomsTracked} entries`;

      addSection('>> DATA OVERVIEW', overviewContent);

      console.log('Adding sleep data...');
      // Sleep Analysis - Compact without special characters
      if (analytics.sleepTracked > 0) {
        const sleepContent = `Average: ${analytics.avgSleep}h/night | Entries: ${analytics.sleepTracked}/${analytics.dateRange} | Coverage: ${((Number(analytics.sleepTracked)/Number(analytics.dateRange))*100).toFixed(0)}%`;
        addSection('>> SLEEP DATA', sleepContent);
      }

      console.log('Adding symptoms...');
      // Symptoms - Compact without special characters
      if (analytics.topSymptoms.length > 0) {
        const symptomContent = `Most frequent symptoms (${analytics.topSymptoms.length} types):
${analytics.topSymptoms.slice(0, 3).map(([symptom, count]) => {
  const percentage = ((Number(count)/Number(analytics.totalDays))*100).toFixed(0);
  return `${symptom}: ${count} times, ${percentage}%`;
}).join('\n')}`;
        
        addSection('>> SYMPTOMS', symptomContent);
      }

      console.log('Adding hydration...');
      // Hydration - Compact without special characters
      const mainHydration = Object.entries(analytics.hydrationTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      if (mainHydration.length > 0) {
        const hydrationContent = `Primary hydration patterns (total: ${Object.values(analytics.hydrationTypes).reduce((a, b) => a + b, 0)} days):
${mainHydration.map(([type, count]) => {
  const percentage = ((Number(count)/Number(analytics.totalDays))*100).toFixed(0);
  const cleanType = type === 'not-specified' ? 'Not specified' : type.replace(/,/g, ', ');
  return `${cleanType}: ${count} days, ${percentage}%`;
}).join('\n')}`;
        
        addSection('>> HYDRATION', hydrationContent);
      }

      console.log('Adding dietary patterns...');
      // Top Foods - Compact
      if (analytics.correlationRisk.length > 0) {
        const foodContent = `Most consumed foods: ${analytics.correlationRisk.slice(0, 3).map(({food}) => food).join(' | ')}
Meal tracking: ${analytics.mealsTracked}/${analytics.dateRange} days (${((Number(analytics.mealsTracked)/Number(analytics.dateRange))*100).toFixed(0)}%)`;
        
        addSection('>> DIETARY PATTERNS', foodContent);
      }

      console.log('Adding tracking summary...');
      // Summary Chart - Compact without special characters
      yPosition += 5;
      addText('>> TRACKING SUMMARY CHART', 11, 'bold', [0, 0, 0]);
      yPosition += 3;
      
      const categories = [
        ['Sleep', analytics.sleepTracked, analytics.dateRange],
        ['Meals', analytics.mealsTracked, analytics.dateRange], 
        ['Sport', analytics.sportsTracked, analytics.dateRange],
        ['Symptoms', analytics.symptomsTracked, analytics.dateRange]
      ];

      // Use plain text without special characters
      categories.forEach(([name, tracked, total]) => {
        const percentage = ((Number(tracked)/Number(total))*100).toFixed(0);
        addText(`${name}: ${percentage}% (${tracked}/${total})`, 9, 'normal', [0, 0, 0]);
      });

      console.log('Adding footer...');
      // Footer - Clean
      yPosition += 8;
      addText('_'.repeat(60), 8, 'normal', [0, 0, 0]); // Line separator
      yPosition += 2;
      addText('Medical data for healthcare consultation | Report ID: EDM-' + now.getTime(), 8, 'normal', [0, 0, 0]);

      console.log('Saving PDF...');
      // Save the PDF
      const fileName = `Health_Report_${selectedFilter.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log('PDF saved successfully:', fileName);
    } catch (error) {
      console.error('Error in downloadPDF:', error);
      throw error;
    }
  };

  return (
  <div className="space-y-6">
      {/* Header */}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Medical Reports
            </h1>
            <p className="text-gray-600 mt-2">Generate professional health tracking reports for medical consultation</p>
          </div>
          <FileText className="w-16 h-16 text-orange-500" />
        </div>
      </div>

            {/* Simple Report Generator */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
        <div className="text-center">
          

          {/* Period Selection - Inline */}
          <div className="flex justify-center mb-6">
            <FilterSelector 
              selectedFilter={selectedFilter} 
              setSelectedFilter={setSelectedFilter}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5" />
                Download PDF Report
              </div>
            )}
      </button>
          
          <p className="text-xs text-gray-500 mt-3">
            Period: <span className="font-semibold">{selectedFilter}</span>
          </p>
      </div>
    </div>
  </div>
);
};

export default ReportsPage; 