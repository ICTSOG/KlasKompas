import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import {
  AanmeldenPagina,
  AgendaPagina,
  BeheerPagina,
  DoelenPagina,
  InzichtenPagina,
  KeuzebordPagina,
  LeerlingenPagina,
  ObservatiesPagina,
  OverzichtPagina,
  ToestelPagina,
} from '@/pages/PlaceholderPages';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/aanmelden" element={<AanmeldenPagina />} />
        <Route path="/toestel" element={<ToestelPagina />} />

        <Route element={<AppShell />}>
          <Route index element={<OverzichtPagina />} />
          <Route path="agenda" element={<AgendaPagina />} />
          <Route path="keuzebord" element={<KeuzebordPagina />} />
          <Route path="observaties" element={<ObservatiesPagina />} />
          <Route path="doelen" element={<DoelenPagina />} />
          <Route path="inzichten" element={<InzichtenPagina />} />
          <Route path="leerlingen" element={<LeerlingenPagina />} />
          <Route path="beheer" element={<BeheerPagina />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
