import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setEmail(session.user.email || '');
        setUserId(session.user.id);
        
        // DB에서 최신 내 정보 가져오기
        const { data } = await supabase.from('profiles').select('name, role').eq('id', session.user.id).single();
        if (data) {
          setName(data.name || session.user.email?.split('@')[0] || '');
          setRole(data.role);
        }
      } else {
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);

  // ⭐ 이름 수정(업데이트) 함수
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('profiles').update({ name: name }).eq('id', userId);
    setIsUpdating(false);

    if (error) {
      alert('프로필 수정 중 오류가 발생했습니다.');
    } else {
      alert('프로필이 성공적으로 수정되었습니다!');
      window.location.reload(); // 헤더 이름 업데이트를 위해 강제 새로고침
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <h1 className="text-3xl font-black mb-8 border-b pb-4">마이페이지</h1>
      
      <div className="space-y-6 mb-10">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">가입된 이메일</label>
          <div className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{email}</div>
        </div>

        {/* 이름 수정 영역 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">이름 (닉네임)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#104175] font-bold"
            />
            <button 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="px-6 py-3 bg-[#104175] text-white font-bold rounded-xl hover:bg-[#0c3158] transition-colors"
            >
              {isUpdating ? '저장 중...' : '변경 저장'}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">권한 상태</label>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
            {role === 'admin' ? '최고 관리자' : role === 'umpire' ? '심판/기록원' : '일반 회원'}
          </span>
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