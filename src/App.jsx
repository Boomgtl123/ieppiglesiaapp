import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import SuperLeaderDashboard from './components/SuperLeaderDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import { ROLES } from './constants';

function AppContent() {
  const { currentUser, userRole, loading } = useAuth();

  console.log('Current User:', currentUser);
  console.log('User Role:', userRole);
  console.log('Loading:', loading);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!currentUser) {
    return <Login />;
  }

  if (userRole === ROLES.SUPER_LEADER) {
    return <SuperLeaderDashboard />;
  }

  if (userRole === ROLES.LEADER || userRole === ROLES.ADMIN) {
    return <LeaderDashboard />;
  }

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <div className="text-red-500 text-lg font-bold mb-4">No tienes permisos para acceder.</div>
        <div className="text-gray-700 mb-4">Rol: {userRole}</div>
        <button onClick={handleSignOut} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Cerrar Sesión
        </button>
        <button onClick={() => window.location.reload()} className="mt-4 ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Recargar Página
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
