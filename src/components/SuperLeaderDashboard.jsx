import React, { useState, useEffect, Suspense, lazy } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { ROLES } from '../constants';
import UserManagement from './UserManagement';
import Announcements from './Announcements';
import Stats from './Stats';
import Calendar from './Calendar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const SuperLeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Dashboard Super Líder" userRole={userRole || 'super_leader'} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab('overview')} className="text-gray-500 hover:text-gray-700">
            Resumen
          </button>
          <button onClick={() => setActiveTab('users')} className="text-gray-500 hover:text-gray-700">
            Usuarios
          </button>
          <button onClick={() => setActiveTab('announcements')} className="text-gray-500 hover:text-gray-700">
            Anuncios
          </button>
          <button onClick={() => setActiveTab('stats')} className="text-gray-500 hover:text-gray-700">
            Estadísticas
          </button>
          <button onClick={() => setActiveTab('calendar')} className="text-gray-500 hover:text-gray-700">
            Calendario
          </button>
        </nav>
        <Suspense fallback={<div className="flex items-center justify-center min-h-64">Cargando...</div>}>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'announcements' && <Announcements />}
          {activeTab === 'stats' && <Stats />}
          {activeTab === 'calendar' && <Calendar />}
        </Suspense>
      </main>
    </div>
  );
};

const Overview = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const brothersSnap = await getDocs(collection(db, 'brothers'));
      const eventsSnap = await getDocs(collection(db, 'events'));
      setStats({
        users: usersSnap.size,
        brothers: brothersSnap.size,
        events: eventsSnap.size,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Resumen General
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Última actualización</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">Usuarios Totales</p>
                <p className="text-4xl font-bold mt-2">{stats.users || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium uppercase tracking-wide">Hermanos Registrados</p>
                <p className="text-4xl font-bold mt-2">{stats.brothers || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium uppercase tracking-wide">Eventos Totales</p>
                <p className="text-4xl font-bold mt-2">{stats.events || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Actividad Reciente
        </h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Nuevo usuario registrado en el sistema</p>
              <p className="text-sm text-gray-600">Hace 2 horas • Departamento de Jóvenes</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Usuario
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Evento de oración completado exitosamente</p>
              <p className="text-sm text-gray-600">Hace 1 día • 45 participantes</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Evento
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Nuevo anuncio publicado</p>
              <p className="text-sm text-gray-600">Hace 3 días • Reunión general este domingo</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Anuncio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperLeaderDashboard;
