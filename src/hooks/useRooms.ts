import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Room } from "../types";

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      orderBy("createdAt", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData: Room[] = [];
        snapshot.forEach((doc) => {
          roomsData.push({ ...doc.data(), id: doc.id } as Room);
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
