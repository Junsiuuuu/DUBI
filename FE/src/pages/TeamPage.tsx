import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function TeamPage() {
  const { id } = useParams<{ id: string }>(); 
  const [teamName, setTeamName] = useState('로딩 중...');
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, win: 0, draw: 0, loss: 0, rate: '0.0' });

  const [userRole, setUserRole] = useState('user');
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchTeamData();
    checkUserRole();
  }, [id]);

  useEffect(() => {
    const searchUsers = async () => {
      if (newPlayerName.trim().length < 1) {
        setUserSearchResults([]);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .ilike('name', `%${newPlayerName}%`)
        .limit(5);

      if (data) setUserSearchResults(data);
    };

    const timerId = setTimeout(() => searchUsers(), 200);
    return () => clearTimeout(timerId);
  }, [newPlayerName]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role, team_id').eq('id', session.user.id).single();
      if (data) {
        setUserRole(data.role);
        setUserTeamId(data.team_id);
      }
    }
  };

  const canEditPlayers = 
    userRole === 'admin' || 
    userRole === 'umpire' || 
    (userRole === 'captain' && userTeamId === id);

  const fetchTeamData = async () => {
    if (!id) return;
    const { data: teamData } = await supabase.from('teams').select('name').eq('id', id).single();
    if (teamData) setTeamName(teamData.name);

    const { data: playersData } = await supabase
      .from('players')
      .select('*, profiles(email)')
      .eq('team_id', id)
      .order('name');
    if (playersData) setPlayers(playersData);

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*, away_team:teams!matches_away_team_id_fkey(name), home_team:teams!matches_home_team_id_fkey(name)')
      .or(`away_team_id.eq.${id},home_team_id.eq.${id}`)
      .order('match_date', { ascending: false });

    if (matchesData) {
      setMatches(matchesData);
      calculateStats(matchesData, id);
    }
  };

  const calculateStats = (matchList: any[], teamId: string) => {
    let total = 0, win = 0, draw = 0, loss = 0;
    matchList.forEach(m => {
      if (m.away_score === 0 && m.home_score === 0 && m.status !== 'finished') return;
      total++;
      const isAway = m.away_team_id === teamId;
      const myScore = isAway ? m.away_score : m.home_score;
      const opScore = isAway ? m.home_score : m.away_score;
      if (myScore > opScore) win++; else if (myScore < opScore) loss++; else draw++;
    });
    const rate = total > 0 ? ((win / (total - draw)) * 100).toFixed(1) : '0.0';
    setStats({ total, win, draw, loss, rate });
  };

  // 팀 중복 방지
  const submitPlayer = async (name: string, userId: string | null) => {
    if (!name.trim()) return alert("선수 이름을 입력하세요.");
    
    // 회원 계정 연동
    if (userId) {
      // players 테이블을 뒤져서 이 계정이 이미 다른 팀에 등록되어 있는지 확인합니다.
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('team:teams(name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingPlayer) {
        // @ts-ignore
        const currentTeam = existingPlayer.team?.name || '다른 팀';
        return alert(`추가 실패!\n해당 회원은 이미 [${currentTeam}]에 소속되어 있습니다.`);
      }
    }

    const payload: any = { team_id: id, name: name.trim() };
    if (userId) payload.user_id = userId;

    const { error } = await supabase.from('players').insert([payload]);
    
    if (!error) { 
      setNewPlayerName(''); 
      setShowDropdown(false);
      fetchTeamData(); 
    } else {
      alert("추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`${playerName} 선수를 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (!error) fetchTeamData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* 타이틀 및 통계 카드 */}
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[#104175] border-b-2 border-[#104175] pb-4 mb-6">{teamName}</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-around text-center">
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">총 경기</span><span className="text-3xl font-black text-[#104175]">{stats.total}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">승</span><span className="text-3xl font-black text-[#2d6d3c]">{stats.win}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">무</span><span className="text-3xl font-black text-[#104175]">{stats.draw}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">패</span><span className="text-3xl font-black text-[#802a33]">{stats.loss}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">승률</span><span className="text-3xl font-black text-[#104175]">{stats.rate}%</span></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start mb-20">
        
        {/* 선수 명단 영역 */}
        <section className="w-full lg:w-[380px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
          <h3 className="text-xl font-bold mb-6">👥 선수 명단</h3>
          
          {canEditPlayers && (
            <div className="relative mb-6">
              <div className="flex gap-2 relative z-20">
                <input 
                  type="text" 
                  value={newPlayerName} 
                  onChange={(e) => {
                    setNewPlayerName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="선수 검색 또는 직접 입력" 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#104175] text-[15px]" 
                />
                <button 
                  onClick={() => submitPlayer(newPlayerName, null)} 
                  className="px-4 py-2 bg-[#18361f] text-white font-bold rounded-lg hover:bg-green-900 transition-colors whitespace-nowrap"
                >
                  추가
                </button>
              </div>

              {showDropdown && newPlayerName.trim().length > 0 && (
                <div className="absolute top-[42px] left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-30 overflow-hidden">
                  <div 
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center justify-between transition-colors"
                    onMouseDown={(e) => { e.preventDefault(); submitPlayer(newPlayerName, null); }}
                  >
                    <span className="font-bold text-gray-800">{newPlayerName}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-bold">일반 이름 등록</span>
                  </div>

                  {userSearchResults.map(user => (
                    <div 
                      key={user.id}
                      className="px-4 py-3 hover:bg-[#f0f4f8] cursor-pointer border-b border-gray-100 last:border-0 flex flex-col gap-1 transition-colors"
                      onMouseDown={(e) => { e.preventDefault(); submitPlayer(user.name || newPlayerName, user.id); }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#104175]">{user.name || '이름 미설정'}</span>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">🔗 회원 연결</span>
                      </div>
                      <span className="text-[13px] text-gray-400 font-medium">{user.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 명단 리스트 */}
          <ul className="space-y-0">
            {players.map(player => (
              <li key={player.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <Link to={`/player/${player.id}`} className="font-bold text-gray-800 hover:text-[#104175] hover:underline transition-colors text-[15px]">
                    {player.name}
                  </Link>
                  {player.user_id && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-tighter" title="회원 연동됨">LINK</span>
                  )}
                </div>
                
                {canEditPlayers && (
                  <button onClick={() => handleDeletePlayer(player.id, player.name)} className="px-3 py-1 text-xs font-bold bg-[#dc3545] text-white rounded hover:bg-red-700 transition-colors">삭제</button>
                )}
              </li>
            ))}
            {players.length === 0 && <li className="text-center text-gray-400 py-4 text-sm">등록된 선수가 없습니다.</li>}
          </ul>
        </section>

        {/* 경기 기록 영역 */}
        <section className="flex-1 w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">🏟️ 경기 기록</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#f1f3f5] text-[#495057] text-sm font-bold border-y border-[#dee2e6]">
                <tr><th className="py-3">날짜</th><th className="py-3">상대팀</th><th className="py-3">결과</th><th className="py-3">기록</th></tr>
              </thead>
              <tbody className="text-[15px]">
                {matches.map(match => {
                  const isAway = match.away_team_id === id;
                  const opponent = isAway ? match.home_team?.name : match.away_team?.name;
                  const myScore = isAway ? match.away_score : match.home_score;
                  const opScore = isAway ? match.home_score : match.away_score;
                  let resultText = "미입력", resultColor = "text-gray-500";
                  if (match.status === 'finished' || (match.away_score > 0 || match.home_score > 0)) {
                    if (myScore > opScore) { resultText = `승 (${myScore}:${opScore})`; resultColor = "text-[#2d6d3c] font-black"; }
                    else if (myScore < opScore) { resultText = `패 (${myScore}:${opScore})`; resultColor = "text-[#802a33] font-black"; }
                    else { resultText = `무 (${myScore}:${opScore})`; resultColor = "text-gray-800 font-bold"; }
                  }
                  return (
                    <tr key={match.id} className="border-b border-[#eee] hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-500">{match.match_date}</td>
                      <td className="py-4 font-bold">{opponent}</td>
                      <td className={`py-4 ${resultColor}`}>{resultText}</td>
                      <td className="py-4"><Link to={`/record/${match.id}`} className="px-4 py-2 bg-[#104175] text-white text-xs font-bold rounded-lg hover:bg-[#081e36] inline-block">기록 보기</Link></td>
                    </tr>
                  );
                })}
                {matches.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-gray-400 text-sm">진행된 경기가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}