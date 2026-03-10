import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-[#1e2a4a] text-white px-3 py-1 rounded-full font-bold text-lg">DUBI</div>
          <span className="text-gray-500 text-sm font-medium">대전대학야구인비테이셔널</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-black">홈</Link>
          <Link to="/record" className="hover:text-black">경기 기록 입력</Link>
          <Link to="/stats" className="hover:text-black">선수 기록</Link>
          <button className="ml-4 px-4 py-1.5 bg-[#4a5568] text-white rounded-md hover:bg-gray-700 text-sm">로그인</button>
        </nav>
      </header>
      {/* 이 Outlet 부분에 각 페이지 내용이 바뀝니다 */}
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}