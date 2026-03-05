import { nanoid } from "nanoid";

/**
 * 방 참여 코드로 사용할 짧고 고유한 ID를 생성합니다.
 */
export const generateRoomId = () => {
  return nanoid(8);
};

/**
 * 메뉴 항목용 고유 ID 생성기
 */
export const generateMenuId = () => {
  return nanoid(10);
};

/**
 * 로컬 기기를 식별할 수 있는 임시 랜덤 아이디 (닉네임 외의 고유 구분용)
 */
export const getLocalDeviceId = () => {
  let deviceId = localStorage.getItem("menu_sync_device_id");
  if (!deviceId) {
    deviceId = nanoid(16);
    localStorage.setItem("menu_sync_device_id", deviceId);
  }
  return deviceId;
};
