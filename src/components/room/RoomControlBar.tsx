import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ANIMAL_URL_MAP } from "../../constants/animals";

interface RoomControlBarProps {
  nickname: string;
  avatar: string | null;
  isHost: boolean;
  isClosed: boolean;
  onCopyLink: () => void;
  onOpenEditNickname: () => void;
  onCloseVote: () => void;
}

export default function RoomControlBar({
  nickname,
  avatar,
  isHost,
  isClosed,
  onCopyLink,
  onOpenEditNickname,
  onCloseVote,
}: RoomControlBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out" },
      );
    }
  });

  const handleCopyLink = () => {
    onCopyLink();
  };

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-[#e5e1d8] p-4 z-10 opacity-0"
    >
      <div className="max-w-md mx-auto flex gap-2.5">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-[0.98]"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          링크 복사
        </button>

        <button
          onClick={onOpenEditNickname}
          className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-[0.98]"
        >
          {avatar && ANIMAL_URL_MAP[avatar] ? (
            <img
              src={ANIMAL_URL_MAP[avatar]}
              alt={avatar}
              className="w-4 h-4 object-contain"
            />
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.5L16.732 3.732z"
              />
            </svg>
          )}
          {nickname}
        </button>

        {isHost && !isClosed && (
          <button
            onClick={onCloseVote}
            className="flex-1 bg-[#111] hover:bg-zinc-800 text-white font-black py-3 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-[0.98]"
          >
            투표 종료
          </button>
        )}
      </div>
    </div>
  );
}
