import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the request body
    const { first_name, last_name, email, role } = await request.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["Admin", "AC"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'Admin' or 'AC'" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Create user in auth.users table
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          first_name: first_name,
          last_name: last_name,
          role: role,
        },
      });

    if (authError) {
      console.error("Auth user creation failed:", authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      );
    }

    // Step 2: Create user record in public.users table
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: authUser.user.id,
      email: email,
      first_name: first_name,
      last_name: last_name,
      role: role,
      has_logged_in: false,
    });

    if (userError) {
      console.error("Public user creation failed:", userError);

      // Try to clean up the auth user if public user creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }

      return NextResponse.json(
        { error: `Failed to create user record: ${userError.message}` },
        { status: 400 }
      );
    }

    // Step 3: Send password setup email
    const { error: emailError } =
      await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        }/update-password`,
      });

    if (emailError) {
      console.error("Failed to send password setup email:", emailError);
      // Don't fail the entire operation if email sending fails
      return NextResponse.json({
        success: true,
        message: `User created successfully! However, there was an issue sending the password setup email. Please manually send a password reset email to ${email}.`,
        user: {
          id: authUser.user.id,
          email: email,
          first_name: first_name,
          last_name: last_name,
          role: role,
        },
      });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `User created successfully! A password setup email has been sent to ${email}.`,
      user: {
        id: authUser.user.id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: role,
      },
    });
  } catch (error) {
    console.error("Unexpected error in create-user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
