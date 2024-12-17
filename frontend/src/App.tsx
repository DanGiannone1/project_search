// frontend/src/App.tsx

import { useState } from 'react';
import ProjectSearch from './components/ProjectSearch/ProjectSearch';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from './components/ui/button';
import { User, Shield } from 'lucide-react';
import AddProjectDialog from './components/ProjectSearch/AddProjectDialog'; // Ensure this import is correct

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleView = () => {
    setIsAdmin((prev) => !prev);
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <AddProjectDialog /> {/* Ensure this component is placed correctly */}
        <Button 
          onClick={toggleView} 
          variant="accentGradient" 
          size="sm"
          className="h-9 px-4 whitespace-nowrap"
        >
          {isAdmin ? (
            <>
              <User className="w-4 h-4 mr-2" />
              User View
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Admin Dashboard
            </>
          )}
        </Button>
      </div>
      {isAdmin ? <AdminDashboard /> : <ProjectSearch />}
      <ToastContainer />
    </div>
  );
}

export default App;
