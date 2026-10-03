/**
 * Utility functions for Indian Rupee (INR / ₹) currency formatting
 * formatted according to Indian numbering standards (Lakhs, Crores, etc.)
 */

export const formatINR = (amount: number | undefined | null): string => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

export const formatINRPlain = (amount: number | undefined | null): string => {
  const val = Number(amount) || 0;
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatINRCompact = (amount: number | undefined | null): string => {
  const val = Number(amount) || 0;
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return formatINRPlain(val);
};
