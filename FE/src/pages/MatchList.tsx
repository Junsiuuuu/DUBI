import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MatchList() {
  const [matches, setMatches] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    fetchMatches();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data) setUserRole(data.role);
    }
  };

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

  const canAddMatch = userRole === 'admin' || userRole === 'umpire';

  return (
    // 모바일 여백 축소 (p-6, rounded-[24px])
    <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100">
      {/* 모바일 상하 배치 (flex-col) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#104175] tracking-tight">⚾ 경기 목록</h1>
        
        {canAddMatch && (
          <Link to="/record/new" className="w-full sm:w-auto text-center px-5 py-2.5 sm:py-2 bg-[#104175] text-white font-bold rounded-lg hover:bg-[#081e36] transition-colors">
            + 새 경기 추가
          </Link>
        )}
      </div>

      {/* 표 가로 스크롤 영역 */}
      <div className="overflow-x-auto w-full">
        {/* 표 최소 너비(min-w) 지정으로 찌그러짐 방지 */}
        <table className="w-full text-center border-collapse min-w-[500px]">
          <thead className="bg-[#f1f3f5] text-[#495057] text-[13px] sm:text-sm font-bold border-y border-[#dee2e6] whitespace-nowrap">
            <tr>
              <th className="py-3 sm:py-4">경기 날짜</th>
              <th className="py-3 sm:py-4">초공 팀</th>
              <th className="py-3 sm:py-4">결과 (초공:말공)</th>
              <th className="py-3 sm:py-4">말공 팀</th>
              <th className="py-3 sm:py-4">기록</th>
            </tr>
          </thead>
          <tbody className="text-[14px] sm:text-[15px]">
            {matches.map((match) => (
              <tr key={match.id} className="border-b border-[#eee] hover:bg-gray-50 transition-colors">
                <td className="py-3 sm:py-4 text-gray-500">{match.match_date}</td>
                <td className="py-3 sm:py-4 font-bold text-base sm:text-lg">
                  <Link to={`/team/${match.away_team?.id}`} className="hover:text-[#104175] hover:underline transition-colors whitespace-nowrap">
                    {match.away_team?.name}
                  </Link>
                </td>
                <td className="py-3 sm:py-4 font-black text-red-700 whitespace-nowrap">
                  {match.status === 'finished' ? `${match.away_score} : ${match.home_score}` : '예정'}
                </td>
                <td className="py-3 sm:py-4 font-bold text-base sm:text-lg">
                  <Link to={`/team/${match.home_team?.id}`} className="hover:text-[#104175] hover:underline transition-colors whitespace-nowrap">
                    {match.home_team?.name}
                  </Link>
                </td>
                <td className="py-3 sm:py-4">
                  <div className="flex justify-center">
                    <Link to={`/record/${match.id}`} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#104175] text-white text-[11px] sm:text-xs font-bold rounded-lg hover:bg-[#081e36] transition-colors whitespace-nowrap">
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
    </div>
  );
}