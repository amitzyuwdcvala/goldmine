import { NextResponse } from "next/server";
import { TROY_OUNCE_IN_GRAMS } from "@/lib/calculateGoldRate";
import { fetchSpotPriceFromProvider } from "@/lib/providers";
import { getActiveProviderConfig } from "@/lib/providerStorage";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;

type CachedPayload = {
  pricePerOunce: number;
  pricePerGram: number;
  timestamp: string;
  provider: {
    id: string;
    name: string;
  };
};

// Store cache mapped by providerId so changing provider immediately invalidates previous provider's cache
let cacheByProvider: Record<string, { data: CachedPayload; fetchedAt: number }> = {};

export async function GET(request: Request) {
  const now = Date.now();
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true" || searchParams.get("fresh") === "true";

  // 1. Always get the latest active provider first
  const { providerId, providerMeta, apiKey } = await getActiveProviderConfig();

  // 2. Check cache for this specific active provider
  const providerCache = cacheByProvider[providerId];
  if (!force && providerCache && now - providerCache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(providerCache.data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // 3. Check if key is required
  if (!apiKey && providerId !== "goldprice") {
    delete cacheByProvider[providerId];
    return NextResponse.json(
      {
        error: "Provider key missing",
        message: `API key for ${providerMeta.name} is not configured. Go to /admin to configure or set ${providerMeta.envKeyName}.`,
        provider: { id: providerId, name: providerMeta.name },
      },
      { status: 500 }
    );
  }

  // 4. Fetch live price
  try {
    const { pricePerOunce } = await fetchSpotPriceFromProvider(providerId, apiKey);

    if (!Number.isFinite(pricePerOunce) || pricePerOunce <= 0) {
      delete cacheByProvider[providerId];
      return NextResponse.json(
        {
          error: "Invalid upstream data",
          message: `${providerMeta.name} did not return a valid spot price.`,
          provider: { id: providerId, name: providerMeta.name },
        },
        { status: 502 }
      );
    }

    const payload: CachedPayload = {
      pricePerOunce,
      pricePerGram: pricePerOunce / TROY_OUNCE_IN_GRAMS,
      timestamp: new Date().toISOString(),
      provider: {
        id: providerId,
        name: providerMeta.name,
      },
    };

    cacheByProvider[providerId] = { data: payload, fetchedAt: now };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    // Purge cached data on failure so errors are never masked by stale cache
    delete cacheByProvider[providerId];

    return NextResponse.json(
      {
        error: "Fetch failed",
        message:
          err instanceof Error
            ? err.message
            : `Could not reach ${providerMeta.name}. Check connectivity or API quota.`,
        provider: { id: providerId, name: providerMeta.name },
      },
      { status: 503 }
    );
  }
}
