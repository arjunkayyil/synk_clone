"use client";

/**
 * src/app/providers.tsx
 * Wraps the whole app with TanStack QueryClient and the CreateTask modal context.
 */

import { useState, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// ── Modal context ─────────────────────────────────────────────────────────────
interface ModalCtx {
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  isRightPanelOpen: boolean;
  toggleRightPanel: () => void;
}

const ModalContext = createContext<ModalCtx>({
  isCreateOpen: false,
  openCreate: () => {},
  closeCreate: () => {},
  isRightPanelOpen: true,
  toggleRightPanel: () => {},
});

export function useCreateModal() {
  return useContext(ModalContext);
}

// ── Combined provider ─────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 30 } },
      })
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ModalContext.Provider
            value={{
              isCreateOpen,
              openCreate: () => setIsCreateOpen(true),
              closeCreate: () => setIsCreateOpen(false),
              isRightPanelOpen,
              toggleRightPanel: () => setIsRightPanelOpen(prev => !prev),
            }}
          >
            {children}
          </ModalContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
