import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>('사용자'); // 헤더에 띄울 이름

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchAndSetProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchAndSetProfile(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⭐ 유저 프로필 정보를 가져오고, 없으면 구글 정보로 자동 생성하는 함수
  const fetchAndSetProfile = async (user: any) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

    // 구글 계정에 이름이 있으면 가져오고, 없으면 이메일 앞자리를 씁니다.
    const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

    if (!data) {
      // DB에 프로필이 아예 없는 경우 (구글 최초 로그인) -> 자동 생성
      await supabase.from('profiles').insert([{ id: user.id, email: user.email, name: fallbackName, role: 'user' }]);
      setUserName(fallbackName);
    } else if (!data.name) {
      // 프로필은 있는데 아까 만들어서 이름이 비어있는 경우 (기존 가입자) -> 이름 채워넣기
      await supabase.from('profiles').update({ name: fallbackName }).eq('id', user.id);
      setUserName(fallbackName);
    } else {
      // 정상적으로 이름이 있는 경우
      setUserName(data.name);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      <header className="flex justify-between items-center px-12 py-5 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="bg-black text-white px-3 py-1 rounded-full font-black text-xl tracking-tighter">DUBI</div>
          <span className="text-gray-400 text-xs font-medium">대전 대학 야구 인비테이셔널</span>
        </Link>

        <nav className="flex items-center gap-10 text-[15px] font-semibold text-gray-500">
          <Link to="/matches" className="hover:text-black transition-colors">경기 목록</Link>
          <Link to="/standings" className="hover:text-black transition-colors">순위표</Link>
          <Link to="/stats" className="hover:text-black transition-colors">선수 기록</Link>
          
          {session ? (
            <Link to="/profile" className="ml-4 flex items-center gap-2 px-4 py-2 bg-gray-50 text-black border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all">
              <div className="w-7 h-7 bg-[#104175] text-white rounded-full flex items-center justify-center text-xs font-black uppercase">
                {userName.charAt(0)}
              </div>
              {userName} 님
            </Link>
          ) : (
            <Link to="/login" className="ml-4 px-6 py-2 border border-gray-200 rounded-xl font-bold text-black hover:bg-gray-50 transition-all">
              로그인
            </Link>
          )}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <Outlet />
      </main>
    </div>
  );
}