import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>('사용자'); 
  const [teamLogo, setTeamLogo] = useState<string | null>(null); 

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

  const fetchAndSetProfile = async (user: any) => {
    // 1. 프로필 및 이름 정보 세팅
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

    let currentName = fallbackName;
    if (!profile) {
      await supabase.from('profiles').insert([{ id: user.id, email: user.email, name: fallbackName, role: 'user' }]);
    } else if (!profile.name) {
      await supabase.from('profiles').update({ name: fallbackName }).eq('id', user.id);
    } else {
      currentName = profile.name;
    }
    setUserName(currentName);

    // 2. 소속 팀 로고 가져오기 (players 연동 혹은 captain 관리팀 기준)
    const { data: playerData } = await supabase
      .from('players')
      .select('team:teams(logo_url)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (playerData?.team) {
      // @ts-ignore
      setTeamLogo(playerData.team.logo_url);
    } else if (profile?.team_id) {
      // 일반 선수가 아니라 팀장(Captain) 권한만 가지고 있는 경우
      const { data: teamData } = await supabase.from('teams').select('logo_url').eq('id', profile.team_id).maybeSingle();
      if (teamData?.logo_url) setTeamLogo(teamData.logo_url);
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
              {/* 로고가 있으면 사진을 띄우고, 없으면 기존처럼 첫 글자를 띄움 */}
              {teamLogo ? (
                <img src={teamLogo} alt="팀 로고" className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-white" />
              ) : (
                <div className="w-7 h-7 bg-[#104175] text-white rounded-full flex items-center justify-center text-xs font-black uppercase">
                  {userName.charAt(0)}
                </div>
              )}
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