'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getUserRecord(): Promise<{
  record?: number;
  daysWithRecords?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // Get only EXPENSE records
    const records = await db.record.findMany({
      where: { 
        userId,
        type: 'expense' // Only expenses for spending calculation
      },
    });

    // Calculate total expense amount
    const record = records.reduce((sum, record) => sum + record.amount, 0);

    // Count UNIQUE DAYS with expenses (not individual records)
    const uniqueDays = new Set(
      records
        .filter((record) => record.amount > 0)
        .map((record) => {
          // Handle both Date objects and strings
          const date = record.date instanceof Date ? record.date : new Date(record.date);
          return date.toDateString();
        })
    ).size;

    return { 
      record, 
      daysWithRecords: uniqueDays || 1 // Ensure at least 1 to avoid division by zero
    };
  } catch (error) {
    console.error('Error fetching user record:', error);
    return { error: 'Database error' };
  }
}

export default getUserRecord;