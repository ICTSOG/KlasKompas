import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  Eye,
  LayoutGrid,
  Settings,
  Shapes,
  Sparkles,
  Target,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider, SchoolProvider } from '@/hooks';
import { AanmeldenPagina } from '@/pages/AanmeldenPagina';
import { GebruikersPagina } from '@/pages/GebruikersPagina';
import { KlassenPagina } from '@/pages/KlassenPagina';
import { LeerlingenPagina } from '@/pages/LeerlingenPagina';
import { PlaceholderPagina } from '@/pages/PlaceholderPagina';
import { ProfielPagina } from '@/pages/ProfielPagina';

export function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/aanmelden" element={<AanmeldenPagina />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/school/klassen" replace />} />

              {/* Bovenaan */}
              <Route
                path="lesplanbibliotheek"
                element={
                  <PlaceholderPagina
                    titel="Lesplanbibliotheek"
                    beschrijving="Bundel en deel lesplannen en collecties over de hele school."
                    icon={BookOpen}
                  />
                }
              />

              {/* Sectie SCHOOL */}
              <Route
                path="school/gebruikers"
                element={
                  <ProtectedRoute toegestaneRollen={['schoolbeheerder', 'superbeheerder']}>
                    <GebruikersPagina />
                  </ProtectedRoute>
                }
              />
              <Route path="school/klassen" element={<KlassenPagina />} />
              <Route
                path="school/leerlingen"
                element={<LeerlingenPagina modus="school" />}
              />
              <Route
                path="school/iconen"
                element={
                  <PlaceholderPagina
                    titel="Iconen bibliotheek (School)"
                    beschrijving="Beheer gedeelde pictogrammen voor leerlingen en activiteiten."
                    icon={Shapes}
                  />
                }
              />
              <Route
                path="school/jaardoelen"
                element={
                  <PlaceholderPagina
                    titel="Jaardoelen"
                    beschrijving="Stel jaardoelen en doelencollecties samen voor de klassen."
                    icon={Target}
                  />
                }
              />
              <Route
                path="school/instellingen"
                element={
                  <ProtectedRoute toegestaneRollen={['schoolbeheerder', 'superbeheerder']}>
                    <PlaceholderPagina
                      titel="Schoolinstellingen"
                      beschrijving="Configureer schoolgegevens, uren en themakleuren."
                      icon={Settings}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Sectie KLAS */}
              <Route
                path="klas/leerlingen"
                element={<LeerlingenPagina modus="klas" />}
              />
              <Route
                path="klas/keuze-activiteiten"
                element={
                  <PlaceholderPagina
                    titel="Keuze-activiteiten"
                    beschrijving="Beheer de hoeken en keuzeactiviteiten van de geselecteerde klas."
                    icon={Sparkles}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/agenda"
                element={
                  <PlaceholderPagina
                    titel="Weekagenda"
                    beschrijving="Plan lesactiviteiten en keuzebordmomenten per week."
                    icon={Calendar}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/doelen"
                element={
                  <PlaceholderPagina
                    titel="Doelen & evaluaties"
                    beschrijving="Registreer en bekijk evaluaties op leerlijn- en minimumdoelen."
                    icon={CheckSquare}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/observaties"
                element={
                  <PlaceholderPagina
                    titel="Observaties"
                    beschrijving="Noteer observaties met foto's en doelkoppelingen voor leerlingen."
                    icon={Eye}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/inzichten"
                element={
                  <PlaceholderPagina
                    titel="Inzichten"
                    beschrijving="Bekijk overzichten en voortgang per klas en leerling."
                    icon={BarChart3}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/iconen"
                element={
                  <PlaceholderPagina
                    titel="Iconen bibliotheek (Klas)"
                    beschrijving="Pictogrammen voor deze specifieke klas."
                    icon={Shapes}
                    toonKlasContext
                  />
                }
              />
              <Route
                path="klas/keuzebord"
                element={
                  <PlaceholderPagina
                    titel="Keuze- & Reflectiebord"
                    beschrijving="Interactief digitaal keuzebord voor de kleuters en leerlingen."
                    icon={LayoutGrid}
                    toonKlasContext
                  />
                }
              />

              {/* Profiel */}
              <Route path="profiel" element={<ProfielPagina />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SchoolProvider>
    </AuthProvider>
  );
}
