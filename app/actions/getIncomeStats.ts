'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getIncomeStats(): Promise<{
  totalIncome?: number;
  averageIncome?: number;
  incomeCount?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const incomeRecords = await db.record.findMany({
      where: { 
        userId,
        type: 'income'
      },
      select: { amount: true },
    });

    if (!incomeRecords || incomeRecords.length === 0) {
      return { totalIncome: 0, averageIncome: 0, incomeCount: 0 };
    }

    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const averageIncome = totalIncome / incomeRecords.length;
    const incomeCount = incomeRecords.length;

    return { totalIncome, averageIncome, incomeCount };
  } catch (error) {
    console.error('Error fetching income statistics:', error);
    return { error: 'Database error' };
  }
}

export default getIncomeStats;