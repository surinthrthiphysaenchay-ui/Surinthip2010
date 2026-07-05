/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, signInWithPopup, signOut, googleProvider, auth, isIframe } from '../firebase';
import { 
  LogOut, 
  LogIn, 
  Database, 
  CloudCheck, 
  Smartphone, 
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface UserProfileProps {
  user: User | null;
  isDemo: boolean;
  onSetDemo: (isDemo: boolean) => void;
  onResetDemoData: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isDemo,
  onSetDemo,
  onResetDemoData
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onSetDemo(false); // Turn off demo mode if user successfully logs in
    } catch (e: any) {
      console.error("Google Sign-In Error:", e);
      if (e.code === 'auth/popup-blocked') {
        setErrorMsg('ป๊อปอัพเข้าสู่ระบบถูกบล็อกโดยเบราว์เซอร์ของคุณ กรุณาเปิดแอปในหน้าต่างใหม่หรืออนุญาตป๊อปอัพ');
      } else {
        setErrorMsg('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในพรีวิวเนื่องจากข้อจำกัดด้านความปลอดภัยของ iFrame กรุณาคลิก "เปิดแอปในหน้าต่างใหม่" หรือเลือกใช้งานใน "บัญชีทดลอง (ไม่ล็อกอิน)"');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign-Out Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemoClick = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตบัญชีทดลองเป็นข้อมูลตั้งต้น? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      onResetDemoData();
      alert('รีเซ็ตข้อมูลทดลองเรียบร้อยแล้ว');
    }
  };

  const isIframeActive = isIframe();
  const currentAppUrl = window.location.href;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">จัดการผู้ใช้งาน & บัญชี</h2>
        <p className="text-xs text-slate-500 font-medium font-sans">เลือกช่องทางการบันทึกและสลับสิทธิ์การเข้าถึงข้อมูลของคุณ</p>
      </div>

      {/* Auth State Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
        {/* State Banner */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            user ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
          }`}>
            <Database size={20} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">แหล่งจัดเก็บข้อมูลปัจจุบัน</span>
            <h4 className="text-sm font-bold text-slate-700">
              {isDemo ? '💾 บัญชีทดลอง (เก็บบนมือถือ/บราวเซอร์)' : '☁️ ระบบคลาวด์ Firestore (โครงการ Surinthip2010)'}
            </h4>
          </div>
        </div>

        {user ? (
          /* Logged In view */
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center ring-2 ring-slate-100 text-slate-500 shrink-0">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="space-y-0.5 truncate">
                <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || 'ผู้ใช้นามแฝง'}</p>
                <p className="text-xs text-slate-400 font-semibold truncate font-mono">{user.email}</p>
              </div>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-bold text-emerald-800">✅ ซิงค์กับระบบคลาวด์เรียบร้อย!</p>
              <p className="text-slate-500 font-medium leading-relaxed">
                ข้อมูลของคุณถูกจัดเก็บอย่างสมบูรณ์แบบถาวรบนโครงการ Firebase ของ **Surinthip2010** คุณสามารถล็อกอินด้วยอีเมลนี้บนเบราว์เซอร์หรือมือถือเครื่องอื่นเพื่อซิงค์ข้อมูลได้ทันที
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-2xl transition disabled:opacity-50"
            >
              <LogOut size={16} />
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          </div>
        ) : (
          /* Guest/Logged Out view */
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">
                ขณะนี้คุณกำลังใช้งาน <span className="text-orange-500 font-bold">บัญชีทดลอง (ไม่ล็อกอิน)</span> 
              </p>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                ข้อมูลการทำรายการทั้งหมดของคุณจะถูกบันทึกอยู่ในหน่วยความจำของเครื่อง (Local Storage) หากคุณล้างแคชบราวเซอร์หรือเปลี่ยนเครื่องข้อมูลจะหายไป เพื่อการจัดเก็บข้อมูลระยะยาวที่มีความปลอดภัยสูง โปรดเชื่อมโยงบัญชี Google ของคุณ!
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-2xl p-3.5 font-medium leading-relaxed">
                <p className="font-bold mb-1">เกิดข้อจำกัดในการเชื่อมต่อ ⚠️</p>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-5 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 1.127 15.427 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"/>
                  </svg>
                )}
                <span>ล็อกอินและซิงค์ด้วย Google</span>
              </button>

              {/* Demo Mode Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleResetDemoClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-100 hover:border-slate-200 text-xs font-bold text-slate-500 bg-slate-50 rounded-xl transition"
                >
                  <RotateCcw size={13} />
                  <span>รีเซ็ตข้อมูลทดลอง</span>
                </button>
                {isDemo && user && (
                  <button
                    onClick={() => onSetDemo(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl transition"
                  >
                    <Sparkles size={13} />
                    <span>กลับไปบัญชีคลาวด์</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frame Guidance helper for Sandbox preview limits */}
      {isIframeActive && !user && (
        <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-3xl p-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800">แนะนำการเข้าสู่ระบบกรณีพบปัญหา iFrame</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                เบราว์เซอร์ของคุณอาจบล็อกป๊อปอัพยืนยันตัวตนของ Google เนื่องจากเว็บถูกรันภายในกล่องเฟรม (iFrame) ใน AI Studio หากคุณพบล็อกอินไม่ได้ โปรดกดเปิดแอปแยกในแท็บใหม่เพื่อดำเนินการอย่างเสร็จสมบูรณ์!
              </p>
            </div>
          </div>

          <a 
            href={currentAppUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 border border-indigo-100 hover:bg-indigo-50 text-xs font-bold text-indigo-600 rounded-xl transition bg-white shadow-xs"
          >
            <span>เปิดแอปในหน้าต่างใหม่</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Mobile Design Credit Banner */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-2">
        <Smartphone className="w-6 h-6 text-slate-400" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-700">ดีไซน์ที่รองรับการใช้งานบนมือถือเป็นอันดับแรก</p>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            อินเตอร์เฟสถูกพัฒนาด้วยระบบ Mobile Tab-Navigation สามารถปัด สัมผัสปุ่มหมวดหมู่ หรือกรอกตัวเลขเงินฝากได้อย่างสะดวกสบายบนหน้าจอมือถือทุกขนาด
          </p>
        </div>
      </div>
    </div>
  );
};
