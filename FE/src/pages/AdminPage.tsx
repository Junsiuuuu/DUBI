import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 및 팀 추가용 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    setIsLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("로그인이 필요합니다.");
      navigate('/');
      return;
    }

    const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    
    if (myProfile?.role !== 'admin') {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate('/');
      return;
    }

    // 유저 목록과 팀 목록 불러오기
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: teamsData } = await supabase.from('teams').select('*').order('name');

    if (profilesData) setProfiles(profilesData);
    if (teamsData) setTeams(teamsData);
    
    setIsLoading(false);
  };

  // 새로운 팀 추가 함수
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return alert("추가할 팀 이름을 입력하세요.");
    
    // 중복 검사
    if (teams.find(t => t.name === newTeamName.trim())) {
      return alert("이미 존재하는 팀 이름입니다.");
    }

    const { error } = await supabase.from('teams').insert([{ name: newTeamName.trim() }]);
    
    if (error) {
      alert("팀 추가 실패: " + error.message);
    } else {
      alert(`'${newTeamName}' 팀이 성공적으로 추가되었습니다!`);
      setNewTeamName('');
      checkAdminAndFetchData(); // 목록 새로고침
    }
  };

  // ⭐ 팀 삭제 함수 추가
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`정말로 '${teamName}' 팀을 삭제하시겠습니까?\n\n※ 주의: 해당 팀에 소속된 유저, 선수, 또는 경기 기록이 남아있다면 삭제가 취소될 수 있습니다.`)) {
      return;
    }

    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    
    if (error) {
      // 주로 데이터베이스 연결(Foreign Key Constraint) 오류일 때 뜹니다.
      alert(`삭제 실패!\n\n팀에 소속된 선수나 경기 기록, 팀장이 있는지 먼저 확인하고 해제해주세요.\n(오류메시지: ${error.message})`);
    } else {
      alert(`'${teamName}' 팀이 성공적으로 삭제되었습니다.`);
      checkAdminAndFetchData(); // 목록 새로고침
    }
  };

  // 권한 및 소속 팀 저장 함수
  const handleUpdateRole = async (userId: string, newRole: string, newTeamId: string | null) => {
    if (newRole === 'captain' && !newTeamId) {
      alert("팀장 권한을 주려면 반드시 소속 팀을 선택해야 합니다!");
      return;
    }

    const finalTeamId = newRole === 'captain' ? newTeamId : null;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, team_id: finalTeamId })
      .eq('id', userId);

    if (error) {
      alert("권한 변경에 실패했습니다: " + error.message);
    } else {
      alert("권한이 성공적으로 변경되었습니다!");
      checkAdminAndFetchData(); 
    }
  };

  // 검색어에 따른 유저 필터링
  const filteredProfiles = profiles.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = p.name && p.name.toLowerCase().includes(searchLower);
    const emailMatch = p.email && p.email.toLowerCase().includes(searchLower);
    return nameMatch || emailMatch;
  });

  if (isLoading) return <div className="text-center py-20 font-bold text-gray-500">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="max-w-[1100px] mx-auto bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-20 mt-10">
      
      <div className="mb-10 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-black text-[#104175]">⚙️ 관리자 설정 페이지</h1>
        <p className="text-gray-500 mt-2 font-medium">유저들의 권한과 팀장 소속을 관리하고 팀을 생성/삭제할 수 있습니다.</p>
      </div>

      {/* 1. 팀 관리 섹션 */}
      <section className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🏢 팀 관리</h2>
        
        <div className="flex gap-3 mb-6">
          <input 
            type="text" 
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            placeholder="새로운 팀 이름 입력 (예: 25학번)" 
            className="flex-1 max-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#104175]"
          />
          <button 
            onClick={handleAddTeam}
            className="bg-[#104175] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#081e36] transition-colors"
          >
            팀 추가하기
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-bold text-gray-500 py-1 mr-2">현재 등록된 팀:</span>
          {teams.map(t => (
            // ⭐ 팀 이름과 삭제 버튼(X)을 함께 묶은 UI
            <div key={t.id} className="group flex items-center bg-white border border-gray-300 text-gray-700 pl-3 pr-1 py-1 rounded-full text-sm font-bold shadow-sm">
              <span>{t.name}</span>
              <button 
                onClick={() => handleDeleteTeam(t.id, t.name)}
                className="ml-2 w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                title="팀 삭제"
              >
                ×
              </button>
            </div>
          ))}
          {teams.length === 0 && <span className="text-sm text-gray-400 py-1">등록된 팀이 없습니다.</span>}
        </div>
      </section>

      {/* 2. 유저 권한 관리 섹션 */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-800">👤 유저 권한 관리</h2>
          
          {/* 검색창 */}
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 이메일 검색..." 
              className="w-[250px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#104175] text-sm"
            />
            <span className="absolute right-3 top-2 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-center border-collapse text-sm">
            <thead className="bg-[#f1f3f5] text-[#495057] font-bold border-b border-[#dee2e6]">
              <tr>
                <th className="py-3 px-4 border-r border-gray-200">유저 정보</th>
                <th className="py-3 px-4 border-r border-gray-200 w-40">권한 부여</th>
                <th className="py-3 px-4 border-r border-gray-200 w-48">소속 팀 (팀장용)</th>
                <th className="py-3 px-4 w-28">저장</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <UserRow 
                  key={profile.id} 
                  profile={profile} 
                  teams={teams} 
                  onSave={handleUpdateRole} 
                />
              ))}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-gray-500 bg-gray-50">
                    {searchTerm ? "검색 결과가 없습니다." : "가입된 유저가 없습니다. (Supabase RLS 설정을 확인해주세요)"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// 개별 유저 행 컴포넌트
function UserRow({ profile, teams, onSave }: { profile: any, teams: any[], onSave: any }) {
  const [role, setRole] = useState(profile.role || 'user');
  const [teamId, setTeamId] = useState(profile.team_id || '');

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 border-r border-gray-100 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[#104175] font-black text-[15px]">{profile.name || '이름 미설정'}</span>
        </div>
        <div className="text-gray-500 font-medium mt-0.5">{profile.email}</div>
      </td>
      <td className="py-3 px-4 border-r border-gray-100">
        <select 
          className="w-full border border-gray-300 p-1.5 rounded font-bold text-gray-700 bg-white"
          value={role} 
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">일반 유저</option>
          <option value="captain">팀장</option>
          <option value="umpire">기록원/심판</option>
          <option value="admin">관리자</option>
        </select>
      </td>
      <td className="py-3 px-4 border-r border-gray-100">
        <select 
          className="w-full border border-gray-300 p-1.5 rounded font-medium bg-white disabled:bg-gray-100 disabled:text-gray-400"
          value={teamId} 
          onChange={(e) => setTeamId(e.target.value)}
          disabled={role !== 'captain'}
        >
          <option value="">소속 팀 선택</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </td>
      <td className="py-3 px-4">
        <button 
          onClick={() => onSave(profile.id, role, teamId)}
          className={`w-full py-1.5 rounded font-bold text-white transition-colors ${
            profile.role === role && profile.team_id === (teamId || null) 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-[#18361f] hover:bg-green-900 shadow-sm'
          }`}
          disabled={profile.role === role && profile.team_id === (teamId || null)}
        >
          저장
        </button>
      </td>
    </tr>
  );
}