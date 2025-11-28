import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { CSVLink } from 'react-csv';
import { DEPARTMENTS } from '../constants';

const Stats = () => {
  const [stats, setStats] = useState({});
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const brothersSnap = await getDocs(collection(db, 'brothers'));
      const eventsSnap = await getDocs(collection(db, 'events'));
      const usersSnap = await getDocs(collection(db, 'users'));

      const deptStats = {};
      Object.keys(DEPARTMENTS).forEach(dept => {
        deptStats[dept] = {
          brothers: 0,
          events: 0,
          users: 0,
        };
      });

      brothersSnap.forEach(doc => {
        const data = doc.data();
        if (deptStats[data.department]) deptStats[data.department].brothers++;
      });

      eventsSnap.forEach(doc => {
        const data = doc.data();
        if (deptStats[data.department]) deptStats[data.department].events++;
      });

      usersSnap.forEach(doc => {
        const data = doc.data();
        if (data.role === 'leader' && deptStats[data.department]) deptStats[data.department].users++;
      });

      setStats(deptStats);

      // Prepare CSV
      const csv = [];
      csv.push(['Departamento', 'Hermanos', 'Eventos', 'Usuarios']);
      Object.keys(deptStats).forEach(dept => {
        csv.push([DEPARTMENTS[dept].name, deptStats[dept].brothers, deptStats[dept].events, deptStats[dept].users]);
      });
      setCsvData(csv);
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Estadísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Object.keys(stats).map(dept => (
          <div key={dept} className={`p-4 rounded text-white ${DEPARTMENTS[dept].color}`}>
            <h3 className="text-lg font-medium">{DEPARTMENTS[dept].name}</h3>
            <p>Hermanos: {stats[dept].brothers}</p>
            <p>Eventos: {stats[dept].events}</p>
            <p>Usuarios: {stats[dept].users}</p>
          </div>
        ))}
      </div>
      <CSVLink data={csvData} filename="estadisticas.csv" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Descargar CSV
      </CSVLink>
    </div>
  );
};

export default Stats;
