import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase'; // 경로는 프로젝트에 맞게 확인해주세요!

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

    const { data: playerData } = await supabase
      .from('players')
      .select('team:teams(logo_url)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (playerData?.team) {
      // @ts-ignore
      setTeamLogo(playerData.team.logo_url);
    } else if (profile?.team_id) {
      const { data: teamData } = await supabase.from('teams').select('logo_url').eq('id', profile.team_id).maybeSingle();
      if (teamData?.logo_url) setTeamLogo(teamData.logo_url);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* ⭐ 모바일에서는 위아래로 배치(flex-col), PC에서는 양옆으로(md:flex-row) */}
      <header className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 py-3 md:py-5 bg-white border-b border-gray-100 gap-3 md:gap-0">
        
        {/* 로고 영역 */}
        <Link to="/" className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity w-full md:w-auto justify-center md:justify-start">
          <div className="bg-black text-white px-3 py-1 rounded-full font-black text-lg md:text-xl tracking-tighter shrink-0">DUBI</div>
          {/* ⭐ 모바일에서는 부제목을 숨겨서 공간 확보 (hidden md:block) */}
          <span className="text-gray-400 text-xs font-medium hidden sm:block">대전 대학 야구 인비테이셔널</span>
        </Link>

        {/* 네비게이션 메뉴 영역 */}
        {/* ⭐ 글자가 세로로 깨지지 않게 묶어주고(whitespace-nowrap), 공간이 모자라면 가로 스크롤 허용(overflow-x-auto) */}
        <nav className="flex items-center gap-4 md:gap-10 text-[13px] md:text-[15px] font-semibold text-gray-500 w-full md:w-auto justify-center md:justify-end overflow-x-auto whitespace-nowrap pb-1 md:pb-0 no-scrollbar">
          <Link to="/matches" className="hover:text-black transition-colors shrink-0">경기 목록</Link>
          <Link to="/standings" className="hover:text-black transition-colors shrink-0">순위표</Link>
          <Link to="/stats" className="hover:text-black transition-colors shrink-0">선수 기록</Link>
          
          {session ? (
            <Link to="/profile" className="ml-1 md:ml-4 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 text-black border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all shrink-0">
              {teamLogo ? (
                <img src={teamLogo} alt="팀 로고" className="w-6 h-6 rounded-full object-cover border border-gray-200 bg-white shrink-0" />
              ) : (
                <div className="w-6 h-6 bg-[#104175] text-white rounded-full flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                  {userName.charAt(0)}
                </div>
              )}
              {userName} 님
            </Link>
          ) : (
            <Link to="/login" className="ml-1 md:ml-4 px-4 md:px-6 py-1.5 md:py-2 border border-gray-200 rounded-xl font-bold text-black hover:bg-gray-50 transition-all shrink-0">
              로그인
            </Link>
          )}
        </nav>
      </header>

      {/* ⭐ 메인 콘텐츠 영역도 모바일 여백(px-4)과 PC 여백(md:px-8)을 분리 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-12 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}