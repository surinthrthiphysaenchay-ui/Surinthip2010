/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { getCategoryById, CATEGORIES } from '../categories';
import { formatBaht, formatThaiDate } from '../utils';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Inbox
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedMonth,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 1. Filter transactions based on search, type, category and current selectedMonth
  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      // Must belong to selected month
      const matchMonth = t.date.startsWith(selectedMonth);
      if (!matchMonth) return false;

      // Match Search Query
      const matchSearch = search.trim() === '' || 
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        getCategoryById(t.category).name.toLowerCase().includes(search.toLowerCase());

      // Match Type
      const matchType = filterType === 'all' || t.type === filterType;

      // Match Category
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;

      return matchSearch && matchType && matchCategory;
    });
  }, [transactions, selectedMonth, search, filterType, filterCategory]);

  // 2. Sort filtered transactions by date descending, then by createdAt descending
  const sortedTx = useMemo(() => {
    return [...filteredTx].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTx]);

  // 3. Group by Date
  const groupedTx = useMemo(() => {
    const groups: Record<string, { txs: Transaction[]; dailyTotal: number }> = {};
    
    sortedTx.forEach(tx => {
      if (!groups[tx.date]) {
        groups[tx.date] = { txs: [], dailyTotal: 0 };
      }
      groups[tx.date].txs.push(tx);
      
      if (tx.type === 'income') {
        groups[tx.date].dailyTotal += tx.amount;
      } else {
        groups[tx.date].dailyTotal -= tx.amount;
      }
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [sortedTx]);

  // Unique categories used in this month's transactions for dropdown filtering
  const activeCategories = useMemo(() => {
    const monthItems = transactions.filter(t => t.date.startsWith(selectedMonth));
    const catIds = Array.from(new Set(monthItems.map(t => t.category)));
    return CATEGORIES.filter(c => catIds.includes(c.id));
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Search & Simple Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ หรือ หมวดหมู่..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
          />
        </div>

        {/* Filter Selection Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Type Segment */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 text-[11px] font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              รายจ่าย
            </button>
          </div>

          {/* Filter Category Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-500">
            <Filter size={12} className="text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {activeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Transactions List */}
      {groupedTx.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <Inbox className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-600">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
            <p className="text-xs text-slate-400">ลองล้างตัวกรอง หรือ เพิ่มรายการลงในประวัติบัญชี</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTx.map(([date, group]) => (
            <div key={date} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              {/* Daily Header */}
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{formatThaiDate(date)}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${
                    group.dailyTotal >= 0 ? 'text-emerald-500' : 'text-slate-500'
                  }`}>
                    {group.dailyTotal > 0 ? '+' : ''}{formatBaht(group.dailyTotal, true)}
                  </span>
                </div>
              </div>

              {/* Transactions in this Day */}
              <div className="divide-y divide-slate-50">
                {group.txs.map(tx => {
                  const cat = getCategoryById(tx.category);
                  
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
                      className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/40 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                          <CategoryIcon name={cat.icon} className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {tx.description || cat.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {cat.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatBaht(tx.amount)}
                        </span>
                        
                        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50"
                            title="แก้ไข"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50"
                            title="ลบ"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
