import { useState } from 'react';

export default function PlayerStats() {
  const [tab, setTab] = useState<'batter' | 'pitcher'>('pitcher');

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 border border-gray-200 shadow-sm rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e2a4a] flex items-center justify-center gap-2">
          ⚾ 선수 통합 기록
        </h1>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400">팀 순위 보기</button>
          <button className="px-4 py-2 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400">경기 목록으로</button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 border-b border-gray-300 pb-2">
        <div className="flex gap-2">
          <button onClick={() => setTab('batter')} className={`px-6 py-2 border rounded-t-md text-sm font-bold ${tab === 'batter' ? 'bg-gray-100 border-gray-300 border-b-white' : 'bg-white text-gray-500'}`}>타자 기록</button>
          <button onClick={() => setTab('pitcher')} className={`px-6 py-2 border rounded-t-md text-sm font-bold ${tab === 'pitcher' ? 'bg-gray-100 border-gray-300 border-b-white' : 'bg-white text-gray-500'}`}>투수 기록</button>
        </div>
        <div className="text-sm flex gap-4">
          <label><input type="radio" name="filter" defaultChecked className="mr-1" /> 규정타석/이닝 충족</label>
          <label><input type="radio" name="filter" className="mr-1" /> 전체</label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center border-collapse">
          <thead className="bg-gray-100 border-y border-gray-300">
            <tr>
              <th className="py-3 px-2">소속 팀</th>
              <th className="py-3 px-2">이름</th>
              <th className="py-3 px-2">출전경기수</th>
              <th className="py-3 px-2 flex items-center justify-center gap-1">평균자책점 <span>▲</span></th>
              <th className="py-3 px-2">이닝</th>
              <th className="py-3 px-2">투구수</th>
              <th className="py-3 px-2">자책점</th>
              <th className="py-3 px-2">실점</th>
              <th className="py-3 px-2">탈삼진</th>
              <th className="py-3 px-2">피안타</th>
              <th className="py-3 px-2">피홈런</th>
              <th className="py-3 px-2">볼넷</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3">24학번</td>
              <td className="py-3 font-bold">이은수</td>
              <td className="py-3">1</td>
              <td className="py-3 font-bold">6.00</td>
              <td className="py-3">3.0</td>
              <td className="py-3">0</td>
              <td className="py-3">2</td>
              <td className="py-3">4</td>
              <td className="py-3">0</td>
              <td className="py-3">0</td>
              <td className="py-3">0</td>
              <td className="py-3">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}