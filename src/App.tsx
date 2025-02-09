import { Route, Routes ,Navigate} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './Pages/HomePage';
import Dashboard from './Pages/Dashboard';
import LaunchToken from './Pages/LaunchToken';
import Profile from './Pages/Profile';
import Battle from './Pages/Battle';
import TokenView from './Pages/TokenView';
import GamePage from './Pages/GamePage';
import TicTacToe from './Pages/TicTacToe';
import MemoryGame from './Pages/MemoryGame';
import CyberBattle from './Pages/CyberBattle';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/launch" element={<LaunchToken />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/memory" element={<MemoryGame />} />
        <Route path="/cyberbattle" element={<CyberBattle />} />
        <Route path="/token-view/:id" element={<TokenView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
