export function calculateDiscount(price: number, percentage: number): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }

  if (price <= 0) {
    return 0;
  }

  const discount = price * (percentage / 100);
  const finalPrice = price - discount;

  if (finalPrice < 1) {
    return 1;
  }

  return Math.round(finalPrice * 100) / 100;
}

export function calculateTax(amount: number, rate: number): number {
  if (rate < 0) {
    throw new Error('Tax rate cannot be negative');
  }

  if (amount <= 0) {
    return 0;
  }

  return Math.round(amount * rate * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  } else if (currency === 'EUR') {
    return `€${amount.toFixed(2)}`;
  } else if (currency === 'AED') {
    return `${amount.toFixed(2)} AED`;
  }

  return `${amount.toFixed(2)} ${currency}`;
}
