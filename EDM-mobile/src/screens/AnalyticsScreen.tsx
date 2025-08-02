import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { trackingService } from '../services/trackingService';
import { analyticsService } from '../services/analyticsService';
import { analyticsStyles } from '../styles/analyticsStyles';

const SYMPTOMS = [
  'Headache', 'Fatigue', 'Bloating', 'Nausea', 'Joint Pain', 'Skin Issues',
  'Mood Changes', 'Sleep Issues', 'Digestive Issues', 'Energy Levels',
  'Concentration', 'Stress'
];

type FilterType = 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Custom';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Last Week');
  const [selectedSymptom, setSelectedSymptom] = useState('Headache');

  // Sample KPI data - replace with real data later
  const kpis = useMemo(() => ({
    avgSleep: 7.5,
    avgSportMin: 45,
    avgSymptoms: 2.3,
    dataCompleteness: 85
  }), []);

  // Sample symptom trend data - filtered by selectedFilter
  const symptomTrend = useMemo(() => {
    const baseData = {
      'Last 3 Days': {
        labels: ['Yesterday', 'Today', 'Tomorrow'],
        counts: [2, 1, 0]
      },
      'Last Week': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        counts: [3, 1, 2, 4, 1, 0, 2]
      },
      'Last Month': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        counts: [8, 12, 6, 10]
      }
    };
    return baseData[selectedFilter];
  }, [selectedFilter]);

  // Sample digestive issues trend - filtered by selectedFilter
  const digestiveTrend = useMemo(() => {
    const baseData = {
      'Last 3 Days': {
        labels: ['Yesterday', 'Today', 'Tomorrow'],
        counts: [1, 0, 0]
      },
      'Last Week': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        counts: [2, 4, 1, 3, 0, 1, 2]
      },
      'Last Month': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        counts: [2, 4, 1, 3]
      }
    };
    return baseData[selectedFilter];
  }, [selectedFilter]);

  // Sample food correlation data
  const foodCorrelation = useMemo(() => [
    { food: 'Yogurt', correlation: 85 },
    { food: 'Pasta', correlation: 67 },
    { food: 'Coffee', correlation: 45 },
    { food: 'Chocolate', correlation: 23 }
  ], []);

  // Sample health insights
  const healthInsights = useMemo(() => ({
    alerts: [
      'Average sleep below 6 hours consider improving your sleep routine.',
      'Low average daily sport duration try to be more active.',
      'Strong link between "Yogurt" and digestive issues (100% of days). Consider reducing it.'
    ],
    insights: [
      'Symptom frequency is decreasing great progress!'
    ],
    recommendations: [
      'Try to go to bed earlier and establish a consistent sleep schedule.',
      'Try eliminating Yogurt for a week to see if symptoms improve.'
    ]
  }), []);

  const renderSimpleChart = (values: number[], labels: string[], title: string, colorStyle: any) => (
    <View style={analyticsStyles.chartContainer}>
      <Text style={analyticsStyles.chartTitle}>{title}</Text>
      <View style={analyticsStyles.chartItemsContainer}>
        {values.map((value, index) => (
          <View key={index} style={analyticsStyles.chartItem}>
            <Text style={analyticsStyles.chartLabel}>{labels[index]}</Text>
            <View style={analyticsStyles.chartBarContainer}>
              <View 
                style={[
                  analyticsStyles.chartBar,
                  colorStyle,
                  { width: `${(value / Math.max(...values)) * 100}%` }
                ]}
              />
            </View>
            <Text style={analyticsStyles.chartValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={analyticsStyles.filterContainer}>
      {(['Last 3 Days', 'Last Week', 'Last Month', 'Custom'] as FilterType[]).map(filter => (
        <TouchableOpacity
          key={filter}
          onPress={() => setSelectedFilter(filter)}
          style={[
            analyticsStyles.filterButton,
            selectedFilter === filter && analyticsStyles.filterButtonActive
          ]}
        >
          <Text style={[
            analyticsStyles.filterButtonText,
            selectedFilter === filter 
              ? analyticsStyles.filterButtonTextActive 
              : analyticsStyles.filterButtonTextInactive
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={analyticsStyles.container}>
      <ScrollView style={analyticsStyles.scrollContainer}>
        {/* Header */}
        <View style={analyticsStyles.headerCard}>
          <Text style={analyticsStyles.headerTitle}>Health Analytics</Text>
          <Text style={analyticsStyles.headerSubtitle}>Insights into your health patterns</Text>
          
          {renderFilterButtons()}
        </View>

        {/* KPIs with Pastel Colors */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Overview</Text>
          <View style={analyticsStyles.kpiContainer}>
            {[
              { label: 'Avg Sleep (h)', value: kpis.avgSleep.toFixed(1), style: analyticsStyles.kpiCardSleep },
              { label: 'Data Quality (%)', value: kpis.dataCompleteness.toString(), style: analyticsStyles.kpiCardQuality },
              { label: 'Avg Sport (min)', value: kpis.avgSportMin.toFixed(0), style: analyticsStyles.kpiCardSport },
              { label: 'Avg Symptoms/day', value: kpis.avgSymptoms.toFixed(1), style: analyticsStyles.kpiCardSymptoms }
            ].map((card, idx) => (
              <View key={card.label} style={[analyticsStyles.kpiCard, card.style]}>
                <Text style={analyticsStyles.kpiLabel}>{card.label}</Text>
                <Text style={analyticsStyles.kpiValue}>{card.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Number of Symptoms Over Time */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Number of Symptoms Over Time</Text>
          {renderSimpleChart(symptomTrend.counts, symptomTrend.labels, 'Daily Symptoms', analyticsStyles.chartBarBlue)}
          <Text style={analyticsStyles.chartFooter}>
            Last {symptomTrend.counts.length} {selectedFilter.includes('Day') ? 'days' : selectedFilter.includes('Week') ? 'days' : 'weeks'}
          </Text>
        </View>

        {/* Digestive Issues Trend */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Digestive Issues Days Trend</Text>
          {renderSimpleChart(digestiveTrend.counts, digestiveTrend.labels, 'Weekly Digestive Issues', analyticsStyles.chartBarPurple)}
          <Text style={analyticsStyles.chartFooter}>
            Last {digestiveTrend.counts.length} {selectedFilter.includes('Day') ? 'days' : selectedFilter.includes('Week') ? 'days' : 'weeks'}
          </Text>
        </View>

        {/* Symptom Recurrence Analysis */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Symptom Recurrence Analysis</Text>
          <View style={analyticsStyles.analysisContainer}>
            <Text style={analyticsStyles.analysisTitle}>Most Frequent Symptoms:</Text>
            <View style={analyticsStyles.analysisItemsContainer}>
              {[
                { symptom: 'Headache', count: 12, percentage: 60 },
                { symptom: 'Fatigue', count: 8, percentage: 40 },
                { symptom: 'Nausea', count: 5, percentage: 25 },
                { symptom: 'Bloating', count: 4, percentage: 20 }
              ].map((item, index) => (
                <View key={index} style={analyticsStyles.analysisItem}>
                  <Text style={analyticsStyles.analysisLabel}>{item.symptom}</Text>
                  <View style={analyticsStyles.analysisBarContainer}>
                    <View 
                      style={[
                        analyticsStyles.analysisBar,
                        { width: `${item.percentage}%` }
                      ]}
                    />
                  </View>
                  <Text style={analyticsStyles.analysisValue}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Food Correlation Analysis */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Food Correlation Analysis</Text>
          <View style={analyticsStyles.tableContainer}>
            <View style={analyticsStyles.table}>
              <View style={analyticsStyles.tableHeader}>
                <Text style={analyticsStyles.tableHeaderText}>Food</Text>
                <Text style={analyticsStyles.tableHeaderText}>Correlation</Text>
              </View>
              {foodCorrelation.map((item, index) => (
                <View 
                  key={item.food} 
                  style={[
                    analyticsStyles.tableRow,
                    index % 2 === 0 ? analyticsStyles.tableRowEven : analyticsStyles.tableRowOdd
                  ]}
                >
                  <Text style={analyticsStyles.tableCell}>{item.food}</Text>
                  <Text style={analyticsStyles.tableCell}>{item.correlation}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Health Insights Dashboard */}
        <View style={analyticsStyles.sectionCard}>
          <Text style={analyticsStyles.sectionTitle}>Health Insights</Text>
          
          {/* Alerts */}
          <View style={analyticsStyles.insightsSection}>
            <Text style={[analyticsStyles.insightsTitle, analyticsStyles.insightsTitleAlert]}>Alerts:</Text>
            {healthInsights.alerts.map((alert, index) => (
              <Text key={index} style={[analyticsStyles.insightsItem, analyticsStyles.insightsItemAlert]}>• {alert}</Text>
            ))}
          </View>
          
          {/* Insights */}
          <View style={analyticsStyles.insightsSection}>
            <Text style={[analyticsStyles.insightsTitle, analyticsStyles.insightsTitlePositive]}>Positive Insights:</Text>
            {healthInsights.insights.map((insight, index) => (
              <Text key={index} style={[analyticsStyles.insightsItem, analyticsStyles.insightsItemPositive]}>• {insight}</Text>
            ))}
          </View>
          
          {/* Recommendations */}
          <View>
            <Text style={[analyticsStyles.insightsTitle, analyticsStyles.insightsTitleRecommendation]}>Recommendations:</Text>
            {healthInsights.recommendations.map((rec, index) => (
              <Text key={index} style={[analyticsStyles.insightsItem, analyticsStyles.insightsItemRecommendation]}>• {rec}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 