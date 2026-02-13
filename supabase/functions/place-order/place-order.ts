import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PlaceOrderBody = {
  variant_id?: number | string;
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const stringifyError = (error: unknown) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || "");
  }
  return String(error);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "SERVER_CONFIG_ERROR" }, 500);
  }

  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "UNAUTHORIZED", message: "Missing bearer token." }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user?.email) {
      return jsonResponse({ error: "UNAUTHORIZED", message: "Invalid session token." }, 401);
    }

    const email = userData.user.email.toLowerCase();
    const { data: allowlisted, error: whitelistError } = await admin
      .from("allowed_emails")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (whitelistError) {
      throw whitelistError;
    }
    if (!allowlisted) {
      return jsonResponse({ error: "FORBIDDEN", message: "Email is not allowlisted." }, 403);
    }

    let body: PlaceOrderBody;
    try {
      body = (await request.json()) as PlaceOrderBody;
    } catch (_parseError) {
      return jsonResponse({ error: "BAD_REQUEST", message: "Invalid JSON body." }, 400);
    }

    const variantId = Number(body.variant_id);
    if (!Number.isFinite(variantId) || variantId <= 0) {
      return jsonResponse({ error: "BAD_REQUEST", message: "variant_id must be a positive number." }, 400);
    }

    const { data: orderResult, error: rpcError } = await admin.rpc("place_order_secure", {
      p_variant_id: variantId,
      p_requester_email: email,
    });

    if (rpcError) {
      const message = (rpcError.message || "").toUpperCase();

      if (message.includes("INSUFFICIENT_BALANCE")) {
        return jsonResponse({ error: "INSUFFICIENT_BALANCE" }, 409);
      }
      if (message.includes("VARIANT_NOT_FOUND")) {
        return jsonResponse({ error: "VARIANT_NOT_FOUND" }, 404);
      }
      if (message.includes("FORBIDDEN")) {
        return jsonResponse({ error: "FORBIDDEN" }, 403);
      }
      if (message.includes("UNAUTHORIZED")) {
        return jsonResponse({ error: "UNAUTHORIZED" }, 401);
      }

      const raw = `${rpcError.code || ""} ${rpcError.message || ""} ${rpcError.details || ""} ${rpcError.hint || ""}`.toUpperCase();
      if (raw.includes("PLACE_ORDER_SECURE") && (raw.includes("DOES NOT EXIST") || raw.includes("SCHEMA CACHE"))) {
        return jsonResponse(
          {
            error: "FUNCTION_NOT_FOUND",
            message: "Database function place_order_secure is missing or not exposed.",
            details: rpcError.message,
          },
          500
        );
      }
      if (raw.includes("PERMISSION") || raw.includes("42501")) {
        return jsonResponse(
          {
            error: "DB_PERMISSION_ERROR",
            message: "Database permission error while placing order.",
            details: rpcError.message,
          },
          500
        );
      }
      if (raw.includes("COLUMN") && raw.includes("DOES NOT EXIST")) {
        return jsonResponse(
          {
            error: "DB_SCHEMA_ERROR",
            message: "Database schema mismatch for order placement.",
            details: rpcError.message,
          },
          500
        );
      }

      return jsonResponse(
        {
          error: "RPC_ERROR",
          message: "Database RPC failed.",
          details: rpcError.message,
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      order: orderResult,
    });
  } catch (error) {
    console.error("place-order function error:", error);
    return jsonResponse(
      {
        error: "INTERNAL_ERROR",
        message: "Unable to place order.",
        details: stringifyError(error),
      },
      500
    );
  }
});
