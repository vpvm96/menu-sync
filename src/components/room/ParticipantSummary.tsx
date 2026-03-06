import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ParticipantSummaryProps {
  title: string;
  isClosed: boolean;
  participantCount: number;
}

export default function ParticipantSummary({
  title,
  isClosed,
  participantCount,
}: ParticipantSummaryProps) {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );
    }
  });

  return (
    <header
      ref={headerRef}
      className="bg-white/80 backdrop-blur-md border-b border-[#e5e1d8] p-6 sticky top-0 z-10 shadow-sm opacity-0"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-black transition flex items-center gap-1 text-xs font-black uppercase tracking-widest"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          홈으로
        </button>
        <div className="text-center">
          <h1 className="hd text-2xl text-black leading-tight">{title}</h1>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isClosed ? "bg-gray-300" : "bg-orange-500 animate-pulse"}`}
            />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
              {isClosed
                ? "투표 종료"
                : `참여자 ${participantCount}명 · 투표 진행중`}
            </span>
          </div>
        </div>
        <div className="w-12"></div>
      </div>
    </header>
  );
}
