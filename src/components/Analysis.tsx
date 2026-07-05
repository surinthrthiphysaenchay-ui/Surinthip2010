/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { getCategoryById, CATEGORIES } from '../categories';
import { formatBaht, generateFinancialInsights, formatThaiMonthYear } from '../utils';
import { CategoryIcon } from './CategoryIcon';
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Coins, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Calendar,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';

interface AnalysisProps {
  transactions: Transaction[];
  selectedMonth: string;
}

export const Analysis: React.FC<AnalysisProps> = ({ transactions, selectedMonth }) => {
  // 1. Filter transactions for the selected month
  const monthTx = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 2. Aggregate totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthTx.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [monthTx]);

  // 3. Category distribution (Expenses)
  const categoryData = useMemo(() => {
    const expenseTx = monthTx.filter(t => t.type === 'expense');
    const totalExp = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    const map: Record<string, number> = {};
    expenseTx.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    const data = Object.entries(map).map(([catId, amount]) => {
      const category = getCategoryById(catId);
      const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
      return {
        id: catId,
        name: category.name,
        amount,
        percentage,
        color: category.color,
        icon: category.icon
      };
    });

    // Sort by amount descending
    return data.sort((a, b) => b.amount - a.amount);
  }, [monthTx]);

  // 4. Monthly Trend Data (Last 3 Months)
  const trendData = useMemo(() => {
    // Generate the last 3 months list based on current selection
    const months: string[] = [];
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    for (let i = 2; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    return months.map(mStr => {
      const txs = transactions.filter(t => t.date.startsWith(mStr));
      let inc = 0;
      let exp = 0;
      txs.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      });
      return {
        monthStr: mStr,
        monthThai: formatThaiMonthYear(mStr).split(' ')[0], // just name (e.g. "กรกฎาคม")
        income: inc,
        expense: exp
      };
    });
  }, [transactions, selectedMonth]);

  // 5. Generate financial insights list
  const insights = useMemo(() => {
    return generateFinancialInsights(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Donut chart math parameters
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91

  // Color mappings for Category List
  const colorMaps: Record<string, string> = {
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    lime: 'bg-lime-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
  };

  const ringColors: Record<string, string> = {
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    purple: '#a855f7',
    lime: '#84cc16',
    orange: '#f97316',
    blue: '#3b82f6',
    pink: '#ec4899',
    red: '#ef4444',
    indigo: '#6366f1',
    rose: '#f43f5e',
    slate: '#64748b',
  };

  // Find max value in trendData for scaling chart height
  const maxTrendValue = useMemo(() => {
    let max = 10000; // minimum scale ceiling
    trendData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.1; // 10% breathing room
  }, [trendData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">วิเคราะห์ข้อมูลทางการเงิน</h2>
        <p className="text-xs text-slate-500 font-medium">รายละเอียดเชิงลึกประจำเดือน {formatThaiMonthYear(selectedMonth)}</p>
      </div>

      {/* Grid: Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Coins className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 block">รายรับทั้งหมด</span>
            <span className="text-base font-bold text-slate-800">{formatBaht(totals.income)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
            <TrendingDown className="w-4.5 h-4.5 text-rose-500" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 block">รายจ่ายทั้งหมด</span>
            <span className="text-base font-bold text-slate-800">{formatBaht(totals.expense)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 block">ยอดคงเหลือสุทธิ</span>
            <span className={`text-base font-bold ${totals.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatBaht(totals.balance, true)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Percent className="w-4.5 h-4.5 text-cyan-500" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 block">อัตราการเก็บออม</span>
            <span className={`text-base font-bold ${totals.savingsRate >= 20 ? 'text-emerald-500' : 'text-slate-700'}`}>
              {totals.savingsRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Core Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Expense Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">สัดส่วนรายจ่ายแยกตามหมวดหมู่</h3>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-1.5">
              <span className="text-sm font-semibold">ไม่มีข้อมูลค่าใช้จ่าย</span>
              <span className="text-xs">กรุณาเพิ่มรายการใช้จ่ายในแดชบอร์ด</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2 justify-center">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  {/* Category arc loops */}
                  {(() => {
                    let cumulativePercentage = 0;
                    return categoryData.map((item) => {
                      const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                      const strokeDashoffsetCombined = circumference - (cumulativePercentage / 100) * circumference;
                      
                      cumulativePercentage += item.percentage;
                      const color = ringColors[item.color] || '#64748b';

                      return (
                        <circle
                          key={item.id}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transform={`rotate(${(strokeDashoffsetCombined / circumference) * -360} 50 50)`}
                          strokeLinecap="butt"
                          className="transition-all duration-300"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รายจ่ายรวม</span>
                  <span className="text-base font-extrabold text-slate-800 leading-tight">
                    {formatBaht(totals.expense)}
                  </span>
                </div>
              </div>

              {/* Legends & Details */}
              <div className="flex-1 space-y-2.5 w-full">
                {categoryData.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorMaps[item.color] || 'bg-slate-400'}`}></span>
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right font-medium text-slate-500">
                      <span>{formatBaht(item.amount)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
                {categoryData.length > 4 && (
                  <p className="text-[10px] text-slate-400 text-right italic">
                    และหมวดหมู่อื่นๆ อีก {categoryData.length - 4} รายการ
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: 3-Month Cash Flow Trend */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">แนวโน้มเปรียบเทียบ 3 เดือนล่าสุด</h3>
          </div>

          <div className="flex items-end justify-around h-44 pt-4 px-2 border-b border-slate-100">
            {trendData.map((data, index) => {
              const incPct = (data.income / maxTrendValue) * 100;
              const expPct = (data.expense / maxTrendValue) * 100;

              return (
                <div key={index} className="flex flex-col items-center gap-2 w-1/3">
                  <div className="flex items-end gap-2.5 w-full justify-center h-28">
                    {/* Income Bar */}
                    <div className="flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all text-[9px] bg-slate-900 text-white rounded px-1.5 py-0.5 z-10 font-bold whitespace-nowrap shadow-sm pointer-events-none">
                        {formatBaht(data.income)}
                      </span>
                      <div 
                        className="w-4 bg-emerald-400 rounded-t-lg transition-all duration-500 shadow-emerald-50 shadow-sm hover:bg-emerald-500 cursor-pointer"
                        style={{ height: `${Math.max(incPct, 3)}%` }}
                      ></div>
                    </div>

                    {/* Expense Bar */}
                    <div className="flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all text-[9px] bg-slate-900 text-white rounded px-1.5 py-0.5 z-10 font-bold whitespace-nowrap shadow-sm pointer-events-none">
                        {formatBaht(data.expense)}
                      </span>
                      <div 
                        className="w-4 bg-rose-400 rounded-t-lg transition-all duration-500 shadow-rose-50 shadow-sm hover:bg-rose-500 cursor-pointer"
                        style={{ height: `${Math.max(expPct, 3)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center truncate w-full">
                    {data.monthThai}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400 shadow-sm"></span>
              <span>รายรับ (Income)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-400 shadow-sm"></span>
              <span>รายจ่าย (Expense)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: AI Financial Assistant / Smart Advisor */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-slate-800 text-sm">การวิเคราะห์และข้อแนะนำทางการเงิน</h4>
        </div>

        <div className="space-y-2.5">
          {insights.map((insight, idx) => {
            const isSuccess = insight.type === 'success';
            const isWarning = insight.type === 'warning';

            return (
              <div 
                key={idx} 
                className={`flex gap-3 p-3.5 rounded-2xl border transition-all ${
                  isSuccess 
                    ? 'bg-emerald-50/50 border-emerald-100/60' 
                    : isWarning 
                    ? 'bg-rose-50/50 border-rose-100/60' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess ? (
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                  ) : (
                    <Info className="w-4.5 h-4.5 text-indigo-500" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-bold ${
                    isSuccess ? 'text-emerald-800' : isWarning ? 'text-rose-800' : 'text-slate-800'
                  }`}>
                    {insight.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {insight.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
