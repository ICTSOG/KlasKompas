import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AanmeldenPagina } from '@/pages/AanmeldenPagina';
import { ProfielPagina } from '@/pages/ProfielPagina';
import {
  AgendaPagina,
  BeheerPagina,
  DoelenPagina,
  InzichtenPagina,
  KeuzebordPagina,
  LeerlingenPagina,
  ObservatiesPagina,
  OverzichtPagina,
  PlatformPagina,
  ToestelPagina,
} from '@/pages/PlaceholderPages';

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/aanmelden" element={<AanmeldenPagina />} />
          <Route path="/toestel" element={<ToestelPagina />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverzichtPagina />} />
            <Route path="agenda" element={<AgendaPagina />} />
            <Route path="keuzebord" element={<KeuzebordPagina />} />
            <Route path="observaties" element={<ObservatiesPagina />} />
            <Route path="doelen" element={<DoelenPagina />} />
            <Route path="inzichten" element={<InzichtenPagina />} />
            <Route path="leerlingen" element={<LeerlingenPagina />} />
            <Route path="profiel" element={<ProfielPagina />} />
            <Route
              path="beheer"
              element={
                <ProtectedRoute toegestaneRollen={['schoolbeheerder', 'superbeheerder']}>
                  <BeheerPagina />
                </ProtectedRoute>
              }
            />
            <Route
              path="platform"
              element={
                <ProtectedRoute toegestaneRollen={['superbeheerder']}>
                  <PlatformPagina />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
