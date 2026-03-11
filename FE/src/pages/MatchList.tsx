import React from 'react';
import { Link } from 'react-router-dom';

export default function MatchList() {
  // 임시 권한 및 데이터 (추후 Supabase 연동)
  const isAdmin = true; 
  const matches = [
    { id: '1', date: '2026-02-10', awayTeam: '22학번', homeTeam: '24학번', awayScore: 5, homeScore: 3, status: 'finished' },
    { id: '2', date: '2026-02-04', awayTeam: '23학번', homeTeam: '24학번', awayScore: 1, homeScore: 1, status: 'finished' },
    { id: '3', date: '2026-01-27', awayTeam: '25학번', homeTeam: '22학번', awayScore: 5, homeScore: 6, status: 'finished' },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#104175] tracking-tight">⚾ 경기 목록</h1>
        {isAdmin && (
          <Link to="/record/new" className="px-5 py-2 bg-[#104175] text-white font-bold rounded-lg hover:bg-[#081e36] transition-colors">
            + 새 경기 추가
          </Link>
        )}
      </div>

      <table className="w-full text-center border-collapse">
        <thead className="bg-[#f1f3f5] text-[#495057] text-sm font-bold border-y border-[#dee2e6]">
          <tr>
            <th className="py-4">경기 날짜</th>
            <th className="py-4">초공 팀</th>
            <th className="py-4">결과 (초공:말공)</th>
            <th className="py-4">말공 팀</th>
            <th className="py-4">기록</th>
          </tr>
        </thead>
        <tbody className="text-[15px]">
          {matches.map((match) => (
            <tr key={match.id} className="border-b border-[#eee] hover:bg-gray-50 transition-colors">
              <td className="py-4 text-gray-500">{match.date}</td>
              <td className="py-4 font-bold text-lg">{match.awayTeam}</td>
              <td className="py-4 font-black text-red-700">
                {match.awayScore} : {match.homeScore}
              </td>
              <td className="py-4 font-bold text-lg">{match.homeTeam}</td>
              <td className="py-4">
                <div className="flex justify-center gap-2">
                  {/* 일반 회원은 기록 보기만 가능, 관리자는 수정 가능 */}
                  <Link to={`/record/${match.id}`} className="px-3 py-1.5 bg-[#6c757d] text-white text-xs font-bold rounded hover:bg-[#5a6268]">
                    상세 보기
                  </Link>
                  {isAdmin && (
                    <Link to={`/record/${match.id}/edit`} className="px-3 py-1.5 bg-[#104175] text-white text-xs font-bold rounded hover:bg-[#081e36]">
                      수정
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}