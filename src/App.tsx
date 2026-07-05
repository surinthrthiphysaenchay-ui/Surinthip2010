/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, auth } from './firebase';
import { useTransactions } from './hooks/useTransactions';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Analysis } from './components/Analysis';
import { UserProfile } from './components/UserProfile';
import { getCurrentMonthString, formatThaiMonthYear } from './utils';
import { 
  Home, 
  BarChart2, 
  PlusCircle, 
  FileText, 
  User as UserIcon,
  Wallet,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'dashboard' | 'analysis' | 'add' | 'history' | 'account';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    // Check if the user was previously using Demo Mode
    const savedDemo = localStorage.getItem('surinthip2010_use_demo');
    return savedDemo === 'true' || savedDemo === null; // default to true if no state yet
  });
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  // Firebase auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecking(false);
      
      if (firebaseUser) {
        // If a user logs in, turn off demo mode
        setIsDemo(false);
        localStorage.setItem('surinthip2010_use_demo', 'false');
      }
    });

    return () => unsubscribe();
  }, []);

  // Hook to handle transactions fetching and editing
  const { 
    transactions, 
    loading: txLoading, 
    addTransaction, 
    updateTransaction, 
    removeTransaction,
    resetDemoData
  } = useTransactions(user, isDemo);

  const handleSetDemo = (demoVal: boolean) => {
    setIsDemo(demoVal);
    localStorage.setItem('surinthip2010_use_demo', String(demoVal));
  };

  const handleSaveTransaction = async (txData: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, txData);
      setEditingTransaction(null);
      // Return to Dashboard or History after edit
      setActiveTab('history');
    } else {
      await addTransaction(txData);
      // Return to Dashboard after successful addition
      setActiveTab('dashboard');
    }
  };

  const handleEditInit = (tx: any) => {
    setEditingTransaction(tx);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setActiveTab('dashboard');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      await removeTransaction(id);
    }
  };

  // If we are checking auth, show a beautiful minimalist loading screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-500 font-sans">กำลังเปิดสมุดบัญชี...</p>
        </div>
      </div>
    );
  }

  // Determine whether to show splash/intro selector screen
  // Show splash if they are neither in demo mode, nor logged in
  const showSplash = !isDemo && !user;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6 md:p-10 font-sans">
        {/* Top brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-emerald-200">
            FinTrack Project
          </span>
        </div>

        {/* Hero Illustration & Pitch */}
        <div className="my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200">
              <Sparkles size={12} className="text-indigo-300" />
              <span>จัดการเงินได้ง่าย ครบจบในที่เดียว</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              สมุดบัญชีจัดการ <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
                รายรับ รายจ่าย
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              เครื่องมือวิเคราะห์ สรุปผลรายเดือน และประเมินอัตราการออมเงิน เพื่อให้คุณวางแผนสภาพคล่องทางการเงินได้อย่างมืออาชีพ รองรับการใช้งานมือถืออย่างเต็มระบบ
            </p>
          </div>

          <div className="space-y-3">
            {/* Guest Trial */}
            <button
              onClick={() => handleSetDemo(true)}
              className="w-full flex items-center justify-between py-3.5 px-5 bg-white text-slate-900 font-extrabold rounded-2xl shadow-lg hover:bg-slate-100 active:scale-98 transition duration-150"
            >
              <span>ใช้งานบัญชีทดลอง (ไม่ล็อกอิน)</span>
              <ArrowRight size={18} className="text-slate-500" />
            </button>

            {/* Google Login */}
            <button
              onClick={() => {
                // If they click, we change demo mode off first so that the user profile auth page opens
                handleSetDemo(false);
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-indigo-600/50 hover:bg-indigo-600/70 border border-indigo-500/30 text-white font-bold rounded-2xl transition"
            >
              <svg className="w-4.5 h-4.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 1.127 15.427 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"/>
              </svg>
              <span>ล็อกอินด้วย Google</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500">
          <p>ข้อมูลจัดเก็บอย่างปลอดภัยบนระบบ Firebase โครงการ Surinthip2010</p>
        </div>
      </div>
    );
  }

  // Render the actual web-app workspace
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-6 flex flex-col">
      {/* Top Static Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-100 z-30 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xs font-bold text-slate-800">จัดการรายรับรายจ่าย</h1>
            <p className="text-[9px] font-bold text-slate-400">
              SURINTHIP2010
            </p>
          </div>
        </div>

        {/* Sync Mode Pill */}
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDemo 
              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {isDemo ? 'บัญชีทดลอง (Local)' : 'คลาวด์ซิงค์ (Firebase)'}
          </span>
          
          {user && (
            <img 
              src={user.photoURL || undefined} 
              alt="Avatar" 
              className="w-6 h-6 rounded-lg ring-1 ring-emerald-200"
              onClick={() => setActiveTab('account')}
            />
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-6">
        {txLoading ? (
          <div className="space-y-3 py-12 text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-semibold font-sans">กำลังซิงค์ประวัติบัญชี...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  onEditTransaction={handleEditInit}
                  onDeleteTransaction={handleDelete}
                  onNavigateToAll={() => setActiveTab('history')}
                  onNavigateToAdd={() => setActiveTab('add')}
                />
              )}

              {activeTab === 'analysis' && (
                <Analysis
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                />
              )}

              {activeTab === 'add' && (
                <TransactionForm
                  onSave={handleSaveTransaction}
                  editingTransaction={editingTransaction}
                  onCancelEdit={handleCancelEdit}
                />
              )}

              {activeTab === 'history' && (
                <TransactionList
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                  onEditTransaction={handleEditInit}
                  onDeleteTransaction={handleDelete}
                />
              )}

              {activeTab === 'account' && (
                <UserProfile
                  user={user}
                  isDemo={isDemo}
                  onSetDemo={handleSetDemo}
                  onResetDemoData={resetDemoData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Responsive Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-2 flex justify-around items-center z-40 shadow-lg">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveTab('dashboard');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">หน้าหลัก</span>
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveTab('analysis');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'analysis' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">วิเคราะห์</span>
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveTab('add');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'add' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">{editingTransaction ? 'แก้ไข' : 'บันทึก'}</span>
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveTab('history');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'history' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">ประวัติ</span>
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveTab('account');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
            activeTab === 'account' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">บัญชี</span>
        </button>
      </nav>
    </div>
  );
}
