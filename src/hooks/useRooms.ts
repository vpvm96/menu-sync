import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Room } from "../types";

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sevenDaysAgo = Timestamp.fromMillis(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    );

    const q = query(
      collection(db, "rooms"),
      where("createdAt", ">=", sevenDaysAgo),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData: Room[] = [];
        snapshot.forEach((doc) => {
          roomsData.push({ ...doc.data(), id: doc.id } as Room);
        });
        // 2순위: 투표 진행 중(isClosed=false) 먼저, createdAt 순서 유지
        roomsData.sort((a, b) => {
          const aActive = a.isClosed ? 1 : 0;
          const bActive = b.isClosed ? 1 : 0;
          return aActive - bActive;
        });
        setRooms(roomsData);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { rooms, loading };
};
