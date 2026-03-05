import { useState, useEffect } from "react";
import { doc, setDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Room, Menu } from "../types";
import { generateRoomId } from "../utils/helpers";

export const useRoom = (roomId?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(!!roomId);
  const [error, setError] = useState<Error | null>(null);

  // 방 생성 함수
  const createRoom = async (
    title: string,
    menus: Menu[],
    hostId: string,
    templateId?: string,
  ): Promise<string> => {
    try {
      const newRoomId = generateRoomId();
      const newRoom: Room = {
        id: newRoomId,
        title,
        hostId,
        menus,
        ...(templateId ? { templateId } : {}),
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, "rooms", newRoomId), newRoom);
      return newRoomId;
    } catch (err) {
      console.error("방 생성 중 오류:", err);
      throw err;
    }
  };

  // 실시간 방 정보 구독
  useEffect(() => {
    if (!roomId) {
      return;
    }

    const docRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setRoom({ ...docSnap.data(), id: docSnap.id } as Room);
        } else {
          setRoom(null); // 방이 없음
        }
        setLoading(false);
      },
      (err) => {
        console.error("방 정보 구독 중 오류:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error, createRoom };
};
