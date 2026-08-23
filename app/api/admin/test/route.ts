import { NextResponse } from "next/server";
import { PROVIDER_ORDER, type ProviderId, testProviderConnection } from "@/lib/providers";
import { getAllProviderConfigs } from "@/lib/providerStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, apiKey: customKey } = body;

    if (!providerId || !PROVIDER_ORDER.includes(providerId)) {
      return NextResponse.json(
        { error: "Invalid provider specified" },
        { status: 400 }
      );
    }

    let effectiveKey = typeof customKey === "string" ? customKey.trim() : "";
    
    if (!effectiveKey) {
      // Lookup stored/env key
      const { configs } = await getAllProviderConfigs(true);
      effectiveKey = (configs[providerId as ProviderId]?.api_key || "").trim();
    }

    const testResult = await testProviderConnection(providerId as ProviderId, effectiveKey);

    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        latencyMs: 0,
        error: err instanceof Error ? err.message : "Test connection failed.",
      },
      { status: 500 }
    );
  }
}
