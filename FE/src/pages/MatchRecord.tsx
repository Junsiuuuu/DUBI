import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function MatchRecord() {
  const { id } = useParams();

  // ⭐ 핵심: 실제로는 DB에서 현재 유저의 권한(admin, umpire 등)을 확인해서 true/false를 결정합니다.
  // 테스트: 이 값을 false로 바꾸면 일반 유저 모드(보기 전용)로 변합니다!
  const isAuthorized = true; 

  const [inningTab, setInningTab] = useState<'away' | 'home'>('away');

  // 보기 모드일 때 입력창의 테두리를 없애고 텍스트처럼 보이게 하는 CSS 클래스
  const inputStyle = isAuthorized 
    ? "border border-gray-300 p-1 rounded w-full text-center focus:border-[#104175] focus:outline-none" 
    : "w-full text-center bg-transparent text-black font-medium appearance-none";
  
  const selectStyle = isAuthorized 
    ? "border border-gray-300 p-1 rounded w-full" 
    : "w-full bg-transparent text-black font-medium appearance-none";

  return (
    <div className="max-w-[1400px] mx-auto bg-white p-8 border border-gray-200 shadow-sm rounded-[32px] text-sm">
      
      {/* 1. 상단 타이틀 및 버튼 영역 */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-gray-500 font-bold mb-2">경기 기록 상세</h2>
          <div className="flex items-end gap-4">
            <h1 className="text-4xl font-black text-[#104175]">22학번 vs. 24학번</h1>
            <span className="text-xl font-bold text-gray-400">2026-02-10</span>
          </div>
        </div>
        <div className="space-x-2">
          {/* 권한이 있을 때만 '기록 저장' 버튼 표시 */}
          {isAuthorized && (
            <button className="bg-[#1e2a4a] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm">
              기록 저장
            </button>
          )}
          <Link to="/" className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            목록으로 이동
          </Link>
        </div>
      </div>

      {/* 2. 상단 스코어보드 */}
      <div className="mb-10 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-bold border-y border-gray-200">
            <tr>
              <th className="py-3 px-2 w-32 border-x border-gray-200">TEAM</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="py-3 px-2 w-12 border-x border-gray-200">{i}</th>)}
              <th className="py-3 px-2 w-16 border-x border-gray-200 text-red-700">R</th>
              <th className="py-3 px-2 w-16 border-x border-gray-200">H</th>
              <th className="py-3 px-2 w-16 border-x border-gray-200">E</th>
              <th className="py-3 px-2 w-16 border-x border-gray-200">B</th>
            </tr>
          </thead>
          <tbody className="border-b border-gray-200">
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 border-x border-gray-200 font-bold">
                <select className={selectStyle} disabled={!isAuthorized}>
                  <option>22학번 (초공)</option>
                </select>
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <td key={i} className="px-1 py-2 border-x border-gray-200">
                  <input type="text" className={inputStyle} disabled={!isAuthorized} defaultValue={i === 1 ? '0' : ''} />
                </td>
              ))}
              <td className="py-3 px-2 border-x border-gray-200 text-red-700 font-black text-lg">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
            </tr>
            <tr>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">
                <select className={selectStyle} disabled={!isAuthorized}>
                  <option>24학번 (말공)</option>
                </select>
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <td key={i} className="px-1 py-2 border-x border-gray-200">
                  <input type="text" className={inputStyle} disabled={!isAuthorized} defaultValue={i === 1 ? '0' : ''} />
                </td>
              ))}
              <td className="py-3 px-2 border-x border-gray-200 text-red-700 font-black text-lg">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
              <td className="py-3 px-2 border-x border-gray-200 font-bold">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. 타석 결과 코드표 (접기/펴기 가능하게 만들거나, 관리자에게만 보여줘도 됨) */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200">
        <h3 className="text-center font-bold text-gray-700 mb-4">📖 타석 결과 코드표 (작성 가이드)</h3>
        <div className="flex gap-2 text-xs justify-center flex-wrap">
          <div className="bg-red-800 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">10 삼진</div>
          <div className="bg-red-800 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">20 낫아웃</div>
          <div className="bg-green-700 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">151 1루타</div>
          <div className="bg-green-700 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">722 2루타</div>
          <div className="bg-purple-800 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">17 볼넷</div>
          <div className="bg-gray-800 text-white px-3 py-1.5 rounded-md font-bold shadow-sm">115 실책</div>
        </div>
      </div>

      {/* 4. 초공/말공 탭 전환 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setInningTab('away')}
          className={`px-8 py-3 font-bold text-base rounded-t-xl transition-colors border border-b-0 ${inningTab === 'away' ? 'bg-[#104175] text-white border-[#104175]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
        >
          초공 : 22학번
        </button>
        <button 
          onClick={() => setInningTab('home')}
          className={`px-8 py-3 font-bold text-base rounded-t-xl transition-colors border border-b-0 ${inningTab === 'home' ? 'bg-[#104175] text-white border-[#104175]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
        >
          말공 : 24학번
        </button>
      </div>

      {/* 5. 타자 기록 상세 입력/보기 표 */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-center border-collapse min-w-[1100px]">
          <thead className="bg-[#f1f3f5] text-[#495057] font-bold border-y border-gray-300">
            <tr>
              <th className="py-3 px-2 border-x border-gray-300 w-12">타순</th>
              <th className="py-3 px-2 border-x border-gray-300 w-32">선수 이름</th>
              <th className="py-3 px-2 border-x border-gray-300 w-24">수비위치</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="py-3 px-2 border-x border-gray-300 w-16">{i}</th>)}
              <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">타점</th>
              <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">득점</th>
              <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">타석</th>
              <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">타수</th>
            </tr>
          </thead>
          <tbody>
            {/* 더미 행 3개 출력 */}
            {[1, 2, 3].map(row => (
              <tr key={row} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">{row}</td>
                <td className="py-2 px-2 border-x border-gray-200">
                  <select className={selectStyle} disabled={!isAuthorized}>
                    <option>선수 선택</option>
                    <option>박지훈</option>
                    <option>김민수</option>
                  </select>
                </td>
                <td className="py-2 px-2 border-x border-gray-200">
                  <select className={selectStyle} disabled={!isAuthorized}>
                    <option></option>
                    <option>투수 (1)</option>
                    <option>포수 (2)</option>
                  </select>
                </td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <td key={i} className="p-1 border-x border-gray-200">
                    <input type="text" className={inputStyle} disabled={!isAuthorized} />
                  </td>
                ))}
                <td className="py-2 px-2 border-x border-gray-200"><input type="checkbox" disabled={!isAuthorized} /></td>
                <td className="py-2 px-2 border-x border-gray-200"><input type="checkbox" disabled={!isAuthorized} /></td>
                <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">0</td>
                <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 권한이 있을 때만 선수 추가 버튼(UI) 표시 */}
      {isAuthorized && (
        <div className="flex items-center gap-3 mb-12 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <span className="font-bold text-gray-700">타자 라인업 추가:</span>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded font-bold hover:bg-gray-100">+ 선수 추가</button>
        </div>
      )}

    </div>
  );
}