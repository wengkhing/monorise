export type ProjectionExpressionValues =
  (typeof PROJECTION_EXPRESSION)[keyof typeof PROJECTION_EXPRESSION];

export const PROJECTION_EXPRESSION = {
  NO_DATA:
    'byEntityType, byEntityId, entityType, entityId, mutualId, createdAt, updatedAt',
  MUTUAL_DATA_ONLY:
    'byEntityType, byEntityId, entityType, entityId, mutualId, mutualData, createdAt, updatedAt',
} as const;
