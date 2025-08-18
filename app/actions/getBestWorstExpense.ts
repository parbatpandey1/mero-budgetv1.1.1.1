'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // Fetch only EXPENSE records for the authenticated user (not income)
    const expenseRecords = await db.record.findMany({
      where: { 
        userId,
        type: 'expense' // Only fetch expense records, not income
      },
      select: { amount: true }, // Fetch only the `amount` field for efficiency
    });

    if (!expenseRecords || expenseRecords.length === 0) {
      return { bestExpense: 0, worstExpense: 0 }; // Return 0 if no expense records exist
    }

    const expenseAmounts = expenseRecords.map((record) => record.amount);

    // Calculate best and worst expense amounts (only from expenses)
    const bestExpense = Math.max(...expenseAmounts); // Highest expense amount
    const worstExpense = Math.min(...expenseAmounts); // Lowest expense amount

    return { bestExpense, worstExpense };
  } catch (error) {
    console.error('Error fetching expense amounts:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getBestWorstExpense;