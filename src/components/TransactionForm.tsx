/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../categories';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Plus, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionFormProps {
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSave, 
  editingTransaction,
  onCancelEdit
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Set initial date on mount
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setType('expense');
      setAmount('');
      setCategory('');
      setDescription('');
    }
  }, [editingTransaction]);

  // Handle changing type: reset category to first of that type
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const typeCats = CATEGORIES.filter(c => c.type === newType);
    if (typeCats.length > 0) {
      setCategory(typeCats[0].id);
    } else {
      setCategory('');
    }
  };

  // Set default category when type is set (only on first init if empty)
  useEffect(() => {
    if (!category) {
      const typeCats = CATEGORIES.filter(c => c.type === type);
      if (typeCats.length > 0) {
        setCategory(typeCats[0].id);
      }
    }
  }, [type, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่า 0');
      return;
    }
    if (!category) {
      alert('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      alert('กรุณาเลือกวันที่');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      category,
      date,
      description: description.trim()
    });

    // Reset form if not editing
    if (!editingTransaction) {
      setAmount('');
      setDescription('');
      const typeCats = CATEGORIES.filter(c => c.type === type);
      if (typeCats.length > 0) {
        setCategory(typeCats[0].id);
      }
    }
  };

  const filteredCategories = CATEGORIES.filter(c => c.type === type);

  // Background style helper based on type
  const themeColor = type === 'income' ? 'emerald' : 'rose';

  return (
    <div id="transaction-form-card" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-800">
          {editingTransaction ? 'แก้ไขรายการบัญชี' : 'เพิ่มรายการใหม่'}
        </h3>
        {editingTransaction && onCancelEdit && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded bg-slate-50 border border-slate-100"
          >
            ยกเลิกแก้ไข
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Type */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <button
            type="button"
            id="type-expense-btn"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownCircle size={16} />
            <span>รายจ่าย (Expense)</span>
          </button>
          <button
            type="button"
            id="type-income-btn"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpCircle size={16} />
            <span>รายรับ (Income)</span>
          </button>
        </div>

        {/* Input Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
            จำนวนเงิน (บาท)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              min="0.01"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-5 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-2xl text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-150"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-semibold text-lg text-slate-400">
              ฿
            </span>
          </div>
        </div>

        {/* Category Selection Grid */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            เลือกหมวดหมู่
          </label>
          <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-6 gap-2">
            {filteredCategories.map((cat) => {
              const isSelected = category === cat.id;
              
              // Map color to tailwind class dynamically
              const colorMaps: Record<string, { bg: string, text: string, border: string, bgSel: string }> = {
                emerald: { bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-700', border: 'border-emerald-500', bgSel: 'bg-emerald-500 text-white' },
                teal: { bg: 'bg-teal-50 text-teal-600', text: 'text-teal-700', border: 'border-teal-500', bgSel: 'bg-teal-500 text-white' },
                cyan: { bg: 'bg-cyan-50 text-cyan-600', text: 'text-cyan-700', border: 'border-cyan-500', bgSel: 'bg-cyan-500 text-white' },
                purple: { bg: 'bg-purple-50 text-purple-600', text: 'text-purple-700', border: 'border-purple-500', bgSel: 'bg-purple-500 text-white' },
                lime: { bg: 'bg-lime-50 text-lime-600', text: 'text-lime-700', border: 'border-lime-500', bgSel: 'bg-lime-500 text-white' },
                orange: { bg: 'bg-orange-50 text-orange-600', text: 'text-orange-700', border: 'border-orange-500', bgSel: 'bg-orange-500 text-white' },
                blue: { bg: 'bg-blue-50 text-blue-600', text: 'text-blue-700', border: 'border-blue-500', bgSel: 'bg-blue-500 text-white' },
                pink: { bg: 'bg-pink-50 text-pink-600', text: 'text-pink-700', border: 'border-pink-500', bgSel: 'bg-pink-500 text-white' },
                red: { bg: 'bg-red-50 text-red-600', text: 'text-red-700', border: 'border-red-500', bgSel: 'bg-red-500 text-white' },
                indigo: { bg: 'bg-indigo-50 text-indigo-600', text: 'text-indigo-700', border: 'border-indigo-500', bgSel: 'bg-indigo-500 text-white' },
                rose: { bg: 'bg-rose-50 text-rose-600', text: 'text-rose-700', border: 'border-rose-500', bgSel: 'bg-rose-500 text-white' },
                slate: { bg: 'bg-slate-50 text-slate-600', text: 'text-slate-700', border: 'border-slate-500', bgSel: 'bg-slate-500 text-white' },
              };
              
              const colors = colorMaps[cat.color] || colorMaps.slate;

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-150 border border-transparent hover:scale-105 active:scale-95 group"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected ? colors.bgSel + ' shadow-sm' : colors.bg + ' group-hover:scale-105'
                  }`}>
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors text-center ${
                    isSelected ? 'text-slate-800 font-semibold' : 'text-slate-500'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selector & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              วันที่ทำรายการ
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              บันทึกโน้ต/รายละเอียด
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ค่ากะเพราไข่ดาว, เงินเดือนพาร์ทไทม์"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="save-transaction-btn"
          className={`w-full flex items-center justify-center gap-2 py-3 px-5 text-white font-semibold rounded-2xl shadow-sm transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] ${
            type === 'income' 
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' 
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'
          }`}
        >
          {editingTransaction ? <Check size={18} /> : <Plus size={18} />}
          <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
        </button>
      </form>
    </div>
  );
};
