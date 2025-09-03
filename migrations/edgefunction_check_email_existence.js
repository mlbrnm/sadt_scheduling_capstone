// Paste this into an edge function in Supabase to do the backend email existence checking stuff.

import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  const debugLog = ["Function invoked."];
  try {
    if (req.method !== "POST") {
      debugLog.push("Request method check failed.");
      return new Response(
        JSON.stringify({
          error: `Only POST requests are allowed, received ${req.method}.`,
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    debugLog.push("Attempting to parse JSON body...");
    const { email } = await req.json();
    debugLog.push(`Successfully parsed email from body: "${email}"`);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
    }
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: rpcData, error: authError } = await supabase.rpc(
      "get_user_by_email",
      {
        user_email: email,
      }
    );
    if (authError) {
      throw new Error(`Auth lookup via RPC failed: ${authError.message}`);
    }
    const authUserData = rpcData && rpcData.length > 0 ? rpcData[0] : null;
    let publicUserData = null;
    const authUserId = authUserData?.id;
    if (authUserId) {
      const { data, error: publicError } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUserId)
        .single();
      if (publicError && publicError.code !== "PGRST116") {
        throw new Error(`Public user lookup failed: ${publicError.message}`);
      }
      publicUserData = data;
    }
    // Determine existence status
    let status = "neither";
    if (authUserData && publicUserData) {
      status = "both";
    } else if (authUserData) {
      status = "auth_only";
    }
    return new Response(
      JSON.stringify({
        email,
        status,
        details: {
          foundInAuth: !!authUserData,
          foundInPublic: !!publicUserData,
        },
        debugLog,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    debugLog.push(`CAUGHT ERROR: ${error.message}`);
    console.error("Error checking email existence:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        debugLog,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
