// SERVER-ONLY SERVICE FOR DONATION DATA
// This file should never be imported in client components

import 'server-only'; // Explicitly mark as server-only
import { db } from '@/lib/db';
// Types are now defined locally and not imported from donationClient
// import { DonationSummary, MonthlyDonation, YearlyTotal, Allocation, DonationsResponse } from '@/utils/donationClient';

export type DonationSummary = {
  month: string;
  year: string;
  total_amount: number;
  donor_count: number;
  avg_donation: number;
}

export type MonthlyDonation = {
  id: number;
  amount: number;
  donor_initial: string;
  donor_name?: string;
  method: string;
  donation_date: string;
  notes?: string;
}

export type YearlyTotal = {
  total_amount: number;
  donor_count: number;
  avg_donation: number;
}

export type Allocation = {
  category: string;
  amount: number;
  percentage: number;
}

export type DonationsResponse = {
  monthlyDonations: DonationSummary[];
  currentMonth: MonthlyDonation[];
  yearlyTotal: YearlyTotal;
  allocations: Allocation[];
}

/**
 * Get donation data directly from the database
 * Used by API route
 */
export async function getDonations(year?: string, month?: string): Promise<DonationsResponse> {
  try {
    // Default to current year if not provided
    const targetYear = year || new Date().getFullYear().toString();

    // Fetch monthly summaries for the specified year
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(donation_date, '%m') as month,
        DATE_FORMAT(donation_date, '%Y') as year,
        SUM(amount) as total_amount,
        COUNT(*) as donor_count,
        AVG(amount) as avg_donation
      FROM donations
      WHERE DATE_FORMAT(donation_date, '%Y') = ?
      GROUP BY month, year
      ORDER BY month ASC
    `;
    
    const [rows] = await db.query(monthlyQuery, [targetYear]);
    const monthlyDonations = rows as DonationSummary[];
    
    // Fetch detailed donation data for a specific month if requested
    let currentMonthDonations: MonthlyDonation[] = [];
    if (month) {
      const detailQuery = `
        SELECT 
          id, 
          amount, 
          donor_initial, 
          donor_name,
          method, 
          DATE_FORMAT(donation_date, '%Y-%m-%d') as donation_date,
          notes
        FROM donations
        WHERE 
          DATE_FORMAT(donation_date, '%Y') = ? AND
          DATE_FORMAT(donation_date, '%m') = ?
        ORDER BY donation_date DESC
      `;
      const [detailRows] = await db.query(detailQuery, [targetYear, month]);
      currentMonthDonations = detailRows as MonthlyDonation[];
    }
    
    // Calculate yearly totals
    const yearlyQuery = `
      SELECT 
        SUM(amount) as total_amount,
        COUNT(*) as donor_count,
        AVG(amount) as avg_donation
      FROM donations
      WHERE DATE_FORMAT(donation_date, '%Y') = ?
    `;
    const [yearlyRows] = await db.query(yearlyQuery, [targetYear]);
    const yearlyResults = yearlyRows as any[];
    const yearlyTotal = yearlyResults[0] || { total_amount: 0, donor_count: 0, avg_donation: 0 };
    
    // Get allocation breakdown
    // Note: In a real-world scenario, this might come from its own table
    // or calculated based on actual expenses
    const totalAmount = yearlyTotal.total_amount || 0;
    
    const allocations = [
      { 
        category: 'Biaya Server & Hosting', 
        amount: Math.round(totalAmount * 0.55), 
        percentage: 55 
      },
      { 
        category: 'Pengembangan Fitur Baru', 
        amount: Math.round(totalAmount * 0.33), 
        percentage: 33 
      },
      { 
        category: 'Peningkatan Konten', 
        amount: Math.round(totalAmount * 0.12), 
        percentage: 12 
      },
    ];
    
    return {
      monthlyDonations,
      currentMonth: currentMonthDonations,
      yearlyTotal,
      allocations
    };
  } catch (error) {
    console.error('Error fetching donation data from database:', error);
    // Return empty data structure in case of error
    return {
      monthlyDonations: [],
      currentMonth: [],
      yearlyTotal: {
        total_amount: 0,
        donor_count: 0,
        avg_donation: 0
      },
      allocations: []
    };
  }
}

// These utility functions have been moved to /src/utils/donationClient.ts
// This file now only contains server-side functionality
