import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 통합 기록 상태
  const [batStats, setBatStats] = useState<any>(null);
  const [pitchStats, setPitchStats] = useState<any>(null);

  // 경기별 기록 배열
  const [allBattingRecords, setAllBattingRecords] = useState<any[]>([]);
  const [allPitchingRecords, setAllPitchingRecords] = useState<any[]>([]);

  // 더보기 토글 상태
  const [showAllBatting, setShowAllBatting] = useState(false);
  const [showAllPitching, setShowAllPitching] = useState(false);

  const BATTING_LIMIT = 5;
  const PITCHING_LIMIT = 5;

  useEffect(() => {
    fetchPlayerData();
  }, [id]);

  const fetchPlayerData = async () => {
    setIsLoading(true);

    const { data: playerData } = await supabase
      .from('players')
      .select('*, team:teams(id, name)')
      .eq('id', id)
      .single();

    if (!playerData) {
      setIsLoading(false);
      return;
    }
    setPlayer(playerData);

    const { data: matches } = await supabase
      .from('matches')
      .select('*, away_team:teams!matches_away_team_id_fkey(name), home_team:teams!matches_home_team_id_fkey(name)')
      .or(`away_team_id.eq.${playerData.team_id},home_team_id.eq.${playerData.team_id}`)
      .eq('status', 'finished')
      .order('match_date', { ascending: false });

    const bRecords: any[] = [];
    const pRecords: any[] = [];

    const bAcc = { games: 0, pa: 0, ab: 0, hits: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, runs: 0, steals: 0, ob: 0 };
    const pAcc = { games: 0, outs: 0, pitchcount: 0, ER: 0, RA: 0, K: 0, Hits: 0, HRA: 0, BB: 0, wins: 0, losses: 0, saves: 0, holds: 0 };

    if (matches) {
      matches.forEach(match => {
        const isAway = match.away_team_id === playerData.team_id;
        const teamBatters = isAway ? match.record_data?.away_batters : match.record_data?.home_batters;
        const teamPitchers = isAway ? match.record_data?.away_pitchers : match.record_data?.home_pitchers;
        const gameTitle = `${match.away_team?.name} vs ${match.home_team?.name}`;

        // 타자 기록 추출
        const batter = (teamBatters || []).find((b: any) => b.name === playerData.name);
        if (batter) {
          let pa = 0, ab = 0, hits = 0, ob = 0, steals = 0, doubles = 0, triples = 0, hr = 0;
          
          (batter.outcomes || []).forEach((inningStr: string) => {
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

          const rbi = Number(batter.rbi) || 0;
          const runs = Number(batter.runs) || 0;
          const walks = ob - hits;
          const singles = hits - doubles - triples - hr;

          bRecords.push({ gameDate: match.match_date, gameTitle, pa, ab, hits, singles, doubles, triples, hr, rbi, runs, steals, walks });

          bAcc.games++;
          bAcc.pa += pa; bAcc.ab += ab; bAcc.hits += hits; bAcc.doubles += doubles; bAcc.triples += triples; bAcc.hr += hr;
          bAcc.rbi += rbi; bAcc.runs += runs; bAcc.steals += steals; bAcc.ob += ob;
        }

        // 투수 기록 추출
        const pitcher = (teamPitchers || []).find((p: any) => p.name === playerData.name);
        if (pitcher) {
          const inn = Number(pitcher.innings) || 0;
          const full = Math.floor(inn);
          const partial = Math.round((inn - full) * 10);
          const outs = full * 3 + partial;

          pRecords.push({
            gameDate: match.match_date, gameTitle, result: pitcher.result || '-',
            innings: pitcher.innings || 0, pitchcount: pitcher.pitchcount || 0,
            ER: pitcher.ER || 0, RA: pitcher.RA || 0, K: pitcher.K || 0,
            Hits: pitcher.Hits || 0, HRA: pitcher.HRA || 0, BB: pitcher.BB || 0
          });

          pAcc.games++; pAcc.outs += outs; pAcc.pitchcount += Number(pitcher.pitchcount) || 0;
          pAcc.ER += Number(pitcher.ER) || 0; pAcc.RA += Number(pitcher.RA) || 0; pAcc.K += Number(pitcher.K) || 0;
          pAcc.Hits += Number(pitcher.Hits) || 0; pAcc.HRA += Number(pitcher.HRA) || 0; pAcc.BB += Number(pitcher.BB) || 0;

          if (pitcher.result === '승') pAcc.wins++;
          if (pitcher.result === '패') pAcc.losses++;
          if (pitcher.result === '세') pAcc.saves++;
          if (pitcher.result === '홀') pAcc.holds++;
        }
      });
    }

    const singles = bAcc.hits - bAcc.doubles - bAcc.triples - bAcc.hr;
    const totalBases = singles + (bAcc.doubles * 2) + (bAcc.triples * 3) + (bAcc.hr * 4);
    const avg = bAcc.ab > 0 ? (bAcc.hits / bAcc.ab).toFixed(3) : '0.000';
    const obp = bAcc.pa > 0 ? (bAcc.ob / bAcc.pa).toFixed(3) : '0.000';
    const slg = bAcc.ab > 0 ? (totalBases / bAcc.ab).toFixed(3) : '0.000';
    const ops = (parseFloat(obp) + parseFloat(slg)).toFixed(3);
    setBatStats({ ...bAcc, singles, walks: bAcc.ob - bAcc.hits, avg, obp, slg, ops });

    const era = pAcc.outs > 0 ? ((pAcc.ER * 27) / pAcc.outs).toFixed(2) : '0.00';
    const totalInnings = Math.floor(pAcc.outs / 3) + (pAcc.outs % 3) / 10;
    setPitchStats({ ...pAcc, era, totalInnings });

    setAllBattingRecords(bRecords);
    setAllPitchingRecords(pRecords);
    setIsLoading(false);
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold">기록을 불러오는 중입니다...</div>;
  if (!player) return <div className="text-center py-20 text-gray-500 font-bold">존재하지 않는 선수입니다.</div>;

  // 공통 테이블 스타일 클래스
  const thClass = "border border-[#dee2e6] p-2.5 text-center text-sm bg-[#e9ecef] font-bold text-[#495057] whitespace-nowrap";
  const tdClass = "border border-[#dee2e6] p-2.5 text-center text-sm";
  const tableClass = "w-full border-collapse my-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-white";

  return (
    <div className="max-w-[1200px] mx-auto bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      
      <h1 className="text-[#104175] text-left mt-2 mb-5 font-bold text-3xl">
        <span className="text-[#666] text-[0.8em] mr-2">[{player.team?.name}]</span> 
        {player.name} <span className="text-[0.9em] text-black">선수 기록</span>
      </h1>

      {/* --- 통합 타자 성적 --- */}
      <div id="integratedBattingRecord">
        <h2 className="mt-[30px] text-[1.5em] text-[#343a40] font-bold mb-2">통합 타자 성적</h2>
        {allBattingRecords.length === 0 ? (
          <p className="text-center text-[#6c757d] mt-5">타격 기록이 존재하지 않습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>경기수</th><th className={thClass}>타율</th>
                  <th className={thClass}>타석</th><th className={thClass}>타수</th>
                  <th className={thClass}>안타</th><th className={thClass}>단타</th>
                  <th className={thClass}>2루타</th><th className={thClass}>3루타</th>
                  <th className={thClass}>홈런</th><th className={thClass}>타점</th>
                  <th className={thClass}>득점</th><th className={thClass}>도루</th>
                  <th className={thClass}>볼넷</th><th className={thClass}>출루율</th>
                  <th className={thClass}>장타율</th><th className={thClass}>OPS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-[#f2f2f2]">
                  <td className={tdClass}>{batStats.games}</td><td className={tdClass}>{batStats.avg}</td>
                  <td className={tdClass}>{batStats.pa}</td><td className={tdClass}>{batStats.ab}</td>
                  <td className={tdClass}>{batStats.hits}</td><td className={tdClass}>{batStats.singles}</td>
                  <td className={tdClass}>{batStats.doubles}</td><td className={tdClass}>{batStats.triples}</td>
                  <td className={tdClass}>{batStats.hr}</td><td className={tdClass}>{batStats.rbi}</td>
                  <td className={tdClass}>{batStats.runs}</td><td className={tdClass}>{batStats.steals}</td>
                  <td className={tdClass}>{batStats.walks}</td><td className={tdClass}>{batStats.obp}</td>
                  <td className={tdClass}>{batStats.slg}</td><td className={tdClass}>{batStats.ops}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <hr className="border-[#dee2e6] my-8" />

      {/* --- 경기별 타자 성적 --- */}
      <div id="gameBattingRecord">
        <h2 className="mt-[30px] text-[1.5em] text-[#343a40] font-bold mb-2">경기별 타자 성적</h2>
        {allBattingRecords.length === 0 ? (
          <p className="text-center text-[#6c757d] mt-5">타격 기록이 존재하지 않습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>경기 일자</th><th className={thClass}>경기명</th>
                  <th className={thClass}>타석</th><th className={thClass}>타수</th>
                  <th className={thClass}>안타</th><th className={thClass}>단타</th>
                  <th className={thClass}>2루타</th><th className={thClass}>3루타</th>
                  <th className={thClass}>홈런</th><th className={thClass}>타점</th>
                  <th className={thClass}>득점</th><th className={thClass}>도루</th>
                  <th className={thClass}>볼넷</th>
                </tr>
              </thead>
              <tbody>
                {(showAllBatting ? allBattingRecords : allBattingRecords.slice(0, BATTING_LIMIT)).map((r, i) => (
                  <tr key={i} className="even:bg-[#f2f2f2]">
                    <td className={tdClass}>{r.gameDate}</td><td className={tdClass}>{r.gameTitle}</td>
                    <td className={tdClass}>{r.pa}</td><td className={tdClass}>{r.ab}</td>
                    <td className={tdClass}>{r.hits}</td><td className={tdClass}>{r.singles}</td>
                    <td className={tdClass}>{r.doubles}</td><td className={tdClass}>{r.triples}</td>
                    <td className={tdClass}>{r.hr}</td><td className={tdClass}>{r.rbi}</td>
                    <td className={tdClass}>{r.runs}</td><td className={tdClass}>{r.steals}</td>
                    <td className={tdClass}>{r.walks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allBattingRecords.length > BATTING_LIMIT && (
              <button 
                onClick={() => setShowAllBatting(!showAllBatting)} 
                className="block mx-auto mt-[5px] px-[10px] py-[7px] cursor-pointer bg-[#5e5e5e80] text-white border-none rounded-[5px] text-[12px] hover:bg-[#5e5e5e]"
              >
                {showAllBatting ? '간략히 보기' : '전체 기록 보기'}
              </button>
            )}
          </div>
        )}
      </div>

      <hr className="border-[#dee2e6] my-8" />

      {/* --- 통합 투수 성적 --- */}
      <div id="integratedPitchingRecord">
        <h2 className="mt-[30px] text-[1.5em] text-[#343a40] font-bold mb-2">통합 투수 성적</h2>
        {allPitchingRecords.length === 0 ? (
          <p className="text-center text-[#6c757d] mt-5">투구 기록이 존재하지 않습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>경기수</th><th className={thClass}>평균자책점</th>
                  <th className={thClass}>승</th><th className={thClass}>패</th>
                  <th className={thClass}>세</th><th className={thClass}>홀</th>
                  <th className={thClass}>이닝</th><th className={thClass}>투구수</th>
                  <th className={thClass}>자책점</th><th className={thClass}>실점</th>
                  <th className={thClass}>탈삼진</th><th className={thClass}>피안타</th>
                  <th className={thClass}>피홈런</th><th className={thClass}>사사구</th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-[#f2f2f2]">
                  <td className={tdClass}>{pitchStats.games}</td><td className={tdClass}>{pitchStats.era}</td>
                  <td className={tdClass}>{pitchStats.wins}</td><td className={tdClass}>{pitchStats.losses}</td>
                  <td className={tdClass}>{pitchStats.saves}</td><td className={tdClass}>{pitchStats.holds}</td>
                  <td className={tdClass}>{pitchStats.totalInnings.toFixed(1)}</td><td className={tdClass}>{pitchStats.pitchcount}</td>
                  <td className={tdClass}>{pitchStats.ER}</td><td className={tdClass}>{pitchStats.RA}</td>
                  <td className={tdClass}>{pitchStats.K}</td><td className={tdClass}>{pitchStats.Hits}</td>
                  <td className={tdClass}>{pitchStats.HRA}</td><td className={tdClass}>{pitchStats.BB}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <hr className="border-[#dee2e6] my-8" />

      {/* --- 경기별 투수 성적 --- */}
      <div id="gamePitchingRecord">
        <h2 className="mt-[30px] text-[1.5em] text-[#343a40] font-bold mb-2">경기별 투수 성적</h2>
        {allPitchingRecords.length === 0 ? (
          <p className="text-center text-[#6c757d] mt-5">투구 기록이 존재하지 않습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>경기 일자</th><th className={thClass}>경기명</th>
                  <th className={thClass}>결과</th><th className={thClass}>이닝</th>
                  <th className={thClass}>투구수</th><th className={thClass}>자책점</th>
                  <th className={thClass}>실점</th><th className={thClass}>탈삼진</th>
                  <th className={thClass}>피안타</th><th className={thClass}>피홈런</th>
                  <th className={thClass}>사사구</th>
                </tr>
              </thead>
              <tbody>
                {(showAllPitching ? allPitchingRecords : allPitchingRecords.slice(0, PITCHING_LIMIT)).map((r, i) => (
                  <tr key={i} className="even:bg-[#f2f2f2]">
                    <td className={tdClass}>{r.gameDate}</td><td className={tdClass}>{r.gameTitle}</td>
                    <td className={tdClass}>{r.result}</td><td className={tdClass}>{r.innings}</td>
                    <td className={tdClass}>{r.pitchcount}</td><td className={tdClass}>{r.ER}</td>
                    <td className={tdClass}>{r.RA}</td><td className={tdClass}>{r.K}</td>
                    <td className={tdClass}>{r.Hits}</td><td className={tdClass}>{r.HRA}</td>
                    <td className={tdClass}>{r.BB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allPitchingRecords.length > PITCHING_LIMIT && (
              <button 
                onClick={() => setShowAllPitching(!showAllPitching)} 
                className="block mx-auto mt-[5px] px-[10px] py-[7px] cursor-pointer bg-[#5e5e5e80] text-white border-none rounded-[5px] text-[12px] hover:bg-[#5e5e5e]"
              >
                {showAllPitching ? '간략히 보기' : '전체 기록 보기'}
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}