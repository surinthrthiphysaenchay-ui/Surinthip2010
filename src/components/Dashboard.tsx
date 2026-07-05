/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction } from '../types';
import { getCategoryById } from '../categories';
import { formatBaht, formatThaiDate, formatThaiMonthYear } from '../utils';
import { CategoryIcon } from './CategoryIcon';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Inbox
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateToAll: () => void;
  onNavigateToAdd: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  selectedMonth,
  setSelectedMonth,
  onEditTransaction,
  onDeleteTransaction,
  onNavigateToAll,
  onNavigateToAdd
}) => {
  // Get all unique months from transactions to build selector options
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    
    // Always ensure current month is in the list
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonthStr);

    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        months.add(t.date.substring(0, 7));
      }
    });

    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Filter transactions for selected month
  const currentMonthTx = React.useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Aggregate totals
  const totals = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    currentMonthTx.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [currentMonthTx]);

  // Expense percentage of income
  const expensePercentage = totals.income > 0 ? (totals.expense / totals.income) * 100 : 0;

  // Recent transactions (limit to 5)
  const recentTransactions = React.useMemo(() => {
    return [...currentMonthTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [currentMonthTx]);

  return (
    <div className="space-y-6">
      {/* Header: Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">แดชบอร์ดสรุปผล</h2>
          <p className="text-xs text-slate-500 font-medium">ภาพรวมกระแสเงินสดของคุณ</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto">
          <Calendar className="text-indigo-500 w-4 h-4 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer w-full"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatThaiMonthYear(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Card: Total Balance */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        {/* Background decorative ambient lights */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">ยอดเงินคงเหลือประจำเดือน</span>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {formatBaht(totals.balance, true)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-indigo-300" />
          </div>
        </div>

        {/* Income / Expense bar */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>รายรับรวม</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">
              {formatBaht(totals.income)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>รายจ่ายรวม</span>
            </div>
            <p className="text-lg font-bold text-rose-400">
              {formatBaht(totals.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget usage indicator */}
      {totals.income > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-500">สัดส่วนค่าใช้จ่ายต่อรายรับ</span>
            <span className={`font-bold ${expensePercentage > 80 ? 'text-rose-500' : expensePercentage > 50 ? 'text-orange-500' : 'text-emerald-500'}`}>
              {expensePercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                expensePercentage > 80 ? 'bg-rose-500' : expensePercentage > 50 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(expensePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {expensePercentage > 80 
              ? '⚠️ คุณใช้จ่ายค่อนข้างสูงเมื่อเทียบกับรายได้ ระวังการใช้เงินเกินตัว!'
              : expensePercentage > 50 
              ? '💡 ใช้เงินไปครึ่งหนึ่งแล้ว อย่าลืมสำรองเงินสำหรับออมด้วยล่ะ'
              : '✅ การใช้จ่ายอยู่ในสัดส่วนที่ดีเยี่ยม มีเงินออมเหลือเฟือ!'}
          </p>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-slate-800 text-sm">รายการล่าสุดประจำเดือน</h4>
          {currentMonthTx.length > 5 && (
            <button 
              onClick={onNavigateToAll}
              className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>ดูทั้งหมด ({currentMonthTx.length})</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">ไม่มีประวัติการทำรายการในเดือนนี้</p>
              <p className="text-xs text-slate-400">เริ่มจดบันทึกรายรับหรือรายจ่ายรายการแรกเพื่อเริ่มวิเคราะห์แผนการเงิน</p>
            </div>
            <button 
              onClick={onNavigateToAdd}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 py-2 px-4 rounded-xl shadow-sm transition"
            >
              <Plus size={14} />
              <span>เขียนบันทึกรายการ</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const cat = getCategoryById(tx.category);
              
              // Color styles
              const colorMaps: Record<string, string> = {
                emerald: 'bg-emerald-50 text-emerald-600',
                teal: 'bg-teal-50 text-teal-600',
                cyan: 'bg-cyan-50 text-cyan-600',
                purple: 'bg-purple-50 text-purple-600',
                lime: 'bg-lime-50 text-lime-600',
                orange: 'bg-orange-50 text-orange-600',
                blue: 'bg-blue-50 text-blue-600',
                pink: 'bg-pink-50 text-pink-600',
                red: 'bg-red-50 text-red-600',
                indigo: 'bg-indigo-50 text-indigo-600',
                rose: 'bg-rose-50 text-rose-600',
                slate: 'bg-slate-50 text-slate-600',
              };
              
              const iconColor = colorMaps[cat.color] || colorMaps.slate;

              return (
                <div 
                  key={tx.id} 
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between hover:scale-[1.005] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {tx.description || cat.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatThaiDate(tx.date, true)} • {cat.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatBaht(tx.amount)}
                    </span>
                    
                    {/* Action buttons (reveals nicely on hover or simple touch) */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition"
                        title="แก้ไข"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="ลบ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
