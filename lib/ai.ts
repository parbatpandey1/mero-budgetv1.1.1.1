import OpenAI from 'openai';

interface RawInsight {
  type?: string;
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'MeroBudget',
  },
});

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  type: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

// NPR Currency formatting utilities
const formatNPR = (amount: number): string => {
  try {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl doesn't support NPR
    return `रू ${amount.toLocaleString('en-US')}`;
  }
};

// Simple NPR formatter
const formatNPRSimple = (amount: number): string => {
  return `रू ${amount.toLocaleString('en-US')}`;
};

// Get Nepal context for AI prompts
const getNepalContext = () => {
  return `
IMPORTANT CONTEXT: 
- All financial data is in Nepali Rupees (NPR/रू)
- User is located in Nepal
- Provide all amounts in NPR format (रू X,XXX)
- Consider Nepali financial context, cost of living, and cultural spending patterns
- Average monthly salary in Nepal ranges from रू 15,000 to रू 100,000+
- Basic living expenses in Nepal: Food रू 8,000-15,000/month, Rent रू 5,000-25,000/month
- Transportation: Bus fare रू 15-50, Taxi रू 100-500 per trip
- Always format numbers with NPR currency symbol रू
`;
};

export async function generateExpenseInsights(
  expenses: ExpenseRecord[]
): Promise<AIInsight[]> {
  try {
    console.log('🚀 Starting AI insight generation with', expenses.length, 'records');

    // Validate input data
    if (!expenses || expenses.length === 0) {
      console.log('⚠️ No expense data provided, generating general insights');
      return generateDefaultNepalInsights();
    }

    // Prepare expense data for AI analysis with NPR context
    const expensesSummary = expenses.map((expense) => ({
      amount: expense.amount,
      amountFormatted: formatNPRSimple(expense.amount),
      category: expense.category,
      type: expense.type,
      description: expense.description,
      date: expense.date,
    }));

    // Calculate totals for better context
    const totalExpenses = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalIncome = expenses
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    console.log(`💰 Financial Summary - Income: ${formatNPRSimple(totalIncome)}, Expenses: ${formatNPRSimple(totalExpenses)}, Balance: ${formatNPRSimple(netBalance)}`);

    // Simplified prompt for better AI response
    const prompt = `Analyze this Nepal financial data in NPR and provide exactly 3 insights as a JSON array:

TOTALS: Income रू${totalIncome.toLocaleString()}, Expenses रू${totalExpenses.toLocaleString()}, Balance रू${netBalance.toLocaleString()}

DATA: ${JSON.stringify(expensesSummary.slice(0, 10), null, 2)}

Return JSON array format:
[
  {
    "type": "warning",
    "title": "Short title",
    "message": "Message with रू amounts and Nepal context",
    "action": "What to do next",
    "confidence": 0.85
  }
]

Use types: warning, info, success, tip. Always include NPR amounts like रू 5,000. Focus on Nepal cost of living.`;

    console.log('📤 Sending request to AI...');

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'system',
          content: 'You are a Nepal financial advisor. Respond only with valid JSON array for budget insights using NPR currency (रू). Keep responses practical for Nepal economy.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;
    console.log('📥 AI Response received:', response?.substring(0, 200) + '...');
    
    if (!response) {
      throw new Error('No response from AI');
    }

    // More robust JSON cleaning
    let cleanedResponse = response.trim();
    
    // Remove code blocks
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    
    // Remove any text before [ and after ]
    const jsonStart = cleanedResponse.indexOf('[');
    const jsonEnd = cleanedResponse.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    console.log('🧹 Cleaned response:', cleanedResponse);

    // Parse AI response with better error handling
    let insights;
    try {
      insights = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.log('Raw response:', cleanedResponse);
      throw new Error(`Invalid JSON response: ${parseError}`);
    }

    // Validate insights array
    if (!Array.isArray(insights)) {
      console.error('❌ Response is not an array:', insights);
      throw new Error('AI response is not a valid array');
    }

    // Add IDs and ensure proper format
    const formattedInsights = insights.map((insight: RawInsight, index: number) => {
      const formatted = {
        id: `ai-npr-${Date.now()}-${index}`,
        type: (insight.type || 'info') as 'warning' | 'info' | 'success' | 'tip',
        title: insight.title || 'NPR Budget Insight',
        message: insight.message || 'Financial analysis complete',
        action: insight.action,
        confidence: insight.confidence || 0.8,
      };
      
      console.log(`✅ Formatted insight ${index + 1}:`, formatted.title);
      return formatted;
    });

    console.log(`🎉 Successfully generated ${formattedInsights.length} insights`);
    return formattedInsights;

  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    // Return more detailed error insights for debugging
    return generateDefaultNepalInsights();
  }
}

