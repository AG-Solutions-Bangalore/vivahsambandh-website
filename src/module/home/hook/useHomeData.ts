import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getClients } from "../api/home.api";
import type { ClientResponse } from "../types";

export const homeQueryKeys = {
  categories: ["categories"] as const,
  clients: ["clients"] as const,
};

export function useClientQuery(
  options?: Omit<UseQueryOptions<ClientResponse>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: homeQueryKeys.clients,
    queryFn: getClients,
    ...options,
  });
}
