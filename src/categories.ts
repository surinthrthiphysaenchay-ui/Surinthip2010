/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types';

export const CATEGORIES: Category[] = [
  // Income Categories
  {
    id: 'salary',
    name: 'เงินเดือน',
    icon: 'Briefcase',
    color: 'emerald',
    type: 'income',
  },
  {
    id: 'business',
    name: 'ธุรกิจ/ค้าขาย',
    icon: 'Store',
    color: 'teal',
    type: 'income',
  },
  {
    id: 'investment',
    name: 'การลงทุน',
    icon: 'TrendingUp',
    color: 'cyan',
    type: 'income',
  },
  {
    id: 'gift',
    name: 'ของขวัญ/โบนัส',
    icon: 'Gift',
    color: 'purple',
    type: 'income',
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    icon: 'PlusCircle',
    color: 'lime',
    type: 'income',
  },

  // Expense Categories
  {
    id: 'food',
    name: 'อาหาร/เครื่องดื่ม',
    icon: 'Utensils',
    color: 'orange',
    type: 'expense',
  },
  {
    id: 'travel',
    name: 'เดินทาง/น้ำมัน',
    icon: 'Car',
    color: 'blue',
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง',
    icon: 'ShoppingBag',
    color: 'pink',
    type: 'expense',
  },
  {
    id: 'bills',
    name: 'บิล/ค่าใช้จ่ายบ้าน',
    icon: 'Receipt',
    color: 'red',
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'ความบันเทิง',
    icon: 'Film',
    color: 'indigo',
    type: 'expense',
  },
  {
    id: 'health',
    name: 'สุขภาพ/ความงาม',
    icon: 'Heart',
    color: 'rose',
    type: 'expense',
  },
  {
    id: 'other_expense',
    name: 'รายจ่ายอื่นๆ',
    icon: 'MinusCircle',
    color: 'slate',
    type: 'expense',
  },
];

export const getCategoryById = (id: string): Category => {
  const found = CATEGORIES.find(c => c.id === id);
  if (found) return found;
  
  // Return a fallback category based on common naming or just default
  return {
    id: id || 'other_expense',
    name: id || 'อื่นๆ',
    icon: 'HelpCircle',
    color: 'slate',
    type: 'expense'
  };
};
