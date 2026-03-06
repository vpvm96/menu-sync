import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ANIMALS, ANIMAL_URL_MAP } from "../../constants/animals";

interface NicknameModalProps {
  roomTitle: string;
  onEnter: (nickname: string, avatar: string) => void;
}

export default function NicknameModal({
  roomTitle,
  onEnter,
}: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<string>(() => {
    const random = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return random?.id ?? "";
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          scale: 0.96,
          y: 15,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "power4.out",
        },
      );
    }
  });

  const handleEnter = () => {
    if (!nickname.trim()) return;
    onEnter(nickname.trim(), avatar);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-6">
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-3xl border border-[#e5e1d8] w-full max-w-sm opacity-0"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
      >
        <div className="text-center mb-6">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.35em] mb-3">
            투표 참여
          </p>
          <h2 className="hd text-3xl text-black mb-2 leading-tight">
            {roomTitle}
          </h2>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
            {avatar && ANIMAL_URL_MAP[avatar] && (
              <img
                src={ANIMAL_URL_MAP[avatar]}
                alt={avatar}
                className="w-10 h-10 object-contain"
              />
            )}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 text-center">
            프로필 아이콘 선택
          </p>
          <div className="h-40 overflow-y-auto rounded-xl bg-[#faf9f5] border border-[#e5e1d8] p-2">
            <div className="grid grid-cols-7 gap-1">
              {ANIMALS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatar(a.id)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                    avatar === a.id
                      ? "bg-orange-100 ring-2 ring-orange-400 scale-110"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={a.url}
                    alt={a.id}
                    className="w-6 h-6 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="사용할 닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnter();
          }}
          maxLength={10}
          autoFocus
          className="w-full bg-[#faf9f5] border border-[#e5e1d8] rounded-xl px-4 py-3.5 mb-3 focus-brand placeholder:text-gray-300 font-medium text-black outline-none transition-all text-sm"
        />
        <button
          onClick={handleEnter}
          disabled={!nickname.trim()}
          className="w-full bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-[15px] rounded-xl shadow-[0_4px_20px_rgba(234,88,12,0.2)] transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
        >
          입장하기
        </button>
      </div>
    </div>
  );
}
