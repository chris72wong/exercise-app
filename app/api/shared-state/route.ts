import { createClient } from "@supabase/supabase-js";
import {
  createDefaultSharedState,
  normalizeSharedState,
  normalizeSharedStatePatch,
  SHARED_STATE_ID,
} from "@/lib/sharedState";

export const dynamic = "force-dynamic";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getStoredState() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      state: createDefaultSharedState(),
      configured: false,
    };
  }

  const { data, error } = await supabase
    .from("app_state")
    .select("value")
    .eq("id", SHARED_STATE_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.value) {
    return {
      state: normalizeSharedState(data.value),
      configured: true,
    };
  }

  const state = createDefaultSharedState();
  const { error: upsertError } = await supabase.from("app_state").upsert({
    id: SHARED_STATE_ID,
    value: state,
    updated_at: new Date().toISOString(),
  });

  if (upsertError) {
    throw upsertError;
  }

  return {
    state,
    configured: true,
  };
}

export async function GET() {
  try {
    const result = await getStoredState();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to load shared state.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return Response.json(
      { error: "Supabase environment variables are not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const patch = normalizeSharedStatePatch(body);
    const { state: currentState } = await getStoredState();
    const nextState = normalizeSharedState({
      ...currentState,
      ...patch,
    });

    const { error } = await supabase.from("app_state").upsert({
      id: SHARED_STATE_ID,
      value: nextState,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    return Response.json({ state: nextState });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to save shared state.",
      },
      { status: 500 }
    );
  }
}
