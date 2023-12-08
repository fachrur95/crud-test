import { Layouts } from "@/components/layouts";
import { LoadingPage } from "@/components/layouts/LoadingPage";
import { type MyAppProps } from "@/components/layouts/layoutTypes";
import { GlobalContextProvider } from "@/context/GlobalContext";
import { WorkerContext } from "@/context/WorkerContext";
import type { IEventDeleteWorker } from "@/types/worker";
import { useAppStore } from "@/utils/store";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as TwProvider } from "next-themes";
import NextNProgress from "nextjs-progressbar";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) => {
  const Layout =
    Layouts[Component?.Layout ?? "Plain"] ?? ((page: unknown) => page);
  const [isClient, setIsClient] = useState<boolean>(false);
  const deleteWorker = useRef<Worker>();
  const { setToast, setDeletingProcess } = useAppStore();

  const handleReceiveDeleteResponse = useCallback(
    (event: MessageEvent<IEventDeleteWorker>) => {
      const data = event.data;
      setToast({
        message: data.message,
        variant: data.variant,
        path: data.path ?? undefined,
      });
      setDeletingProcess(data.progress ?? 0);
    },
    [setToast, setDeletingProcess],
  );

  useEffect(() => {
    deleteWorker.current = new Worker(
      new URL("@/utils/workers/deleting.worker.ts", import.meta.url),
    );
    deleteWorker.current.onmessage = handleReceiveDeleteResponse;
    return () => {
      deleteWorker.current?.terminate();
    };
  }, [handleReceiveDeleteResponse]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingPage />;
  }

  return (
    <TwProvider enableSystem={true} attribute="class" defaultTheme="system">
      <GlobalContextProvider>
        <WorkerContext.Provider value={{ deleteWorker }}>
          <SessionProvider session={session as Session}>
            <Layout>
              <NextNProgress color="#fff" height={4} />
              <Component {...pageProps} />
            </Layout>
          </SessionProvider>
        </WorkerContext.Provider>
      </GlobalContextProvider>
    </TwProvider>
  );
};

export default api.withTRPC(MyApp);
