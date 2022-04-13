import axios from "axios";
import { readFileSync } from "fs";

interface ProviderEntry {
  name: string;
  description: string;
  logoUrl: string;
  directory?: string;
}

/**
 * Ensures that logos in providers.json are valid
 */
export async function validateProviders() {
  const providersPath = "providers.json";
  const providers: ProviderEntry[] = JSON.parse(readFileSync(providersPath, "utf-8"));

  providers.forEach(async (provider) => {
    try {
      await axios.get(provider.logoUrl);
    } catch (e) {
      throw new Error(`Failed to get logo for provider ${provider.name}: ${e}`);
    }
  });
}
