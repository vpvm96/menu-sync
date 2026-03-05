import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Menu } from "../types";

// 특정 템플릿의 최신 menus를 실시간 구독
export const useTemplate = (templateId?: string) => {
  const [menus, setMenus] = useState<Menu[] | null>(null);

  useEffect(() => {
    if (!templateId) return;

    const unsubscribe = onSnapshot(
      doc(db, "templates", templateId),
      (snap) => {
        if (snap.exists()) {
          setMenus(snap.data().menus as Menu[]);
        }
      },
    );

    return () => unsubscribe();
  }, [templateId]);

  return menus;
};
