import type { Entity as EntityType, createEntityConfig } from '@monorise/base';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { setupCommonRoutes } from '../controllers/setupRoutes';
import apiKeyAuth from '../middlewares/api-key-auth';
import generalErrorHandler from '../middlewares/general-error-handler';

type AppHandleArgs = {
  config: {
    EntityConfig: Record<EntityType, ReturnType<typeof createEntityConfig>>;
    AllowedEntityTypes: EntityType[];
    EmailAuthEnabledEntities: EntityType[];
  };
  routes?: Hono;
};

const AppHandle = ({ config, routes }: AppHandleArgs) => {
  const app = new Hono().basePath('/core');

  app.use(secureHeaders());
  app.use(
    cors({
      allowHeaders: ['Content-Type'],
      credentials: true,
      origin: JSON.parse(process.env.ALLOWED_ORIGIN as string) as string[],
    }),
  );
  app.use(apiKeyAuth);

  if (routes) {
    app.route('/app', routes);
  }

  app.route('/', setupCommonRoutes(config));

  app.use(generalErrorHandler());

  return handle(app);
};

export default AppHandle;
