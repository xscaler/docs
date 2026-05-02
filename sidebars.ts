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
      label: 'Portal',
      collapsed: false,
      items: [
        'portal/portal',
        'portal/create-tenant',
        'portal/suspend-tenant',
        'portal/tenant-usage',
        'portal/api-tokens',
        'portal/change-plan',
        'portal/notifications',
        'portal/activity',
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
      label: 'Integrations',
      collapsed: true,
      items: [
        'integrations/integrations',
        {
          type: 'category',
          label: 'Infrastructure',
          collapsed: false,
          items: [
            'integrations/linux',
            'integrations/kubernetes',
            'integrations/docker',
          ],
        },
        {
          type: 'category',
          label: 'Cloud',
          collapsed: false,
          items: [
            'integrations/aws-cloudwatch',
            'integrations/google-cloud',
            'integrations/azure-monitor',
          ],
        },
        {
          type: 'category',
          label: 'Databases',
          collapsed: false,
          items: [
            'integrations/postgresql',
            'integrations/mysql',
            'integrations/redis',
            'integrations/mongodb',
          ],
        },
        {
          type: 'category',
          label: 'Web & Messaging',
          collapsed: false,
          items: [
            'integrations/nginx',
            'integrations/apache',
            'integrations/kafka',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'limits',
        'troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Legal',
      collapsed: false,
      items: [
        'legal',
        'privacy',
        'terms',
        'security',
        'cookies',
      ],
    },
  ],
};

export default sidebars;
