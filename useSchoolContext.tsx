import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  abonneerOpAlleScholen,
  abonneerOpSchool,
  maakSchool,
} from '@/lib/db/scholen';
import { useAuth } from './useAuth';
import type { School } from '@/types';

const OPSLAG_SCHOOL = 'klaskompas.actieveSchoolId';
const OPSLAG_KLAS = 'klaskompas.actieveKlasId';

interface SchoolContextWaarde {
  actieveSchoolId: string | null;
  actieveSchool: School | null;
  alleScholen: School[];
  schoolLaden: boolean;
  selecteerSchool: (schoolId: string) => void;
  nieuweSchoolAanmaken: (naam: string) => Promise<string>;
  actieveKlasId: string;
  selecteerKlas: (klasId: string) => void;
}

const SchoolContext = createContext<SchoolContextWaarde | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { gebruiker, isIngelogd } = useAuth();

  const [gekozenSchoolId, setGekozenSchoolId] = useState<string>(() => {
    try {
      return sessionStorage.getItem(OPSLAG_SCHOOL) ?? '';
    } catch {
      return '';
    }
  });

  const [actieveKlasId, setActieveKlasId] = useState<string>(() => {
    try {
      return sessionStorage.getItem(OPSLAG_KLAS) ?? '';
    } catch {
      return '';
    }
  });

  const [alleScholen, setAlleScholen] = useState<School[]>([]);
  const [actieveSchool, setActieveSchool] = useState<School | null>(null);
  const [schoolLaden, setSchoolLaden] = useState(true);

  const isSuper = gebruiker?.rol === 'superbeheerder';

  // Superbeheerder laadt alle scholen voor de schoolkiezer in de topbalk
  useEffect(() => {
    if (!isIngelogd || !isSuper) {
      setAlleScholen([]);
      return;
    }

    const unsubscribe = abonneerOpAlleScholen((lijst) => {
      setAlleScholen(lijst);
    });
    return unsubscribe;
  }, [isIngelogd, isSuper]);

  const actieveSchoolId = useMemo(() => {
    if (!isIngelogd || !gebruiker) return null;
    if (!isSuper) {
      return gebruiker.schoolId || null;
    }
    if (gekozenSchoolId && alleScholen.some((s) => s.id === gekozenSchoolId)) {
      return gekozenSchoolId;
    }
    if (gebruiker.schoolId) {
      return gebruiker.schoolId;
    }
    return alleScholen[0]?.id ?? null;
  }, [isIngelogd, gebruiker, isSuper, gekozenSchoolId, alleScholen]);

  useEffect(() => {
    if (!isIngelogd || !actieveSchoolId) {
      setActieveSchool(null);
      setSchoolLaden(false);
      return;
    }

    setSchoolLaden(true);
    const unsubscribe = abonneerOpSchool(
      actieveSchoolId,
      (school) => {
        setActieveSchool(school);
        setSchoolLaden(false);
      },
      () => {
        setActieveSchool(null);
        setSchoolLaden(false);
      }
    );
    return unsubscribe;
  }, [isIngelogd, actieveSchoolId]);

  const selecteerSchool = useCallback((schoolId: string) => {
    setGekozenSchoolId(schoolId);
    setActieveKlasId('');
    try {
      sessionStorage.setItem(OPSLAG_SCHOOL, schoolId);
      sessionStorage.removeItem(OPSLAG_KLAS);
    } catch {
      // Negeer opslagfout
    }
  }, []);

  const selecteerKlas = useCallback((klasId: string) => {
    setActieveKlasId(klasId);
    try {
      sessionStorage.setItem(OPSLAG_KLAS, klasId);
    } catch {
      // Negeer opslagfout
    }
  }, []);

  const nieuweSchoolAanmaken = useCallback(
    async (naam: string) => {
      const id = await maakSchool(naam);
      selecteerSchool(id);
      return id;
    },
    [selecteerSchool]
  );

  const waarde = useMemo<SchoolContextWaarde>(
    () => ({
      actieveSchoolId,
      actieveSchool,
      alleScholen,
      schoolLaden,
      selecteerSchool,
      nieuweSchoolAanmaken,
      actieveKlasId,
      selecteerKlas,
    }),
    [
      actieveSchoolId,
      actieveSchool,
      alleScholen,
      schoolLaden,
      selecteerSchool,
      nieuweSchoolAanmaken,
      actieveKlasId,
      selecteerKlas,
    ]
  );

  return (
    <SchoolContext.Provider value={waarde}>{children}</SchoolContext.Provider>
  );
}

export function useActieveSchool(): SchoolContextWaarde {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error('useActieveSchool moet binnen een SchoolProvider gebruikt worden.');
  }
  return ctx;
}
