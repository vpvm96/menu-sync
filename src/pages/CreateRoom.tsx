import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { useTemplates } from "../hooks/useTemplates";
import type { MenuTemplate } from "../hooks/useTemplates";
import { getLocalDeviceId } from "../utils/helpers";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function CreateRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const formattedDate = `${year}년 ${month}월 ${day}일`;

  const { createRoom } = useRoom();
  const { templates, loading, removeTemplate } = useTemplates();

  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const templateListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template && selectedTemplate?.id !== template.id) {
        Promise.resolve().then(() => {
          setSelectedTemplate(template);
        });
      }
    }
  }, [templateId, templates, selectedTemplate]);

  // 페이지 진입 애니메이션
  useGSAP(
    () => {
      gsap.fromTo(
        "header",
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
      gsap.fromTo(
        ".page-section",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          delay: 0.2,
        },
      );
    },
    { scope: containerRef },
  );

  // 템플릿 목록 stagger 애니메이션
  useEffect(() => {
    if (!loading && templates.length > 0 && templateListRef.current) {
      gsap.fromTo(
        templateListRef.current.querySelectorAll(".tpl-card"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, [loading, templates.length]);

  const handleCreateRoom = async () => {
    if (!title.trim()) {
      alert("방 제목을 입력해주세요.");
      return;
    }
    if (!selectedTemplate) {
      alert("메뉴판을 선택해주세요.");
      return;
    }

    try {
      setIsCreating(true);
      const hostId = getLocalDeviceId();
      const roomId = await createRoom(title, selectedTemplate.menus, hostId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error(error);
      alert("방 생성에 실패했습니다.");
      setIsCreating(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#fdfcf9] flex flex-col font-sans"
    >
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e5e1d8] p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-black transition flex items-center gap-1 text-xs font-black uppercase tracking-widest"
          >
            ← 홈으로
          </button>
          <h1 className="hd text-2xl text-black">투표 시작하기</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 p-6 pb-32">
        <div className="max-w-md mx-auto space-y-12">
          <section className="page-section opacity-0">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">
              투표 방 제목 입력
            </label>
            <div className="relative group">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`ex) ${formattedDate} 점심`}
                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-orange-600 py-4 text-center text-2xl font-semibold text-black focus:ring-0 placeholder:text-gray-300 placeholder:font-normal transition-colors outline-none"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-orange-600 transition-all duration-500 group-focus-within:w-full"></div>
            </div>
          </section>

          <section className="page-section opacity-0 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                메뉴판 선택 ({templates.length})
              </label>
              <button
                onClick={() => navigate("/template/new")}
                className="text-[10px] font-black text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition uppercase tracking-widest"
              >
                + 새 메뉴판 만들기
              </button>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-100/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div ref={templateListRef} className="grid gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`tpl-card group relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${
                        selectedTemplate?.id === tpl.id
                          ? "border-orange-600 bg-orange-50/50 shadow-sm"
                          : "border-[#e5e1d8] bg-white hover:border-orange-200 shadow-sm hover:shadow-md"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className={`font-display font-semibold text-lg ${selectedTemplate?.id === tpl.id ? "text-orange-950" : "text-black"}`}
                        >
                          {tpl.name}
                        </h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                          {tpl.menus.length}개의 메뉴
                        </p>
                      </div>

                      <div className="flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/template/new?editId=${tpl.id}`);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition"
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
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.5L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("이 메뉴판을 삭제하시겠습니까?"))
                              removeTemplate(tpl.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.menus.slice(0, 5).map((m) => (
                        <span
                          key={m.id}
                          className="text-[10px] font-bold bg-white border border-[#e5e1d8] text-gray-700 px-2 py-0.5 rounded-sm"
                        >
                          {m.name}
                        </span>
                      ))}
                      {tpl.menus.length > 5 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{tpl.menus.length - 5}개 더
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-20 bg-white border-2 border-dashed border-[#e5e1d8] rounded-2xl">
                    <p className="font-semibold text-gray-400 text-base mb-2">
                      아직 등록된 메뉴판이 없습니다
                    </p>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-300">
                      새 메뉴판 만들기로 시작해보세요
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-[#e5e1d8]">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !selectedTemplate}
            className={`w-full py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl
              ${isCreating || !selectedTemplate ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100"}
            `}
          >
            {isCreating
              ? "방을 준비 중입니다..."
              : selectedTemplate
                ? "투표 시작하기"
                : "메뉴판을 선택해주세요"}
          </button>
        </div>
      </footer>
    </div>
  );
}
