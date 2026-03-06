import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates";
import { useRooms } from "../hooks/useRooms";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const navigate = useNavigate();
  const { templates, loading } = useTemplates();
  const { rooms, loading: roomsLoading } = useRooms();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);
  const roomsListRef = useRef<HTMLDivElement>(null);

  // 페이지 진입 애니메이션 (레이아웃 시프트 없이 top-aligned)
  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".home-hero",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      ).fromTo(
        ".home-btn",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.09,
          ease: "power2.out",
        },
        "-=0.4",
      );
    },
    { scope: containerRef },
  );

  // 스켈레톤 → 실제 콘텐츠 크로스페이드 (레이아웃 시프트 방지)
  useEffect(() => {
    if (!loading) {
      // 스켈레톤 페이드아웃
      if (skeletonRef.current) {
        gsap.to(skeletonRef.current, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            if (skeletonRef.current) {
              skeletonRef.current.style.display = "none";
            }
          },
        });
      }
      // 실제 콘텐츠 페이드인
      if (listRef.current) {
        gsap.fromTo(
          listRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" },
        );
        if (templates.length > 0) {
          gsap.fromTo(
            listRef.current.querySelectorAll(".template-card"),
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.07,
              ease: "power2.out",
              delay: 0.1,
            },
          );
        }
      }
    }
  }, [loading, templates.length]);

  return (
    // top-aligned 레이아웃 — justify-center 제거로 CLS 방지
    <div
      ref={containerRef}
      className="min-h-screen bg-[#faf9f5] font-sans flex flex-col items-center px-6"
    >
      <div className="w-full max-w-sm pt-[clamp(48px,12vh,96px)] pb-20">
        {/* Hero */}
        <div className="home-hero text-center mb-12 opacity-0">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-10 bg-gray-300/80"></div>
            <h1 className="hd text-5xl text-black">오뭐먹</h1>
            <div className="h-px w-10 bg-gray-300/80"></div>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.35em]">
            실시간 메뉴 투표
          </p>
        </div>

        {/* 메인 버튼 */}
        <div className="space-y-3 mb-14">
          <button
            onClick={() => navigate("/create")}
            className="home-btn opacity-0 w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-[18px] px-4 rounded-2xl text-sm tracking-wide transition-all duration-200 active:scale-[0.98] shadow-[0_8px_24px_rgba(234,88,12,0.22)]"
          >
            투표 방 만들기
          </button>

          <button
            onClick={() => navigate("/template/new")}
            className="home-btn opacity-0 w-full bg-white border border-[#e5e1d8] hover:border-orange-200 hover:bg-orange-50/40 text-black font-semibold py-[18px] px-4 rounded-2xl text-sm tracking-wide transition-all duration-200 active:scale-[0.98]"
          >
            새 메뉴판 만들기
          </button>
        </div>

        {/* 진행 중인 투표방 섹션 */}
        <div className="home-btn opacity-0 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.35em]">
              투표방
            </span>
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
          </div>

          <div ref={roomsListRef} className="space-y-2.5">
            {roomsLoading ? (
              <div className="h-[62px] bg-white border border-[#f0ede6] rounded-2xl animate-pulse" />
            ) : rooms.length > 0 ? (
              rooms.map((room) => {
                const linkedTemplate = room.templateId
                  ? templates.find((t) => t.id === room.templateId)
                  : null;
                const menuCount = linkedTemplate
                  ? linkedTemplate.menus.length
                  : room.menus.length;
                return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="w-full flex items-center justify-between bg-white border border-[#e5e1d8] hover:border-orange-200 hover:shadow-sm p-4 rounded-2xl text-left transition-all duration-200 group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${room.isClosed ? "bg-gray-300" : "bg-orange-500 animate-pulse"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="hd text-[18px] text-black group-hover:text-orange-900 transition-colors block truncate">
                        {room.title}
                      </span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mt-0.5 block">
                        {room.isClosed ? "투표 종료" : "투표 진행 중"} · 메뉴 {menuCount}개
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors ml-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-6 border border-dashed border-[#e5e1d8] rounded-2xl bg-white/50">
                <p className="hd text-xl text-gray-300 mb-1">아직 만든 투표방이 없습니다</p>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                  위 버튼으로 투표방을 만들어보세요
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 저장된 메뉴판 섹션 */}
        <div className="home-btn opacity-0">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.35em]">
              저장된 메뉴판
            </span>
            <div className="h-px flex-1 bg-[#e5e1d8]"></div>
          </div>

          {/* 콘텐츠 영역 — min-h로 레이아웃 시프트 방지 */}
          <div className="relative min-h-[200px]">
            {/* 스켈레톤 (절대 위치로 오버레이) */}
            {loading && (
              <div ref={skeletonRef} className="absolute inset-0 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[62px] bg-white border border-[#f0ede6] rounded-2xl animate-pulse"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}

            {/* 실제 콘텐츠 */}
            <div ref={listRef} className="opacity-0">
              {templates.length > 0 ? (
                <div className="space-y-2.5">
                  {templates.slice(0, 5).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => navigate(`/create?templateId=${tpl.id}`)}
                      className="template-card w-full flex items-center justify-between bg-white border border-[#e5e1d8] hover:border-orange-200 hover:shadow-sm p-4 rounded-2xl text-left transition-all duration-200 group active:scale-[0.99]"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="hd text-[18px] text-black group-hover:text-orange-900 transition-colors block truncate">
                          {tpl.name}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mt-0.5 block">
                          메뉴 {tpl.menus.length}개
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors ml-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-6 border border-dashed border-[#e5e1d8] rounded-2xl bg-white/50 min-h-[160px]">
                  <p className="hd text-2xl text-gray-300 mb-2">
                    저장된 메뉴판이 없습니다
                  </p>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    위 버튼으로 메뉴판을 만들어보세요
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
