import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Cycles from './pages/Cycles';
import CreateCycle from './pages/CreateCycle';
import CycleDetail from './pages/CycleDetail';
import Parametrage from './pages/Parametrage';
import Depenses from './pages/Depenses';
import Ventes from './pages/Ventes';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="accent.1" />
      </Center>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return <DashboardLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cycles" element={<Cycles />} />
        <Route path="/cycles/nouveau" element={<CreateCycle />} />
        <Route path="/cycles/:id" element={<CycleDetail />} />
        <Route path="/parametrage" element={<Parametrage />} />
        <Route path="/depenses" element={<Depenses />} />
        <Route path="/ventes" element={<Ventes />} />
        <Route path="/utilisateurs" element={<ComingSoon />} />
        <Route path="/stocks" element={<ComingSoon />} />
        <Route path="/sante" element={<ComingSoon />} />
        <Route path="/clients" element={<ComingSoon />} />
        <Route path="/dashboard" element={<ComingSoon />} />
        <Route path="/bilans" element={<ComingSoon />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
