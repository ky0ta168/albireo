import { openDB, type IDBPDatabase } from "idb";
import type { VideoData } from "./index";

const DB_NAME = "albireo";
const DB_VERSION = 1;
const STORE_VIDEOS = "videos";

type AlbireoDB = IDBPDatabase<unknown>;

let dbPromise: Promise<AlbireoDB> | null = null;

const getDB = (): Promise<AlbireoDB> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
          db.createObjectStore(STORE_VIDEOS, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
};

const nextOrder = async (db: AlbireoDB): Promise<number> => {
  const all = (await db.getAll(STORE_VIDEOS)) as VideoData[];
  if (all.length === 0) return 1;
  return Math.max(...all.map((v) => v.order ?? 0)) + 1;
};

export const getAllVideos = async (): Promise<VideoData[]> => {
  const db = await getDB();
  const all = (await db.getAll(STORE_VIDEOS)) as VideoData[];
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const putVideo = async (video: VideoData): Promise<void> => {
  const db = await getDB();
  if (video.order !== undefined) {
    await db.put(STORE_VIDEOS, video);
    return;
  }
  const existing = (await db.get(STORE_VIDEOS, video.id)) as
    | VideoData
    | undefined;
  const order = existing?.order ?? (await nextOrder(db));
  await db.put(STORE_VIDEOS, { ...video, order });
};

export const deleteVideo = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_VIDEOS, id);
};

export const putVideoList = async (videos: VideoData[]): Promise<void> => {
  const db = await getDB();
  const start = await nextOrder(db);
  const tx = db.transaction(STORE_VIDEOS, "readwrite");
  let offset = 0;
  await Promise.all([
    ...videos.map((v) => {
      const stored: VideoData =
        v.order !== undefined ? v : { ...v, order: start + offset++ };
      return tx.store.put(stored);
    }),
    tx.done,
  ]);
};
