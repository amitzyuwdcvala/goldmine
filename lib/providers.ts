export type ProviderId = "goldapi" | "goldprice" | "metals_dev" | "metalprice";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  website: string;
  limits: string;
  description: string;
  envKeyName: string;
  keyPlaceholder: string;
  docsUrl: string;
}

export const PROVIDERS_META: Record<ProviderId, ProviderMeta> = {
  goldapi: {
    id: "goldapi",
    name: "GoldAPI.io",
    website: "https://goldapi.io",
    limits: "~100 requests/month (Free)",
    description: "Real-time gold spot price feed. Fast, reliable standard precious metals API.",
    envKeyName: "GOLDAPI_KEY",
    keyPlaceholder: "goldapi-xxxxxxxx-io",
    docsUrl: "https://goldapi.io",
  },
  goldprice: {
    id: "goldprice",
    name: "goldprice.dev",
    website: "https://goldprice.dev",
    limits: "1,000 requests/month (Free, No Credit Card)",
    description: "Generous 1,000 req/mo free tier for gold spot prices and live bullion market rates.",
    envKeyName: "GOLDPRICE_KEY",
    keyPlaceholder: "Bearer or API token",
    docsUrl: "https://goldprice.dev",
  },
  metals_dev: {
    id: "metals_dev",
    name: "metals.dev",
    website: "https://metals.dev",
    limits: "Free plan available (60s max delay)",
    description: "Real-time and delayed precious metals data API covering gold (XAU) in USD.",
    envKeyName: "METALS_DEV_KEY",
    keyPlaceholder: "metals.dev API key",
    docsUrl: "https://metals.dev",
  },
  metalprice: {
    id: "metalprice",
    name: "MetalpriceAPI.com",
    website: "https://metalpriceapi.com",
    limits: "Free Tier (150+ currencies supported)",
    description: "Live forex & precious metals rates API with global currency conversion support.",
    envKeyName: "METALPRICE_KEY",
    keyPlaceholder: "metalpriceapi API key",
    docsUrl: "https://metalpriceapi.com",
  },
};

export const PROVIDER_ORDER: ProviderId[] = ["goldapi", "goldprice", "metals_dev", "metalprice"];

/**
 * Fetches spot gold price in USD per troy ounce from the specified provider.
 */
export async function fetchSpotPriceFromProvider(
  providerId: ProviderId,
  apiKey: string
): Promise<{ pricePerOunce: number; raw: any }> {
  if (!apiKey && providerId !== "goldprice") {
    throw new Error(`API key for ${PROVIDERS_META[providerId].name} is missing.`);
  }

  switch (providerId) {
    case "goldapi": {
      const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`GoldAPI error (${res.status}): ${txt}`);
      }

      const data = await res.json();
      const price = Number(data.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`GoldAPI returned invalid price format: ${JSON.stringify(data)}`);
      }
      return { pricePerOunce: price, raw: data };
    }

    case "goldprice": {
      // goldprice.dev supports header Authorization or parameter
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
        headers["X-API-Key"] = apiKey;
      }

      const res = await fetch("https://api.goldprice.dev/v1/spot/XAU-USD-SPOT", {
        headers,
        cache: "no-store",
      });

      let data: any;
      if (!res.ok) {
        // Fallback to /v1/prices endpoint
        const fallbackRes = await fetch("https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT", {
          headers,
          cache: "no-store",
        });
        if (!fallbackRes.ok) {
          const txt = await fallbackRes.text();
          throw new Error(`goldprice.dev error (${fallbackRes.status}): ${txt}`);
        }
        data = await fallbackRes.json();
      } else {
        data = await res.json();
      }

      const price = Number(data.price ?? data.data?.price ?? data.spot_price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`goldprice.dev returned invalid price format: ${JSON.stringify(data)}`);
      }
      return { pricePerOunce: price, raw: data };
    }

    case "metals_dev": {
      // metals.dev endpoint
      const url = `https://api.metals.dev/v1/latest?api_key=${encodeURIComponent(apiKey)}&currency=USD&unit=toz`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        // Try alternate metals-api endpoint
        const altUrl = `https://metals-api.com/api/latest?access_key=${encodeURIComponent(apiKey)}&base=USD&symbols=XAU`;
        const altRes = await fetch(altUrl, { cache: "no-store" });
        if (!altRes.ok) {
          const txt = await res.text();
          throw new Error(`metals.dev error (${res.status}): ${txt}`);
        }
        const altData = await altRes.json();
        let price = Number(altData.rates?.USDXAU ?? (altData.rates?.XAU ? 1 / altData.rates.XAU : 0));
        if (price > 0) return { pricePerOunce: price, raw: altData };
      }

      const data = await res.json();
      const rawGold = data.metals?.gold ?? data.rates?.XAU ?? data.price;
      const price = Number(rawGold);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`metals.dev returned invalid price: ${JSON.stringify(data)}`);
      }
      return { pricePerOunce: price, raw: data };
    }

    case "metalprice": {
      const url = `https://api.metalpriceapi.com/v1/latest?api_key=${encodeURIComponent(apiKey)}&base=USD&currencies=XAU`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`MetalpriceAPI error (${res.status}): ${txt}`);
      }

      const data = await res.json();
      if (data.success === false) {
        throw new Error(data.error?.info || `MetalpriceAPI error: ${JSON.stringify(data)}`);
      }

      // Rates can be returned as USDXAU (USD per oz) or XAU (oz per USD)
      const rates = data.rates || {};
      let price = 0;
      if (rates.USDXAU && Number(rates.USDXAU) > 0) {
        price = Number(rates.USDXAU);
      } else if (rates.XAU && Number(rates.XAU) > 0) {
        const val = Number(rates.XAU);
        price = val > 50 ? val : 1 / val; // if XAU is 0.0004 (units/USD) -> 1/0.0004 = 2500 USD/oz
      }

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`MetalpriceAPI returned invalid rate format: ${JSON.stringify(data)}`);
      }
      return { pricePerOunce: price, raw: data };
    }

    default:
      throw new Error(`Unknown gold price provider: ${providerId}`);
  }
}

/**
 * Tests connection to a specific provider and measures latency.
 */
export async function testProviderConnection(
  providerId: ProviderId,
  apiKey: string
): Promise<{ success: boolean; pricePerOunce?: number; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const { pricePerOunce } = await fetchSpotPriceFromProvider(providerId, apiKey);
    const latencyMs = Date.now() - start;
    return { success: true, pricePerOunce, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      latencyMs,
      error: err instanceof Error ? err.message : "Failed to connect to provider.",
    };
  }
}
