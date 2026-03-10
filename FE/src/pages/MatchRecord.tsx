export default function MatchRecord() {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 border border-gray-200 shadow-sm rounded-lg text-sm">
      {/* 상단 타이틀 영역 */}
      <div className="mb-6">
        <h2 className="text-gray-600 font-bold mb-1">경기 기록</h2>
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-3xl font-black">22학번 vs. 24학번</h1>
          <span className="text-lg font-bold text-gray-700">2026-02-10</span>
        </div>
        <div className="space-x-2">
          <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded font-bold hover:bg-blue-900">기록 저장</button>
          <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded font-bold hover:bg-blue-900">경기 명단으로 이동</button>
        </div>
      </div>

      {/* 스코어보드 */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-center border-collapse border border-gray-300">
          <thead className="bg-gray-50 text-gray-600 font-bold">
            <tr>
              <th className="border border-gray-300 py-2 w-32">TEAM</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="border border-gray-300 py-2 w-10">{i}</th>)}
              <th className="border border-gray-300 py-2 w-12 text-red-700">Score</th>
              <th className="border border-gray-300 py-2 w-12">H</th>
              <th className="border border-gray-300 py-2 w-12">B</th>
              <th className="border border-gray-300 py-2 w-12">E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 py-2 font-bold">
                <select className="border p-1 rounded"><option>22학번</option></select>
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <td key={i} className="border border-gray-300"></td>)}
              <td className="border border-gray-300 text-red-700 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
            </tr>
            <tr>
              <td className="border border-gray-300 py-2 font-bold">
                <select className="border p-1 rounded"><option>24학번</option></select>
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <td key={i} className="border border-gray-300"></td>)}
              <td className="border border-gray-300 text-red-700 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
              <td className="border border-gray-300 font-bold">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 타석 결과 코드표 (약식 디자인) */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300">
        <h3 className="text-center font-bold mb-4">타석 결과 코드표</h3>
        <div className="flex gap-2 text-xs justify-center flex-wrap">
          {/* 아웃, 안타 등 색상별 박스 예시 */}
          <div className="bg-red-800 text-white px-2 py-1 rounded">10 삼진</div>
          <div className="bg-red-800 text-white px-2 py-1 rounded">20 낫아웃</div>
          <div className="bg-green-700 text-white px-2 py-1 rounded">151 1루타</div>
          <div className="bg-green-700 text-white px-2 py-1 rounded">722 2루타</div>
          <div className="bg-[#1e2a4a] text-white px-2 py-1 rounded">115 실책</div>
          <div className="bg-purple-800 text-white px-2 py-1 rounded">17 볼넷</div>
        </div>
      </div>

      {/* 초공 / 말공 탭 */}
      <div className="flex gap-2 mb-4">
        <button className="px-6 py-2 bg-gray-200 font-bold rounded">초공</button>
        <button className="px-6 py-2 border font-bold rounded bg-white">말공</button>
      </div>

      <h3 className="text-lg font-bold mb-4">초공 : 22학번</h3>

      {/* 타자 기록 입력 테이블 */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-center border-collapse border border-gray-300 min-w-[1000px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 py-2">타순</th>
              <th className="border border-gray-300 py-2">선수 이름</th>
              <th className="border border-gray-300 py-2">수비위치</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="border border-gray-300 py-2 w-16">{i}</th>)}
              <th className="border border-gray-300 py-2">타점</th>
              <th className="border border-gray-300 py-2">득점</th>
              <th className="border border-gray-300 py-2">타석</th>
              <th className="border border-gray-300 py-2">타수</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(row => (
              <tr key={row}>
                <td className="border border-gray-300 py-2">{row}</td>
                <td className="border border-gray-300">
                  <select className="border p-1 w-full"><option>선수 선택</option></select>
                </td>
                <td className="border border-gray-300">
                  <select className="border p-1 w-full"><option></option></select>
                </td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <td key={i} className="border border-gray-300 p-1">
                    <input type="text" className="w-full border p-1 text-center" />
                  </td>
                ))}
                <td className="border border-gray-300"><input type="checkbox" /></td>
                <td className="border border-gray-300"><input type="checkbox" /></td>
                <td className="border border-gray-300">0</td>
                <td className="border border-gray-300">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center gap-2 mb-8">
        <span className="font-bold">타자 추가 (22학번):</span>
        <select className="border p-1"><option>타순</option></select>
        <button className="bg-[#1e2a4a] text-white px-3 py-1 rounded text-xs">추가</button>
      </div>
    </div>
  );
}