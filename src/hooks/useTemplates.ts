import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Menu } from "../types";
import { generateRoomId } from "../utils/helpers";

export interface MenuTemplate {
  id: string;
  name: string;
  menus: Menu[];
  createdAt: number;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    // 2초 안에 데이터가 없으면 empty UI 표시
    const timer = setTimeout(() => {
      if (!resolved) setLoading(false);
    }, 2000);

    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      resolved = true;
      clearTimeout(timer);
      const tpls: MenuTemplate[] = [];
      snapshot.forEach((doc) => {
        tpls.push({ id: doc.id, ...doc.data() } as MenuTemplate);
      });
      setTemplates(tpls);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const saveTemplate = async (
    id: string | null,
    name: string,
    menus: Menu[],
  ) => {
    const tplId = id || `tpl-${generateRoomId()}`;
    const tplRef = doc(db, "templates", tplId);
    await setDoc(tplRef, {
      name,
      menus,
      createdAt: new Date().getTime(),
    });
  };

  const removeTemplate = async (id: string) => {
    await deleteDoc(doc(db, "templates", id));
  };

  return { templates, loading, saveTemplate, removeTemplate };
};
