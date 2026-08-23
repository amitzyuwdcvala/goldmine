import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const DEFAULT_ADMIN_EMAIL = "admin@aurumdesk.com";
const DEFAULT_ADMIN_PASSWORD = "admin";

export async function POST() {
  try {
    // 1. List existing users
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json(
        { error: "Failed to list Supabase users", message: listError.message },
        { status: 500 }
      );
    }

    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
    );

    if (existingUser) {
      // Update existing user with default password and confirm email
      const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: DEFAULT_ADMIN_PASSWORD,
          email_confirm: true,
        }
      );

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to reset admin password", message: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Admin credentials updated successfully!`,
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      });
    }

    // 2. Create new default admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json(
        { error: "Failed to create default admin user", message: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Default admin account created in Supabase!`,
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Setup failed", message: err.message },
      { status: 500 }
    );
  }
}
