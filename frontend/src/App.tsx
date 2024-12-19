import { useState, useEffect } from 'react';
import ProjectSearch from './components/ProjectSearch/ProjectSearch';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from './components/ui/button';
import { User, Shield } from 'lucide-react';
import AddProjectDialog from './components/ProjectSearch/AddProjectDialog';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAdmin, setCheckedAdmin] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);

  useEffect(() => {
    // Check if the user is admin
    async function checkAdminStatus() {
      try {
        const response = await fetch('/api/check_admin', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setCheckedAdmin(true);
      }
    }
    checkAdminStatus();
  }, []);

  if (!checkedAdmin) {
    return <div className="w-screen h-screen flex items-center justify-center text-white">Checking access...</div>;
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <AddProjectDialog />
        {/* Only show admin dashboard button if the user is admin */}
        {isAdmin && (
          <Button
            onClick={() => setShowAdminView(!showAdminView)}
            variant="secondary"
            size="sm"
            className="h-9 px-4 whitespace-nowrap"
          >
            {showAdminView ? (
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
        )}
      </div>
      {/* Show admin dashboard or project search based on showAdminView state */}
      {showAdminView && isAdmin ? <AdminDashboard /> : <ProjectSearch />}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
      />
    </div>
  );
}

export default App;