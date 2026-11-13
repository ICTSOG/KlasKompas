import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  ACCOUNT_NIET_GEACTIVEERD_MELDING,
  haalGebruikerProfiel,
  luisterNaarAuthStatus,
  meldAanMetEmail,
  meldAf,
  vertaalAuthFout,
  verstuurWachtwoordReset,
  werkEigenEmailBij,
  werkEigenNaamBij,
  wijzigEigenWachtwoord,
} from '@/lib/auth';
import type { Gebruiker, GebruikersRol } from '@/types';

interface AuthContextWaarde {
  user: User | null;
  gebruiker: Gebruiker | null;
  rol: GebruikersRol | null;
  schoolId: string | null;
  klasIds: string[];
  laden: boolean;
  isIngelogd: boolean;
  authFout: string | null;
  inloggen: (email: string, wachtwoord: string) => Promise<void>;
  uitloggen: () => Promise<void>;
  wachtwoordVergeten: (email: string) => Promise<void>;
  naamBijwerken: (gegevens: { voornaam: string; familienaam: string }) => Promise<void>;
  emailBijwerken: (
    nieuwEmail: string,
    huidigWachtwoord: string
  ) => Promise<{ verificatieVerzonden: boolean }>;
  wachtwoordWijzigen: (
    huidigWachtwoord: string,
    nieuwWachtwoord: string
  ) => Promise<void>;
  profielHerladen: () => Promise<void>;
  wisAuthFout: () => void;
}

const AuthContext = createContext<AuthContextWaarde | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gebruiker, setGebruiker] = useState<Gebruiker | null>(null);
  const [laden, setLaden] = useState(true);
  const [authFout, setAuthFout] = useState<string | null>(null);

  const laadProfielVoorUser = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setGebruiker(null);
      setLaden(false);
      return;
    }

    try {
      const profiel = await haalGebruikerProfiel(firebaseUser.uid);

      if (!profiel || profiel.status !== 'actief') {
        setAuthFout(ACCOUNT_NIET_GEACTIVEERD_MELDING);
        setUser(null);
        setGebruiker(null);
        await meldAf();
        setLaden(false);
        return;
      }

      setUser(firebaseUser);
      setGebruiker(profiel);
      setLaden(false);
    } catch (err) {
      setAuthFout(vertaalAuthFout(err));
      setUser(null);
      setGebruiker(null);
      await meldAf().catch(() => {});
      setLaden(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = luisterNaarAuthStatus((firebaseUser) => {
      void laadProfielVoorUser(firebaseUser);
    });
    return unsubscribe;
  }, [laadProfielVoorUser]);

  const inloggen = useCallback(async (email: string, wachtwoord: string) => {
    setAuthFout(null);
    try {
      const profiel = await meldAanMetEmail(email, wachtwoord);
      setGebruiker(profiel);
    } catch (err) {
      const boodschap = vertaalAuthFout(err);
      setAuthFout(boodschap);
      throw new Error(boodschap);
    }
  }, []);

  const uitloggen = useCallback(async () => {
    setAuthFout(null);
    await meldAf();
    setUser(null);
    setGebruiker(null);
  }, []);

  const wachtwoordVergeten = useCallback(async (email: string) => {
    try {
      await verstuurWachtwoordReset(email);
    } catch (err) {
      throw new Error(vertaalAuthFout(err));
    }
  }, []);

  const profielHerladen = useCallback(async () => {
    if (!user) return;
    const profiel = await haalGebruikerProfiel(user.uid);
    if (profiel && profiel.status === 'actief') {
      setGebruiker(profiel);
    }
  }, [user]);

  const naamBijwerken = useCallback(
    async (gegevens: { voornaam: string; familienaam: string }) => {
      if (!gebruiker) throw new Error('Je bent niet aangemeld.');
      try {
        await werkEigenNaamBij(gebruiker.uid, gegevens);
        await profielHerladen();
      } catch (err) {
        throw new Error(vertaalAuthFout(err));
      }
    },
    [gebruiker, profielHerladen]
  );

  const emailBijwerken = useCallback(
    async (nieuwEmail: string, huidigWachtwoord: string) => {
      try {
        const resultaat = await werkEigenEmailBij(nieuwEmail, huidigWachtwoord);
        if (!resultaat.verificatieVerzonden) {
          await profielHerladen();
        }
        return resultaat;
      } catch (err) {
        throw new Error(vertaalAuthFout(err));
      }
    },
    [profielHerladen]
  );

  const wachtwoordWijzigen = useCallback(
    async (huidigWachtwoord: string, nieuwWachtwoord: string) => {
      try {
        await wijzigEigenWachtwoord(huidigWachtwoord, nieuwWachtwoord);
      } catch (err) {
        throw new Error(vertaalAuthFout(err));
      }
    },
    []
  );

  const wisAuthFout = useCallback(() => setAuthFout(null), []);

  const waarde = useMemo<AuthContextWaarde>(
    () => ({
      user,
      gebruiker,
      rol: gebruiker?.rol ?? null,
      schoolId: gebruiker?.schoolId ?? null,
      klasIds: gebruiker?.klasIds ?? [],
      laden,
      isIngelogd: Boolean(user && gebruiker && gebruiker.status === 'actief'),
      authFout,
      inloggen,
      uitloggen,
      wachtwoordVergeten,
      naamBijwerken,
      emailBijwerken,
      wachtwoordWijzigen,
      profielHerladen,
      wisAuthFout,
    }),
    [
      user,
      gebruiker,
      laden,
      authFout,
      inloggen,
      uitloggen,
      wachtwoordVergeten,
      naamBijwerken,
      emailBijwerken,
      wachtwoordWijzigen,
      profielHerladen,
      wisAuthFout,
    ]
  );

  return <AuthContext.Provider value={waarde}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextWaarde {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth moet binnen een AuthProvider gebruikt worden.');
  }
  return ctx;
}
