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

// Module-level cache & inflight promise for entire retrieval
let sysUsersCache: SysUserType[] | null = null;
let inflight: Promise<SysUserType[] | null> | null = null;

// Map server item -> client SysUserType shape
const mapServerToClient = (s: any): SysUserType => ({
  userId: String(s.userId ?? s.id ?? s.user_id ?? ""),
  fullname: String(s.fullname ?? s.full_name ?? s.username ?? ""),
  // Fallback to username if email is not provided by the API
  email: String(s.email ?? s.username ?? ""),
  accessLevel: Number(s.accessLevel ?? s.access_level ?? 0),
  // Default to 1 (active) if the API doesn't provide a status
  status: Number(s.status ?? 1),
});

// Single-shot fetch: pull all data at once and cache it
const fetchAllSysUsers = async (token: string): Promise<SysUserType[] | null> => {
  const client = axiosInstanceWithAuthorization(token);
  const res = await client.get("/api/admin-sys-users");
  if (res.status !== 200) return null;

  const raw = res.data;
  // Expected shape:
  // { success: true, data: { items: [...], total, offset, limit } }
  let items: any[] = [];
  if (Array.isArray(raw)) items = raw;
  else if (Array.isArray(raw?.data?.items)) items = raw.data.items;
  else if (Array.isArray(raw?.data)) items = raw.data;
  else if (Array.isArray(raw?.items)) items = raw.items;

  const mapped = items.map(mapServerToClient).filter((u) => u.userId);
  // Deduplicate by userId
  const dedup = Array.from(new Map(mapped.map((u) => [u.userId, u])).values());
  return dedup;
};

export const useSysUsersCache = (options?: { forceRefresh?: boolean }) => {
  const [cookie] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<SysUserType[] | null>(sysUsersCache);
  const [loading, setLoading] = React.useState<boolean>(!sysUsersCache);
  const [error, setError] = React.useState<string | null>(null);
  const forceRefresh = !!options?.forceRefresh;

  React.useEffect(() => {
    let cancelled = false;

    const startFetch = () => {
      if (!inflight || forceRefresh) {
        if (forceRefresh) sysUsersCache = null;
        inflight = (async () => {
          try {
            const result = await fetchAllSysUsers(cookie.accessToken);
            sysUsersCache = result || [];
            return sysUsersCache;
          } catch (e: any) {
            setError(e?.message || "Failed to load sys users");
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
      setData(sysUsersCache);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [cookie.accessToken, forceRefresh]);

  return {
    data: (data || []) as SysUserType[],
    loading,
    error,
    refresh: () => {
      sysUsersCache = null;
      inflight = null;
      setLoading(true);
    },
  };
};
