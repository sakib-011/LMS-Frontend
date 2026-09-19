// Format a date string or Date object into a readable format
export const formatDate = (date: string | Date | undefined, includeTime: boolean = false): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };

  return new Intl.DateTimeFormat('en-US', options).format(d);
};

// Format a number into currency
export const formatCurrency = (amount: number | undefined, currency: string = 'USD'): string => {
  if (amount === undefined || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format large numbers (e.g., 1500 -> 1.5k)
export const formatCompactNumber = (number: number | undefined): string => {
  if (number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
};
