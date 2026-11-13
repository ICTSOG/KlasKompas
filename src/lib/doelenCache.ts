import type { Doel } from '@/types';

const DB_NAAM = 'klaskompas-doelen-db';
const DB_VERSIE = 1;
const STORE_NAAM = 'doelen';
const META_STORE = 'meta';
const CACHE_SLEUTEL = 'v1-doelen-geladen';

function openDoelenDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAAM, DB_VERSIE);

    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(STORE_NAAM)) {
        const store = idb.createObjectStore(STORE_NAAM, { keyPath: 'id' });
        store.createIndex('leergebied', 'leergebied', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('code', 'code', { unique: false });
      }
      if (!idb.objectStoreNames.contains(META_STORE)) {
        idb.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function leesAlleUitIndexedDb(idb: IDBDatabase): Promise<Doel[] | null> {
  return new Promise((resolve, reject) => {
    const tx = idb.transaction([STORE_NAAM, META_STORE], 'readonly');
    const metaReq = tx.objectStore(META_STORE).get(CACHE_SLEUTEL);

    metaReq.onsuccess = () => {
      if (!metaReq.result) {
        resolve(null);
        return;
      }
      const doelenReq = tx.objectStore(STORE_NAAM).getAll();
      doelenReq.onsuccess = () => resolve(doelenReq.result as Doel[]);
      doelenReq.onerror = () => reject(doelenReq.error);
    };
    metaReq.onerror = () => reject(metaReq.error);
  });
}

async function schrijfNaarIndexedDb(idb: IDBDatabase, doelen: Doel[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = idb.transaction([STORE_NAAM, META_STORE], 'readwrite');
    const store = tx.objectStore(STORE_NAAM);
    store.clear();

    for (const doel of doelen) {
      store.put(doel);
    }

    tx.objectStore(META_STORE).put(
      { aantal: doelen.length, geladenOp: new Date().toISOString() },
      CACHE_SLEUTEL
    );

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Laadt /public/data/doelen.json éénmalig en bewaart alle records lokaal in IndexedDB.
 * Komt niet in Firestore terecht.
 */
export async function laadDoelenMetCache(): Promise<Doel[]> {
  const idb = await openDoelenDb();
  const gecachet = await leesAlleUitIndexedDb(idb);

  if (gecachet && gecachet.length > 0) {
    return gecachet;
  }

  const url = `${import.meta.env.BASE_URL}data/doelen.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kon doelen.json niet laden (${response.status}).`);
  }

  const doelen = (await response.json()) as Doel[];
  await schrijfNaarIndexedDb(idb, doelen);
  return doelen;
}
