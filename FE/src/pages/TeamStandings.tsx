import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function TeamStandings() {
  const [standings, setStandings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    // 1. DB에서 모든 팀과 '종료된(finished)' 경기 기록을 가져옵니다.
    const { data: teamsData } = await supabase.from('teams').select('*');
    const { data: matchesData } = await supabase.from('matches').select('*').eq('status', 'finished');

    if (teamsData && matchesData) {
      // 2. 각 팀별로 경기 결과를 돌면서 승, 무, 패를 계산합니다.
      const stats = teamsData.map(team => {
        let wins = 0, losses = 0, draws = 0;

        matchesData.forEach(match => {
          const isAway = match.away_team_id === team.id;
          const isHome = match.home_team_id === team.id;

          if (isAway || isHome) {
            const myScore = isAway ? match.away_score : match.home_score;
            const opScore = isAway ? match.home_score : match.away_score;

            if (myScore > opScore) wins++;
            else if (myScore < opScore) losses++;
            else draws++;
          }
        });

        // 3. KBO 방식 승률 계산: 승리 / (승리 + 패배)
        const validGames = wins + losses;
        const winRate = validGames > 0 ? (wins / validGames) : 0;

        return {
          id: team.id,
          name: team.name,
          wins,
          losses,
          draws,
          winRateValue: winRate,
          winRate: winRate.toFixed(3) // 소수점 3자리까지 (예: 0.667)
        };
      });

      // 4. 순위 매기기: 승률이 높은 순 -> 같으면 승수가 많은 순
      stats.sort((a, b) => {
        if (b.winRateValue !== a.winRateValue) return b.winRateValue - a.winRateValue;
        return b.wins - a.wins;
      });

      // 5. 정렬된 배열에 등수(Rank)를 부여합니다.
      const rankedStats = stats.map((stat, index) => ({
        ...stat,
        rank: index + 1
      }));

      setStandings(rankedStats);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#104175] tracking-tight mb-2">🏆 팀 순위표</h1>
        <p className="text-gray-500">DUBI 리그의 실시간 정규시즌 순위입니다.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead className="bg-[#f1f3f5] text-[#495057] text-sm font-bold border-y border-[#dee2e6]">
            <tr>
              <th className="py-4 w-20">순위</th>
              <th className="py-4 text-left px-4">팀명</th>
              <th className="py-4 w-20">경기수</th>
              <th className="py-4 w-20">승</th>
              <th className="py-4 w-20">무</th>
              <th className="py-4 w-20">패</th>
              <th className="py-4 w-28 text-right px-4">승률</th>
            </tr>
          </thead>
          <tbody className="text-[15px]">
            {isLoading ? (
              <tr><td colSpan={7} className="py-10 text-gray-400">순위 데이터를 불러오는 중입니다...</td></tr>
            ) : standings.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-gray-400">등록된 팀 데이터가 없습니다.</td></tr>
            ) : (
              standings.map((team) => {
                const totalGames = team.wins + team.losses + team.draws;
                return (
                  <tr key={team.id} className="border-b border-[#eee] hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-black text-gray-500">{team.rank}</td>
                    <td className="py-4 text-left px-4 font-bold text-lg">
                      {/* ⭐ 팀 이름을 누르면 해당 팀 페이지로 쏙 넘어갑니다! */}
                      <Link to={`/team/${team.id}`} className="hover:text-[#104175] hover:underline transition-colors">
                        {team.name}
                      </Link>
                    </td>
                    <td className="py-4 text-gray-600 font-medium">{totalGames}</td>
                    <td className="py-4 text-[#2d6d3c] font-bold">{team.wins}</td>
                    <td className="py-4 text-gray-600 font-medium">{team.draws}</td>
                    <td className="py-4 text-[#802a33] font-bold">{team.losses}</td>
                    <td className="py-4 text-right px-4 font-black text-[#104175] tabular-nums">{team.winRate}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}