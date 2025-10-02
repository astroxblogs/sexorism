import React, { createContext, useContext, useState, useCallback } from "react";
import { incrementShareCount as apiIncrementShare } from "../services/Public-service/api";

const ShareContext = createContext();

export const ShareProvider = ({ children }) => {
  const [shareCounts, setShareCounts] = useState({});

  const getShareCount = useCallback(
    (blogId) => {
      return shareCounts[blogId] || 0;
    },
    [shareCounts]
  );

  const setInitialShareCount = useCallback((blogId, count) => {
    setShareCounts((prev) => {
      if (prev[blogId] !== undefined) return prev; // don’t overwrite updated count
      return { ...prev, [blogId]: count };
    });
  }, []);

  const incrementShareCount = useCallback(
    async (blogId) => {
      try {
        const res = await apiIncrementShare(blogId);
        const next = res?.shareCount ?? (shareCounts[blogId] || 0) + 1;
        setShareCounts((prev) => ({ ...prev, [blogId]: next }));
        return next;
      } catch {
        const next = (shareCounts[blogId] || 0) + 1;
        setShareCounts((prev) => ({ ...prev, [blogId]: next }));
        return next;
      }
    },
    [shareCounts]
  );

  return (
    <ShareContext.Provider
      value={{ shareCounts, getShareCount, incrementShareCount, setInitialShareCount }}
    >
      {children}
    </ShareContext.Provider>
  );
};

export const useShare = () => useContext(ShareContext);
