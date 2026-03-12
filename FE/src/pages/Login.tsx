import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/'); 
    } catch (error: any) {
      alert(`로그인 실패: 이메일이나 비밀번호를 확인해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그인 함수
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // 로그인 후 원래 화면으로 돌아오기
      }
    });
    if (error) alert('구글 로그인 연동 에러가 발생했습니다.');
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight mb-2">로그인</h2>
          <p className="text-gray-500 text-sm">DUBI LEAGUE</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* 이메일, 비밀번호 입력창 (기존과 동일) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-400 hover:text-black">{showPassword ? '숨기기' : '보기'}</button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-4 disabled:bg-gray-400">
            {isLoading ? '로그인 중...' : '이메일로 로그인'}
          </button>
        </form>

        {/* 구글 로그인 버튼 (구분선 포함) */}
        <div className="mt-6 flex items-center justify-between">
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-400 uppercase font-bold">또는</span>
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
        </div>
        <button 
          onClick={handleGoogleLogin} 
          className="w-full mt-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          구글로 시작하기
        </button>

        <div className="mt-8 text-center text-sm text-gray-500 flex flex-col gap-3">
          <span>
            계정이 없으신가요? <Link to="/signup" className="text-black font-bold hover:underline">회원가입</Link>
          </span>
          <span>
            비밀번호를 잊으셨나요? <Link to="/reset-password" className="text-black font-bold hover:underline">비밀번호 찾기</Link>
          </span>
        </div>
      </div>
    </div>
  );
}