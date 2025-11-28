import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { DEPARTMENTS, ROLES } from '../constants';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: '', department: '', nombre: '', apellidos: '' });
  const [loading, setLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      // Always save to localStorage as backup
      localStorage.setItem('users', JSON.stringify(usersData));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Load from localStorage if Firestore fails
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(localUsers);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Current user:', auth.currentUser);
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const isLocal = window.location.hostname === "localhost";
      const url = isLocal
        ? "http://localhost:5001/iepp-67678/us-central1/createUser"
        : "https://us-central1-iepp-67678.cloudfunctions.net/createUser";

      const idToken = await auth.currentUser.getIdToken();
      console.log('ID Token obtained:', idToken ? 'Yes' : 'No');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          department: newUser.department,
          nombre: newUser.nombre,
          apellidos: newUser.apellidos
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setNewUser({ email: '', password: '', role: '', nombre: '', apellidos: '' });
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Error creando usuario:', error);
      // For offline mode, create user locally
      const newUserData = {
        ...newUser,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      const updatedUsers = [...users, newUserData];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setNewUser({ email: '', password: '', role: '', nombre: '', apellidos: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setDeletingUser(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      // For offline mode, remove from local state
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
      <form onSubmit={handleCreateUser} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Correo"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          >
            <option value="">Seleccionar Rol</option>
            <option value={ROLES.SUPER_LEADER}>Super Líder</option>
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.LEADER}>Líder</option>
            <option value="member">Miembro (sin acceso)</option>
          </select>
          <select
            value={newUser.department}
            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          >
            <option value="">Seleccionar Departamento</option>
            {Object.keys(DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>{DEPARTMENTS[dept].name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nombre"
            value={newUser.nombre}
            onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Apellidos"
            value={newUser.apellidos}
            onChange={(e) => setNewUser({ ...newUser, apellidos: e.target.value })}
            className="px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Crear Usuario
        </button>
      </form>

      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p>{user.email}</p>
              <p className="text-sm text-gray-500">{user.role} - {DEPARTMENTS[user.department]?.name}</p>
            </div>
            <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
