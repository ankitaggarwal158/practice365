export * from "./types/client.types";
export * from "./api/client.api";
export * from "./hooks/useClients";
export * from "./hooks/useClient";
export * from "./hooks/useCreateClient";
export * from "./hooks/useUpdateClient";
export * from "./hooks/useMergeClients";
export * from "./hooks/useDuplicateCheck";

export { default as ClientListPage } from "./pages/ClientListPage";
export { default as CreateClientPage } from "./pages/CreateClientPage";
export { default as ClientDetailsPage } from "./pages/ClientDetailsPage";
export { default as EditClientPage } from "./pages/EditClientPage";
