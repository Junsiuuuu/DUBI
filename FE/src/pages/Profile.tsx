import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [teamId, setTeamId] = useState<string | null>(null);
  
  const [linkedPlayer, setLinkedPlayer] = useState<{ id: string, name: string } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }

    let currentTeamName = '';
    let currentTeamId = null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileData) {
      setProfile({ ...profileData, email: session.user.email });
      setEditNameValue(profileData.name || '');
      
      if (profileData.team_id) {
        const { data: teamData } = await supabase.from('teams').select('id, name').eq('id', profileData.team_id).single();
        if (teamData) {
          currentTeamName = teamData.name;
          currentTeamId = teamData.id;
        }
      }
    }

    const { data: playerData } = await supabase
      .from('players')
      .select('id, name, team:teams(id, name)') 
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (playerData) {
      setLinkedPlayer({ id: playerData.id, name: playerData.name });
      if (!currentTeamName && playerData.team) {
        // @ts-ignore
        currentTeamName = playerData.team.name;
        // @ts-ignore
        currentTeamId = playerData.team.id;
      }
    }

    setTeamName(currentTeamName);
    setTeamId(currentTeamId);
    setIsLoading(false);
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return alert("이름을 입력해주세요.");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name: editNameValue })
      .eq('id', session.user.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, name: editNameValue }));
      setIsEditingName(false);
      alert("이름이 성공적으로 변경되었습니다.");
    } else {
      alert("이름 변경에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    if(!window.confirm("로그아웃 하시겠습니까?")) return;
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) return <div className="text-center py-20 font-bold text-gray-500">내 정보를 불러오는 중입니다...</div>;
  if (!profile) return null;

  const roleMap: Record<string, string> = {
    admin: '👑 관리자',
    umpire: '📝 기록원 / 심판',
    captain: '🧢 팀장',
    user: '👤 일반 유저'
  };

  return (
    <div className="max-w-[600px] mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 mt-10">
      <h1 className="text-3xl font-black text-[#104175] mb-8 border-b border-gray-100 pb-4">마이페이지</h1>
      
      <div className="space-y-6 text-[15px]">
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="font-bold text-gray-500">이메일</span>
          <span className="font-bold text-gray-800">{profile.email}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="font-bold text-gray-500">이름</span>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={editNameValue} 
                onChange={(e) => setEditNameValue(e.target.value)} 
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm outline-none focus:border-[#104175]"
                placeholder="이름을 입력하세요"
              />
              <button onClick={handleSaveName} className="text-xs bg-[#104175] text-white px-3 py-1.5 font-bold rounded-lg hover:bg-[#0d3560]">저장</button>
              <button onClick={() => setIsEditingName(false)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 font-bold rounded-lg hover:bg-gray-300">취소</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">{profile.name || '이름 미설정'}</span>
              <button onClick={() => setIsEditingName(true)} className="text-[13px] text-gray-400 hover:text-[#104175] underline font-bold">수정</button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="font-bold text-gray-500">권한 상태</span>
          <span className="font-black text-[#104175] text-base">{roleMap[profile.role || 'user']}</span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="font-bold text-gray-500">소속 팀</span>
          <span className="font-bold text-[#18361f]">
            {teamId ? (
              <Link to={`/team/${teamId}`} className="hover:text-[#104175] hover:underline transition-colors">
                {teamName}
              </Link>
            ) : (
              teamName || '팀 미배정'
            )}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="font-bold text-gray-500">내 기록</span>
          {linkedPlayer ? (
            <Link 
              to={`/player/${linkedPlayer.id}`} 
              className="font-bold text-[#104175] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-[#104175] hover:text-white transition-colors flex items-center gap-1"
            >
              📊 내 기록 보기
            </Link>
          ) : (
            <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">연동된 선수 정보 없음</span>
          )}
        </div>
      </div>

      {profile.role === 'admin' && (
        <div className="mt-10 p-6 bg-[#f8f9fa] rounded-2xl border border-[#dee2e6] text-center">
          <p className="text-xs text-gray-500 font-bold mb-3">관리자 전용 메뉴</p>
          <Link 
            to="/admin" 
            className="block w-full py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#104175] transition-colors shadow-sm"
          >
            ⚙️ 관리자 설정 페이지로 이동
          </Link>
        </div>
      )}

      <div className="mt-10 flex justify-end gap-3">
         <button onClick={handleLogout} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors">
           로그아웃
         </button>
      </div>
    </div>
  );
}