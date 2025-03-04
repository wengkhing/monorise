export enum Entity {}

export interface EntitySchemaMap {
  [key: string]: Record<string, any>;
}

export type DraftEntity<T extends Entity = Entity> =
  T extends keyof EntitySchemaMap ? EntitySchemaMap[T] : never;

export type CreatedEntity<T extends Entity = Entity> = {
  entityId: string;
  entityType: string;
  data: T extends keyof EntitySchemaMap ? EntitySchemaMap[T] : never;
  createdAt: string;
  updatedAt: string;
};

export interface MonoriseConfig {
  configPath: string;
}