import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

export async function trackPageVisit(eventKey: string) {
  const token = getAccessToken();
  const userId = getUserId();
  if (!token || !userId) return { unlockedCount: 0, randomDrop: false, sequenceDrop: false };

  await restFetch("user_events", {}, {
    method: "POST",
    body: {
      user_id: userId,
      event_type: "page_visit",
      event_key: eventKey,
    },
    token,
    prefer: "return=minimal",
  });

  const rpc = await restFetch<any>("rpc/try_unlocks", {}, {
    method: "POST",
    body: {
      p_event_type: "page_visit",
      p_event_key: eventKey,
    },
    token,
  });

  return {
    unlockedCount: (rpc as any)?.unlocked_count ?? (Array.isArray(rpc) ? (rpc[0] as any)?.unlocked_count ?? 0 : 0),
    randomDrop: (rpc as any)?.random_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.random_drop ?? false : false),
    sequenceDrop: (rpc as any)?.sequence_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.sequence_drop ?? false : false),
  };
}

export async function trackPageClick(eventKey: string) {
  const token = getAccessToken();
  const userId = getUserId();
  if (!token || !userId) return { unlockedCount: 0, randomDrop: false, sequenceDrop: false };

  await restFetch("user_events", {}, {
    method: "POST",
    body: {
      user_id: userId,
      event_type: "page_click",
      event_key: eventKey,
    },
    token,
    prefer: "return=minimal",
  });

  const rpc = await restFetch<any>("rpc/try_unlocks", {}, {
    method: "POST",
    body: {
      p_event_type: "page_click",
      p_event_key: eventKey,
    },
    token,
  });

  return {
    unlockedCount: (rpc as any)?.unlocked_count ?? (Array.isArray(rpc) ? (rpc[0] as any)?.unlocked_count ?? 0 : 0),
    randomDrop: (rpc as any)?.random_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.random_drop ?? false : false),
    sequenceDrop: (rpc as any)?.sequence_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.sequence_drop ?? false : false),
  };
}

export async function trackTimeOnPage(eventKey: string) {
  const token = getAccessToken();
  const userId = getUserId();
  if (!token || !userId) return { unlockedCount: 0, randomDrop: false, sequenceDrop: false };

  await restFetch("user_events", {}, {
    method: "POST",
    body: {
      user_id: userId,
      event_type: "page_time",
      event_key: eventKey,
    },
    token,
    prefer: "return=minimal",
  });

  const rpc = await restFetch<any>("rpc/try_unlocks", {}, {
    method: "POST",
    body: {
      p_event_type: "page_time",
      p_event_key: eventKey,
    },
    token,
  });

  return {
    unlockedCount: (rpc as any)?.unlocked_count ?? (Array.isArray(rpc) ? (rpc[0] as any)?.unlocked_count ?? 0 : 0),
    randomDrop: (rpc as any)?.random_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.random_drop ?? false : false),
    sequenceDrop: (rpc as any)?.sequence_drop ?? (Array.isArray(rpc) ? (rpc[0] as any)?.sequence_drop ?? false : false),
  };
}
