import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;

      if (data.user) {
        // ⭐ 이메일뿐만 아니라 name: name 도 함께 저장하도록 추가되었습니다!
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, email: email, name: name, role: 'user' }]);
          
        if (profileError) throw profileError;
      }

      alert('🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
      
    } catch (error: any) {
      alert(`회원가입 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight mb-2">회원가입</h2>
          <p className="text-gray-500 text-sm">DUBI LEAGUE</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이름 (닉네임)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="홍길동" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">비밀번호 (6자리 이상)</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-400 hover:text-black">{showPassword ? '숨기기' : '보기'}</button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-4 disabled:bg-gray-400">
            {isLoading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          이미 계정이 있으신가요? <Link to="/login" className="text-black font-bold hover:underline">로그인</Link>
        </div>
      </div>
    </div>
  );
}