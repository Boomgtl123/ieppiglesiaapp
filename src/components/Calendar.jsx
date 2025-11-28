import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, ROLES } from '../constants';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    es: es,
  },
});

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date(), department: '' });
  const { userRole, currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      let eventsSnap;
      if (userRole === ROLES.SUPER_LEADER) {
        eventsSnap = await getDocs(collection(db, 'events'));
      } else {
        // Fetch user's department
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
        if (!userDoc.empty) {
          const dept = userDoc.docs[0].data().department;
          eventsSnap = await getDocs(query(collection(db, 'events'), where('department', '==', dept)));
        }
      }
      if (eventsSnap) {
        setEvents(eventsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate(),
        })));
      }
    };
    fetchEvents();
  }, [userRole, currentUser]);

  const handleSelectSlot = ({ start, end }) => {
    if (userRole === ROLES.SUPER_LEADER || userRole === ROLES.LEADER) {
      setNewEvent({ ...newEvent, start, end });
      setShowForm(true);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    let dept = newEvent.department;
    if (userRole === ROLES.LEADER) {
      // Get user's department
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
      if (!userDoc.empty) {
        dept = userDoc.docs[0].data().department;
      }
    }
    await addDoc(collection(db, 'events'), {
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      department: dept,
    });
    setShowForm(false);
    setNewEvent({ title: '', start: new Date(), end: new Date(), department: '' });
    // Refresh
    const eventsSnap = await getDocs(collection(db, 'events'));
    setEvents(eventsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
    })));
  };

  const handleDeleteEvent = async (event) => {
    if (userRole === ROLES.SUPER_LEADER || (userRole === ROLES.LEADER && event.department === currentUser.department)) {
      await deleteDoc(doc(db, 'events', event.id));
      setEvents(events.filter(e => e.id !== event.id));
    }
  };

  const eventStyleGetter = (event) => {
    const dept = DEPARTMENTS[event.department];
    return {
      style: {
        backgroundColor: dept ? dept.color.replace('bg-', '').replace('-500', '') : 'gray',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Calendario</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        selectable
        onSelectEvent={handleDeleteEvent}
        eventPropGetter={eventStyleGetter}
      />
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuevo Evento</h3>
            <form onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Título"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-4"
                required
              />
              {userRole === ROLES.SUPER_LEADER && (
                <select
                  value={newEvent.department}
                  onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded mb-4"
                  required
                >
                  <option value="">Seleccionar Departamento</option>
                  {Object.keys(DEPARTMENTS).map(dept => (
                    <option key={dept} value={dept}>{DEPARTMENTS[dept].name}</option>
                  ))}
                </select>
              )}
              <div className="flex space-x-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Crear
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
