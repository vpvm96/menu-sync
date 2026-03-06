import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { db } from "../config/firebase";
import { useRoom } from "../hooks/useRoom";
import { useVote } from "../hooks/useVote";
import { useTemplate } from "../hooks/useTemplate";
import { useUserStore } from "../store/userStore";
import { getLocalDeviceId } from "../utils/helpers";

// Sub-components
import ParticipantSummary from "../components/room/ParticipantSummary";
import VoteMenuList from "../components/room/VoteMenuList";
import NicknameModal from "../components/room/NicknameModal";
import EditNicknameModal from "../components/room/EditNicknameModal";
import RoomControlBar from "../components/room/RoomControlBar";

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const {
    votes,
    loading: votesLoading,
    castVote,
    updateNickname,
  } = useVote(roomId!);
  const templateMenus = useTemplate(room?.templateId);

  // React 19: No useMemo needed
  const menus = templateMenus ?? room?.menus ?? [];

  const { nickname, setNickname, avatar, setAvatar } = useUserStore();
  const [showEditNickname, setShowEditNickname] = useState(false);

  const deviceId = getLocalDeviceId();

  // React 19: No useMemo needed
  const participantCount = new Set(votes.map((v) => v.userId)).size;
  const isHost = room?.hostId === deviceId;
  const isClosed = room?.isClosed ?? false;

  // 투표 종료 시 축하 효과 (최초 1회)
  const confettiTriggered = useRef(false);
  useEffect(() => {
    if (isClosed && !confettiTriggered.current) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ea580c", "#fbbf24", "#fef3c7"],
      });
      confettiTriggered.current = true;
    }
  }, [isClosed]);

  if (roomLoading || votesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
            입장 중
          </p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] p-6">
        <div className="text-center">
          <p className="hd text-3xl text-gray-300 mb-2">
            방을 찾을 수 없습니다
          </p>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
            링크를 다시 확인해주세요
          </span>
        </div>
      </div>
    );
  }

  // 닉네임 입력 모달 (입장 전)
  if (!nickname) {
    return (
      <NicknameModal
        roomTitle={room.title}
        onEnter={(name, av) => {
          setNickname(name);
          setAvatar(av);
        }}
      />
    );
  }

  const handleVote = async (menuId: string) => {
    if (isClosed) return;
    await castVote(deviceId, nickname, avatar, menuId);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("링크가 복사되었습니다!");
  };

  const handleCloseVote = async () => {
    if (!roomId) return;
    if (window.confirm("투표를 종료하시겠습니까?")) {
      try {
        await updateDoc(doc(db, "rooms", roomId), { isClosed: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveNickname = async (name: string, av: string) => {
    if (name !== nickname || av !== avatar) {
      try {
        await updateNickname(deviceId, name, av);
        setNickname(name);
        setAvatar(av);
        toast.success("프로필이 변경되었습니다.");
      } catch (err) {
        toast.error("프로필 변경 중 오류가 발생했습니다.");
        console.error(err);
      }
    }
    setShowEditNickname(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col font-sans">
      <ParticipantSummary
        title={room.title}
        isClosed={isClosed}
        participantCount={participantCount}
      />

      <VoteMenuList
        menus={menus}
        votes={votes}
        deviceId={deviceId}
        nickname={nickname}
        isClosed={isClosed}
        onVote={handleVote}
      />

      <RoomControlBar
        nickname={nickname}
        avatar={avatar}
        isHost={isHost}
        isClosed={isClosed}
        onCopyLink={handleCopyLink}
        onOpenEditNickname={() => setShowEditNickname(true)}
        onCloseVote={handleCloseVote}
      />

      {showEditNickname && (
        <EditNicknameModal
          currentNickname={nickname}
          currentAvatar={avatar}
          onSave={handleSaveNickname}
          onCancel={() => setShowEditNickname(false)}
        />
      )}
    </div>
  );
}
