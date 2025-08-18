import getRecords from '@/app/actions/getRecords';
import RecordItem from './RecordItem';
import BudgetTracker from './BudgetTracker';
import { Record } from '@/types/Record';

const RecordHistory = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        {/* Budget Tracking Section */}
        <BudgetTracker records={[]} />
        
        {/* Error State for Records */}
        <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
          <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm sm:text-lg'>💰</span>
            </div>
            <div>
              <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Income and Expense History
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Your income and spending timeline
              </p>
            </div>
          </div>
          <div className='bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-l-red-500 p-3 sm:p-4 rounded-xl'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center'>
                <span className='text-base sm:text-lg'>⚠️</span>
              </div>
              <h4 className='font-bold text-red-800 dark:text-red-300 text-sm'>
                Error loading transaction history
              </h4>
            </div>
            <p className='text-red-700 dark:text-red-400 ml-8 sm:ml-10 text-xs'>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        {/* Budget Tracking Section */}
        <BudgetTracker records={[]} />
        
        {/* Empty State for Records */}
        <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50'>
          <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm sm:text-lg'>💰</span>
            </div>
            <div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
                Income and Expense History
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Your income and spending timeline
              </p>
            </div>
          </div>
          <div className='text-center py-6 sm:py-8'>
            <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl sm:text-3xl'>📊</span>
            </div>
            <h4 className='text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2'>
              No Transaction Records Found
            </h4>
            <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm'>
              Start tracking your income and expenses to see your financial history and
              patterns here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Budget Tracking Section */}
      <BudgetTracker records={records} />
      
      {/* Income and Expense History */}
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
        <div className='flex items-center justify-between mb-4 sm:mb-6'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm sm:text-lg'>💰</span>
            </div>
            <div>
              <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Income and Expense History
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Your income and spending timeline
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className='hidden sm:flex items-center gap-3'>
            {(() => {
              const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
              const expenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
              const balance = income - expenses;
              
              return (
                <>
                  <div className='text-center'>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Income</div>
                    <div className='text-sm font-bold text-green-600'>+Rs. {income.toFixed(2)}</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Expenses</div>
                    <div className='text-sm font-bold text-red-600'>-Rs. {expenses.toFixed(2)}</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Balance</div>
                    <div className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance >= 0 ? '+' : ''}Rs. {balance.toFixed(2)}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        
        {/* Records Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
          {records.map((record: Record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
        
        {/* Mobile Summary Stats */}
        <div className='sm:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='grid grid-cols-3 gap-3 text-center'>
            {(() => {
              const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
              const expenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
              const balance = income - expenses;
              
              return (
                <>
                  <div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Income</div>
                    <div className='text-sm font-bold text-green-600'>+Rs. {income.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Expenses</div>
                    <div className='text-sm font-bold text-red-600'>-Rs. {expenses.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Balance</div>
                    <div className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance >= 0 ? '+' : ''}Rs. {balance.toFixed(2)}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordHistory;