import { supabase } from "@/lib/supabaseClient";

export async function trackPageVisit(eventKey: string) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return { unlockedCount: 0, randomDrop: false };

  const ins = await supabase.from("user_events").insert({
    user_id: user.id,
    event_type: "page_visit",
    event_key: eventKey,
  });

  if (ins.error) throw ins.error;

  const rpc = await supabase.rpc("try_unlocks", {
    p_event_type: "page_visit",
    p_event_key: eventKey,
  });

  if (rpc.error) throw rpc.error;

  return {
    unlockedCount: (rpc.data as any)?.unlocked_count ?? 0,
    randomDrop: (rpc.data as any)?.random_drop ?? false,
  };
}

export async function trackPageClick(eventKey: string) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return { unlockedCount: 0, randomDrop: false };

  const ins = await supabase.from("user_events").insert({
    user_id: user.id,
    event_type: "page_click",
    event_key: eventKey,
  });


  
  if (ins.error) throw ins.error;

  const rpc = await supabase.rpc("try_unlocks", {
    p_event_type: "page_click",
    p_event_key: eventKey,
  });

  if (rpc.error) throw rpc.error;

  return {
    unlockedCount: (rpc.data as any)?.unlocked_count ?? 0,
    randomDrop: (rpc.data as any)?.random_drop ?? false,
  };
}

export async function trackTimeOnPage(eventKey: string) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return { unlockedCount: 0, randomDrop: false };

  const ins = await supabase.from("user_events").insert({
    user_id: user.id,
    event_type: "page_time",
    event_key: eventKey,
  });

  if (ins.error) throw ins.error;

  const rpc = await supabase.rpc("try_unlocks", {
    p_event_type: "page_time",
    p_event_key: eventKey,
  });

  if (rpc.error) throw rpc.error;

  return {
    unlockedCount: (rpc.data as any)?.unlocked_count ?? 0,
    randomDrop: (rpc.data as any)?.random_drop ?? false,
  };
}
