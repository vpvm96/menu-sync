import { Timestamp } from "firebase/firestore";

export interface Menu {
  id: string; // 메뉴 고유 ID
  name: string; // "짜장면"
}

export interface Vote {
  userId: string; // 사용자를 식별할 임시 ID 또는 닉네임
  nickname: string; // 화면에 표시될 닉네임
  avatar?: string; // 프로필 동물 아이콘 ID
  menuId: string; // 선택한 메뉴 ID
  updatedAt: Timestamp;
}

export interface Room {
  id: string; // URL 등에 사용될 방 고유 코드
  title: string; // "오늘 점심 뭐 먹지?"
  hostId: string; // 방장 식별자
  menus: Menu[]; // 방에 등록된 메뉴 리스트
  templateId?: string; // 연결된 메뉴판 ID
  createdAt: Timestamp;
  isClosed?: boolean; // 투표 종료 여부
}
