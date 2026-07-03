export interface CalculationResult {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
}

export const billingCalculationService = {
  calculateTotals(
    items: { amount: number }[],
    taxRatePercent = 0,
    amountPaid = 0
  ): CalculationResult {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = taxRatePercent / 100;
    
    // Perform rounding to 2 decimal places to avoid floating point issues
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const balanceDue = Math.round((totalAmount - amountPaid) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      totalAmount,
      balanceDue: balanceDue < 0 ? 0 : balanceDue,
    };
  }
};
