import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Cycles from './pages/Cycles';
import CreateCycle from './pages/CreateCycle';
import CycleDetail from './pages/CycleDetail';
import Parametrage from './pages/Parametrage';

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
  return <Layout />;
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
      </Route>
      <Route path="*" element={<Navigate to="/cycles" replace />} />
    </Routes>
  );
}
