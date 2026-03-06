import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ANIMAL_URL_MAP } from "../../constants/animals";
import type { Menu, Vote } from "../../types";

interface VoteMenuListProps {
  menus: Menu[];
  votes: Vote[];
  deviceId: string;
  nickname: string | null;
  isClosed: boolean;
  onVote: (menuId: string) => void;
}

export default function VoteMenuList({
  menus,
  votes,
  deviceId,
  nickname,
  isClosed,
  onVote,
}: VoteMenuListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevVotesRef = useRef<Vote[]>([]);

  // 1:1 매핑된 투표 데이터 계산
  const menuVotesMap = menus.reduce(
    (acc, m) => {
      acc[m.id] = { count: 0, voters: [] };
      return acc;
    },
    {} as Record<
      string,
      { count: number; voters: { nickname: string; avatar?: string }[] }
    >,
  );

  votes.forEach((vote) => {
    if (menuVotesMap[vote.menuId]) {
      menuVotesMap[vote.menuId].count += 1;
      menuVotesMap[vote.menuId].voters.push({
        nickname: vote.nickname,
        avatar: vote.avatar,
      });
    }
  });

  const totalVotes = votes.length;
  const maxVoteCount = Math.max(
    ...Object.values(menuVotesMap).map((v) => v.count),
    0,
  );

  const winnerMenuId = isClosed
    ? Object.entries(menuVotesMap)
        .filter(([, v]) => v.count > 0)
        .sort((a, b) => b[1].count - a[1].count)[0]?.[0]
    : null;

  // 진입 애니메이션
  useGSAP(
    () => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".menu-vote-item"),
          {
            opacity: 0,
            y: 20,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power4.out",
          },
        );
      }
    },
    { scope: containerRef },
  );

  // 투표 업데이트 시 애니메이션
  useEffect(() => {
    if (votes.length !== prevVotesRef.current.length && containerRef.current) {
      const changed = votes.find(
        (v) =>
          !prevVotesRef.current.find(
            (pv) => pv.userId === v.userId && pv.menuId === v.menuId,
          ),
      );
      if (changed) {
        const el = containerRef.current.querySelector(
          `[data-menu-id="${changed.menuId}"]`,
        );
        if (el) {
          gsap.fromTo(
            el,
            { scale: 1 },
            {
              scale: 1.02,
              duration: 0.15,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut",
            },
          );
        }
      }
    }
    prevVotesRef.current = votes;
  }, [votes]);

  return (
    <main
      ref={containerRef}
      className="flex-1 px-5 pt-6 pb-28 w-full max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-[#e5e1d8]"></div>
        <span
          className={`text-[9px] font-black uppercase tracking-[0.3em] ${isClosed ? "text-orange-500" : "text-gray-400"}`}
        >
          {isClosed ? "최종 결과" : "원하는 메뉴를 선택하세요"}
        </span>
        <div className="h-px flex-1 bg-[#e5e1d8]"></div>
      </div>

      <div className="space-y-3">
        {menus.map((menu) => {
          const voteData = menuVotesMap[menu.id];
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
              onClick={() => onVote(menu.id)}
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
              {isWinner && (
                <div className="absolute -top-2.5 left-5">
                  <span className="bg-orange-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    1위
                  </span>
                </div>
              )}

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

              {totalVotes > 0 && (
                <div className="mb-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full vote-bar transition-all duration-500 ease-out ${isLeading ? "bg-orange-500" : "bg-gray-300"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}

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
  );
}
