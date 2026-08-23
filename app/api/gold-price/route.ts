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

let cache: { data: CachedPayload; fetchedAt: number } | null = null;

export async function GET(request: Request) {
  const now = Date.now();
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true" || searchParams.get("fresh") === "true";

  if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60" },
    });
  }

  const { providerId, providerMeta, apiKey } = await getActiveProviderConfig();

  if (!apiKey && providerId !== "goldprice") {
    return NextResponse.json(
      {
        error: "Provider key missing",
        message: `API key for ${providerMeta.name} is not set. Go to /admin to configure or set ${providerMeta.envKeyName} in .env.`,
        provider: { id: providerId, name: providerMeta.name },
      },
      { status: 500 }
    );
  }

  try {
    const { pricePerOunce } = await fetchSpotPriceFromProvider(providerId, apiKey);

    if (!Number.isFinite(pricePerOunce) || pricePerOunce <= 0) {
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

    cache = { data: payload, fetchedAt: now };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60" },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Fetch failed",
        message:
          err instanceof Error
            ? err.message
            : `Could not reach ${providerMeta.name}. Check connectivity or API key.`,
        provider: { id: providerId, name: providerMeta.name },
      },
      { status: 503 }
    );
  }
}
