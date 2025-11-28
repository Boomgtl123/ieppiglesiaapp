import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const BrothersForm = ({ department }) => {
  const [brothers, setBrothers] = useState([]);
  const [newBrother, setNewBrother] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const fetchBrothers = useCallback(async () => {
    if (!department) return;
    try {
      const brothersSnap = await getDocs(query(collection(db, 'brothers'), where('department', '==', department)));
      const brothersData = brothersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrothers(brothersData);
      // Always save to localStorage as backup
      localStorage.setItem(`brothers_${department}`, JSON.stringify(brothersData));
    } catch (error) {
      console.error('Error fetching brothers:', error);
      // Load from localStorage if Firestore fails
      const localBrothers = JSON.parse(localStorage.getItem(`brothers_${department}`) || '[]');
      setBrothers(localBrothers);
    }
  }, [department]);

  useEffect(() => {
    fetchBrothers();
  }, [fetchBrothers]);

  const handleCreateBrother = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const brotherData = {
        ...newBrother,
        department,
        registeredAt: new Date(),
      };

      // Try to save to Firestore
      const docRef = await addDoc(collection(db, 'brothers'), brotherData);
      setNewBrother({ name: '', email: '', phone: '' });
      // Refresh list
      await fetchBrothers();
    } catch (error) {
      console.error('Error registrando hermano:', error);
      // Save to localStorage and local state if Firestore fails
      const newBrotherWithId = {
        ...newBrother,
        department,
        registeredAt: new Date(),
        id: Date.now().toString()
      };
      const updatedBrothers = [...brothers, newBrotherWithId];
      setBrothers(updatedBrothers);
      localStorage.setItem(`brothers_${department}`, JSON.stringify(updatedBrothers));
      setNewBrother({ name: '', email: '', phone: '' });
    } finally {
      setLoading(false);
    }
  };

  const brothersCount = useMemo(() => brothers.length, [brothers]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Registro de Hermanos</h2>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {brothersCount} Hermanos
            </div>
          </div>

          <form onSubmit={handleCreateBrother} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  placeholder="Ingresa el nombre"
                  value={newBrother.name}
                  onChange={(e) => setNewBrother({ ...newBrother, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newBrother.email}
                  onChange={(e) => setNewBrother({ ...newBrother, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={newBrother.phone}
                  onChange={(e) => setNewBrother({ ...newBrother, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </div>
              ) : (
                'Registrar Hermano'
              )}
            </button>
          </form>

          <div className="space-y-4">
            {brothers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay hermanos registrados</h3>
                <p className="text-gray-500">Registra el primer hermano usando el formulario arriba.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {brothers.map(brother => (
                  <div key={brother.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{brother.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          {brother.email && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {brother.email}
                            </div>
                          )}
                          {brother.phone && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {brother.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Registrado</div>
                        <div className="text-sm font-medium text-gray-900">
                          {brother.registeredAt?.toDate ? brother.registeredAt.toDate().toLocaleDateString() : new Date(brother.registeredAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrothersForm;
