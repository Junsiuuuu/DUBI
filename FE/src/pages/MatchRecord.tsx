import { useState, useEffect } from 'react'; // React 임포트 경고 수정
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// --- 타석 결과 코드표 데이터 ---
const COLORS = {
  OUT: "#C83320", GROUNDBALL: "#C83320", LINAR: "#C83320", FLYBALL: "#C83320",
  DOUBLEPLAY: "#A52113", TRIPLEPLAY: "#BD2107", SACRIFICE: "#836231",
  HIT_1B: "#4E930F", HIT_2B: "#0F9315", HIT_3B: "#0F935E", HOMERUN: "#0D9F8E",
  ERROR: "#156082", FIELDER_CHOICE: "#0E2841", ONBASE: "#842479",
  OTHER: "#654B51", OTHER1: "#84344D", OTHER2: "#403165", OTHER3: "#BC4C14"
};

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

const CATEGORIES = ["아웃", "땅볼", "병살", "직선타", "뜬공", "희생타", "1루타", "2루타", "3루타", "홈런", "실책", "야수선택", "출루", "기타"];
const POSITIONS = ["투수", "포수", "1루수", "2루수", "3루수", "유격수", "좌익수", "중견수", "우익수", "지명타자"];
const PITCH_OUTCOMES = ["승", "패", "홀", "세", "-"];

