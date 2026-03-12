import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // ⭐ Supabase 추가
import type { TeamStanding, LeagueLeader } from '../types/baseball';

// 🚨 RECENT_MATCHES 더미 데이터는 삭제했습니다! (DB에서 직접 가져옵니다)

// 팀 순위와 리그 리더는 추후 DB 연결을 위해 일단 더미 데이터를 유지합니다.
const STANDINGS: TeamStanding[] = [
  { rank: 1, teamName: '22학번', wins: 5, losses: 2, draws: 1, winRate: '0.625' },
  { rank: 2, teamName: '23학번', wins: 4, losses: 3, draws: 1, winRate: '0.500' },
  { rank: 3, teamName: '24학번', wins: 3, losses: 3, draws: 2, winRate: '0.375' },
  { rank: 4, teamName: '25학번', wins: 2, losses: 6, draws: 0, winRate: '0.250' },
];

const LEADERS: LeagueLeader[] = [
  { category: 'OPS 1위', value: '1.370', playerName: '박지훈', teamName: '22학번' },
  { category: '안타 1위', value: 14, playerName: '박지훈', teamName: '22학번' },
  { category: 'ERA 1위', value: '3.00', playerName: '김민수', teamName: '22학번' },
  { category: '탈삼진 1위', value: 22, playerName: '김민수', teamName: '22학번' },
];

export const Home = () => {
  const [recentMatches, setRecentMatches] = useState<any[]>([]); // 최근 경기 목록
  const [standings, setStandings] = useState<any[]>([]); // 순위 데이터 

  // 최근 5 경기
  useEffect(() => {
    const fetchRecentMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, match_date, away_score, home_score, status, 
          away_team:teams!matches_away_team_id_fkey(id, name), 
          home_team:teams!matches_home_team_id_fkey(id, name)
        `)
        .order('match_date', { ascending: false })
        .limit(5); 
      if (data) setRecentMatches(data);
    };
    fetchRecentMatches();

    const fetchStandings = async () => {
      const { data: teamsData } = await supabase.from('teams').select('*');
      const { data: matchesData } = await supabase.from('matches').select('*').eq('status', 'finished');

      if (teamsData && matchesData) {
        const stats = teamsData.map(team => {
          let wins = 0, losses = 0, draws = 0;
          matchesData.forEach(match => {
            if (match.away_team_id === team.id || match.home_team_id === team.id) {
              const myScore = match.away_team_id === team.id ? match.away_score : match.home_score;
              const opScore = match.away_team_id === team.id ? match.home_score : match.away_score;
              if (myScore > opScore) wins++; else if (myScore < opScore) losses++; else draws++;
            }
          });
          const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) : 0;
          return { id: team.id, name: team.name, wins, losses, draws, winRateValue: winRate, winRate: winRate.toFixed(3) };
        });

        stats.sort((a, b) => b.winRateValue !== a.winRateValue ? b.winRateValue - a.winRateValue : b.wins - a.wins);
        setStandings(stats.map((s, i) => ({ ...s, rank: i + 1 })).slice(0, 4)); // 홈 화면에는 상위 4팀만 표시!
      }
    };
    fetchStandings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        
        {/* 최근 경기 섹션 */}
        <section className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">최근 경기</h2>
            <Link to="/matches" className="text-sm font-bold px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</Link>
          </div>
          
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex justify-between items-center p-5 border border-gray-50 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all group">
                <span className="text-gray-300 font-medium text-sm w-24">{match.match_date}</span>
                
                <div className="flex-1 flex justify-center items-center gap-6 text-lg font-bold">
                  {/* ⭐ 초공 팀 이름 누르면 해당 팀 페이지로 이동! */}
                  <Link to={`/team/${match.away_team?.id}`} className="w-20 text-right hover:text-[#104175] hover:underline cursor-pointer">
                    {match.away_team?.name}
                  </Link>
                  
                  <span className="text-gray-200 font-light text-xs italic">vs</span>
                  
                  {/* ⭐ 말공 팀 이름 누르면 해당 팀 페이지로 이동! */}
                  <Link to={`/team/${match.home_team?.id}`} className="w-20 text-left hover:text-[#104175] hover:underline cursor-pointer">
                    {match.home_team?.name}
                  </Link>
                </div>

                <span className="font-black text-xl w-24 text-right tabular-nums">
                  {match.status === 'finished' ? `${match.away_score} : ${match.home_score}` : '예정'}
                </span>
              </div>
            ))}
            
            {/* DB에 데이터가 하나도 없을 때 보여줄 문구 */}
            {recentMatches.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-sm">최근 경기 기록이 없습니다.</div>
            )}
          </div>
        </section>

        {/* 팀 순위 섹션 (이하 기존 코드 동일) */}
        <section className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">팀 순위</h2>
            <Link to="/standings" className="text-sm font-bold px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</Link>
          </div>
          <table className="w-full">
            <thead className="text-gray-400 text-xs font-bold uppercase border-b border-gray-50">
              <tr>
                <th className="pb-5 text-left">순위</th>
                <th className="pb-5 text-left">팀</th>
                <th className="pb-5">승</th>
                <th className="pb-5">패</th>
                <th className="pb-5">무</th>
                <th className="pb-5 text-right">승률</th>
              </tr>
            </thead>
            <tbody className="text-[15px]">
              {standings.map((row) => (
                <tr key={row.rank} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 font-black text-gray-400">{row.rank}</td>
                  <td className="py-5 font-bold text-lg">
                    {/* 홈 화면에서도 팀 이름 누르면 넘어가게 처리 */}
                    <Link to={`/team/${row.id}`} className="hover:text-[#104175] hover:underline transition-colors">
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-5 text-center font-medium">{row.wins}</td>
                  <td className="py-5 text-center font-medium">{row.losses}</td>
                  <td className="py-5 text-center font-medium">{row.draws}</td>
                  <td className="py-5 text-right font-black tabular-nums">{row.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* 리그 리더 섹션 (이하 기존 코드 동일) */}
      <section>
        <h2 className="text-2xl font-bold mb-8 tracking-tight px-2">리그 리더</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEADERS.map((leader, i) => (
            <div key={i} className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 hover:translate-y-[-4px] transition-transform duration-300">
              <span className="text-gray-400 text-[11px] font-black uppercase tracking-widest">{leader.category}</span>
              <div className="mt-6">
                <div className="text-4xl font-black tracking-tighter mb-2 tabular-nums">{leader.value}</div>
                <div className="text-[15px] text-gray-500 font-semibold leading-tight">
                  {leader.playerName} <span className="text-gray-300 font-normal ml-1">({leader.teamName})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};