import { NextResponse } from "next/server";
import { PROVIDER_ORDER, PROVIDERS_META, type ProviderId } from "@/lib/providers";
import { getAllProviderConfigs, updateProviderConfig } from "@/lib/providerStorage";

export const dynamic = "force-dynamic";

function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export async function GET() {
  try {
    const { configs, activeProviderId, fromDb } = await getAllProviderConfigs(true);

    const providers = PROVIDER_ORDER.map((id) => {
      const meta = PROVIDERS_META[id];
      const cfg = configs[id];
      const rawKey = cfg?.api_key || "";

      return {
        id,
        name: meta.name,
        website: meta.website,
        limits: meta.limits,
        description: meta.description,
        keyPlaceholder: meta.keyPlaceholder,
        envKeyName: meta.envKeyName,
        docsUrl: meta.docsUrl,
        isActive: id === activeProviderId,
        hasKey: rawKey.trim().length > 0,
        maskedKey: maskApiKey(rawKey),
        rawKey: rawKey, // Sent to authenticated admin UI for editing
        updatedAt: cfg?.updated_at,
      };
    });

    return NextResponse.json({
      providers,
      activeProviderId,
      fromDb,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load provider configs", message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { providerId, is_active, api_key } = body;

    if (!providerId || !PROVIDER_ORDER.includes(providerId)) {
      return NextResponse.json(
        { error: "Invalid providerId specified" },
        { status: 400 }
      );
    }

    const res = await updateProviderConfig(providerId as ProviderId, {
      is_active: typeof is_active === "boolean" ? is_active : undefined,
      api_key: typeof api_key === "string" ? api_key.trim() : undefined,
    });

    if (!res.success) {
      return NextResponse.json(
        { error: "Update failed", message: res.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update provider", message: err.message },
      { status: 500 }
    );
  }
}
