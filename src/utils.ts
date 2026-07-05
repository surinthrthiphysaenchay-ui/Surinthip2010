/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from './types';

// Format number to Thai Baht currency style
export const formatBaht = (amount: number, showSign = false): string => {
  const formatted = new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (amount === 0) return '0 ฿';
  const sign = amount < 0 ? '-' : showSign ? '+' : '';
  return `${sign}${formatted} ฿`;
};

// Map YYYY-MM-DD to a beautiful Thai date format
export const formatThaiDate = (dateStr: string, short = false): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const monthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const monthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear() + 543; // Buddhist Era

  const month = short ? monthsShort[monthIndex] : monthsFull[monthIndex];
  return `${day} ${month} ${year}`;
};

// Format YYYY-MM to readable Thai Month-Year (e.g. "2026-07" -> "กรกฎาคม 2569")
export const formatThaiMonthYear = (monthStr: string): string => {
  if (!monthStr || monthStr.length !== 7) return monthStr;
  const [yearStr, monthNum] = monthStr.split('-');
  const monthIndex = parseInt(monthNum, 10) - 1;
  const year = parseInt(yearStr, 10) + 543;

  const monthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return `${monthsFull[monthIndex]} ${year}`;
};

// Get the YYYY-MM string of current local date
export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Generate insights and financial tips in Thai based on user transactions
export const generateFinancialInsights = (
  transactions: Transaction[], 
  selectedMonth: string
): { title: string; desc: string; type: 'info' | 'warning' | 'success' }[] => {
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  const income = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const insights: { title: string; desc: string; type: 'info' | 'warning' | 'success' }[] = [];

  if (currentMonthTransactions.length === 0) {
    return [
      {
        title: 'เริ่มต้นการออม',
        desc: 'เริ่มบันทึกรายรับ-รายจ่ายของคุณวันนี้ เพื่อช่วยวิเคราะห์แผนการเงินและวินัยการออมที่ดี!',
        type: 'info'
      }
    ];
  }

  // Savings rate insights
  if (income > 0) {
    if (savingsRate >= 30) {
      insights.push({
        title: 'สุดยอดการออม! 🎉',
        desc: `คุณมีอัตราการออมเงินสูงถึง ${savingsRate.toFixed(0)}% ของรายได้ ซึ่งอยู่ในเกณฑ์ดีเยี่ยม (เป้าหมายมาตรฐานคือ 20%) รักษาวินัยนี้ไว้นะครับ!`,
        type: 'success'
      });
    } else if (savingsRate >= 10 && savingsRate < 30) {
      insights.push({
        title: 'สัดส่วนเงินออมกำลังดี 👍',
        desc: `คุณมีอัตราการออมเงินอยู่ที่ ${savingsRate.toFixed(0)}% ลองลดรายจ่ายฟุ่มเฟือยอีกนิดเพื่อเพิ่มให้ถึงเป้าหมาย 20-30%`,
        type: 'info'
      });
    } else if (savingsRate > 0 && savingsRate < 10) {
      insights.push({
        title: 'ออมเงินได้อีกนิด ⚠️',
        desc: `อัตราเงินออมของคุณค่อนข้างต่ำที่ ${savingsRate.toFixed(0)}% พยายามตรวจสอบรายจ่ายที่ไม่จำเป็นเพื่อปรับปรุงสัดส่วนการออม`,
        type: 'warning'
      });
    } else {
      insights.push({
        title: 'รายจ่ายสูงกว่ารายรับ 🚨',
        desc: 'เดือนนี้คุณมีรายจ่ายเกินกว่ารายรับ! แนะนำให้รีบระงับรายจ่ายฟุ่มเฟือยหรือแบ่งสัดส่วนการใช้ออกเป็นหมวดหมู่อย่างเคร่งครัด',
        type: 'warning'
      });
    }
  }

  // Expense analysis
  if (expense > 0) {
    // Find biggest expense category
    const categoryExpenses: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    let biggestCat = '';
    let biggestAmount = 0;
    Object.entries(categoryExpenses).forEach(([cat, amt]) => {
      if (amt > biggestAmount) {
        biggestAmount = amt;
        biggestCat = cat;
      }
    });

    const categoryNames: Record<string, string> = {
      food: 'อาหารและเครื่องดื่ม',
      travel: 'การเดินทางและค่าน้ำมัน',
      shopping: 'ช้อปปิ้งซื้อของ',
      bills: 'บิลและค่าใช้จ่ายประจำ',
      entertainment: 'ความบันเทิงและท่องเที่ยว',
      health: 'สุขภาพและยารักษาโรค',
      other_expense: 'รายจ่ายจิปาถะอื่นๆ'
    };

    if (biggestCat) {
      const catName = categoryNames[biggestCat] || biggestCat;
      const pct = (biggestAmount / expense) * 100;
      insights.push({
        title: `หมวดค่าใช้จ่ายหลัก: ${catName}`,
        desc: `คุณเสียเงินให้กับ '${catName}' มากที่สุด คิดเป็น ${pct.toFixed(0)}% ของค่าใช้จ่ายทั้งหมดในเดือนนี้ (${formatBaht(biggestAmount)})`,
        type: pct > 40 ? 'warning' : 'info'
      });
    }
  }

  // Generic finance quotes / tips
  if (insights.length < 3) {
    insights.push({
      title: 'เคล็ดลับ 50/30/20 💡',
      desc: 'ลองแบ่งเงินเป็น 3 ส่วน: 50% สำหรับของจำเป็น (อาหาร บิล บ้าน), 30% สำหรับของที่ต้องการ (ช้อปปิ้ง เที่ยว) และ 20% เพื่อเก็บออมหรือจ่ายหนี้',
      type: 'info'
    });
  }

  return insights;
};
