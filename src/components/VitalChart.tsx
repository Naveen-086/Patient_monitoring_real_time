import React, { useState, useEffect } from 'react';
import { VitalSigns } from '../types';

interface VitalChartProps {
  title: string;
  data: number[];
  color: string;
  unit: string;
  baseline?: [number, number];
}

const VitalChart: React.FC<VitalChartProps> = ({ title, data, color, unit, baseline }) => {
  const [animatedData, setAnimatedData] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data) * 1.2;
  const minValue = Math.min(...data) * 0.8;
  const range = maxValue - minValue;

  const getPath = (values: number[]) => {
    if (values.length === 0) return '';
    
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const currentValue = data[data.length - 1] || 0;
  const isInBaseline = baseline ? 
    currentValue >= baseline[0] && currentValue <= baseline[1] : true;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${isInBaseline ? 'text-slate-900' : 'text-rose-600'}`}>
            {currentValue} <span className="text-lg font-normal text-slate-500">{unit}</span>
          </div>
          {baseline && (
            <div className="text-xs text-slate-500 font-medium">
              Normal: {baseline[0]}-{baseline[1]} {unit}
            </div>
          )}
        </div>
      </div>
      
      <div className="relative h-32 bg-slate-50 rounded-xl overflow-hidden">
        {/* Baseline range visualization */}
        {baseline && (
          <div 
            className="absolute w-full bg-emerald-100 opacity-60"
            style={{
              top: `${100 - ((baseline[1] - minValue) / range) * 100}%`,
              height: `${((baseline[1] - baseline[0]) / range) * 100}%`
            }}
          ></div>
        )}
        
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={getPath(animatedData)}
            stroke={color}
            strokeWidth="3"
            fill="none"
            className="transition-all duration-700"
          />
          {/* Data points */}
          {animatedData.map((value, index) => (
            <circle
              key={index}
              cx={`${(index / (animatedData.length - 1)) * 100}%`}
              cy={`${100 - ((value - minValue) / range) * 100}%`}
              r="4"
              fill={color}
              className="opacity-80 hover:opacity-100 transition-opacity shadow-lg"
            />
          ))}
        </svg>
      </div>
      
      {!isInBaseline && (
        <div className="mt-4 text-sm text-rose-600 font-bold">
          ⚠ Outside normal range
        </div>
      )}
    </div>
  );
};

export default VitalChart;