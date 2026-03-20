import { differenceInDays, parseISO } from 'date-fns';

// Calculate string similarity (Levenshtein distance)
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// Group transactions by similar descriptions
export function groupSimilarTransactions(transactions, threshold = 0.75) {
  const groups = [];
  const processed = new Set();
  
  transactions.forEach((transaction, index) => {
    if (processed.has(index)) return;
    
    const group = [transaction];
    processed.add(index);
    
    for (let i = index + 1; i < transactions.length; i++) {
      if (processed.has(i)) continue;
      
      const sim = similarity(transaction.description, transactions[i].description);
      const amountDiff = Math.abs(transaction.amount - transactions[i].amount) / Math.max(transaction.amount, transactions[i].amount);
      
      // Similar description and amount within 10% tolerance
      if (sim >= threshold && amountDiff <= 0.1) {
        group.push(transactions[i]);
        processed.add(i);
      }
    }
    
    if (group.length >= 2) {
      groups.push(group);
    }
  });
  
  return groups;
}

// Detect recurring patterns in transaction groups
export function detectRecurringPatterns(transactionGroups) {
  const recurringSubscriptions = [];
  
  transactionGroups.forEach(group => {
    if (group.length < 2) return;
    
    // Sort by date
    const sorted = group.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date));
      intervals.push(diff);
    }
    
    if (intervals.length === 0) return;
    
    // Calculate average interval
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Check if intervals are consistent (variance < 5 days)
    const variance = intervals.reduce((sum, interval) => sum + Math.abs(interval - avgInterval), 0) / intervals.length;
    
    // Determine frequency
    let frequency = 'unknown';
    if (avgInterval >= 25 && avgInterval <= 35 && variance < 7) {
      frequency = 'monthly';
    } else if (avgInterval >= 5 && avgInterval <= 9 && variance < 3) {
      frequency = 'weekly';
    } else if (avgInterval >= 12 && avgInterval <= 17 && variance < 4) {
      frequency = 'bi-weekly';
    }
    
    if (frequency !== 'unknown') {
      const avgAmount = group.reduce((sum, t) => sum + parseFloat(t.amount), 0) / group.length;
      
      recurringSubscriptions.push({
        name: extractSubscriptionName(sorted[0].description),
        description: sorted[0].description,
        amount: avgAmount,
        frequency,
        occurrences: group.length,
        lastDetected: sorted[sorted.length - 1].date,
        transactions: group.map(t => t.id),
        avgInterval: Math.round(avgInterval)
      });
    }
  });
  
  return recurringSubscriptions;
}

// Extract clean subscription name from description
function extractSubscriptionName(description) {
  // Remove common payment processor names
  let name = description
    .replace(/\b(payment|purchase|subscription|recurring|auto|debit)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Take first 3 words
  const words = name.split(' ').filter(w => w.length > 2);
  return words.slice(0, 3).join(' ') || description.slice(0, 20);
}

// Analyze spending waste
export function analyzeWaste(transactions, subscriptions) {
  const analysis = {
    totalWaste: 0,
    lowValuePayments: [],
    unusedSubscriptions: [],
    duplicateSubscriptions: []
  };
  
  // Find low-value repeated payments (< ₹50 occurring frequently)
  const lowValueGroups = groupSimilarTransactions(
    transactions.filter(t => parseFloat(t.amount) < 50),
    0.8
  );
  
  lowValueGroups.forEach(group => {
    if (group.length >= 5) {
      const totalAmount = group.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      analysis.lowValuePayments.push({
        name: extractSubscriptionName(group[0].description),
        count: group.length,
        totalAmount,
        avgAmount: totalAmount / group.length
      });
      analysis.totalWaste += totalAmount;
    }
  });
  
  // Check for potential duplicate subscriptions
  const subNames = subscriptions.map(s => s.name.toLowerCase());
  subNames.forEach((name, index) => {
    for (let i = index + 1; i < subNames.length; i++) {
      if (similarity(name, subNames[i]) > 0.7) {
        const sub1 = subscriptions[index];
        const sub2 = subscriptions[i];
        analysis.duplicateSubscriptions.push({
          sub1: sub1.name,
          sub2: sub2.name,
          wastage: Math.min(sub1.amount, sub2.amount)
        });
        analysis.totalWaste += Math.min(sub1.amount, sub2.amount);
      }
    }
  });
  
  return analysis;
}

// Auto-categorize transactions
export function categorizeTransaction(description) {
  const desc = description.toLowerCase();
  
  const categories = {
    'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'food', 'pizza', 'burger', 'starbucks', 'dominos'],
    'Entertainment': ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'movie', 'theater', 'bookmyshow'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'store', 'mall'],
    'Bills': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill', 'airtel', 'jio'],
    'Travel': ['uber', 'ola', 'rapido', 'fuel', 'petrol', 'irctc', 'makemytrip', 'goibibo'],
    'Health': ['pharmacy', 'medical', 'hospital', 'doctor', 'medicine', 'apollo', 'practo'],
    'Education': ['course', 'udemy', 'coursera', 'tuition', 'book', 'education']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  return 'Others';
}

// Generate insights
export function generateInsights(transactions, subscriptions) {
  const insights = [];
  
  if (subscriptions.length === 0) {
    insights.push({
      type: 'info',
      message: 'Upload more transactions to detect recurring subscriptions'
    });
    return insights;
  }
  
  // Subscription count insight
  if (subscriptions.length > 5) {
    insights.push({
      type: 'warning',
      message: `You have ${subscriptions.length} active subscriptions. Consider reviewing them.`
    });
  }
  
  // High subscription cost
  const totalSubCost = subscriptions.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  if (totalSubCost > 2000) {
    insights.push({
      type: 'alert',
      message: `Subscriptions cost you ₹${totalSubCost.toFixed(0)}/month. That's ₹${(totalSubCost * 12).toFixed(0)}/year!`
    });
  }
  
  // Category analysis
  const categoryTotals = {};
  transactions.forEach(t => {
    const cat = t.category || 'Others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount);
  });
  
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push({
      type: 'info',
      message: `Your highest spending category is ${topCategory[0]} at ₹${topCategory[1].toFixed(0)}`
    });
  }
  
  return insights;
}
