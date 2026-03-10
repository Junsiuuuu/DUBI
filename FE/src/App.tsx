import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Home } from './pages/Home'; // (아까 만든 Home 컴포넌트를 여기에 연결)
import MatchRecord from './pages/MatchRecord';
import PlayerStats from './pages/PlayerStats';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="record" element={<MatchRecord />} />
          <Route path="stats" element={<PlayerStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;