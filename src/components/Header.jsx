import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header = ({ title, userRole }) => {
  const handleSignOut = async () => {
    await signOut(auth);
    window.location.reload(); // refresh to reset state on signout
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Logo Iglesia" className="h-10 w-10" />
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm font-medium capitalize">{userRole.replace('_', ' ')}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
