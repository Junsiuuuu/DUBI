import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function TeamPage() {
  const { id } = useParams<{ id: string }>(); // URL의 팀 ID
  const [teamName, setTeamName] = useState('로딩 중...');
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [stats, setStats] = useState({ total: 0, win: 0, draw: 0, loss: 0, rate: '0.0' });

  // 권한 관리를 위한 State
  const [userRole, setUserRole] = useState('user');
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
    checkUserRole();
  }, [id]);

  // 1. 유저의 권한(role)과 소속 팀(team_id)을 모두 가져옵니다.
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

  // 현재 페이지의 선수를 수정할 수 있는 권한인지 확인합니다.
  const canEditPlayers = 
    userRole === 'admin' || 
    userRole === 'umpire' || 
    (userRole === 'captain' && userTeamId === id);

  const fetchTeamData = async () => {
    if (!id) return;
    const { data: teamData } = await supabase.from('teams').select('name').eq('id', id).single();
    if (teamData) setTeamName(teamData.name);

    const { data: playersData } = await supabase.from('players').select('*').eq('team_id', id).order('name');
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

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return alert("선수 이름을 입력하세요.");
    const { error } = await supabase.from('players').insert([{ team_id: id, name: newPlayerName }]);
    if (!error) { setNewPlayerName(''); fetchTeamData(); }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`${playerName} 선수를 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (!error) fetchTeamData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* 통계 카드 부분은 화면이 길어져 생략 없이 그대로 둡니다 */}
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[#104175] border-b-2 border-[#104175] pb-4 mb-6">{teamName}</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-around text-center">
          {/* ... 기존 통계 UI 동일 ... */}
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">총 경기</span><span className="text-3xl font-black text-[#104175]">{stats.total}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">승</span><span className="text-3xl font-black text-[#2d6d3c]">{stats.win}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">무</span><span className="text-3xl font-black text-[#104175]">{stats.draw}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">패</span><span className="text-3xl font-black text-[#802a33]">{stats.loss}</span></div>
          <div className="flex flex-col gap-2"><span className="text-sm font-bold text-gray-500">승률</span><span className="text-3xl font-black text-[#104175]">{stats.rate}%</span></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <section className="w-full lg:w-[320px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
          <h3 className="text-xl font-bold mb-6">👥 선수 명단</h3>
          
          {/* ⭐ 권한이 있는 사람에게만 추가 폼 노출 */}
          {canEditPlayers && (
            <div className="flex gap-2 mb-6">
              <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="선수 이름" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#104175]" />
              <button onClick={handleAddPlayer} className="px-4 py-2 bg-[#18361f] text-white font-bold rounded-lg hover:bg-green-900 transition-colors whitespace-nowrap">추가</button>
            </div>
          )}

          <ul className="space-y-0">
            {players.map(player => (
              <li key={player.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <span className="font-bold text-gray-800">{player.name}</span>
                {/* ⭐ 권한이 있는 사람에게만 삭제 버튼 노출 */}
                {canEditPlayers && (
                  <button onClick={() => handleDeletePlayer(player.id, player.name)} className="px-3 py-1 text-xs font-bold bg-[#dc3545] text-white rounded hover:bg-red-700 transition-colors">삭제</button>
                )}
              </li>
            ))}
            {players.length === 0 && <li className="text-center text-gray-400 py-4 text-sm">등록된 선수가 없습니다.</li>}
          </ul>
        </section>

        {/* ... 우측 경기 기록 섹션 동일 (생략 없이 원본 유지) ... */}
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
                  const opponent = isAway ? match.home_team.name : match.away_team.name;
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
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}