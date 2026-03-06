import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ANIMAL_URL_MAP, ANIMALS } from "../../constants/animals";

interface EditNicknameModalProps {
  currentNickname: string;
  currentAvatar: string | null;
  onSave: (nickname: string, avatar: string) => void;
  onCancel: () => void;
}

export default function EditNicknameModal({
  currentNickname,
  currentAvatar,
  onSave,
  onCancel,
}: EditNicknameModalProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [avatar, setAvatar] = useState<string>(currentAvatar ?? "");
  const modalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          scale: 0.98,
          y: 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power4.out",
        },
      );
    }
  });

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    onSave(trimmed, avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-3xl border border-[#e5e1d8] w-full max-w-sm opacity-0"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
      >
        <div className="text-center mb-5">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.35em] mb-2">
            프로필 수정
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
            {avatar && ANIMAL_URL_MAP[avatar] && (
              <img
                src={ANIMAL_URL_MAP[avatar]}
                alt={avatar}
                className="w-9 h-9 object-contain"
              />
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="h-36 overflow-y-auto rounded-xl bg-[#faf9f5] border border-[#e5e1d8] p-2">
            <div className="grid grid-cols-7 gap-1">
              {ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setAvatar(animal.id)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                    avatar === animal.id
                      ? "bg-orange-100 ring-2 ring-orange-400 scale-110"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={animal.url}
                    alt={animal.id}
                    className="w-6 h-6 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          maxLength={10}
          autoFocus
          className="w-full bg-[#faf9f5] border border-[#e5e1d8] rounded-xl px-4 py-3.5 mb-3 focus-brand placeholder:text-gray-300 font-medium text-black outline-none transition-all text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!nickname.trim()}
            className="flex-1 bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
