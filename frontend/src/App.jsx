import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ChatProvider>
          <BrowserRouter>
            <div className="relative min-h-screen w-full text-white">
              <AnimatedBackground />
              <Suspense fallback={<FullScreenLoader />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<ChatPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>
          </BrowserRouter>
        </ChatProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
