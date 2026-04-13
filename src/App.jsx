import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Calendar from './pages/Calendar';
import { TaskProvider } from './context/TaskContext';
import { HabitProvider } from './context/HabitContext';
import { GoalProvider } from './context/GoalContext';
import { FinanceProvider } from './context/FinanceContext';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Goals from './pages/Goals';
import Finance from './pages/Finance';
import Auth from './pages/Auth';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <HabitProvider>
            <GoalProvider>
              <FinanceProvider>
                <EventProvider>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="habits" element={<Habits />} />
                      <Route path="goals" element={<Goals />} />
                      <Route path="finance" element={<Finance />} />
                    </Route>
                  </Routes>
                </EventProvider>
              </FinanceProvider>
            </GoalProvider>
          </HabitProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
