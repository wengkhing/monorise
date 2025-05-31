import { SingleTable } from './single-table';
import { EVENT, SOURCE } from '../constants/event';
import { QFunction } from './q-function';

type MonoriseCoreArgs = {
  tableTtl?: string;
  slackWebhook?: string;
  allowHeaders?: string[];
  allowOrigins?: string[];
};

export class MonoriseCore {
  public readonly id: string;
  public readonly api: sst.aws.ApiGatewayV2;
  public readonly bus: sst.aws.Bus;
  public readonly table: SingleTable;
  public readonly dlqTopic: sst.aws.SnsTopic;

  constructor(id: string, args?: MonoriseCoreArgs) {
    const runtime: sst.aws.FunctionArgs['runtime'] = 'nodejs22.x';

    this.id = id;

    this.api = new sst.aws.ApiGatewayV2(`${id}-monorise-api`, {
      cors: {
        allowMethods: ['*'],
        allowCredentials: true,
        allowHeaders: [
          ...(args?.allowHeaders ? args.allowHeaders : []),
          'Content-Type',
          'Authorization',
        ],
        allowOrigins: args?.allowOrigins,
      },
    });

    this.bus = new sst.aws.Bus(`${id}-monorise-bus`);
    this.table = new SingleTable(id, {
      ttl: args?.tableTtl,
      runtime,
    });

    const secretApiKeys = new sst.Secret('API_KEYS', '["secret1", "secret2"]');

    this.api.route('ANY /core/{proxy+}', {
      handler: '.monorise/app.handler',
      link: [this.table, this.bus, secretApiKeys],
      environment: {
        API_KEYS: secretApiKeys.value,
      },
    });

    this.dlqTopic = new sst.aws.SnsTopic(`${id}-monorise-dlq-alarm-topic`);
    this.dlqTopic.subscribe('send-cloudwatch-alarm', {
      name: `${$app.stage}-${id}-monorise-send-cloudwatch-alarm`,
      handler:
        'node_modules/monorise/sst/function/send-cloudwatch-alarm.handler',
      memory: '512 MB',
      runtime,
      environment: args?.slackWebhook
        ? { SLACK_MONITOR_WEBHOOK: args.slackWebhook }
        : undefined,
    });

    this.bus.subscribe(
      'send-error-message',
      {
        name: `${$app.stage}-${id}-monorise-send-error-message`,
        handler:
          'node_modules/monorise/sst/function/send-error-message.handler',
        memory: '512 MB',
        runtime,
        environment: args?.slackWebhook
          ? { SLACK_MONITOR_WEBHOOK: args.slackWebhook }
          : undefined,
      },
      {
        pattern: {
          source: [EVENT.GENERAL.ENDPOINT_ERROR.Source],
          detailType: [EVENT.GENERAL.ENDPOINT_ERROR.DetailType],
        },
      },
    );

    const environment = {
      CORE_TABLE: this.table.table.name,
      CORE_EVENT_BUS: this.bus.name,
    };

    /**
     * Event Processors
     */
    const mutualProcessor = new QFunction('mutual', {
      name: `${$app.stage}-${$app.name}-${id}-monorise-mutual-processor`,
      handler: '.monorise/processors.mutualHandler',
      memory: '512 MB',
      timeout: '30 seconds',
      visibilityTimeout: '30 seconds',
      dlqTopic: this.dlqTopic,
      runtime,
      environment,
    });

    const tagProcessor = new QFunction('tag', {
      name: `${$app.stage}-${$app.name}-${id}-monorise-tag-processor`,
      handler: '.monorise/processors.tagHandler',
      memory: '512 MB',
      timeout: '30 seconds',
      visibilityTimeout: '30 seconds',
      dlqTopic: this.dlqTopic,
      runtime,
      environment,
    });

    const treeProcessor = new QFunction('tree', {
      name: `${$app.stage}-${$app.name}-${id}-monorise-tree-processor`,
      handler: '.monorise/processors.treeHandler',
      memory: '512 MB',
      timeout: '30 seconds',
      visibilityTimeout: '30 seconds',
      dlqTopic: this.dlqTopic,
      runtime,
      environment,
    });

    this.bus.subscribeQueue(`${id}-mutual-queue-rule`, mutualProcessor.queue, {
      pattern: {
        source: [SOURCE.CORE],
        detailType: [
          EVENT.CORE.ENTITY_MUTUAL_TO_CREATE.DetailType,
          EVENT.CORE.ENTITY_MUTUAL_TO_UPDATE.DetailType,
        ],
      },
    });

    this.bus.subscribeQueue(`${id}-tag-queue-rule`, tagProcessor.queue, {
      pattern: {
        source: [SOURCE.CORE],
        detailType: [
          EVENT.CORE.ENTITY_CREATED.DetailType,
          EVENT.CORE.ENTITY_UPDATED.DetailType,
        ],
      },
    });

    this.bus.subscribeQueue(`${id}-tree-queue-rule`, treeProcessor.queue, {
      pattern: {
        source: [SOURCE.CORE],
        detailType: [
          EVENT.CORE.ENTITY_MUTUAL_PROCESSED.DetailType,
          EVENT.CORE.PREJOIN_RELATIONSHIP_SYNC.DetailType,
        ],
      },
    });

    new sst.x.DevCommand('Monorise', {
      dev: {
        autostart: true,
        command: 'npx monorise dev:watch',
      },
    });
  }
}
