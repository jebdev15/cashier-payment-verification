import React from "react";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";

export type SysUserType = {
  userId: string;
  fullname: string;
  email: string;
  accessLevel: number;
  status: number;
};

// Module-level cache & inflight promise for entire bulk retrieval
let sysUsersCache: SysUserType[] | null = null;
let inflight: Promise<SysUserType[] | null> | null = null;

const CHUNK_LIMIT = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract items + total from various possible response shapes.
 */
const normalizeResponse = (raw: any): { items: SysUserType[]; total: number } => {
  if (!raw) return { items: [], total: 0 };

  // Common shapes:
  // { data: { items: [], total: number } }
  if (raw?.data?.items && Array.isArray(raw.data.items)) {
    return { items: raw.data.items, total: Number(raw.data.total ?? raw.data.items.length) };
  }
  // { data: [] , total: number }
  if (Array.isArray(raw?.data)) {
    return { items: raw.data, total: Number(raw.total ?? raw.data.length) };
  }
  // Array directly
  if (Array.isArray(raw)) {
    return { items: raw, total: raw.length };
  }
  // Fallback single object with items
  if (Array.isArray(raw?.items)) {
    return { items: raw.items, total: Number(raw.total ?? raw.items.length) };
  }
  return { items: [], total: Number(raw?.total ?? 0) };
};

/**
 * Bulk fetch all sys users in CHUNK_LIMIT increments.
 */
const fetchAllSysUsers = async (token: string, chunkSize: number): Promise<SysUserType[] | null> => {
  const client = axiosInstanceWithAuthorization(token);
  let all: SysUserType[] = [];
  let offset = 0;
  let total = Infinity;

  // Map server item -> client SysUserType shape
  const mapServerToClient = (s: any): SysUserType => ({
    userId: String(s.userId ?? s.id ?? ""),
    fullname: String(s.fullname ?? ""),
    email: String(s.email ?? ""),
    accessLevel: Number(s.accessLevel ?? 0),
    status: Number(s.status ?? 0),
  });

  while (offset < total) {
    const url = `/api/admin-sys-users?offset=${offset}&limit=${chunkSize}`;
    let res: any = null;
    let attempt = 0;
    const maxRetry = 3;

    while (attempt < maxRetry && !res) {
      try {
        res = await client.get(url);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          attempt += 1;
          await sleep(500 * attempt);
          if (attempt === maxRetry) throw err;
          continue;
        }
        throw err;
      }
    }

    if (!res || res.status !== 200) break;

    const { items, total: parsedTotal } = normalizeResponse(res.data);
    if (total === Infinity) total = parsedTotal; // set total on first successful parse

    if (!items.length) break;

    // Normalize each server item to SysUserType
    const mapped = items.map(mapServerToClient).filter((u) => u.userId);
    all = all.concat(mapped);
    offset += mapped.length;
    if (mapped.length < chunkSize && offset >= parsedTotal) break;
  }

  // Final normalization: remove potential duplicates by userId
  const dedupMap = new Map<string, SysUserType>();
  all.forEach((u) => {
    if (u?.userId) dedupMap.set(u.userId, u);
  });

  return Array.from(dedupMap.values());
};

export const useSysUsersCache = (options?: { forceRefresh?: boolean; chunkSize?: number }) => {
  const [cookie] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<SysUserType[] | null>(sysUsersCache);
  const [loading, setLoading] = React.useState<boolean>(!sysUsersCache);
  const [error, setError] = React.useState<string | null>(null);
  const chunkSize = options?.chunkSize && options.chunkSize > 0 ? options.chunkSize : CHUNK_LIMIT;
  const forceRefresh = !!options?.forceRefresh;

  React.useEffect(() => {
    let cancelled = false;

    const startFetch = () => {
      if (!inflight || forceRefresh) {
        if (forceRefresh) {
          sysUsersCache = null;
        }
        inflight = (async () => {
          try {
            const result = await fetchAllSysUsers(cookie.accessToken, chunkSize);
            sysUsersCache = result || [];
            return sysUsersCache;
          } catch (e: any) {
            const message =
              e?.response?.status === 429
                ? "Rate limit reached. Please try again shortly."
                : e?.message || "Failed to load sys users";
            setError(message);
            return null;
          }
        })();
      }
      inflight.then((list) => {
        if (cancelled) return;
        setData(list || []);
        setLoading(false);
      });
    };

    if (!sysUsersCache || forceRefresh) {
      setLoading(true);
      startFetch();
    } else {
      // Already cached
      setData(sysUsersCache);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [cookie.accessToken, forceRefresh, chunkSize]);
  console.log("useSysUsersCache:", { data, loading, error });
  return {
    data: data || [],
    loading,
    error,
    refresh: () => {
      // manual refresh: clear cache & trigger effect cycle
      sysUsersCache = null;
      inflight = null;
      setLoading(true);
    },
  };
};
