import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 Supabase 로그인 연동
    alert('로그인 시도: ' + email);
    navigate('/'); 
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight mb-2">로그인</h2>
          <p className="text-gray-500 text-sm">DUBI 리그의 모든 기록을 확인해보세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="••••••••"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-400 hover:text-black"
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-4"
          >
            로그인
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          계정이 없으신가요? <Link to="/signup" className="text-black font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}