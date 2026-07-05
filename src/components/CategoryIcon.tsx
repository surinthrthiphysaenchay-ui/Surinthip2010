/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, 
  Store, 
  TrendingUp, 
  Gift, 
  PlusCircle, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Film, 
  Heart, 
  MinusCircle, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Store,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Heart,
  MinusCircle,
  HelpCircle,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} />;
};
