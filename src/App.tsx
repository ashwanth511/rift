import { Route, Routes ,Navigate} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './Pages/HomePage';
import Dashboard from './Pages/Dashbord';
import LaunchToken from './Pages/LaunchToken';
import Profile from './Pages/Profile';
import Battle from './Pages/Battle';
import TokenView from './Pages/TokenView';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/launch-token" element={<LaunchToken />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/token/:id" element={<TokenView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
