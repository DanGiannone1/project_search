// frontend/src/App.tsx
import { useState } from 'react';
import ProjectSearch from './components/ProjectSearch/ProjectSearch';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from './components/ui/button';
import { User, Shield } from 'lucide-react';

function App() {
  const [isAdmin, setIsAdmin] = useState(false); // Manage view state

  const toggleView = () => {
    setIsAdmin((prev) => !prev);
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <div className="flex justify-end p-4">
        <Button onClick={toggleView} variant="accentGradient" size="sm">
          {isAdmin ? <User className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
          {isAdmin ? 'Go to User View' : 'Go to Admin Dashboard'}
        </Button>
      </div>
      {isAdmin ? <AdminDashboard /> : <ProjectSearch />}
      <ToastContainer />
    </div>
  );
}

export default App;
