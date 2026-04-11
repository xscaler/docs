import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'intro',
        'getting-started',
        'authentication',
        'regions',
      ],
    },
    {
      type: 'category',
      label: 'Sending Metrics',
      collapsed: false,
      items: [
        'ingest/prometheus-remote-write',
        'ingest/grafana-alloy',
        'ingest/opentelemetry-collector',
        'ingest/otel-sdk-python',
        'ingest/otel-sdk-nodejs',
        'ingest/otel-sdk-go',
      ],
    },
    {
      type: 'category',
      label: 'Querying',
      collapsed: false,
      items: [
        'query/overview',
        'query/instant-query',
        'query/range-query',
        'query/label-exploration',
      ],
    },
    'grafana',
    'rules-and-alerts',
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'limits',
        'troubleshooting',
      ],
    },
  ],
};

export default sidebars;
