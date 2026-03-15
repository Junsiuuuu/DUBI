import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Home = () => {
  const navigate = useNavigate(); 
  
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]); 

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

    const fetchStatsAndLeaders = async () => {
      const { data: teamsData } = await supabase.from('teams').select('*');
      const { data: playersData } = await supabase.from('players').select('*');
      const { data: matchesData } = await supabase.from('matches').select('*').eq('status', 'finished');

      if (!teamsData || !matchesData || !playersData) return;

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
      setStandings(stats.map((s, i) => ({ ...s, rank: i + 1 })).slice(0, 4));

      const teamGames: Record<string, number> = {};
      matchesData.forEach(m => {
         teamGames[m.away_team_id] = (teamGames[m.away_team_id] || 0) + 1;
         teamGames[m.home_team_id] = (teamGames[m.home_team_id] || 0) + 1;
      });

      const bMap: Record<string, any> = {};
      const pMap: Record<string, any> = {};

      playersData.forEach(p => {
         const tName = teamsData.find(t => t.id === p.team_id)?.name || '';
         const key = `${p.name.trim()}_${p.team_id}`;
         bMap[key] = { id: p.id, name: p.name, team_id: p.team_id, teamName: tName, pa: 0, ab: 0, hits: 0, ob: 0, tb: 0 };
         pMap[key] = { id: p.id, name: p.name, team_id: p.team_id, teamName: tName, outs: 0, er: 0, k: 0 };
      });

      matchesData.forEach(match => {
          const record = match.record_data;
          if (!record) return;

          const processBatters = (batters: any[], teamId: string) => {
              batters.forEach(b => {
                  if (!b.name) return;
                  const key = `${b.name.trim()}_${teamId}`;
                  if (!bMap[key]) return;

                  let pa = 0, ab = 0, hits = 0, ob = 0, tb = 0;
                  (b.outcomes || []).forEach((inningStr: string) => {
                      if (!inningStr) return;
                      const codes = inningStr.split(',').map((c: string) => c.trim()).filter(Boolean);
                      if (codes.length > 0) pa++;
                      codes.forEach((code: string) => {
                          const m = code.match(/(\d+)$/) || code.match(/^(\d+)/);
                          if (m) {
                              const d = parseInt(m[1].slice(-1));
                              if ([0, 1, 2, 3, 4, 5, 6, 9].includes(d)) ab++;
                              if ([1, 2, 3, 4].includes(d)) hits++;
                              if ([1, 2, 3, 4, 7].includes(d)) ob++;
                              if (d === 1) tb += 1;
                              if (d === 2) tb += 2;
                              if (d === 3) tb += 3;
                              if (d === 4) tb += 4;
                          }
                      });
                  });
                  bMap[key].pa += pa; bMap[key].ab += ab; bMap[key].hits += hits; bMap[key].ob += ob; bMap[key].tb += tb;
              });
          };
          processBatters(record.away_batters || [], match.away_team_id);
          processBatters(record.home_batters || [], match.home_team_id);

          const processPitchers = (pitchers: any[], teamId: string) => {
              pitchers.forEach(p => {
                  if (!p.name) return;
                  const key = `${p.name.trim()}_${teamId}`;
                  if (!pMap[key]) return;

                  const inn = Number(p.innings) || 0;
                  const full = Math.floor(inn);
                  const partial = Math.round((inn - full) * 10);
                  const outs = full * 3 + partial;

                  pMap[key].outs += outs;
                  pMap[key].er += (Number(p.ER) || 0);
                  pMap[key].k += (Number(p.K) || 0);
              });
          };
          processPitchers(record.away_pitchers || [], match.away_team_id);
          processPitchers(record.home_pitchers || [], match.home_team_id);
      });

      let maxOps = { val: 0, player: null as any };
      let maxHits = { val: 0, player: null as any };
      Object.values(bMap).forEach(b => {
          const reqPa = (teamGames[b.team_id] || 0) * 2;
          if (b.pa >= reqPa && reqPa > 0) {
              const obp = b.pa > 0 ? b.ob / b.pa : 0;
              const slg = b.ab > 0 ? b.tb / b.ab : 0;
              const ops = obp + slg;
              if (ops > maxOps.val) maxOps = { val: ops, player: b };
          }
          if (b.hits > maxHits.val) maxHits = { val: b.hits, player: b };
      });

      let minEra = { val: 99.99, player: null as any };
      let maxK = { val: 0, player: null as any };
      Object.values(pMap).forEach(p => {
          const reqOuts = (teamGames[p.team_id] || 0) * 3;
          if (p.outs >= reqOuts && reqOuts > 0) {
              const era = p.outs > 0 ? (p.er * 27) / p.outs : 99.99;
              if (era < minEra.val) minEra = { val: era, player: p };
          }
          if (p.k > maxK.val) maxK = { val: p.k, player: p };
      });

      setLeaders([
          { category: 'OPS 1위', value: maxOps.player ? maxOps.val.toFixed(3) : '-', playerName: maxOps.player?.name || '-', teamName: maxOps.player?.teamName || '-', playerId: maxOps.player?.id },
          { category: '안타 1위', value: maxHits.player ? maxHits.val : '-', playerName: maxHits.player?.name || '-', teamName: maxHits.player?.teamName || '-', playerId: maxHits.player?.id },
          { category: 'ERA 1위', value: minEra.player && minEra.val !== 99.99 ? minEra.val.toFixed(2) : '-', playerName: minEra.player?.name || '-', teamName: minEra.player?.teamName || '-', playerId: minEra.player?.id },
          { category: '탈삼진 1위', value: maxK.player ? maxK.val : '-', playerName: maxK.player?.name || '-', teamName: maxK.player?.teamName || '-', playerId: maxK.player?.id },
      ]);
    };

    fetchRecentMatches();
    fetchStatsAndLeaders();
  }, []);

  return (
    // 모바일에서 좌우 여백을 줄이기 위해 Layout의 여백에 맡기고 w-full로 변경
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-10 lg:mb-16">
        
        {/* 최근 경기 섹션 */}
        {/* 모바일 패딩 축소 (p-6), 모서리 둥글기 축소 (rounded-[24px]) */}
        <section className="bg-white p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">최근 경기</h2>
            <Link to="/matches" className="text-xs sm:text-sm font-bold px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</Link>
          </div>
          
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => navigate(`/record/${match.id}`)}
                // 모바일에서는 상하 배치(flex-col), PC에서는 좌우 배치(sm:flex-row)
                className="flex flex-col sm:flex-row justify-center sm:justify-between items-center p-4 sm:p-5 gap-3 sm:gap-0 border border-gray-50 rounded-2xl hover:shadow-md hover:border-[#104175] transition-all group cursor-pointer"
              >
                <span className="text-gray-400 font-medium text-xs sm:text-sm text-center sm:text-left sm:w-24">
                  {match.match_date}
                </span>
                
                <div className="flex-1 flex justify-center items-center gap-3 sm:gap-6 text-base sm:text-lg font-bold text-gray-800 group-hover:text-black transition-colors w-full">
                  <Link 
                    to={`/team/${match.away_team?.id}`} 
                    onClick={(e) => e.stopPropagation()} 
                    className="w-20 text-right hover:text-[#104175] hover:underline truncate"
                  >
                    {match.away_team?.name}
                  </Link>
                  
                  <span className="text-gray-300 font-light text-[12px] sm:text-[13px] italic">vs</span>
                  
                  <Link 
                    to={`/team/${match.home_team?.id}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 text-left hover:text-[#104175] hover:underline truncate"
                  >
                    {match.home_team?.name}
                  </Link>
                </div>

                <span className="font-black text-lg sm:text-xl text-center sm:text-right sm:w-24 tabular-nums text-[#104175]">
                  {match.status === 'finished' ? `${match.away_score} : ${match.home_score}` : '예정'}
                </span>
              </div>
            ))}
            
            {recentMatches.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-sm">최근 경기 기록이 없습니다.</div>
            )}
          </div>
        </section>

        {/* 팀 순위 섹션 */}
        <section className="bg-white p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">팀 순위</h2>
            <Link to="/standings" className="text-xs sm:text-sm font-bold px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</Link>
          </div>
          {/* 표가 화면을 벗어나지 않도록 가로 스크롤(overflow-x-auto) 래퍼 추가 */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px]">
              <thead className="text-gray-400 text-[11px] sm:text-xs font-bold uppercase border-b border-gray-50">
                <tr>
                  <th className="pb-3 sm:pb-5 text-left">순위</th>
                  <th className="pb-3 sm:pb-5 text-left">팀</th>
                  <th className="pb-3 sm:pb-5">승</th>
                  <th className="pb-3 sm:pb-5">패</th>
                  <th className="pb-3 sm:pb-5">무</th>
                  <th className="pb-3 sm:pb-5 text-right">승률</th>
                </tr>
              </thead>
              <tbody className="text-[13px] sm:text-[15px]">
                {standings.map((row) => (
                  <tr key={row.rank} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 sm:py-5 font-black text-gray-400">{row.rank}</td>
                    <td className="py-3 sm:py-5 font-bold text-base sm:text-lg">
                      <Link to={`/team/${row.id}`} className="hover:text-[#104175] hover:underline transition-colors whitespace-nowrap">
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-3 sm:py-5 text-center font-medium">{row.wins}</td>
                    <td className="py-3 sm:py-5 text-center font-medium">{row.losses}</td>
                    <td className="py-3 sm:py-5 text-center font-medium">{row.draws}</td>
                    <td className="py-3 sm:py-5 text-right font-black tabular-nums">{row.winRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 리그 리더 섹션 */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 tracking-tight px-2">리그 리더</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {leaders.map((leader, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-gray-100 hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="text-xs sm:text-sm font-bold text-gray-500 mb-4 sm:mb-5">{leader.category}</div>
              
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#104175] mb-2 tabular-nums leading-none">
                  {leader.value}
                </div>
                
                <div className="text-[15px] sm:text-[16px] text-gray-800 font-bold mt-3 sm:mt-4 flex items-center gap-1.5">
                  {leader.playerId ? (
                    <Link to={`/player/${leader.playerId}`} className="hover:text-[#104175] hover:underline transition-colors truncate">
                      {leader.playerName}
                    </Link>
                  ) : (
                    <span className="truncate">{leader.playerName}</span>
                  )}
                  <span className="text-gray-400 font-medium text-[12px] sm:text-[13px] shrink-0">({leader.teamName})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};