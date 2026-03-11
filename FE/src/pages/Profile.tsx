import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setEmail(session.user.email || '');
      } else {
        navigate('/login'); // 로그인 안 되어있으면 튕겨냄
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <h1 className="text-3xl font-black mb-8 border-b pb-4">마이페이지</h1>
      
      <div className="space-y-6 mb-10">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">가입된 이메일</label>
          <div className="text-lg font-bold text-gray-900">{email}</div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">권한 상태</label>
          {/* 나중에 DB와 연동해서 '관리자', '심판' 등으로 바뀌게 됩니다 */}
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">일반 회원</span>
        </div>
      </div>

      <div className="flex gap-4 border-t pt-8">
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}