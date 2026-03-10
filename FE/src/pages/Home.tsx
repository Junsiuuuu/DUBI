import React from 'react';
import type { Match, TeamStanding, LeagueLeader } from '../types/baseball';

// --- 더미 데이터 (나중에 Supabase에서 가져올 부분) ---
const RECENT_MATCHES: Match[] = [
  { id: '1', date: '2026-02-04', homeTeam: '23학번', awayTeam: '24학번', homeScore: 1, awayScore: 1, status: 'finished' },
  { id: '2', date: '2026-01-27', homeTeam: '25학번', awayTeam: '22학번', homeScore: 5, awayScore: 6, status: 'finished' },
  { id: '3', date: '2026-01-19', homeTeam: '22학번', awayTeam: '23학번', homeScore: 3, awayScore: 1, status: 'finished' },
  { id: '4', date: '2026-01-06', homeTeam: '24학번', awayTeam: '25학번', homeScore: 5, awayScore: 2, status: 'finished' },
  { id: '5', date: '2025-12-20', homeTeam: '25학번', awayTeam: '23학번', homeScore: 2, awayScore: 7, status: 'finished' },
];

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

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      {/* GNB (Navigation) */}
      <header className="flex justify-between items-center px-12 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white px-3 py-1 rounded-full font-black text-xl tracking-tighter">DUBI</div>
          <span className="text-gray-400 text-xs font-medium">대전대학야구인비테이셔널</span>
        </div>
        <nav className="flex items-center gap-10 text-[15px] font-semibold text-gray-500">
          <button className="hover:text-black transition-colors">경기 목록</button>
          <button className="hover:text-black transition-colors">순위표</button>
          <button className="hover:text-black transition-colors">선수 기록</button>
          <button className="ml-4 px-6 py-2 border border-gray-200 rounded-xl font-bold text-black hover:bg-gray-50 transition-all">로그인</button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          
          {/* 최근 경기 섹션 */}
          <section className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">최근 경기</h2>
              <button className="text-sm font-bold px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</button>
            </div>
            <div className="space-y-4">
              {RECENT_MATCHES.map((match) => (
                <div key={match.id} className="flex justify-between items-center p-5 border border-gray-50 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer">
                  <span className="text-gray-300 font-medium text-sm w-24">{match.date}</span>
                  <div className="flex-1 flex justify-center items-center gap-6 text-lg font-bold">
                    <span className="w-20 text-right">{match.homeTeam}</span>
                    <span className="text-gray-200 font-light text-xs italic">vs</span>
                    <span className="w-20 text-left">{match.awayTeam}</span>
                  </div>
                  <span className="font-black text-xl w-24 text-right tabular-nums">{match.homeScore} : {match.awayScore}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 팀 순위 섹션 */}
          <section className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">팀 순위</h2>
              <button className="text-sm font-bold px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">더보기</button>
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
                {STANDINGS.map((row) => (
                  <tr key={row.rank} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-black text-gray-400">{row.rank}</td>
                    <td className="py-5 font-bold text-lg">{row.teamName}</td>
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

        {/* 리그 리더 섹션 */}
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
      </main>
    </div>
  );
};