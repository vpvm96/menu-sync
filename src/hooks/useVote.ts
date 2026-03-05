import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Vote } from "../types";

export const useVote = (roomId: string) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState<boolean>(!!roomId);

  // 실시간 투표 데이터 구독
  useEffect(() => {
    if (!roomId) return;

    const votesRef = collection(db, "rooms", roomId, "votes");

    const unsubscribe = onSnapshot(
      votesRef,
      (snapshot) => {
        const votesData: Vote[] = [];
        snapshot.forEach((doc) => {
          votesData.push(doc.data() as Vote);
        });
        setVotes(votesData);
        setLoading(false);
      },
      (err) => {
        console.error("투표 구독 중 오류:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomId]);

  // 투표하기 (또는 투표 메뉴 변경하기)
  const castVote = async (userId: string, nickname: string, menuId: string) => {
    if (!roomId) return;

    try {
      const voteRef = doc(db, "rooms", roomId, "votes", userId);
      const voteData: Vote = {
        userId,
        nickname,
        menuId,
        updatedAt: Timestamp.now(),
      };

      // 기존 문서가 있으면 덮어쓰기 (upsert 동작)
      await setDoc(voteRef, voteData);
    } catch (err) {
      console.error("투표 처리 중 오류:", err);
      throw err;
    }
  };

  return { votes, loading, castVote };
};
