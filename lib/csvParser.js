import Papa from 'papaparse';
import { categorizeTransaction } from './recurringDetection';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = results.data.map((row, index) => {
            // Try to detect date, description, amount columns
            const keys = Object.keys(row);
            
            let date, description, amount;
            
            // Find date column
            const dateKey = keys.find(k => 
              k.toLowerCase().includes('date') || 
              k.toLowerCase().includes('transaction date')
            );
            date = row[dateKey];
            
            // Find description column
            const descKey = keys.find(k => 
              k.toLowerCase().includes('description') || 
              k.toLowerCase().includes('narration') || 
              k.toLowerCase().includes('details') ||
              k.toLowerCase().includes('particulars')
            );
            description = row[descKey];
            
            // Find amount column (prefer debit/withdrawal)
            const amountKey = keys.find(k => 
              k.toLowerCase().includes('debit') || 
              k.toLowerCase().includes('withdrawal') ||
              k.toLowerCase().includes('amount')
            );
            amount = row[amountKey];
            
            // Parse and clean the data
            if (!date || !description || !amount) {
              return null;
            }
            
            // Clean amount (remove currency symbols, commas)
            const cleanAmount = parseFloat(amount.toString().replace(/[^0-9.-]/g, ''));
            
            if (isNaN(cleanAmount) || cleanAmount <= 0) {
              return null;
            }
            
            // Parse date
            let parsedDate;
            try {
              // Try multiple date formats
              const dateStr = date.toString().trim();
              if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts[2]?.length === 4) {
                  // DD/MM/YYYY
                  parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else {
                  // MM/DD/YYYY
                  parsedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                }
              } else if (dateStr.includes('-')) {
                parsedDate = dateStr;
              } else {
                parsedDate = new Date(dateStr).toISOString().split('T')[0];
              }
            } catch (e) {
              return null;
            }
            
            return {
              date: parsedDate,
              description: description.toString().trim(),
              amount: cleanAmount,
              category: categorizeTransaction(description.toString())
            };
          }).filter(t => t !== null);
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
