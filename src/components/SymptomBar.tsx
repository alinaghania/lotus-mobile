import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SymptomBarProps {
  labels: string[];
  values: number[];
}

const SymptomBar: React.FC<SymptomBarProps> = ({ labels, values }) => {
  // Calculate responsive bar thickness based on number of data points
  const getBarThickness = () => {
    if (labels.length <= 3) return 40;
    if (labels.length <= 7) return 30;
    if (labels.length <= 15) return 20;
    return 15;
  };

  const data = {
    labels: labels.map(label => label.slice(-5)), // Show last 5 characters (MM-DD)
    datasets: [
      {
        label: '# Symptoms',
        data: values,
        backgroundColor: '#8b5cf6',
        hoverBackgroundColor: '#a855f7',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: getBarThickness(),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => `Date: ${labels[context[0].dataIndex]}`,
          label: (context: any) => `Symptoms: ${context.raw}`,
        }
      },
    },
    scales: {
      x: { 
        grid: { 
          display: false 
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 500,
          },
          maxRotation: labels.length > 10 ? 45 : 0,
        },
        title: {
          display: true,
          text: 'Date',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: { top: 10 }
        }
      },
      y: { 
        beginAtZero: true, 
        ticks: { 
          stepSize: 1,
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#F3F4F6',
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: 'Number of Symptoms',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: { bottom: 10 }
        }
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }
    }
  } as const;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div style={{ height: '200px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SymptomBar; 