/**
 * @file src/module/super-admin/hook/useClients.ts
 * React Query hooks for Client management: client list,
 * single-record inspection, creation, update, status update, and deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  updateClient,
  updateClientStatus,
} from '../services/clientApi'
import { toListMeta } from '../services/mappers'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import { EMPTY_LIST_META } from './useServerList'
import type {
  ClientListParams,
  ClientPayload,
  ClientStatus,
  ListMeta,
} from '../types'

/**
 * The client list. `/client` pages its rows and filters them on
 * the server, so search terms and page numbers travel with the request.
 */
export function useClientsQuery(params: ClientListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.clients, params],
    queryFn: async () => {
      const result = await fetchClients(params)
      if (result.error) throw new Error(result.error)
      return {
        records: result.data,
        meta: toListMeta(result.raw, {
          page: params.page,
          per_page: params.per_page,
          rowCount: result.data.length,
        }),
      }
    },
    staleTime: PANEL_STALE_TIME,
    placeholderData: (previous) => previous,
  })

  const records = query.data?.records ?? []
  const meta: ListMeta = query.data?.meta ?? EMPTY_LIST_META

  return { ...query, records, meta }
}

/**
 * Single Client record inspection.
 */
export function useClientQuery(id: number | string | null | undefined) {
  return useQuery({
    queryKey: superAdminKeys.client(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchClientById(id as number | string)),
    enabled: id !== null && id !== undefined && id !== '',
    staleTime: PANEL_STALE_TIME,
  })
}

/** Alias for useClientQuery (find client by ID) */
export const useFindClientByIdQuery = useClientQuery

interface CreateClientVariables {
  payload: ClientPayload | FormData
  successMessage?: string
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateClientVariables) =>
      unwrapAction(await createClient(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.clients })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateClientVariables {
  id: number | string
  payload: ClientPayload | FormData
  successMessage?: string
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateClientVariables) =>
      unwrapAction(await updateClient(id, payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.clients }),
        queryClient.invalidateQueries({
          queryKey: superAdminKeys.client(variables.id),
        }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateClientStatusVariables {
  id: number | string
  clients_status: ClientStatus | string
  successMessage?: string
}

export function useUpdateClientStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, clients_status }: UpdateClientStatusVariables) =>
      unwrapAction(await updateClientStatus(id, clients_status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.clients }),
        queryClient.invalidateQueries({
          queryKey: superAdminKeys.client(variables.id),
        }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteClientVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteClientVariables) =>
      unwrapAction(await deleteClient(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.clients })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