function getContrastColor(hexcolor: string) {
  if (!hexcolor || hexcolor.length < 7) return '#000000';
  const r = parseInt(hexcolor.substr(1, 2), 16), g = parseInt(hexcolor.substr(3, 2), 16), b = parseInt(hexcolor.substr(5, 2), 16);
  return (((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128) ? '#000000' : '#ffffff';
}

// --- 타석 스탯 계산기 (any 타입 오류 수정) ---
const calcBatStats = (outcomes: string[]) => {
  let pa = 0, ab = 0, hits = 0, ob = 0, steals = 0;
  outcomes.forEach(inningStr => {
    if (!inningStr) return;
    const codes = inningStr.split(',').map((c: string) => c.trim()).filter(Boolean);
    if (codes.length > 0) pa++;
    codes.forEach((code: string) => {
      if (code === 'S') steals++;
      const isNumeric = /^\d+$/.test(code);
      if (!isNumeric) return;
      const match = code.match(/(\d+)$/) || code.match(/^(\d+)/);
      if (match) {
        const digit = parseInt(match[1].slice(-1));
        if ([0,1,2,3,4,5,6,9].includes(digit)) ab++;
        if ([1,2,3,4].includes(digit)) hits++;
        if ([1,2,3,4,7].includes(digit)) ob++;
      }
    });
  });
  return { pa, ab, hits, ob, steals };
};

// --- 기초 데이터 생성기 ---
const generateInitialBatters = () => Array.from({ length: 9 }, (_, i) => ({
  id: Date.now() + i, order: String(i + 1), name: '', position: '', outcomes: Array(9).fill(''), rbi: 0, runs: 0, isSubstitute: false
}));
const generateInitialPitchers = () => [{
  id: Date.now(), order: 1, name: '', result: '', innings: '', pitchcount: '', ER: '', RA: '', K: '', Hits: '', HRA: '', BB: '', isSubstitute: false
}];

// --- 타석 결과 코드표 컴포넌트 ---
const CodeMappingTable = ({ onCodeClick }: { onCodeClick: (code: string) => void }) => (
  <div className="bg-[#f0f2f5] p-2 border border-gray-200 rounded-lg mb-10 text-center">
    <h3 className="font-bold text-gray-700 mb-2 mt-1">
      타석 결과 코드표 
      <span className="text-xs text-blue-600 font-normal ml-2">
        (입력할 타석 칸을 먼저 클릭하고 표를 누르면 자동으로 입력됩니다)
      </span>
    </h3>
    <div className="flex flex-wrap justify-center gap-[2px]">
      {CATEGORIES.map(category => {
        const items = OUTCOME_CODES.filter(item => item.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="flex-[0_0_calc(100%/14-2px)] border border-[#ddd] rounded overflow-hidden bg-white">
            <div className="p-[3px] text-[11px] font-bold bg-[#e9ecef] text-center border-b border-[#ddd]">{category}</div>
            <table className="w-full border-collapse table-fixed m-0">
              <tbody>
                {items.map(item => (
                  <tr key={item.code}>
                    <td className="p-[1px] border border-[#eee] overflow-hidden text-ellipsis whitespace-nowrap text-[8px] w-[30%] text-center">{item.code}</td>
                    <td 
                      className="p-[1px] border border-[#eee] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] w-[70%] text-center cursor-pointer hover:brightness-90 active:scale-95 transition-all"
                      style={{ backgroundColor: item.color, color: getContrastColor(item.color) }}
                      title={item.text}
                      onMouseDown={(e) => {
                        e.preventDefault(); 
                        onCodeClick(item.code);
                      }}
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
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [inningTab, setInningTab] = useState<'away' | 'home'>('away');
  
  // 데이터 연동
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  
  // 상태 관리
  const [editingCell, setEditingCell] = useState<{ team: 'away'|'home', bIdx: number, inning: number } | null>(null);
  const [addOrderAway, setAddOrderAway] = useState('');
  const [addOrderHome, setAddOrderHome] = useState('');
  
  const [matchData, setMatchData] = useState({
    match_date: new Date().toISOString().split('T')[0],
    away_team_id: '',
    home_team_id: '',
    away_scores: Array(9).fill(''),
    home_scores: Array(9).fill(''),
    away_batters: generateInitialBatters(),
    home_batters: generateInitialBatters(),
    away_pitchers: generateInitialPitchers(),
    home_pitchers: generateInitialPitchers(),
  });

  const inputStyle = isAdmin ? "border border-gray-300 p-1 rounded w-full text-center focus:border-[#104175] focus:outline-none" : "w-full text-center bg-transparent text-black font-medium appearance-none";
  const selectStyle = isAdmin ? "border border-gray-300 p-1 rounded w-full" : "w-full bg-transparent text-black font-medium appearance-none text-center";

  useEffect(() => {
    checkRoleAndFetch();
  }, [id]);

  const checkRoleAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data?.role === 'admin' || data?.role === 'umpire') setIsAdmin(true);
    }
    const { data: teams } = await supabase.from('teams').select('*');
    if (teams) setAllTeams(teams);
    const { data: players } = await supabase.from('players').select('*');
    if (players) setAllPlayers(players);

    if (id !== 'new') {
      const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
      if (match && match.record_data) {
        setMatchData({ ...matchData, ...match, ...match.record_data });
      }
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;

    // ⭐ 1. 필수 입력값(팀 선택) 확인 방어 코드
    if (!matchData.away_team_id || !matchData.home_team_id) {
      alert('초공 팀과 말공 팀을 모두 선택해주세요!');
      return;
    }
    if (matchData.away_team_id === matchData.home_team_id) {
      alert('초공 팀과 말공 팀이 같을 수 없습니다!');
      return;
    }

    const awayTotal = matchData.away_scores.reduce((a, b) => a + (Number(b) || 0), 0);
    const homeTotal = matchData.home_scores.reduce((a, b) => a + (Number(b) || 0), 0);
    
    const saveData = {
      match_date: matchData.match_date,
      away_team_id: matchData.away_team_id,
      home_team_id: matchData.home_team_id,
      away_score: awayTotal,
      home_score: homeTotal,
      status: 'finished',
      record_data: {
        away_scores: matchData.away_scores,
        home_scores: matchData.home_scores,
        away_batters: matchData.away_batters,
        home_batters: matchData.home_batters,
        away_pitchers: matchData.away_pitchers,
        home_pitchers: matchData.home_pitchers,
      }
    };

    try {
      // ⭐ 2. 에러가 발생하면 화면에 띄워주도록 try-catch 추가
      if (id === 'new') {
        const { error } = await supabase.from('matches').insert([saveData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('matches').update(saveData).eq('id', id);
        if (error) throw error;
      }
      
      alert('기록이 성공적으로 저장되었습니다!');
      navigate('/matches');
      
    } catch (error: any) {
      console.error(error);
      alert(`저장 실패: ${error.message}`); // 어떤 에러인지 알림창으로 보여줌
    }
  };

  const handleAddBatter = (batTeam: 'away'|'home', orderStr: string) => {
    if (!orderStr) return alert("추가할 타순을 선택해주세요.");
    const targetOrder = Number(orderStr);
    const newBatter = { id: Date.now(), order: String(targetOrder), name: '', position: '', outcomes: Array(9).fill(''), rbi: 0, runs: 0, isSubstitute: true };
    const batters = [...matchData[`${batTeam}_batters`]];
    let insertIdx = batters.length;
    for (let i = 0; i < batters.length; i++) {
      if (parseInt(batters[i].order) > targetOrder) { insertIdx = i; break; }
    }
    batters.splice(insertIdx, 0, newBatter);
    setMatchData({ ...matchData, [`${batTeam}_batters`]: batters });
    if(batTeam === 'away') setAddOrderAway(''); else setAddOrderHome('');
  };

  const handleRemoveBatter = (batTeam: 'away'|'home', bIdx: number) => {
    if(!window.confirm('정말로 이 선수를 삭제하시겠습니까?')) return;
    const batters = [...matchData[`${batTeam}_batters`]];
    batters.splice(bIdx, 1);
    setMatchData({ ...matchData, [`${batTeam}_batters`]: batters });
  };

  const handleAddPitcher = (pitchTeam: 'away'|'home') => {
    const pitchers = [...matchData[`${pitchTeam}_pitchers`]];
    pitchers.push({ id: Date.now(), order: pitchers.length + 1, name: '', result: '', innings: '', pitchcount: '', ER: '', RA: '', K: '', Hits: '', HRA: '', BB: '', isSubstitute: true });
    setMatchData({ ...matchData, [`${pitchTeam}_pitchers`]: pitchers });
  };

  const handleRemovePitcher = (pitchTeam: 'away'|'home', pIdx: number) => {
    if(!window.confirm('정말로 이 투수를 삭제하시겠습니까?')) return;
    const pitchers = [...matchData[`${pitchTeam}_pitchers`]];
    pitchers.splice(pIdx, 1);
    setMatchData({ ...matchData, [`${pitchTeam}_pitchers`]: pitchers });
  };

  const handleOutcomeChange = (team: 'away'|'home', bIdx: number, inning: number, newValue: string) => {
    const batters = [...matchData[`${team}_batters`]];
    batters[bIdx].outcomes[inning] = newValue;
    setMatchData({ ...matchData, [`${team}_batters`]: batters });
  };

  const handleCodeClick = (code: string) => {
    if (!editingCell) return;
    const { team, bIdx, inning } = editingCell;
    const batters = [...matchData[`${team}_batters`]];
    const current = batters[bIdx].outcomes[inning] || '';
    
    if (!current.split(',').map((c: string) => c.trim()).includes(code)) {
      batters[bIdx].outcomes[inning] = current ? `${current}, ${code}` : code;
    }
    setMatchData({ ...matchData, [`${team}_batters`]: batters });
  };


  const renderHalfInning = (batTeam: 'away'|'home', pitchTeam: 'away'|'home') => {
    const batters = matchData[`${batTeam}_batters`];
    const pitchers = matchData[`${pitchTeam}_pitchers`];
    
    const batTeamId = matchData[`${batTeam}_team_id`];
    const pitchTeamId = matchData[`${pitchTeam}_team_id`];
    
    const batTeamName = allTeams.find(t => t.id === batTeamId)?.name || (batTeam === 'away' ? '초공팀' : '말공팀');
    const pitchTeamName = allTeams.find(t => t.id === pitchTeamId)?.name || (pitchTeam === 'away' ? '초공팀' : '말공팀');

    const batPlayers = allPlayers.filter(p => p.team_id === batTeamId);
    const pitchPlayers = allPlayers.filter(p => p.team_id === pitchTeamId);

    const addOrder = batTeam === 'away' ? addOrderAway : addOrderHome;
    const setAddOrder = batTeam === 'away' ? setAddOrderAway : setAddOrderHome;

    return (
      <div className="animate-fade-in">
        {/* 타자 표 */}
        <h3 className="text-xl font-bold mb-4">⚾ 타자 기록 : <span className="text-[#104175]">{batTeamName}</span></h3>
        <div className="overflow-x-auto mb-2">
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
                <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">안타</th>
                <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">출루</th>
                <th className="py-3 px-2 border-x border-gray-300 w-12 text-xs">도루</th>
              </tr>
            </thead>
            <tbody>
              {batters.map((b, bIdx) => {
                const stats = calcBatStats(b.outcomes);
                return (
                  <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">{b.order}</td>
                    
                    <td className="py-2 px-2 border-x border-gray-200 relative">
                      <div className="flex gap-1 justify-center items-center">
                        <select className={selectStyle} disabled={!isAdmin} value={b.name} onChange={e => {
                          const newB = [...batters]; newB[bIdx].name = e.target.value; setMatchData({...matchData, [`${batTeam}_batters`]: newB});
                        }}>
                          <option value="">선수 선택</option>
                          {batPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        {isAdmin && b.isSubstitute && (
                          <button onClick={() => handleRemoveBatter(batTeam, bIdx)} className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black hover:bg-red-600 shrink-0">X</button>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-2 px-2 border-x border-gray-200">
                      <select className={selectStyle} disabled={!isAdmin} value={b.position} onChange={e => {
                          const newB = [...batters]; newB[bIdx].position = e.target.value; setMatchData({...matchData, [`${batTeam}_batters`]: newB});
                        }}>
                        <option value=""></option>{POSITIONS.map((p: string) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>

                    {/* 타석 입력칸 (타입 에러 수정) */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(inning => {
                      const isEditing = editingCell?.team === batTeam && editingCell?.bIdx === bIdx && editingCell?.inning === inning;
                      const rawValue = b.outcomes[inning] || '';
                      
                      return (
                        <td key={inning} className="p-1 border-x border-gray-200 relative cursor-pointer" 
                            onClick={() => isAdmin && setEditingCell({ team: batTeam, bIdx, inning })}>
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              className="w-full text-center border-b-2 border-blue-500 focus:outline-none text-xs bg-blue-50 py-1"
                              value={rawValue}
                              onChange={(e) => handleOutcomeChange(batTeam, bIdx, inning, e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            />
                          ) : (
                            <div className="w-full min-h-[28px] text-[11px] flex flex-col items-center justify-center hover:bg-gray-100 rounded">
                              {rawValue.split(',').filter(Boolean).map((code: string, i: number) => {
                                const info = OUTCOME_CODES.find(c => c.code === code.trim());
                                return info ? <span key={i} style={{ color: info.color, fontWeight: 'bold' }}>{info.text}</span> : <span key={i}>{code}</span>;
                              })}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-2 border-x border-gray-200"><input type="number" className={inputStyle} disabled={!isAdmin} value={b.rbi === 0 ? '' : b.rbi} onChange={e => { const newB = [...batters]; newB[bIdx].rbi = Number(e.target.value); setMatchData({...matchData, [`${batTeam}_batters`]: newB}); }}/></td>
                    <td className="py-2 px-2 border-x border-gray-200"><input type="number" className={inputStyle} disabled={!isAdmin} value={b.runs === 0 ? '' : b.runs} onChange={e => { const newB = [...batters]; newB[bIdx].runs = Number(e.target.value); setMatchData({...matchData, [`${batTeam}_batters`]: newB}); }}/></td>
                    
                    <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">{stats.pa}</td>
                    <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">{stats.ab}</td>
                    <td className="py-2 px-2 border-x border-gray-200 font-bold text-[#4E930F]">{stats.hits}</td>
                    <td className="py-2 px-2 border-x border-gray-200 font-bold text-[#842479]">{stats.ob}</td>
                    <td className="py-2 px-2 border-x border-gray-200 font-bold text-[#BC4C14]">{stats.steals}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3 mb-12 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
            <span className="font-bold text-gray-700">타자 라인업 추가 ({batTeamName}):</span>
            <select className="border p-1 rounded" value={addOrder} onChange={e => setAddOrder(e.target.value)}>
              <option value="">타순 선택</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <option key={i} value={i}>{i}번</option>)}
            </select>
            <button onClick={() => handleAddBatter(batTeam, addOrder)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1 rounded font-bold hover:bg-gray-100">+ 선수 추가</button>
          </div>
        )}

        {/* 투수 표 */}
        <h3 className="text-xl font-bold mb-4 mt-10">⚾ 투수 기록 : <span className="text-red-700">{pitchTeamName}</span></h3>
        <div className="overflow-x-auto mb-2">
          <table className="w-full text-center border-collapse text-sm min-w-[900px]">
            <thead className="bg-[#f1f3f5] text-[#495057] font-bold border-y border-gray-300">
              <tr>
                <th className="py-3 px-2 border-x border-gray-300 w-12">순서</th>
                <th className="py-3 px-2 border-x border-gray-300 w-32">선수 이름</th>
                <th className="py-3 px-2 border-x border-gray-300 w-20">결과</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">이닝</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">투구수</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">자책점</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">실점</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">탈삼진</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">피안타</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">피홈런</th>
                <th className="py-3 px-2 border-x border-gray-300 w-16">사사구</th>
              </tr>
            </thead>
            <tbody>
              {pitchers.map((p, pIdx) => (
                <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-2 border-x border-gray-200 font-bold bg-gray-50">{p.order}</td>
                  <td className="py-2 px-2 border-x border-gray-200 relative">
                    <div className="flex gap-1 justify-center items-center">
                      <select disabled={!isAdmin} className={selectStyle} value={p.name} onChange={e => {
                        const newP = [...pitchers]; newP[pIdx].name = e.target.value; setMatchData({...matchData, [`${pitchTeam}_pitchers`]: newP});
                      }}>
                        <option value="">선수선택</option>
                        {pitchPlayers.map(player => <option key={player.id} value={player.name}>{player.name}</option>)}
                      </select>
                      {isAdmin && p.isSubstitute && (
                        <button onClick={() => handleRemovePitcher(pitchTeam, pIdx)} className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black hover:bg-red-600 shrink-0">X</button>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 border-x border-gray-200">
                    <select disabled={!isAdmin} className={selectStyle} value={p.result} onChange={e => {
                        const newP = [...pitchers]; newP[pIdx].result = e.target.value; setMatchData({...matchData, [`${pitchTeam}_pitchers`]: newP});
                      }}>
                      <option value=""></option>
                      {PITCH_OUTCOMES.map((r: string) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  {/* ⭐ Boolean 타입 할당 에러가 났던 곳 (as string | number 추가) */}
                  {['innings', 'pitchcount', 'ER', 'RA', 'K', 'Hits', 'HRA', 'BB'].map((stat: string) => (
                    <td key={stat} className="py-2 px-2 border-x border-gray-200">
                      <input disabled={!isAdmin} type="number" step={stat === 'innings' ? "0.1" : "1"} className={inputStyle} value={p[stat as keyof typeof p] as string | number} onChange={e => {
                        const newP = [...pitchers]; newP[pIdx][stat as 'innings'] = e.target.value; setMatchData({...matchData, [`${pitchTeam}_pitchers`]: newP});
                      }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3 mb-10 p-3 bg-red-50 rounded-xl border border-red-100 text-sm">
            <span className="font-bold text-red-800">투수 추가 ({pitchTeamName}):</span>
            <button onClick={() => handleAddPitcher(pitchTeam)} className="bg-white border border-red-300 text-red-800 px-4 py-1 rounded font-bold hover:bg-red-100">+ 투수 추가</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-white p-8 border border-gray-200 shadow-sm rounded-[32px] text-sm mb-20">
      
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-gray-500 font-bold mb-2">경기 기록 상세</h2>
          <div className="flex items-end gap-4">
            <h1 className="text-4xl font-black text-[#104175]">DUBI 리그 기록지</h1>
            {isAdmin && <input type="date" value={matchData.match_date} onChange={e => setMatchData({...matchData, match_date: e.target.value})} className="border border-gray-300 p-2 rounded-lg font-bold" />}
          </div>
        </div>
        <div className="space-x-2">
          {isAdmin && <button onClick={handleSave} className="bg-[#1e2a4a] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 shadow-sm">기록 저장</button>}
          <Link to="/matches" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200">목록으로 이동</Link>
        </div>
      </div>

      <div className="mb-10 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-bold border-y border-gray-200">
            <tr>
              <th className="py-3 px-2 w-32 border-x border-gray-200">TEAM</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="py-3 px-2 w-12 border-x border-gray-200">{i}</th>)}
              <th className="py-3 px-2 w-16 border-x border-gray-200 text-red-700">R</th>
            </tr>
          </thead>
          <tbody className="border-b border-gray-200">
            {['away', 'home'].map(team => {
              const teamKey = `${team}_team_id` as 'away_team_id' | 'home_team_id';
              const scoresKey = `${team}_scores` as 'away_scores' | 'home_scores';
              const scores = matchData[scoresKey];
              const total = scores.reduce((a, b) => a + (Number(b) || 0), 0);
              return (
                <tr key={team} className="border-b border-gray-100">
                  <td className="py-3 px-2 border-x border-gray-200 font-bold">
                    <select disabled={!isAdmin} className="w-full border border-gray-300 p-1 rounded font-bold text-center" value={matchData[teamKey]} onChange={e => setMatchData({...matchData, [teamKey]: e.target.value})}>
                      <option value="">{team === 'away' ? '초공 팀 선택' : '말공 팀 선택'}</option>
                      {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <td key={i} className="px-1 py-2 border-x border-gray-200">
                      <input disabled={!isAdmin} type="number" className={inputStyle} value={scores[i]} onChange={e => {
                        const newScores = [...scores]; newScores[i] = e.target.value; setMatchData({...matchData, [scoresKey]: newScores});
                      }}/>
                    </td>
                  ))}
                  <td className="py-3 px-2 border-x border-gray-200 text-red-700 font-black text-lg">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isAdmin && <CodeMappingTable onCodeClick={handleCodeClick} />}

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px mt-10">
        <button onClick={() => setInningTab('away')} className={`px-8 py-3 font-bold text-base rounded-t-xl transition-colors border border-b-0 ${inningTab === 'away' ? 'bg-[#104175] text-white border-[#104175]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}>
          초공 : {allTeams.find(t => t.id === matchData.away_team_id)?.name || '팀미정'}
        </button>
        <button onClick={() => setInningTab('home')} className={`px-8 py-3 font-bold text-base rounded-t-xl transition-colors border border-b-0 ${inningTab === 'home' ? 'bg-[#104175] text-white border-[#104175]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}>
          말공 : {allTeams.find(t => t.id === matchData.home_team_id)?.name || '팀미정'}
        </button>
      </div>

      {inningTab === 'away' ? renderHalfInning('away', 'home') : renderHalfInning('home', 'away')}

    </div>
  );
}