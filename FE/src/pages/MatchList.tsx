import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MatchList() {
  const [matches, setMatches] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    fetchMatches();
    checkUserRole();
  }, []);

  // 1. 현재 로그인한 유저의 권한(role)을 확인합니다.
  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data) setUserRole(data.role);
    }
  };

  // 2. DB에서 실제 경기 목록과 팀 정보(id, name)를 가져옵니다.
  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select(`
        id, match_date, away_score, home_score, status, 
        away_team:teams!matches_away_team_id_fkey(id, name), 
        home_team:teams!matches_home_team_id_fkey(id, name)
      `)
      .order('match_date', { ascending: false });
      
    if (data) setMatches(data);
  };

  // ⭐ 관리자(admin) 이거나 심판(umpire)일 때만 true가 됩니다.
  const canAddMatch = userRole === 'admin' || userRole === 'umpire';

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#104175] tracking-tight">⚾ 경기 목록</h1>
        
        {/* 권한이 있는 사람에게만 새 경기 추가 버튼 노출 */}
        {canAddMatch && (
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
              <td className="py-4 text-gray-500">{match.match_date}</td>
              <td className="py-4 font-bold text-lg">
                {/* ⭐ 팀 이름을 누르면 팀 상세 페이지로 이동하도록 Link 적용 */}
                <Link to={`/team/${match.away_team?.id}`} className="hover:text-[#104175] hover:underline transition-colors">
                  {match.away_team?.name}
                </Link>
              </td>
              <td className="py-4 font-black text-red-700">
                {match.status === 'finished' ? `${match.away_score} : ${match.home_score}` : '예정'}
              </td>
              <td className="py-4 font-bold text-lg">
                {/* ⭐ 팀 이름을 누르면 팀 상세 페이지로 이동하도록 Link 적용 */}
                <Link to={`/team/${match.home_team?.id}`} className="hover:text-[#104175] hover:underline transition-colors">
                  {match.home_team?.name}
                </Link>
              </td>
              <td className="py-4">
                <div className="flex justify-center">
                  <Link to={`/record/${match.id}`} className="px-4 py-2 bg-[#104175] text-white text-xs font-bold rounded-lg hover:bg-[#081e36] transition-colors">
                    기록 보기
                  </Link>
                </div>
              </td>
            </tr>
          ))}
          {matches.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-gray-400">등록된 경기 기록이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}