export type EntityType = "leads" | "clients" | "suppliers";

export type ContragentType = "lead" | "client" | "supplier";

export const ENTITY_TO_CONTRAGENT_MAP: Record<EntityType, ContragentType> = {
  leads: "lead",
  clients: "client",
  suppliers: "supplier",
} as const;

export const CONTRAGENT_TO_ENTITY_MAP: Record<ContragentType, EntityType> = {
  lead: "leads",
  client: "clients",
  supplier: "suppliers",
} as const;
