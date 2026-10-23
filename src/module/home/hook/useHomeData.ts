import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getCommunity } from "../../registration/api/registration.api";
import type { CommunityItem } from "../../registration/types";
import { getClients } from "../api/home.api";
import type { ClientResponse } from "../types";

export const homeQueryKeys = {
  categories: ["categories"] as const,
  clients: ["clients"] as const,
  communities: ["communities"] as const,
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

/**
 * Live community list for the home page's "Find Matches by Community" cards.
 * The CRM owns the names and ordering; the UI localises known communities.
 */
export function useCommunitiesQuery(
  options?: Omit<UseQueryOptions<CommunityItem[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: homeQueryKeys.communities,
    queryFn: getCommunity,
    ...options,
  });
}
