'use client';

import { useState, useEffect } from 'react';
import { Record } from '@/types/Record';

interface BudgetTrackerProps {
  records: Record[];
}

const BudgetTracker = ({ records }: BudgetTrackerProps) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load budget from localStorage on component mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedBudget = localStorage.getItem('monthlyBudget');
      if (savedBudget) {
        setMonthlyBudget(parseFloat(savedBudget));
      }
    }
  }, [mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  // Calculate current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = records
    .filter(record => {
      const recordDate = new Date(record.date);
      return (
        record.type === 'expense' &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, record) => sum + record.amount, 0);

  const currentMonthIncome = records
    .filter(record => {
      const recordDate = new Date(record.date);
      return (
        record.type === 'income' &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, record) => sum + record.amount, 0);

  const budgetPercentage = monthlyBudget > 0 ? (currentMonthExpenses / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - currentMonthExpenses;
  const isOverBudget = currentMonthExpenses > monthlyBudget;

  const handleSetBudget = () => {
    const budget = parseFloat(budgetInput);
    if (!isNaN(budget) && budget > 0) {
      setMonthlyBudget(budget);
      if (typeof window !== 'undefined') {
        localStorage.setItem('monthlyBudget', budget.toString());
      }
      setIsEditing(false);
      setIsAddingNew(false);
      setBudgetInput('');
    }
  };

  const handleEditBudget = () => {
    setIsEditing(true);
    setIsAddingNew(false);
    setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : '');
  };

  const handleAddNewBudget = () => {
    setIsAddingNew(true);
    setIsEditing(false);
    setBudgetInput('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsAddingNew(false);
    setBudgetInput('');
  };

  // Get progress bar color based on percentage
  const getProgressColor = () => {
    if (budgetPercentage <= 50) return 'from-green-500 to-emerald-500';
    if (budgetPercentage <= 75) return 'from-yellow-500 to-orange-500';
    if (budgetPercentage <= 100) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getProgressBarWidth = () => {
    return Math.min(budgetPercentage, 100);
  };

  // Show initial budget setup screen or add new budget screen
  if (monthlyBudget === 0 || isAddingNew) {
    return (
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
        <div className='flex items-center justify-between mb-4 sm:mb-6'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm sm:text-lg'>🎯</span>
            </div>
            <div>
              <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Budget Tracker
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} overview
              </p>
            </div>
          </div>
          
          {/* Cancel button for add new budget */}
          {isAddingNew && (
            <button
              onClick={handleCancelEdit}
              className='px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500'
            >
              Cancel
            </button>
          )}
        </div>

        <div className='text-center py-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🎯</span>
          </div>
          <h4 className='text-base font-bold text-gray-800 dark:text-gray-200 mb-2'>
            {isAddingNew ? 'Set New Monthly Budget' : 'Set Your Monthly Budget'}
          </h4>
          <p className='text-gray-600 dark:text-gray-400 text-sm mb-6'>
            {isAddingNew 
              ? 'Enter a new budget amount to replace your current budget and start fresh tracking.'
              : 'Track your spending and stay within your financial goals by setting a monthly budget.'
            }
          </p>
          
          {/* Budget Input Section */}
          <div className='max-w-sm mx-auto mb-6'>
            <div className='flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600'>
              <span className='text-gray-600 dark:text-gray-400 font-medium'>Rs.</span>
              <input
                type='number'
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetBudget()}
                placeholder='Enter budget amount'
                className='flex-1 bg-transparent text-lg font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none'
                autoFocus
              />
            </div>
          </div>

          <div className='flex gap-3 justify-center'>
            <button
              onClick={handleSetBudget}
              disabled={!budgetInput || isNaN(parseFloat(budgetInput)) || parseFloat(budgetInput) <= 0}
              className='px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              {isAddingNew ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>🎯</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Budget Tracker
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} overview
            </p>
          </div>
        </div>

        {/* Budget Actions */}
        <div className='flex items-center gap-2'>
          {!isEditing ? (
            <>
              <button
                onClick={handleEditBudget}
                className='px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              >
                Edit Budget
              </button>
              <button
                onClick={handleAddNewBudget}
                className='px-3 py-1.5 text-xs font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1'
              >
                Add New
              </button>
            </>
          ) : (
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetBudget()}
                placeholder='Enter budget'
                className='w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
                autoFocus
              />
              <button
                onClick={handleSetBudget}
                className='px-2 py-1 text-xs font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                ✓
              </button>
              <button
                onClick={handleCancelEdit}
                className='px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500'
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        {/* Budget Progress Bar */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Monthly Budget Progress
            </span>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {budgetPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden'>
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out`}
              style={{ width: `${getProgressBarWidth()}%` }}
            />
            {isOverBudget && (
              <div className='w-full h-full bg-red-500/20 animate-pulse' />
            )}
          </div>
        </div>

        {/* Budget Stats Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
          {/* Monthly Budget */}
          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-4 h-4 bg-blue-500 rounded-md flex items-center justify-center'>
                <span className='text-white text-xs'>💰</span>
              </div>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>Budget</span>
            </div>
            <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
              Rs. {monthlyBudget.toLocaleString()}
            </p>
          </div>

          {/* Spent Amount */}
          <div className='bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-4 h-4 bg-red-500 rounded-md flex items-center justify-center'>
                <span className='text-white text-xs'>💸</span>
              </div>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>Spent</span>
            </div>
            <p className='text-lg font-bold text-red-600 dark:text-red-400'>
              Rs. {currentMonthExpenses.toLocaleString()}
            </p>
          </div>

          {/* Remaining Budget */}
          <div className={`bg-gradient-to-br p-3 rounded-xl border ${
            remainingBudget >= 0 
              ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/50' 
              : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-100 dark:border-red-800/50'
          }`}>
            <div className='flex items-center gap-2 mb-1'>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className='text-white text-xs'>{remainingBudget >= 0 ? '✓' : '⚠️'}</span>
              </div>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
              </span>
            </div>
            <p className={`text-lg font-bold ${
              remainingBudget >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              Rs. {Math.abs(remainingBudget).toLocaleString()}
            </p>
          </div>

          {/* Monthly Income */}
          <div className='bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-4 h-4 bg-emerald-500 rounded-md flex items-center justify-center'>
                <span className='text-white text-xs'>📈</span>
              </div>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>Income</span>
            </div>
            <p className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
              Rs. {currentMonthIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Budget Alert */}
        {isOverBudget && (
          <div className='bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-l-red-500 p-3 rounded-xl'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500 text-lg'>⚠️</span>
              <div>
                <p className='text-sm font-bold text-red-800 dark:text-red-300'>
                  Budget Exceeded!
                </p>
                <p className='text-xs text-red-700 dark:text-red-400'>
                  You've spent Rs. {(currentMonthExpenses - monthlyBudget).toLocaleString()} over your monthly budget.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {budgetPercentage >= 80 && !isOverBudget && (
          <div className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-l-yellow-500 p-3 rounded-xl'>
            <div className='flex items-center gap-2'>
              <span className='text-yellow-500 text-lg'>⚡</span>
              <div>
                <p className='text-sm font-bold text-yellow-800 dark:text-yellow-300'>
                  Budget Warning
                </p>
                <p className='text-xs text-yellow-700 dark:text-yellow-400'>
                  You've used {budgetPercentage.toFixed(1)}% of your monthly budget.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;