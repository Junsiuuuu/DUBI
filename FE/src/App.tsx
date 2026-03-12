import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Home } from './pages/Home';               
import MatchList from './pages/MatchList';         
import MatchRecord from './pages/MatchRecord';
import PlayerStats from './pages/PlayerStats';
import TeamStandings from './pages/TeamStandings'; 
import Login from './pages/Login';                 
import Signup from './pages/Signup'; 
import Profile from './pages/Profile'; 
import ResetPassword from './pages/ResetPassword';   
import UpdatePassword from './pages/UpdatePassword'; 
import TeamPage from './pages/TeamPage';
import PlayerPage from './pages/PlayerPage';
import AdminPage from './pages/AdminPage';

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
          <Route path="profile" element={<Profile />} /> 
          <Route path="reset-password" element={<ResetPassword />} /> 
          <Route path="update-password" element={<UpdatePassword />} /> 
          <Route path="team/:id" element={<TeamPage />} />
          <Route path="player/:id" element={<PlayerPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;