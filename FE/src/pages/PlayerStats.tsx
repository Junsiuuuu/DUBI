import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PlayerStats() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'batter' | 'pitcher'>('batter');
  
  // ⭐ 기본값을 'all'(전체 기록)로 설정
  const [filterType, setFilterType] = useState<'qualified' | 'all'>('all');
  
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [batterRecords, setBatterRecords] = useState<any[]>([]);
  const [pitcherRecords, setPitcherRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [bSortKey, setBSortKey] = useState('avg');
  const [bSortDir, setBSortDir] = useState<'asc' | 'desc'>('desc');
  const [pSortKey, setPSortKey] = useState('era');
  const [pSortDir, setPSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchAndProcessStats();
  }, []);

  const fetchAndProcessStats = async () => {
    setIsLoading(true);
    
    // ⭐ 팀 목록, 경기 목록뿐만 아니라 'players' 테이블도 가져와서 ID를 매칭합니다.
    const { data: teamsData } = await supabase.from('teams').select('*');
    const { data: playersData } = await supabase.from('players').select('*');
    const { data: matchesData } = await supabase.from('matches').select('away_team_id, home_team_id, record_data').eq('status', 'finished');

    if (!teamsData || !matchesData || !playersData) {
      setIsLoading(false);
      return;
    }
    
    setAllTeams(teamsData);

    const teamGames: Record<string, number> = {};
    const bMap: Record<string, any> = {};
    const pMap: Record<string, any> = {};

    // ⭐ 선수 ID를 미리 세팅해 둡니다 (이름에 공백이 있어도 매칭되도록 trim 처리)
    playersData.forEach(p => {
      const tName = teamsData.find(t => t.id === p.team_id)?.name || 'Unknown';
      const key = `${p.name.trim()}_${tName}`;
      bMap[key] = { id: p.id, name: p.name.trim(), teamName: tName, games: 0, pa: 0, ab: 0, hits: 0, rbi: 0, runs: 0, steals: 0, ob: 0, doubles: 0, triples: 0, hr: 0 };
      pMap[key] = { id: p.id, name: p.name.trim(), teamName: tName, games: 0, outs: 0, pitchcount: 0, ER: 0, RA: 0, K: 0, Hits: 0, HRA: 0, BB: 0 };
    });

    matchesData.forEach(match => {
      const record = match.record_data;
      if (!record) return;

      const awayTeamName = teamsData.find(t => t.id === match.away_team_id)?.name || 'Unknown';
      const homeTeamName = teamsData.find(t => t.id === match.home_team_id)?.name || 'Unknown';

      teamGames[awayTeamName] = (teamGames[awayTeamName] || 0) + 1;
      teamGames[homeTeamName] = (teamGames[homeTeamName] || 0) + 1;

      const processBatters = (batters: any[], teamName: string) => {
        batters.forEach(b => {
          if (!b.name || b.name.trim() === '') return;
          const key = `${b.name.trim()}_${teamName}`;
          
          if (!bMap[key]) {
            bMap[key] = { id: '', name: b.name.trim(), teamName, games: 0, pa: 0, ab: 0, hits: 0, rbi: 0, runs: 0, steals: 0, ob: 0, doubles: 0, triples: 0, hr: 0 };
          }
          bMap[key].games += 1;

          let pa = 0, ab = 0, hits = 0, ob = 0, steals = 0, doubles = 0, triples = 0, hr = 0;
          
          (b.outcomes || []).forEach((inningStr: string) => {
            if (!inningStr) return;
            const codes = inningStr.split(',').map((c: string) => c.trim()).filter(Boolean);
            if (codes.length > 0) pa++;
            
            codes.forEach((code: string) => {
              if (code === 'S') steals++;
              const isNum = /^\d+$/.test(code);
              if (!isNum) return;
              
              const m = code.match(/(\d+)$/) || code.match(/^(\d+)/);
              if (m) {
                const d = parseInt(m[1].slice(-1));
                if ([0, 1, 2, 3, 4, 5, 6, 9].includes(d)) ab++;
                if ([1, 2, 3, 4].includes(d)) hits++;
                if ([1, 2, 3, 4, 7].includes(d)) ob++;
                if (d === 2) doubles++;
                if (d === 3) triples++;
                if (d === 4) hr++;
              }
            });
          });

          const r = bMap[key];
          r.pa += pa; r.ab += ab; r.hits += hits; r.ob += ob; r.steals += steals;
          r.doubles += doubles; r.triples += triples; r.hr += hr;
          r.rbi += Number(b.rbi) || 0; 
          r.runs += Number(b.runs) || 0;
        });
      };

      processBatters(record.away_batters || [], awayTeamName);
      processBatters(record.home_batters || [], homeTeamName);

      const processPitchers = (pitchers: any[], teamName: string) => {
        pitchers.forEach(p => {
          if (!p.name || p.name.trim() === '') return;
          const key = `${p.name.trim()}_${teamName}`;
          
          if (!pMap[key]) {
            pMap[key] = { id: '', name: p.name.trim(), teamName, games: 0, outs: 0, pitchcount: 0, ER: 0, RA: 0, K: 0, Hits: 0, HRA: 0, BB: 0 };
          }
          pMap[key].games += 1;

          const inn = Number(p.innings) || 0;
          const full = Math.floor(inn);
          const partial = Math.round((inn - full) * 10);
          const outs = full * 3 + partial;

          const r = pMap[key];
          r.outs += outs;
          r.pitchcount += Number(p.pitchcount) || 0;
          r.ER += Number(p.ER) || 0;
          r.RA += Number(p.RA) || 0;
          r.K += Number(p.K) || 0;
          r.Hits += Number(p.Hits) || 0;
          r.HRA += Number(p.HRA) || 0;
          r.BB += Number(p.BB) || 0;
        });
      };

      processPitchers(record.away_pitchers || [], awayTeamName);
      processPitchers(record.home_pitchers || [], homeTeamName);
    });

    // 1경기라도 출전한 적이 있는 선수만 필터링
    const activeBatters = Object.values(bMap).filter(b => b.games > 0);
    const activePitchers = Object.values(pMap).filter(p => p.games > 0);

    const finalBatters = activeBatters.map(b => {
      const requiredPA = (teamGames[b.teamName] || 0) * 2; 
      const isQualified = b.pa >= requiredPA;
      
      const avg = b.ab > 0 ? b.hits / b.ab : 0;
      const obp = b.pa > 0 ? b.ob / b.pa : 0;
      const singles = b.hits - b.doubles - b.triples - b.hr;
      const totalBases = singles + (2 * b.doubles) + (3 * b.triples) + (4 * b.hr);
      const slg = b.ab > 0 ? totalBases / b.ab : 0;
      const ops = obp + slg;

      return { ...b, avg, obp, slg, ops, isQualified };
    });

    const finalPitchers = activePitchers.map(p => {
      const requiredOuts = (teamGames[p.teamName] || 0) * 3; 
      const isQualified = p.outs >= requiredOuts;
      
      const era = p.outs > 0 ? (p.ER * 27) / p.outs : 99.99; 
      const innings = Math.floor(p.outs / 3) + (p.outs % 3) / 10; 

      return { ...p, era, innings, isQualified };
    });

    setBatterRecords(finalBatters);
    setPitcherRecords(finalPitchers);
    setIsLoading(false);
  };

  const SortArrow = ({ sortKey, currentKey, direction }: { sortKey: string, currentKey: string, direction: 'asc'|'desc' }) => {
    if (sortKey !== currentKey) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-gray-700">{direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const handleSort = (type: 'batter'|'pitcher', key: string) => {
    if (type === 'batter') {
      if (bSortKey === key) setBSortDir(bSortDir === 'desc' ? 'asc' : 'desc');
      else { setBSortKey(key); setBSortDir('desc'); } 
    } else {
      if (pSortKey === key) setPSortDir(pSortDir === 'desc' ? 'asc' : 'desc');
      else { setPSortKey(key); setPSortDir(key === 'era' ? 'asc' : 'desc'); } 
    }
  };

  const displayBatters = useMemo(() => {
    let arr = [...batterRecords];
    if (filterType === 'qualified') arr = arr.filter(b => b.isQualified);
    
    arr.sort((a, b) => {
      const aVal = a[bSortKey]; const bVal = b[bSortKey];
      return bSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [batterRecords, filterType, bSortKey, bSortDir]);

  const displayPitchers = useMemo(() => {
    let arr = [...pitcherRecords];
    if (filterType === 'qualified') arr = arr.filter(p => p.isQualified);
    
    arr.sort((a, b) => {
      const aVal = a[pSortKey]; const bVal = b[pSortKey];
      return pSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [pitcherRecords, filterType, pSortKey, pSortDir]);

  return (
    <div className="max-w-[1200px] mx-auto bg-[#f8f9fa] min-h-screen p-6 font-sans">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[#104175]">⚾ 선수 통합 기록</h1>
      </div>

      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('batter')} 
            className={`px-5 py-2 text-sm rounded-t-lg transition-colors border border-b-0 ${activeTab === 'batter' ? 'bg-white font-bold text-black border-gray-300' : 'bg-[#e9ecef] text-[#495057] border-transparent hover:bg-gray-200'}`}
          >
            타자 기록
          </button>
          <button 
            onClick={() => setActiveTab('pitcher')} 
            className={`px-5 py-2 text-sm rounded-t-lg transition-colors border border-b-0 ${activeTab === 'pitcher' ? 'bg-white font-bold text-black border-gray-300' : 'bg-[#e9ecef] text-[#495057] border-transparent hover:bg-gray-200'}`}
          >
            투수 기록
          </button>
        </div>
        
        {/* ⭐ 라디오 버튼 순서 변경: '전체 기록'이 먼저 오도록 배치 */}
        <div className="text-sm text-gray-700 flex gap-4 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="filter" value="all" checked={filterType === 'all'} onChange={() => setFilterType('all')} className="accent-[#104175]" /> 
            전체 기록
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="filter" value="qualified" checked={filterType === 'qualified'} onChange={() => setFilterType('qualified')} className="accent-[#104175]" /> 
            규정타석/이닝 충족
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm overflow-hidden mt-[-1px]">
        
        {/* === 타자 기록 테이블 === */}
        {activeTab === 'batter' && (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#e9ecef] text-[#495057] font-bold text-sm border-b border-gray-300 whitespace-nowrap">
                <tr>
                  <th className="py-3 px-2 border-r border-gray-200 w-24">소속 팀</th>
                  <th className="py-3 px-2 border-r border-gray-200 w-28">이름</th>
                  {[
                    { key: 'games', label: '출전경기수' }, { key: 'avg', label: '타율' }, { key: 'obp', label: '출루율' },
                    { key: 'slg', label: '장타율' }, { key: 'ops', label: 'OPS' }, { key: 'pa', label: '타석' },
                    { key: 'ab', label: '타수' }, { key: 'hits', label: '안타' }, { key: 'rbi', label: '타점' },
                    { key: 'runs', label: '득점' }, { key: 'steals', label: '도루' }, { key: 'ob', label: '출루' }
                  ].map(col => (
                    <th key={col.key} className="py-3 px-2 border-r border-gray-200 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('batter', col.key)}>
                      {col.label} <SortArrow sortKey={col.key} currentKey={bSortKey} direction={bSortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {isLoading ? (
                  <tr><td colSpan={14} className="py-8 text-gray-500">기록을 불러오는 중입니다...</td></tr>
                ) : displayBatters.length === 0 ? (
                  <tr><td colSpan={14} className="py-8 text-gray-500">조건에 맞는 데이터가 없습니다.</td></tr>
                ) : (
                  displayBatters.map((r, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${!r.isQualified && filterType === 'all' ? 'text-gray-400' : 'text-gray-800'}`}>
                      <td className="py-3 px-2 border-r border-gray-100">{r.teamName}</td>
                      <td className="py-3 px-2 border-r border-gray-100 font-bold hover:underline cursor-pointer text-[#104175]">
                        {/* ⭐ 선수 ID가 정상적으로 있을 때만 링크를 달아줍니다 */}
                        {r.id ? <Link to={`/player/${r.id}`}>{r.name}</Link> : <span>{r.name}</span>}
                      </td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.games}</td>
                      <td className="py-3 px-2 border-r border-gray-100 font-black tabular-nums">{r.avg.toFixed(3)}</td>
                      <td className="py-3 px-2 border-r border-gray-100 tabular-nums">{r.obp.toFixed(3)}</td>
                      <td className="py-3 px-2 border-r border-gray-100 tabular-nums">{r.slg.toFixed(3)}</td>
                      <td className="py-3 px-2 border-r border-gray-100 tabular-nums">{r.ops.toFixed(3)}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.pa}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.ab}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.hits}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.rbi}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.runs}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.steals}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.ob}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* === 투수 기록 테이블 === */}
        {activeTab === 'pitcher' && (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#e9ecef] text-[#495057] font-bold text-sm border-b border-gray-300 whitespace-nowrap">
                <tr>
                  <th className="py-3 px-2 border-r border-gray-200 w-24">소속 팀</th>
                  <th className="py-3 px-2 border-r border-gray-200 w-28">이름</th>
                  {[
                    { key: 'games', label: '출전경기수' }, { key: 'era', label: '평균자책점' }, { key: 'innings', label: '이닝' },
                    { key: 'pitchcount', label: '투구수' }, { key: 'ER', label: '자책점' }, { key: 'RA', label: '실점' },
                    { key: 'K', label: '탈삼진' }, { key: 'Hits', label: '피안타' }, { key: 'HRA', label: '피홈런' }, { key: 'BB', label: '볼넷' }
                  ].map(col => (
                    <th key={col.key} className="py-3 px-2 border-r border-gray-200 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('pitcher', col.key)}>
                      {col.label} <SortArrow sortKey={col.key} currentKey={pSortKey} direction={pSortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {isLoading ? (
                  <tr><td colSpan={12} className="py-8 text-gray-500">기록을 불러오는 중입니다...</td></tr>
                ) : displayPitchers.length === 0 ? (
                  <tr><td colSpan={12} className="py-8 text-gray-500">조건에 맞는 데이터가 없습니다.</td></tr>
                ) : (
                  displayPitchers.map((r, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${!r.isQualified && filterType === 'all' ? 'text-gray-400' : 'text-gray-800'}`}>
                      <td className="py-3 px-2 border-r border-gray-100">{r.teamName}</td>
                      <td className="py-3 px-2 border-r border-gray-100 font-bold hover:underline cursor-pointer text-[#104175]">
                        {/* ⭐ 선수 ID가 정상적으로 있을 때만 링크를 달아줍니다 */}
                        {r.id ? <Link to={`/player/${r.id}`}>{r.name}</Link> : <span>{r.name}</span>}
                      </td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.games}</td>
                      <td className="py-3 px-2 border-r border-gray-100 font-black tabular-nums">{r.era.toFixed(2)}</td>
                      <td className="py-3 px-2 border-r border-gray-100 tabular-nums">{r.innings.toFixed(1)}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.pitchcount}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.ER}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.RA}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.K}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.Hits}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.HRA}</td>
                      <td className="py-3 px-2 border-r border-gray-100">{r.BB}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}