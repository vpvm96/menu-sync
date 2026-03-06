import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import CreateMenuBoard from "./pages/CreateMenuBoard";
import Room from "./pages/Room";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/template/new" element={<CreateMenuBoard />} />
          <Route path="/room/:roomId" element={<Room />} />
          {/* 없는 경로는 모두 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