// Helper function for default insights
function generateDefaultNepalInsights(): AIInsight[] {
  return [
    {
      id: 'default-npr-1',
      type: 'info',
      title: 'NPR Budget Tracking Active',
      message: 'Your MeroBudget is ready to analyze Nepal financial data. Add some income and expenses in रू to get personalized insights.',
      action: 'Add first transaction',
      confidence: 0.9,
    },
    {
      id: 'default-npr-2', 
      type: 'tip',
      title: 'Nepal Budgeting Tips',
      message: 'In Nepal, aim to save 20% of income. With average expenses of रू 25,000-40,000/month, even रू 500 daily savings adds up to रू 15,000 monthly.',
      action: 'Start saving challenge',
      confidence: 0.85,
    },
    {
      id: 'default-npr-3',
      type: 'success',
      title: 'Smart NPR Management',
      message: 'Track categories like Food (रू 8,000-15,000), Transport (रू 2,000-5,000), and Bills (रू 3,000-8,000) for better Nepal budget control.',
      action: 'Set category budgets',
      confidence: 0.8,
    }
  ];
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'system',
          content: `You are a financial categorization AI for Nepal/NPR transactions. 

For EXPENSES, categorize into: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, Other
For INCOME, categorize into: Salary, Freelance, Business, Investment, Gift, Remittance, Other

Consider Nepal context:
- Food: Dal bhat, momo, restaurants, groceries from local shops
- Transportation: Local bus, taxi, micro, bike fuel
- Bills: Electricity (NEA), water, internet, mobile (Ncell/NTC)  
- Entertainment: Cinema, festivals, games
- Healthcare: Hospital, pharmacy, checkups
- Education: School fees, books, courses
- Remittance: Money from abroad (common in Nepal)

Respond with only the category name.`,
        },
        {
          role: 'user',
          content: `Categorize this Nepal/NPR financial record: "${description}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const category = completion.choices[0].message.content?.trim();

    const validCategories = [
      // Expense categories
      'Food',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Education',
      // Income categories  
      'Salary',
      'Freelance',
      'Business',
      'Investment',
      'Gift',
      'Remittance',
      'Other',
    ];

    const finalCategory = validCategories.includes(category || '')
      ? category!
      : 'Other';
    return finalCategory;
  } catch (error) {
    console.error('❌ Error categorizing expense:', error);
    return 'Other';
  }
}

export async function generateAIAnswer(
  question: string,
  context: ExpenseRecord[]
): Promise<string> {
  try {
    // Prepare expense data with NPR formatting
    const expensesSummary = context.map((expense) => ({
      amount: expense.amount,
      amountFormatted: formatNPRSimple(expense.amount),
      category: expense.category,
      type: expense.type,
      description: expense.description,
      date: expense.date,
    }));

    // Calculate financial summary
    const totalExpenses = context
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalIncome = context
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const prompt = `${getNepalContext()}

Based on the following Nepal/NPR financial data, provide a detailed answer to: "${question}"

FINANCIAL SUMMARY:
- Total Income: ${formatNPRSimple(totalIncome)}
- Total Expenses: ${formatNPRSimple(totalExpenses)} 
- Net Balance: ${formatNPRSimple(netBalance)}

DETAILED DATA:
${JSON.stringify(expensesSummary, null, 2)}

Provide a comprehensive answer that:
1. Addresses the question directly with Nepal context
2. Uses specific NPR amounts from the data
3. Offers actionable advice for Nepal
4. Considers Nepal's cost of living and financial culture
5. Keeps response concise but informative (2-4 sentences)
6. Always format amounts as रू X,XXX

IMPORTANT: Always use NPR currency format and Nepal-specific advice.
Return only the answer text, no additional formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'system',
          content: `You are a helpful financial advisor AI specializing in Nepal and Nepali Rupees (NPR/रू). You understand Nepal's economy, cost of living, and cultural context. Always provide specific, actionable answers using NPR currency format. Consider that average salaries in Nepal range from रू 15,000-100,000+ monthly.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return response.trim();
  } catch (error) {
    console.error('❌ Error generating AI answer:', error);
    return "I'm unable to provide a detailed NPR budget answer at the moment. Please try refreshing the insights or check your connection. Your Nepal financial data requires NPR-specific analysis.";
  }
}