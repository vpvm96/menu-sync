import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates";
import { generateMenuId } from "../utils/helpers";
import type { Menu } from "../types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function CreateMenuBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");

  const { templates, saveTemplate, loading } = useTemplates();

  const [templateName, setTemplateName] = useState("");
  const [menuInput, setMenuInput] = useState("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuListRef = useRef<HTMLDivElement>(null);
  const prevMenuCount = useRef(0);

  useEffect(() => {
    if (editId && templates.length > 0) {
      const targetTpl = templates.find((t) => t.id === editId);
      if (targetTpl) {
        setTemplateName(targetTpl.name);
        setMenus(targetTpl.menus);
      }
    }
  }, [editId, templates]);

  // 페이지 진입 애니메이션 (editId인 경우 로딩 완료 후 실행)
  useGSAP(
    () => {
      if (loading) return;
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
    { scope: containerRef, dependencies: [loading] },
  );

  // 메뉴 추가 시 새 아이템 애니메이션
  useEffect(() => {
    if (menus.length > prevMenuCount.current && menuListRef.current) {
      const items = menuListRef.current.querySelectorAll(".menu-item");
      const lastItem = items[items.length - 1];
      if (lastItem) {
        gsap.fromTo(
          lastItem,
          { opacity: 0, x: -16, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" },
        );
      }
    }
    prevMenuCount.current = menus.length;
  }, [menus.length]);

  const handleAddMenu = () => {
    if (!menuInput.trim()) return;
    setMenus([...menus, { id: generateMenuId(), name: menuInput.trim() }]);
    setMenuInput("");
  };

  const handleRemoveMenu = (idToRemove: string) => {
    setMenus(menus.filter((m) => m.id !== idToRemove));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("메뉴판 이름을 입력해주세요.");
      return;
    }
    if (menus.length === 0) {
      alert("최소 1개 이상의 메뉴를 추가해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      await saveTemplate(editId, templateName, menus);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("메뉴판 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (editId && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            불러오는 중
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#fdfcf9] flex flex-col font-sans"
    >
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e5e1d8] p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
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
            뒤로가기
          </button>
          <h1 className="hd text-2xl text-black">
            {editId ? "메뉴판 수정" : "새 메뉴판"}
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 p-6 pb-32">
        <div className="max-w-md mx-auto space-y-10">
          <section className="page-section opacity-0">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">
              메뉴판 이름
            </label>
            <div className="relative group">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="ex) 미스터 디벨로 메뉴판"
                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-orange-600 py-4 text-center text-2xl font-semibold text-black focus:ring-0 placeholder:text-gray-300 placeholder:font-normal transition-colors outline-none"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-orange-700 transition-all duration-500 group-focus-within:w-full"></div>
            </div>
          </section>

          <section className="page-section opacity-0">
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                메뉴 목록 ({menus.length})
              </label>
            </div>

            <div className="flex gap-3 mb-8">
              <input
                type="text"
                value={menuInput}
                onChange={(e) => setMenuInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMenu()}
                placeholder="메뉴를 입력하세요..."
                className="flex-1 bg-white border border-[#e5e1d8] rounded-lg px-4 py-3 text-black font-medium focus-brand placeholder:text-gray-400 placeholder:font-normal placeholder:not-italic transition-all outline-none"
              />
              <button
                onClick={handleAddMenu}
                className="bg-black text-white font-black px-6 py-3 rounded-lg hover:bg-zinc-800 transition active:scale-[0.95] text-sm uppercase tracking-widest"
              >
                추가
              </button>
            </div>

            <div ref={menuListRef} className="grid gap-3">
              {menus.map((menu, idx) => (
                <div
                  key={menu.id}
                  className="menu-item flex justify-between items-center bg-white border border-[#e5e1d8] p-5 rounded-xl group hover:border-orange-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-300 w-6 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-base text-black">
                      {menu.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMenu(menu.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              {menus.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-[#e5e1d8] rounded-2xl">
                  <p className="font-semibold text-gray-400 text-base">
                    메뉴가 아직 비어있습니다
                  </p>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mt-3">
                    위 입력창에서 메뉴를 추가해보세요
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-[#e5e1d8]">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className={`w-full py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl
              ${isSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-orange-600 text-white hover:bg-orange-700"}
            `}
          >
            {isSaving ? "저장 중..." : "메뉴판 저장하기"}
          </button>
        </div>
      </footer>
    </div>
  );
}
