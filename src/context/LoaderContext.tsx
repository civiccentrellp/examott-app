'use client';

import { createContext, useContext, useEffect, useState } from "react";

let globalShowLoader: (() => void) | null = null;
let globalHideLoader: (() => void) | null = null;

const LoaderContext = createContext({
  loading: false,
  showLoader: () => {},
  hideLoader: () => {},
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoader = () => {
    setLoadingCount((prev) => prev + 1);
  };

  const hideLoader = () => {
    setLoadingCount((prev) => Math.max(prev - 1, 0));
  };

  const loading = loadingCount > 0;

  useEffect(() => {
    globalShowLoader = showLoader;
    globalHideLoader = hideLoader;
  }, []);

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <span className="loader"></span>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
export const showGlobalLoader = () => globalShowLoader && globalShowLoader();
export const hideGlobalLoader = () => globalHideLoader && globalHideLoader();
