import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useRoom } from "../hooks/useRoom";
import { useVote } from "../hooks/useVote";
import { useTemplate } from "../hooks/useTemplate";
import { useUserStore } from "../store/userStore";
import { getLocalDeviceId } from "../utils/helpers";
import { ANIMALS, ANIMAL_URL_MAP } from "../constants/animals";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const { votes, loading: votesLoading, castVote, updateNickname } = useVote(roomId!);
  const templateMenus = useTemplate(room?.templateId);
  // templateId가 있으면 최신 템플릿 메뉴를 사용, 없으면 room에 저장된 메뉴 사용
  const menus = useMemo(
    () => templateMenus ?? room?.menus ?? [],
    [templateMenus, room?.menus],
  );

  const { nickname, setNickname, avatar, setAvatar } = useUserStore();
  const [tempNickname, setTempNickname] = useState("");
  const [tempAvatar, setTempAvatar] = useState<string>(() => {
    const random = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return random?.id ?? "";
  });
  const [showEditNickname, setShowEditNickname] = useState(false);
  const [editNicknameInput, setEditNicknameInput] = useState("");
  const [editAvatar, setEditAvatar] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuListRef = useRef<HTMLDivElement>(null);
  const nicknameModalRef = useRef<HTMLDivElement>(null);
  const prevVotesRef = useRef<typeof votes>([]);

  const deviceId = getLocalDeviceId();

  const menuVotesMap = useMemo(() => {
    const map: Record<string, { count: number; voters: { nickname: string; avatar?: string }[] }> = {};
    if (menus.length > 0) {
      menus.forEach((m) => {
        map[m.id] = { count: 0, voters: [] };
      });
    }
    votes.forEach((vote) => {
      if (map[vote.menuId]) {
        map[vote.menuId].count += 1;
        map[vote.menuId].voters.push({ nickname: vote.nickname, avatar: vote.avatar });
      }
    });
    return map;
  }, [menus, votes]);

  const participantCount = useMemo(
    () => new Set(votes.map((v) => v.userId)).size,
    [votes],
  );

  const totalVotes = votes.length;

  const maxVoteCount = useMemo(
    () => Math.max(...Object.values(menuVotesMap).map((v) => v.count), 0),
    [menuVotesMap],
  );

  // 메뉴 목록 진입 애니메이션
  useGSAP(
    () => {
      if (!roomLoading && !votesLoading && room && nickname) {
        gsap.fromTo(
          "header",
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
        if (menuListRef.current) {
          gsap.fromTo(
            menuListRef.current.querySelectorAll(".menu-vote-item"),
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.07,
              ease: "power2.out",
              delay: 0.15,
            },
          );
        }
      }
    },
    {
      scope: containerRef,
      dependencies: [roomLoading, votesLoading, !!room, !!nickname],
    },
  );

  // 투표 변경 시 해당 카드 pulse
  useEffect(() => {
    if (votes.length !== prevVotesRef.current.length && menuListRef.current) {
      const changed = votes.find(
        (v) =>
          !prevVotesRef.current.find(
            (pv) => pv.userId === v.userId && pv.menuId === v.menuId,
          ),
      );
      if (changed) {
        const el = menuListRef.current.querySelector(
          `[data-menu-id="${changed.menuId}"]`,
        );
        if (el) {
          gsap.fromTo(
            el,
            { scale: 1 },
            {
              scale: 1.025,
              duration: 0.15,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            },
          );
        }
      }
    }
    prevVotesRef.current = votes;
  }, [votes]);

  // 닉네임 모달 진입 애니메이션
  useGSAP(
    () => {
      if (
        !nickname &&
        !roomLoading &&
        !votesLoading &&
        nicknameModalRef.current
      ) {
        gsap.fromTo(
          nicknameModalRef.current,
          { opacity: 0, scale: 0.94, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
        );
      }
    },
    { dependencies: [!nickname, roomLoading, votesLoading] },
  );

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

  const handleEnterRoom = () => {
    if (!tempNickname.trim()) return;
    setNickname(tempNickname.trim());
    setAvatar(tempAvatar);
  };

  // 닉네임 입력 모달
  if (!nickname) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-6">
        <div
          ref={nicknameModalRef}
          className="bg-white p-8 rounded-3xl border border-[#e5e1d8] w-full max-w-sm opacity-0"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
        >
          <div className="text-center mb-6">
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.35em] mb-3">
              투표 참여
            </p>
            <h2 className="hd text-3xl text-black mb-2 leading-tight">
              {room.title}
            </h2>
          </div>

          {/* 선택된 아바타 미리보기 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
              {tempAvatar && ANIMAL_URL_MAP[tempAvatar] && (
                <img
                  src={ANIMAL_URL_MAP[tempAvatar]}
                  alt={tempAvatar}
                  className="w-10 h-10 object-contain"
                />
              )}
            </div>
          </div>

          {/* 동물 아이콘 선택 그리드 */}
          <div className="mb-5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 text-center">
              프로필 아이콘 선택
            </p>
            <div className="h-40 overflow-y-auto rounded-xl bg-[#faf9f5] border border-[#e5e1d8] p-2">
              <div className="grid grid-cols-7 gap-1">
                {ANIMALS.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => setTempAvatar(animal.id)}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                      tempAvatar === animal.id
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
            placeholder="사용할 닉네임"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEnterRoom();
            }}
            maxLength={10}
            autoFocus
            className="w-full bg-[#faf9f5] border border-[#e5e1d8] rounded-xl px-4 py-3.5 mb-3 focus-brand placeholder:text-gray-300 placeholder:font-normal font-medium text-black outline-none transition-all text-sm"
          />
          <button
            onClick={handleEnterRoom}
            disabled={!tempNickname.trim()}
            className="w-full bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-[15px] rounded-xl shadow-[0_4px_20px_rgba(234,88,12,0.2)] transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            입장하기
          </button>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === deviceId;
  const isClosed = room.isClosed;

  const winnerMenuId = isClosed
    ? Object.entries(menuVotesMap)
        .filter(([, v]) => v.count > 0)
        .sort((a, b) => b[1].count - a[1].count)[0]?.[0]
    : null;

  const handleVote = async (menuId: string) => {
    if (isClosed) return;
    await castVote(deviceId, nickname, avatar, menuId);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 복사되었습니다!");
  };

  const handleCloseVote = async () => {
    if (!roomId) return;
    if (window.confirm("투표를 종료하시겠습니까?")) {
      try {
        await updateDoc(doc(db, "rooms", roomId), { isClosed: true });
      } catch (err) {
        console.error(err);
        alert("투표 종료에 실패했습니다.");
      }
    }
  };

  const handleOpenEditNickname = () => {
    setEditNicknameInput(nickname ?? "");
    setEditAvatar(avatar ?? tempAvatar);
    setShowEditNickname(true);
  };

  const handleSaveNickname = async () => {
    const trimmed = editNicknameInput.trim();
    if (!trimmed) {
      setShowEditNickname(false);
      return;
    }
    if (trimmed !== nickname || editAvatar !== avatar) {
      await updateNickname(deviceId, trimmed, editAvatar);
      setNickname(trimmed);
      if (editAvatar) setAvatar(editAvatar);
    }
    setShowEditNickname(false);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#faf9f5] flex flex-col font-sans"
    >
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e5e1d8] p-6 sticky top-0 z-10 shadow-sm">
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
            <h1 className="hd text-2xl text-black leading-tight">
              {room.title}
            </h1>
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

      {/* 메뉴 목록 */}
      <main className="flex-1 px-5 pt-6 pb-28 w-full max-w-md mx-auto">
        {/* 안내 배너 */}
        {!isClosed && (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
              원하는 메뉴를 선택하세요
            </span>
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
          </div>
        )}

        {isClosed && (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">
              최종 결과
            </span>
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
          </div>
        )}

        <div ref={menuListRef} className="space-y-3">
          {menus.map((menu) => {
            const voteData = menuVotesMap[menu.id] || {
              count: 0,
              voters: [],
            };
            const isMyVote =
              votes.find((v) => v.userId === deviceId)?.menuId === menu.id;
            const isLeading =
              voteData.count > 0 && voteData.count === maxVoteCount;
            const isWinner = winnerMenuId === menu.id;
            const percentage =
              totalVotes > 0
                ? Math.round((voteData.count / totalVotes) * 100)
                : 0;

            return (
              <button
                key={menu.id}
                data-menu-id={menu.id}
                onClick={() => handleVote(menu.id)}
                disabled={isClosed}
                className={[
                  "menu-vote-item group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200",
                  isWinner
                    ? "border-orange-400 bg-linear-to-br from-orange-50 to-amber-50/40"
                    : isMyVote
                      ? "border-orange-200 bg-orange-50/30"
                      : "border-[#e9e5dd] bg-white hover:border-orange-200 hover:shadow-sm",
                  isClosed && !isWinner ? "opacity-45" : "",
                  isClosed ? "cursor-default" : "active:scale-[0.99]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* 1위 배지 */}
                {isWinner && (
                  <div className="absolute -top-2.5 left-5">
                    <span className="bg-orange-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                      1위
                    </span>
                  </div>
                )}

                {/* 메뉴명 + 투표수 */}
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className={`hd text-[26px] leading-tight transition-colors flex-1 ${isWinner ? "text-orange-950" : "text-black"} ${!isClosed ? "group-hover:text-orange-900" : ""}`}
                  >
                    {menu.name}
                  </h3>
                  <div className="text-right shrink-0 ml-3">
                    {isMyVote && !isWinner && (
                      <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-block mb-1">
                        내 선택
                      </span>
                    )}
                    <span
                      className={`text-3xl font-bold leading-none block ${voteData.count > 0 ? (isWinner ? "text-orange-600" : "text-orange-500") : "text-gray-200"}`}
                    >
                      {voteData.count}
                    </span>
                    {totalVotes > 0 && voteData.count > 0 && (
                      <span className="text-[9px] font-black text-gray-400 tracking-wide block">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* 진행 바 */}
                {totalVotes > 0 && (
                  <div className="mb-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full vote-bar ${isLeading ? "bg-orange-500" : "bg-gray-300"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}

                {/* 투표자 목록 */}
                <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                  {voteData.voters.map((voter, idx) => (
                    <span
                      key={idx}
                      className={`flex items-center gap-1 text-[10px] font-bold tracking-tight px-2 py-0.5 rounded border ${
                        voter.nickname === nickname
                          ? "bg-orange-600 border-orange-600 text-white"
                          : "bg-white border-[#e5e1d8] text-gray-500"
                      }`}
                    >
                      {voter.avatar && ANIMAL_URL_MAP[voter.avatar] && (
                        <img
                          src={ANIMAL_URL_MAP[voter.avatar]}
                          alt={voter.avatar}
                          className="w-3.5 h-3.5 object-contain"
                        />
                      )}
                      {voter.nickname}
                    </span>
                  ))}
                  {voteData.count === 0 && !isClosed && (
                    <span className="hd text-sm text-gray-300">
                      첫 번째로 선택해보세요
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <span className="hd text-lg text-gray-300">Menu Sync</span>
        </div>
      </main>

      {/* 닉네임 수정 모달 */}
      {showEditNickname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl border border-[#e5e1d8] w-full max-w-sm"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <div className="text-center mb-5">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.35em] mb-2">
                프로필 수정
              </p>
            </div>

            {/* 선택된 아바타 미리보기 */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
                {editAvatar && ANIMAL_URL_MAP[editAvatar] && (
                  <img
                    src={ANIMAL_URL_MAP[editAvatar]}
                    alt={editAvatar}
                    className="w-9 h-9 object-contain"
                  />
                )}
              </div>
            </div>

            {/* 동물 아이콘 선택 그리드 */}
            <div className="mb-4">
              <div className="h-36 overflow-y-auto rounded-xl bg-[#faf9f5] border border-[#e5e1d8] p-2">
                <div className="grid grid-cols-7 gap-1">
                  {ANIMALS.map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setEditAvatar(animal.id)}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                        editAvatar === animal.id
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
              value={editNicknameInput}
              onChange={(e) => setEditNicknameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNickname();
                if (e.key === "Escape") setShowEditNickname(false);
              }}
              maxLength={10}
              autoFocus
              className="w-full bg-[#faf9f5] border border-[#e5e1d8] rounded-xl px-4 py-3.5 mb-3 focus-brand placeholder:text-gray-300 font-medium text-black outline-none transition-all text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditNickname(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                취소
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={!editNicknameInput.trim()}
                className="flex-1 bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 컨트롤 바 */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-[#e5e1d8] p-4">
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
            onClick={handleOpenEditNickname}
            className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-[0.98]"
          >
            {avatar && ANIMAL_URL_MAP[avatar] ? (
              <img
                src={ANIMAL_URL_MAP[avatar]}
                alt={avatar}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.5L16.732 3.732z" />
              </svg>
            )}
            {nickname}
          </button>

          {isHost && !isClosed && (
            <button
              onClick={handleCloseVote}
              className="flex-1 bg-[#111] hover:bg-zinc-800 text-white font-black py-3 px-4 rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-[0.98]"
            >
              투표 종료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
