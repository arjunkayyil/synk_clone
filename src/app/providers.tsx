"use client";

/**
 * src/app/providers.tsx
 * Wraps the whole app with TanStack QueryClient and the CreateTask modal context.
 */

import { useState, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// ── Modal context ─────────────────────────────────────────────────────────────
interface ModalCtx {
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
}

const ModalContext = createContext<ModalCtx>({
  isCreateOpen: false,
  openCreate: () => {},
  closeCreate: () => {},
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

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ModalContext.Provider
          value={{
            isCreateOpen,
            openCreate: () => setIsCreateOpen(true),
            closeCreate: () => setIsCreateOpen(false),
          }}
        >
          {children}
        </ModalContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
