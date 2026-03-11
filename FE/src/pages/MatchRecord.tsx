import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// --- 타석 결과 코드표 데이터 ---
const COLORS = {
  OUT: "#C83320", GROUNDBALL: "#C83320", LINAR: "#C83320", FLYBALL: "#C83320",
  DOUBLEPLAY: "#A52113", TRIPLEPLAY: "#BD2107", SACRIFICE: "#836231",
  HIT_1B: "#4E930F", HIT_2B: "#0F9315", HIT_3B: "#0F935E", HOMERUN: "#0D9F8E",
  ERROR: "#156082", FIELDER_CHOICE: "#0E2841", ONBASE: "#842479",
  OTHER: "#654B51", OTHER1: "#84344D", OTHER2: "#403165", OTHER3: "#BC4C14"
};

const CATEGORIES = [
  "아웃", "땅볼", "병살", "직선타", "뜬공", "희생타", "1루타",
  "2루타", "3루타", "홈런", "실책", "야수선택", "출루", "기타"
];

const OUTCOME_CODES = [
  { code: "10", text: "삼진", color: COLORS.OUT, category: "아웃" },
  { code: "20", text: "낫아웃", color: COLORS.OUT, category: "아웃" },
  { code: "30", text: "쓰리번트", color: COLORS.OUT, category: "아웃" },
  { code: "40", text: "타자타구", color: COLORS.OUT, category: "아웃" },
  { code: "50", text: "수비방해", color: COLORS.OUT, category: "아웃" },
  { code: "60", text: "부정타격", color: COLORS.OUT, category: "아웃" },
  { code: "110", text: "투땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "210", text: "포땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "310", text: "1땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "410", text: "2땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "510", text: "3땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "610", text: "유땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "710", text: "좌땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "810", text: "중땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "910", text: "우땅", color: COLORS.GROUNDBALL, category: "땅볼" },
  { code: "1100", text: "투땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "2100", text: "포땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "3100", text: "1땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "4100", text: "2땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "5100", text: "3땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "6100", text: "유땅병살", color: COLORS.DOUBLEPLAY, category: "병살" },
  { code: "000", text: "삼중살", color: COLORS.TRIPLEPLAY, category: "병살" },
  { code: "120", text: "투직", color: COLORS.LINAR, category: "직선타" },
  { code: "320", text: "1직", color: COLORS.LINAR, category: "직선타" },
  { code: "420", text: "2직", color: COLORS.LINAR, category: "직선타" },
  { code: "520", text: "3직", color: COLORS.LINAR, category: "직선타" },
  { code: "620", text: "유직", color: COLORS.LINAR, category: "직선타" },
  { code: "130", text: "투뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "230", text: "포뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "330", text: "1뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "430", text: "2뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "530", text: "3뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "630", text: "유뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "730", text: "좌뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "830", text: "중뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "930", text: "우뜬", color: COLORS.FLYBALL, category: "뜬공" },
  { code: "338", text: "1희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "438", text: "2희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "538", text: "3희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "638", text: "유희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "738", text: "좌희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "838", text: "중희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "938", text: "우희플", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "118B", text: "투희번", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "218B", text: "포희번", color: COLORS.SACRIFICE, category: "희생타" },
  { code: "151", text: "투안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "251", text: "포안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "351", text: "1내안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "451", text: "2내안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "551", text: "3내안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "651", text: "유내안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "751", text: "좌안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "851", text: "중안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "951", text: "우안", color: COLORS.HIT_1B, category: "1루타" },
  { code: "772", text: "좌선2", color: COLORS.HIT_2B, category: "2루타" },
  { code: "722", text: "좌전2", color: COLORS.HIT_2B, category: "2루타" },
  { code: "822", text: "중전2", color: COLORS.HIT_2B, category: "2루타" },
  { code: "922", text: "우전2", color: COLORS.HIT_2B, category: "2루타" },
  { code: "773", text: "좌선3", color: COLORS.HIT_3B, category: "3루타" },
  { code: "823", text: "중전3", color: COLORS.HIT_3B, category: "3루타" },
  { code: "923", text: "우전3", color: COLORS.HIT_3B, category: "3루타" },
  { code: "784", text: "좌월홈런", color: COLORS.HOMERUN, category: "홈런" },
  { code: "884", text: "중월홈런", color: COLORS.HOMERUN, category: "홈런" },
  { code: "984", text: "우월홈런", color: COLORS.HOMERUN, category: "홈런" },
  { code: "115", text: "투실", color: COLORS.ERROR, category: "실책" },
  { code: "215", text: "포실", color: COLORS.ERROR, category: "실책" },
  { code: "315", text: "1실", color: COLORS.ERROR, category: "실책" },
  { code: "415", text: "2실", color: COLORS.ERROR, category: "실책" },
  { code: "515", text: "3실", color: COLORS.ERROR, category: "실책" },
  { code: "615", text: "유실", color: COLORS.ERROR, category: "실책" },
  { code: "156", text: "투야선", color: COLORS.FIELDER_CHOICE, category: "야수선택" },
  { code: "256", text: "포야선", color: COLORS.FIELDER_CHOICE, category: "야수선택" },
  { code: "17", text: "볼넷", color: COLORS.ONBASE, category: "출루" },
  { code: "27", text: "사구", color: COLORS.ONBASE, category: "출루" },
  { code: "37", text: "고의4구", color: COLORS.ONBASE, category: "출루" },
  { code: "09", text: "낫아웃+", color: COLORS.ONBASE, category: "출루" },
  { code: "S", text: "도루", color: COLORS.OTHER3, category: "기타" },
  { code: "E", text: "실책진루", color: COLORS.OTHER3, category: "기타" },
  { code: "WP", text: "폭투", color: COLORS.OTHER3, category: "기타" },
  { code: "PB", text: "포일", color: COLORS.OTHER3, category: "기타" },
  { code: "CS", text: "도루자", color: COLORS.OTHER1, category: "기타" },
  { code: "RO", text: "주루사", color: COLORS.OTHER1, category: "기타" },
  { code: "PH", text: "대타", color: COLORS.OTHER2, category: "기타" },
  { code: "PR", text: "대주자", color: COLORS.OTHER2, category: "기타" }
];

function getContrastColor(hexcolor: string) {
  if (!hexcolor || hexcolor.length < 7) return '#000000';
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

// --- 타석 결과 코드표 컴포넌트 ---
const CodeMappingTable = () => (
  <div className="bg-[#f0f2f5] p-2 border border-gray-200 rounded-lg mb-10 text-center">
    <h3 className="font-bold text-gray-700 mb-2 mt-1">타석 결과 코드표</h3>
    <div className="flex flex-wrap justify-center gap-[2px]">
      {CATEGORIES.map(category => {
        const items = OUTCOME_CODES.filter(item => item.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="flex-[0_0_calc(100%/14-2px)] border border-[#ddd] rounded overflow-hidden bg-white">
            <div className="p-[3px] text-[11px] font-bold bg-[#e9ecef] text-center border-b border-[#ddd]">
              {category}
            </div>
            <table className="w-full border-collapse table-fixed m-0">
              <tbody>
                {items.map(item => (
                  <tr key={item.code}>
                    <td className="p-[1px] border border-[#eee] overflow-hidden text-ellipsis whitespace-nowrap text-[8px] w-[30%] text-center">
                      {item.code}
                    </td>
                    <td 
                      className="p-[1px] border border-[#eee] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] w-[70%] text-center cursor-pointer hover:brightness-90"
                      style={{ backgroundColor: item.color, color: getContrastColor(item.color) }}
                      title={item.text}
                    >
                      {item.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  </div>
);

export default function MatchRecord() {
  const { id } = useParams();

  // ⭐ 핵심: 이 값이 true면 수정 가능한 폼, false면 보기 전용 텍스트 표가 됩니다.
  const isAuthorized = true; 
  const [inningTab, setInningTab] = useState<'away' | 'home'>('away');

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
          {isAuthorized && (
            <button className="bg-[#1e2a4a] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm">
              기록 저장
            </button>
          )}
          <Link to="/matches" className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
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

      {/* 3. 타석 결과 코드표 (권한이 있을 때만 표시) */}
      {isAuthorized && <CodeMappingTable />}

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
                <td className="py-2 px-2 border-x border-gray-200"><input type="number" className={inputStyle} disabled={!isAuthorized} defaultValue="0" /></td>
                <td className="py-2 px-2 border-x border-gray-200"><input type="number" className={inputStyle} disabled={!isAuthorized} defaultValue="0" /></td>
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
          <select className="border p-1 rounded"><option>타순</option><option>1</option></select>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded font-bold hover:bg-gray-100">+ 선수 추가</button>
        </div>
      )}

    </div>
  );
}