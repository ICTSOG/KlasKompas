import { useEffect, useState } from 'react';
import { luisterNaarSessie, type SessieContext } from '@/lib/auth';

export function useAuth() {
  const [sessie, setSessie] = useState<SessieContext>({
    user: null,
    gebruiker: null,
    toestel: null,
  });
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const unsubscribe = luisterNaarSessie((ctx) => {
      setSessie(ctx);
      setLaden(false);
    });
    return unsubscribe;
  }, []);

  return {
    ...sessie,
    laden,
    isIngelogd: Boolean(sessie.user),
    isToestel: Boolean(sessie.toestel),
  };
}
