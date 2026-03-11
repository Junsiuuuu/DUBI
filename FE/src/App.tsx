import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Home } from './pages/Home';           
import MatchList from './pages/MatchList';         
import MatchRecord from './pages/MatchRecord';
import PlayerStats from './pages/PlayerStats';
import TeamStandings from './pages/TeamStandings'; 
import Login from './pages/Login';                 
import Signup from './pages/Signup'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />                      
          <Route path="matches" element={<MatchList />} />        
          <Route path="standings" element={<TeamStandings />} />  
          <Route path="stats" element={<PlayerStats />} />        
          <Route path="record/:id" element={<MatchRecord />} />   
          <Route path="login" element={<Login />} />              
          <Route path="signup" element={<Signup />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;