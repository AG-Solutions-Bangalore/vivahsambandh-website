import { apiFetch } from "@/lib/api/apiClient";
import type { ClientResponse } from "../types";
/**
 * Fetches lending partners / client logos.
 */
export async function getClients(): Promise<ClientResponse> {
  return apiFetch<ClientResponse>("/getClient");
}
