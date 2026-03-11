import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  const isAdminLoggedIn = false; 

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      <header className="flex justify-between items-center px-12 py-5 bg-white border-b border-gray-100">
        
        {/* 로고 영역 (클릭 시 메인 대시보드로 이동) */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="bg-black text-white px-3 py-1 rounded-full font-black text-xl tracking-tighter">
            DUBI
          </div>
          <span className="text-gray-400 text-xs font-medium">
            대전대학야구인비테이셔널
          </span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-10 text-[15px] font-semibold text-gray-500">
          {/* ⭐ 경기 목록 주소를 /matches로 변경! */}
          <Link to="/matches" className="hover:text-black transition-colors">
            경기 목록
          </Link>
          <Link to="/standings" className="hover:text-black transition-colors">
            순위표
          </Link>
          <Link to="/stats" className="hover:text-black transition-colors">
            선수 기록
          </Link>
          
          {isAdminLoggedIn ? (
            <button className="ml-4 px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
              관리자 로그아웃
            </button>
          ) : (
            <Link 
              to="/login" 
              className="ml-4 px-6 py-2 border border-gray-200 rounded-xl font-bold text-black hover:bg-gray-50 transition-all"
            >
              로그인
            </Link>
          )}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <Outlet />
      </main>
    </div>
  );
}