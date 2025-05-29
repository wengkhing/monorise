interface QFunctionArgs extends sst.aws.FunctionArgs {
  visibilityTimeout?: sst.aws.QueueArgs['visibilityTimeout'];
  maximumBatchingWindowInSeconds?: aws.lambda.EventSourceMappingArgs['maximumBatchingWindowInSeconds'];
  batchSize?: number;
  dlqTopic?: sst.aws.SnsTopic;
}

export class QFunction {
  public readonly id: string;
  public readonly queue: sst.aws.Queue;
  private dlq: sst.aws.Queue;
  private function: sst.aws.Function;

  constructor(id: string, args: QFunctionArgs) {
    this.id = id;

    const {
      visibilityTimeout,
      maximumBatchingWindowInSeconds,
      batchSize,
      dlqTopic,
      ...functionArgs
    } = args;

    this.function = new sst.aws.Function(`${id}-processor`, {
      ...functionArgs,
    });

    this.dlq = new sst.aws.Queue(`${id}-queue-dlq`);

    this.queue = new sst.aws.Queue(`${id}-queue`, {
      visibilityTimeout,
      dlq: this.dlq.arn,
    });

    this.queue.subscribe(`${id}-processor`, {
      transform: {
        eventSourceMapping: {
          bisectBatchOnFunctionError: true,
          maximumBatchingWindowInSeconds,
          batchSize,
        },
      },
    });

    if (dlqTopic) {
      const dlqMessageAlarm = new aws.cloudwatch.MetricAlarm(
        `${id}-dlq-message-alarm`,
        {
          name: `${$app.stage}-${$app.name}-${id}-dlq-alarm`,
          comparisonOperator: 'GreaterThanOrEqualToThreshold',
          evaluationPeriods: 1,
          metricName: 'ApproximateNumberOfMessagesVisible',
          namespace: 'AWS/SQS',
          period: 60,
          statistic: 'Sum',
          threshold: 1,
          dimensions: {
            QueueName: this.dlq.nodes.queue.name,
          },
          alarmDescription:
            'Alarm when there is at least one message in the DLQ.',
          // Actions to take when the alarm changes to ALARM state.
          alarmActions: [dlqTopic.arn],
          // Actions to take when the alarm changes to OK state.
          // okActions: [alarmSnsTopic.arn],
        },
      );
    }
  }
}
