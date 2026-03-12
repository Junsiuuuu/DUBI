import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 이메일로 비밀번호 재설정 링크를 보냅니다. 
      // redirectTo: 메일의 링크를 클릭했을 때 돌아올 우리 사이트 주소
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setIsSent(true);

    } catch (error: any) {
      alert(`메일 발송 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight mb-2">비밀번호 찾기</h2>
          <p className="text-gray-500 text-sm">가입하신 이메일로 재설정 링크를 보내드립니다.</p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl font-bold">
              ✅ 이메일이 발송되었습니다!<br/>메일함을 확인해주세요.
            </div>
            <Link to="/login" className="block w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">이메일</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="example@email.com"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:bg-gray-400"
            >
              {isLoading ? '발송 중...' : '재설정 링크 받기'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-black">
                뒤로 가기
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}