/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { INITIAL_DEMO_TRANSACTIONS } from '../data';
import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  User
} from '../firebase';

export function useTransactions(user: User | null, isDemo: boolean) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load transactions based on authentication or demo state
  useEffect(() => {
    setLoading(true);

    if (isDemo) {
      // Demo Mode: Use localStorage
      const localData = localStorage.getItem('surinthip2010_demo_transactions');
      if (localData) {
        try {
          setTransactions(JSON.parse(localData));
        } catch (e) {
          console.error("Error parsing demo transactions, resetting", e);
          setTransactions(INITIAL_DEMO_TRANSACTIONS);
          localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
        }
      } else {
        // First time, write initial demo data
        setTransactions(INITIAL_DEMO_TRANSACTIONS);
        localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
      }
      setLoading(false);

      // Return cleanup (noop for local storage)
      return () => {};
    } else if (user) {
      // Authenticated Mode: Sync with Firestore in real-time
      const colRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(colRef, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedList: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedList.push({
            id: docSnap.id,
            type: data.type,
            amount: Number(data.amount),
            category: data.category,
            date: data.date,
            description: data.description || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });
        setTransactions(fetchedList);
        setLoading(false);
      }, (error) => {
        console.error("Firestore sync failed:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // No user and not in demo mode
      setTransactions([]);
      setLoading(false);
      return () => {};
    }
  }, [user, isDemo]);

  // Create/Add a transaction
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: isDemo ? 'demo-' + Date.now() : '',
      createdAt: new Date().toISOString()
    };

    if (isDemo) {
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(updated));
    } else if (user) {
      const colRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(colRef, {
        type: newTx.type,
        amount: Number(newTx.amount),
        category: newTx.category,
        date: newTx.date,
        description: newTx.description,
        createdAt: newTx.createdAt
      });
    }
  };

  // Update a transaction
  const updateTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    if (isDemo) {
      const updated = transactions.map(t => t.id === id ? { ...t, ...updatedFields } : t);
      setTransactions(updated);
      localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(updated));
    } else if (user) {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await updateDoc(docRef, {
        ...updatedFields,
        ...(updatedFields.amount !== undefined ? { amount: Number(updatedFields.amount) } : {})
      });
    }
  };

  // Delete a transaction
  const removeTransaction = async (id: string) => {
    if (isDemo) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(updated));
    } else if (user) {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(docRef);
    }
  };

  // Quick reset to default demo transactions for trial mode
  const resetDemoData = () => {
    if (isDemo) {
      setTransactions(INITIAL_DEMO_TRANSACTIONS);
      localStorage.setItem('surinthip2010_demo_transactions', JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    removeTransaction,
    resetDemoData
  };
}
