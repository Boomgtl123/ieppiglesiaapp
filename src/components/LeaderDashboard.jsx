import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants';
import Calendar from './Calendar';
import BrothersForm from './BrothersForm';
import Announcements from './Announcements';
import UserManagement from './UserManagement';
import Header from './Header';

const LeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, userRole } = useAuth();
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
        if (!userDoc.empty) {
          setDepartment(userDoc.docs[0].data().department);
        }
      } catch (error) {
        console.error('Error fetching department:', error);
        // For now, set a default department or leave empty
        // This allows the component to work even without Firestore
      }
    };
    fetchDepartment();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title={`Dashboard Líder - ${DEPARTMENTS[department]?.name || 'Departamento'}`} userRole={userRole || 'leader'} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-4 mb-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            📊 Resumen General
          </button>
          <button
            onClick={() => setActiveTab('brothers')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'brothers'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            👥 Registro de Hermanos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            👤 Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            📅 Calendario de Eventos
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'announcements'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            📢 Anuncios del Departamento
          </button>
        </nav>
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'overview' && <Overview department={department} />}
          {activeTab === 'brothers' && <BrothersForm department={department} />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'announcements' && <Announcements readOnly={true} />}
        </div>
      </main>
    </div>
  );
};

const Overview = ({ department }) => {
  const [stats, setStats] = useState({ brothers: 0, events: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const brothersSnap = await getDocs(query(collection(db, 'brothers'), where('department', '==', department)));
      const eventsSnap = await getDocs(query(collection(db, 'events'), where('department', '==', department)));
      setStats({
        brothers: brothersSnap.size,
        events: eventsSnap.size,
      });
    };
    if (department) fetchStats();
  }, [department]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-medium">Hermanos Registrados</h3>
        <p className="text-3xl font-bold">{stats.brothers}</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-medium">Eventos</h3>
        <p className="text-3xl font-bold">{stats.events}</p>
      </div>
    </div>
  );
};

export default LeaderDashboard;
