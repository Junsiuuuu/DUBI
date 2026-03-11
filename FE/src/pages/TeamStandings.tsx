import React from 'react';
import type { TeamStanding } from '../types/baseball';

// 더미 데이터
const STANDINGS: TeamStanding[] = [
  { rank: 1, teamName: '22학번', wins: 5, losses: 2, draws: 1, winRate: '0.625' },
  { rank: 2, teamName: '23학번', wins: 4, losses: 3, draws: 1, winRate: '0.500' },
  { rank: 3, teamName: '24학번', wins: 3, losses: 3, draws: 2, winRate: '0.375' },
  { rank: 4, teamName: '25학번', wins: 2, losses: 6, draws: 0, winRate: '0.250' },
];

export default function TeamStandings() {
  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">⚾ 팀 순위표</h1>
      </div>
      <table className="w-full">
        <thead className="text-gray-400 text-sm font-bold uppercase border-b border-gray-100">
          <tr>
            <th className="pb-5 text-left pl-4">순위</th>
            <th className="pb-5 text-left">팀명</th>
            <th className="pb-5 text-center">승</th>
            <th className="pb-5 text-center">무</th>
            <th className="pb-5 text-center">패</th>
            <th className="pb-5 text-right pr-4">승률</th>
          </tr>
        </thead>
        <tbody className="text-[16px]">
          {STANDINGS.map((row) => (
            <tr key={row.rank} className="border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-6 pl-4 font-black text-gray-400">{row.rank}</td>
              <td className="py-6 font-bold text-xl text-black cursor-pointer hover:text-blue-600">{row.teamName}</td>
              <td className="py-6 text-center font-semibold text-red-600">{row.wins}</td>
              <td className="py-6 text-center font-semibold text-gray-500">{row.draws}</td>
              <td className="py-6 text-center font-semibold text-blue-600">{row.losses}</td>
              <td className="py-6 text-right pr-4 font-black tabular-nums">{row.winRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}