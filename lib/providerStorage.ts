import { supabaseAdmin } from "@/lib/supabaseClient";
import {
  type ProviderId,
  PROVIDER_ORDER,
  PROVIDERS_META,
} from "@/lib/providers";

export interface StoredProviderConfig {
  id: ProviderId;
  name: string;
  api_key: string;
  is_active: boolean;
  updated_at?: string;
}

// Runtime in-memory store so changes work immediately even before DB table creation
let runtimeStore: {
  configs: Record<ProviderId, StoredProviderConfig>;
  activeProviderId: ProviderId;
} | null = null;

/**
 * Returns default configuration seeded from .env environment variables.
 */
export function getEnvFallbackConfigs(): {
  configs: Record<ProviderId, StoredProviderConfig>;
  activeProviderId: ProviderId;
} {
  const activeEnv = (process.env.ACTIVE_PROVIDER as ProviderId) || "goldapi";
  const activeProviderId = PROVIDER_ORDER.includes(activeEnv) ? activeEnv : "goldapi";

  const configs: Record<ProviderId, StoredProviderConfig> = {
    goldapi: {
      id: "goldapi",
      name: PROVIDERS_META.goldapi.name,
      api_key: process.env.GOLDAPI_KEY || "",
      is_active: activeProviderId === "goldapi",
    },
    goldprice: {
      id: "goldprice",
      name: PROVIDERS_META.goldprice.name,
      api_key: process.env.GOLDPRICE_KEY || "",
      is_active: activeProviderId === "goldprice",
    },
    metals_dev: {
      id: "metals_dev",
      name: PROVIDERS_META.metals_dev.name,
      api_key: process.env.METALS_DEV_KEY || "",
      is_active: activeProviderId === "metals_dev",
    },
    metalprice: {
      id: "metalprice",
      name: PROVIDERS_META.metalprice.name,
      api_key: process.env.METALPRICE_KEY || "",
      is_active: activeProviderId === "metalprice",
    },
  };

  return { configs, activeProviderId };
}

/**
 * Fetches all provider configs from Supabase, with seamless fallback to runtime/env store.
 */
export async function getAllProviderConfigs(forceFresh = false): Promise<{
  configs: Record<ProviderId, StoredProviderConfig>;
  activeProviderId: ProviderId;
  fromDb: boolean;
}> {
  if (!runtimeStore) {
    runtimeStore = getEnvFallbackConfigs();
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("provider_config")
      .select("*");

    if (error || !data || data.length === 0) {
      return {
        configs: runtimeStore.configs,
        activeProviderId: runtimeStore.activeProviderId,
        fromDb: false,
      };
    }

    const configs = { ...runtimeStore.configs };
    let activeId = runtimeStore.activeProviderId;

    for (const row of data) {
      const pid = row.id as ProviderId;
      if (PROVIDER_ORDER.includes(pid)) {
        configs[pid] = {
          id: pid,
          name: row.name || PROVIDERS_META[pid].name,
          api_key: row.api_key || runtimeStore.configs[pid]?.api_key || "",
          is_active: Boolean(row.is_active),
          updated_at: row.updated_at,
        };
        if (row.is_active) {
          activeId = pid;
        }
      }
    }

    runtimeStore = { configs, activeProviderId: activeId };

    return { configs, activeProviderId: activeId, fromDb: true };
  } catch {
    return {
      configs: runtimeStore.configs,
      activeProviderId: runtimeStore.activeProviderId,
      fromDb: false,
    };
  }
}

/**
 * Gets the currently active provider and its effective API key.
 */
export async function getActiveProviderConfig(): Promise<{
  providerId: ProviderId;
  providerMeta: typeof PROVIDERS_META[ProviderId];
  apiKey: string;
}> {
  const { configs, activeProviderId } = await getAllProviderConfigs();
  const config = configs[activeProviderId];
  const apiKey = config?.api_key || process.env[PROVIDERS_META[activeProviderId].envKeyName] || "";

  return {
    providerId: activeProviderId,
    providerMeta: PROVIDERS_META[activeProviderId],
    apiKey,
  };
}

/**
 * Updates a provider's active state or API key in Supabase (and local runtime store).
 */
export async function updateProviderConfig(
  providerId: ProviderId,
  updates: { api_key?: string; is_active?: boolean }
): Promise<{ success: boolean; fromDb: boolean; error?: string }> {
  if (!runtimeStore) {
    runtimeStore = getEnvFallbackConfigs();
  }

  const now = new Date().toISOString();

  // 1. Immediately update runtime in-memory store so it takes effect instantly
  if (updates.is_active) {
    for (const pid of PROVIDER_ORDER) {
      runtimeStore.configs[pid].is_active = pid === providerId;
    }
    runtimeStore.activeProviderId = providerId;
  }

  if (updates.api_key !== undefined) {
    runtimeStore.configs[providerId].api_key = updates.api_key;
    runtimeStore.configs[providerId].updated_at = now;
  }

  // 2. Persist to Supabase if table exists
  try {
    let dbSuccess = true;

    if (updates.is_active) {
      for (const pid of PROVIDER_ORDER) {
        const { error } = await supabaseAdmin
          .from("provider_config")
          .upsert(
            {
              id: pid,
              name: PROVIDERS_META[pid].name,
              is_active: pid === providerId,
              updated_at: now,
            },
            { onConflict: "id" }
          );
        if (error) dbSuccess = false;
      }
    }

    if (updates.api_key !== undefined) {
      const { error } = await supabaseAdmin
        .from("provider_config")
        .upsert(
          {
            id: providerId,
            name: PROVIDERS_META[providerId].name,
            api_key: updates.api_key,
            ...(updates.is_active !== undefined ? { is_active: updates.is_active } : {}),
            updated_at: now,
          },
          { onConflict: "id" }
        );
      if (error) dbSuccess = false;
    }

    return { success: true, fromDb: dbSuccess };
  } catch {
    // Runtime store is still updated successfully
    return { success: true, fromDb: false };
  }
}
