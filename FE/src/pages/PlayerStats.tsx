import React, { useState } from 'react';

export default function PlayerStats() {
  const [tab, setTab] = useState<'batter' | 'pitcher'>('batter');
  const [filter, setFilter] = useState<'qualified' | 'all'>('qualified');

  return (
    <div className="max-w-6xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
      <h1 className="text-3xl font-black text-[#104175] text-center mb-8">⚾ 선수 통합 기록</h1>

      <div className="flex justify-between items-end mb-4 border-b border-gray-300 pb-2">
        {/* 탭 버튼 */}
        <div className="flex gap-2">
          <button 
            onClick={() => setTab('batter')} 
            className={`px-6 py-2 border border-b-0 rounded-t-lg text-sm font-bold transition-colors ${tab === 'batter' ? 'bg-white text-[#104175] border-gray-300 border-b-white translate-y-[1px]' : 'bg-[#e9ecef] text-[#495057] border-transparent hover:bg-gray-200'}`}
          >
            타자 기록
          </button>
          <button 
            onClick={() => setTab('pitcher')} 
            className={`px-6 py-2 border border-b-0 rounded-t-lg text-sm font-bold transition-colors ${tab === 'pitcher' ? 'bg-white text-[#104175] border-gray-300 border-b-white translate-y-[1px]' : 'bg-[#e9ecef] text-[#495057] border-transparent hover:bg-gray-200'}`}
          >
            투수 기록
          </button>
        </div>

        {/* 필터 라디오 버튼 */}
        <div className="text-sm font-medium flex gap-4 text-gray-700">
          <label className="cursor-pointer flex items-center gap-1">
            <input type="radio" name="filter" checked={filter === 'qualified'} onChange={() => setFilter('qualified')} /> 
            규정타석/이닝 충족
          </label>
          <label className="cursor-pointer flex items-center gap-1">
            <input type="radio" name="filter" checked={filter === 'all'} onChange={() => setFilter('all')} /> 
            전체
          </label>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="overflow-x-auto rounded-b-lg border border-t-0 border-gray-200 shadow-sm">
        <table className="w-full text-center border-collapse whitespace-nowrap">
          <thead className="bg-[#e9ecef] text-[#495057] text-sm font-bold">
            {tab === 'batter' ? (
              <tr>
                <th className="p-3 border border-gray-300">소속 팀</th>
                <th className="p-3 border border-gray-300">이름</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">출전경기수</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">타율</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">출루율</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">장타율</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300 text-[#104175]">OPS ▼</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">타석</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">타수</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">안타</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">타점</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">득점</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">도루</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">출루</th>
              </tr>
            ) : (
              <tr>
                <th className="p-3 border border-gray-300">소속 팀</th>
                <th className="p-3 border border-gray-300">이름</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">출전경기수</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300 text-[#104175]">평균자책점 ▼</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">이닝</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">투구수</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">자책점</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">실점</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">탈삼진</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">피안타</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">피홈런</th>
                <th className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-300">볼넷</th>
              </tr>
            )}
          </thead>
          <tbody className="text-[14px]">
            {/* 임시 더미 데이터 */}
            <tr className="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
              <td className="p-3 border border-gray-300">22학번</td>
              <td className="p-3 border border-gray-300 font-bold text-[#104175] hover:underline">박지훈</td>
              <td className="p-3 border border-gray-300">5</td>
              <td className="p-3 border border-gray-300 font-bold">0.450</td>
              <td className="p-3 border border-gray-300">0.520</td>
              <td className="p-3 border border-gray-300">0.850</td>
              <td className="p-3 border border-gray-300 font-bold text-red-600">1.370</td>
              <td className="p-3 border border-gray-300">25</td>
              <td className="p-3 border border-gray-300">20</td>
              <td className="p-3 border border-gray-300">9</td>
              <td className="p-3 border border-gray-300">7</td>
              <td className="p-3 border border-gray-300">8</td>
              <td className="p-3 border border-gray-300">2</td>
              <td className="p-3 border border-gray-300">13</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}