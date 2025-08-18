'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Record } from '@/types/Record';
import getRecords from '@/app/actions/getRecords';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

// Predefined colors for different categories
const COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

const ToggleableSpendingChart = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const fetchAndProcessData = async () => {
    if (dataFetched) return; // Don't fetch again if already fetched
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecords();
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (!result.records) {
        setError('No records found');
        setLoading(false);
        return;
      }

      // Filter only expense records
      const expenseRecords = result.records.filter(
        (record: Record) => record.type === 'expense'
      );

      // Group expenses by category and calculate totals
      const categoryTotals: { [key: string]: number } = {};
      let total = 0;

      expenseRecords.forEach((record: Record) => {
        const category = record.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + record.amount;
        total += record.amount;
      });

      // Convert to array format for the chart
      const chartData: CategoryData[] = Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value); // Sort by spending amount

      setCategoryData(chartData);
      setTotalExpenses(total);
      setDataFetched(true);
      setLoading(false);
    } catch (err) {
      console.error('Error processing category data:', err);
      setError('Failed to process expense data');
      setLoading(false);
    }
  };

  const handleToggleChart = () => {
    if (!showChart && !dataFetched) {
      fetchAndProcessData();
    }
    setShowChart(!showChart);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            {data.name}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Amount: Rs. {data.value.toFixed(2)}
          </p>
          <p className="text-green-600 dark:text-green-400 text-xs">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-shadow duration-300">
      {/* Toggle Button - Reduced margin */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Spending Analytics
        </h3>
        <button
          onClick={handleToggleChart}
          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            <>
              <span className="text-sm">📊</span>
              {showChart ? 'Hide Chart' : 'Spending by Categories'}
            </>
          )}
        </button>
      </div>

      {/* Chart Container - Reduced margins and padding */}
      {showChart && (
        <div className="mt-3 animate-in fade-in duration-300">
          {error ? (
            <div className="text-center text-red-600 dark:text-red-400 py-4">
              <p>Error loading spending data: {error}</p>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              <p>No expense data available</p>
            </div>
          ) : (
            <>
              {/* Pie Chart - Reduced height */}
              <div className="h-48 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Total Display - Minimized spacing */}
              <div className="text-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                  Total Expenses
                </p>
                <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                  Rs. {totalExpenses.toFixed(2)}
                </p>
              </div>

              {/* Category Legend - Reduced spacing */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Breakdown
                </h4>
                {categoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Rs. {category.value.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleableSpendingChart;