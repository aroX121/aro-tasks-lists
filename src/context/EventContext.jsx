import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }
    const savedEvents = localStorage.getItem(`producter-events-${user.id}`);
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`producter-events-${user.id}`, JSON.stringify(events));
    }
  }, [events, user]);

  const addEvent = (event) => {
    const newEvent = { ...event, id: Date.now().toString(), created_at: new Date().toISOString() };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id, updatedFields) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updatedFields } : event
    ));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};
