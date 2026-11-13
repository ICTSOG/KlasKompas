import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { mediaConverter } from './converters';
import type { MediaItem } from '@/types';

export function mediaCollectie(schoolId: string) {
  return collection(db, dbPaths.media(schoolId)).withConverter(mediaConverter);
}

export function abonneerOpSchoolProfielfotos(
  schoolId: string,
  onData: (mediaMap: Record<string, MediaItem>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(mediaCollectie(schoolId), where('soort', '==', 'profiel'));
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, MediaItem> = {};
      for (const d of snap.docs) {
        map[d.id] = d.data();
      }
      onData(map);
    },
    onError
  );
}

export function abonneerOpKlasProfielfotos(
  schoolId: string,
  klasIds: string[],
  onData: (mediaMap: Record<string, MediaItem>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const uniekeIds = Array.from(new Set(klasIds)).filter(Boolean);
  if (uniekeIds.length === 0) {
    onData({});
    return () => {};
  }

  const q = query(
    mediaCollectie(schoolId),
    where('soort', '==', 'profiel'),
    where('klasId', 'in', uniekeIds.slice(0, 30))
  );

  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, MediaItem> = {};
      for (const d of snap.docs) {
        map[d.id] = d.data();
      }
      onData(map);
    },
    onError
  );
}

/**
 * Verkleint een afbeeldingsbestand in de browser tot max. 256x256 px en slaat deze op
 * in scholen/{schoolId}/media/{id} met soort "profiel".
 */
export async function uploadProfielfoto(
  schoolId: string,
  klasId: string,
  bestand: File
): Promise<string> {
  if (!bestand.type.startsWith('image/')) {
    throw new Error('Kies een geldig afbeeldingsbestand (JPG, PNG of WebP).');
  }

  const gecomprimeerd = await verkleinAfbeelding(bestand, 256);
  const nu = serverTimestamp();

  const ref = await addDoc(collection(db, dbPaths.media(schoolId)), {
    dataUrl: gecomprimeerd.dataUrl,
    breedte: gecomprimeerd.breedte,
    hoogte: gecomprimeerd.hoogte,
    soort: 'profiel',
    klasId,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  });

  return ref.id;
}

function verkleinAfbeelding(
  bestand: File,
  maxZijde: number
): Promise<{ dataUrl: string; breedte: number; hoogte: number }> {
  return new Promise((resolve, reject) => {
    const lezer = new FileReader();
    lezer.onload = () => {
      const img = new Image();
      img.onload = () => {
        const schaal = Math.min(1, maxZijde / Math.max(img.width, img.height));
        const breedte = Math.max(1, Math.round(img.width * schaal));
        const hoogte = Math.max(1, Math.round(img.height * schaal));

        const canvas = document.createElement('canvas');
        canvas.width = breedte;
        canvas.height = hoogte;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Kon afbeelding niet verwerken in deze browser.'));
          return;
        }
        ctx.drawImage(img, 0, 0, breedte, hoogte);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({ dataUrl, breedte, hoogte });
      };
      img.onerror = () => reject(new Error('Kon de afbeelding niet openen.'));
      img.src = String(lezer.result);
    };
    lezer.onerror = () => reject(new Error('Kon het bestand niet lezen.'));
    lezer.readAsDataURL(bestand);
  });
}
