import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const announcementsSnap = await getDocs(collection(db, 'announcements'));
      setAnnouncements(announcementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'announcements'), {
      text: newAnnouncement,
      timestamp: new Date(),
    });
    setNewAnnouncement('');
    // Refresh
    const announcementsSnap = await getDocs(collection(db, 'announcements'));
    setAnnouncements(announcementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteAnnouncement = async (id) => {
    await deleteDoc(doc(db, 'announcements', id));
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Anuncios</h2>
      <form onSubmit={handleCreateAnnouncement} className="mb-6">
        <textarea
          placeholder="Nuevo anuncio"
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows="4"
          required
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Crear Anuncio
        </button>
      </form>
      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="border p-4 rounded">
            <p>{ann.text}</p>
            <p className="text-sm text-gray-500">{ann.timestamp.toDate().toLocaleString()}</p>
            <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-500 hover:text-red-700 mt-2">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
