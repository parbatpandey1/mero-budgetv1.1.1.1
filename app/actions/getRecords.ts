'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Record } from '@/types/Record';

async function getRecords(): Promise<{
  records?: Record[];
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const recordsRaw = await db.record.findMany({
      where: { userId },
      orderBy: {
        date: 'desc', // Sort by the `date` field in descending order
      },
      take: 20, // Limit the request to 20 records to show both income and expenses
    });

    const records: Record[] = recordsRaw.map((record) => ({
      ...record,
      type: record.type === 'income' ? 'income' : 'expense',
      date: record.date instanceof Date ? record.date.toISOString() : record.date,
    }));

    return { records };
  } catch (error) {
    console.error('Error fetching records:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getRecords;