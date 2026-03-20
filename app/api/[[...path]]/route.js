import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { groupSimilarTransactions, detectRecurringPatterns, categorizeTransaction } from '@/lib/recurringDetection';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get all transactions
    if (action === 'transactions') {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ transactions });
    }

    // Get subscriptions
    if (action === 'subscriptions') {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('amount', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ subscriptions });
    }

    // Get dashboard stats
    if (action === 'stats') {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      // Calculate stats
      const totalSpending = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const monthlySubscriptions = subscriptions?.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0) || 0;
      
      // Category breakdown
      const categoryTotals = {};
      transactions.forEach(t => {
        const cat = t.category || 'Others';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount || 0);
      });

      return NextResponse.json({ 
        totalSpending,
        monthlySubscriptions,
        subscriptionCount: subscriptions?.length || 0,
        transactionCount: transactions.length,
        categoryTotals
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, transactions: newTransactions } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Upload transactions
    if (action === 'upload') {
      if (!newTransactions || !Array.isArray(newTransactions)) {
        return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 });
      }

      // Add user_id and categorize
      const transactionsToInsert = newTransactions.map(t => ({
        user_id: userId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category || categorizeTransaction(t.description)
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert)
        .select();

      if (error) throw error;

      // Fetch all transactions for this user to detect patterns
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      // Detect recurring patterns
      const groups = groupSimilarTransactions(allTransactions || []);
      const subscriptions = detectRecurringPatterns(groups);

      // Store or update subscriptions
      if (subscriptions.length > 0) {
        // Clear old subscriptions
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId);

        // Insert new subscriptions
        const subsToInsert = subscriptions.map(s => ({
          user_id: userId,
          name: s.name,
          amount: s.amount,
          frequency: s.frequency,
          last_detected: s.lastDetected
        }));

        await supabase
          .from('subscriptions')
          .insert(subsToInsert);
      }

      return NextResponse.json({ 
        success: true, 
        inserted: data.length,
        subscriptionsDetected: subscriptions.length 
      });
    }

    // Delete all data
    if (action === 'deleteAll') {
      await supabase.from('transactions').delete().eq('user_id', userId);
      await supabase.from('subscriptions').delete().eq('user_id', userId);
      
      return NextResponse.json({ success: true });
    }

    // Update transaction category
    if (action === 'updateCategory') {
      const { transactionId, category } = body;
      
      const { error } = await supabase
        .from('transactions')
        .update({ category })
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const transactionId = searchParams.get('transactionId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (transactionId) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
