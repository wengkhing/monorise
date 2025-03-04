import type { CreatedEntity, Entity, Mutual } from '@monorise/base';
import { enableMapSet } from 'immer';
import type React from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getEntityConfig } from '../lib/config';
import type { ApplicationRequestError, ModalProps } from '../types/api.type';
import type { CommonStore } from '../types/monorise.type';

enableMapSet();

const configureDevtools = (storeName: string) => ({
  name: `${storeName} Store`,
  anonymousActionType: `${storeName.toLowerCase()}/action`,
  enabled: !['prod', 'dev'].includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? ''),
  serialize: {
    options: {
      map: true,
    },
  },
});

type Options = {
  modals?: Record<string, React.ComponentType<unknown>>;
};

const initMonoriseStore = async () => {
  let options: Options = {};
  const { modals = {} } = options;

  const entityMaps = (Object.keys(await getEntityConfig()) as string[]).reduce(
    (acc, entity) => {
      acc[entity as any] = {
        dataMap: new Map<string, CreatedEntity<Entity>>(),
        isFirstFetched: false,
        lastKey: '',
      } as CommonStore<CreatedEntity<Entity>>;
      return acc;
    },
    {} as Record<Entity, CommonStore<CreatedEntity<Entity>>>,
  );

  type AppModalProps = ModalProps<typeof modals>;

  const monoriseStore = create(
    devtools(
      (): {
        app: {
          ongoingRequests: Map<string, Promise<unknown>>;
          loadStack: Map<string, number>;
          intLoadStack: Map<string, number>;
          loadingMessage: string;
          errorStack: Map<string, ApplicationRequestError>;
          modal: {
            name: keyof AppModalProps | null;
            context?: AppModalProps[keyof AppModalProps];
          };
        };
        entity: Record<Entity, CommonStore<CreatedEntity<Entity>>>;
        mutual: Record<string, CommonStore<Mutual>>;
        tag: Record<string, CommonStore<CreatedEntity<Entity>>>;
        auth: {
          isUnauthorized: boolean;
          profile: {
            displayName: string;
            email: string;
            accountId: string;
          };
        };
      } => ({
        app: {
          ongoingRequests: new Map(),
          loadStack: new Map(),
          intLoadStack: new Map(),
          loadingMessage: '',
          errorStack: new Map(),
          modal: {
            name: null,
          },
        },
        entity: entityMaps,
        mutual: {},
        tag: {},
        auth: {
          isUnauthorized: false,
          profile: {
            displayName: '',
            email: '',
            accountId: '',
          },
        },
      }),
      configureDevtools('monorise'),
    ),
  );

  const setOptions = (opts: Options) => {
    options = {
      ...options,
      ...opts,
    };
  };

  return { setOptions, monoriseStore };
};

export { initMonoriseStore };

export type MonoriseStore = Awaited<
  ReturnType<typeof initMonoriseStore>
>['monoriseStore'];
