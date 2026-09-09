import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import apiSidebar from './docs/api/sidebar';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    // ── Get started ──────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      items: [
        'intro',
        'getting-started',
        'authentication',
        'regions',
      ],
    },

    // ── Send & query data ────────────────────────────────────────────────────
    // One section per signal. Each signal leads with the xScaler agent, then
    // the raw query API, then where you read the data back.
    {
      type: 'category',
      label: 'Send & query data',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Metrics',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Send',
              collapsed: false,
              items: [
                'ingest/opentelemetry-collector',
                'ingest/prometheus-remote-write',
                'ingest/grafana-alloy',
                'ingest/otel-sdk-python',
                'ingest/otel-sdk-nodejs',
                'ingest/otel-sdk-go',
              ],
            },
            {
              type: 'category',
              label: 'Query API',
              collapsed: true,
              items: [
                'query/overview',
                'query/instant-query',
                'query/range-query',
                'query/label-exploration',
              ],
            },
            'grafana-metrics',
          ],
        },
        {
          type: 'category',
          label: 'Logs',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Send',
              collapsed: false,
              items: [
                'logs/opentelemetry-collector',
                'logs/grafana-alloy',
                'logs/otel-sdk-python',
                'logs/otel-sdk-nodejs',
                'logs/otel-sdk-go',
              ],
            },
            {
              type: 'category',
              label: 'Query API',
              collapsed: true,
              items: [
                'log-query/overview',
                'log-query/instant-query',
                'log-query/range-query',
                'log-query/label-exploration',
              ],
            },
            'grafana-logs',
          ],
        },
        {
          type: 'category',
          label: 'Traces',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Send',
              collapsed: false,
              items: [
                'traces/opentelemetry-collector',
                'traces/grafana-alloy',
                'traces/otel-sdk-python',
                'traces/otel-sdk-nodejs',
                'traces/otel-sdk-go',
              ],
            },
            {
              type: 'category',
              label: 'Query API',
              collapsed: true,
              items: [
                'trace-query/overview',
                'trace-query/search',
              ],
            },
            'grafana-traces',
          ],
        },
      ],
    },

    // ── OpenTelemetry agent ──────────────────────────────────────────────────
    {
      type: 'category',
      label: 'OpenTelemetry agent',
      collapsed: false,
      link: { type: 'doc', id: 'fleet-management/fleet-management' },
      items: [
        'fleet-management/enroll-agents',
        'fleet-management/configure-agents',
        'fleet-management/secrets',
        'fleet-management/ebpf-instrumentation',
        'fleet-management/traces-auto-instrumentation',
        'fleet-management/fleet-troubleshooting',
      ],
    },

    // ── Insights ─────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Insights',
      collapsed: false,
      link: { type: 'doc', id: 'insights/insights' },
      items: [
        'insights/metrics',
        'insights/logs',
        'insights/traces',
        'insights/explorer',
        'insights/dashboards',
        'insights/snapshots',
        'insights/alerting',
      ],
    },

    // ── xScaler & AI tools ───────────────────────────────────────────────────
    {
      type: 'category',
      label: 'xScaler & AI tools',
      collapsed: true,
      link: { type: 'doc', id: 'ai/ai' },
      items: [
        'ai/ai-connect',
        'ai/ai-capabilities',
        'ai/ai-tools',
        {
          type: 'category',
          label: 'Use cases',
          collapsed: true,
          link: { type: 'doc', id: 'ai/use-cases/ai-use-cases' },
          items: [
            'ai/use-cases/ai-uc-trace-id',
            'ai/use-cases/ai-uc-latency',
            'ai/use-cases/ai-uc-when-it-started',
            'ai/use-cases/ai-uc-after-a-deploy',
            'ai/use-cases/ai-uc-dashboard',
            'ai/use-cases/ai-uc-alert-rule',
            'ai/use-cases/ai-uc-who-gets-told',
          ],
        },
        'ai/ai-answers',
        'ai/ai-manage',
        'ai/ai-limits',
        'ai/ai-security',
        'ai/ai-troubleshooting',
        'ai/ai-protocol',
      ],
    },

    // ── AI observability ─────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'AI observability',
      collapsed: true,
      link: { type: 'doc', id: 'ai-observability/ai-observability' },
      items: [
        'ai-observability/instrument',
        'ai-observability/metrics',
        'ai-observability/traces',
        'ai-observability/cost',
      ],
    },

    // ── Platform ─────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Platform',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Portal',
          collapsed: true,
          link: { type: 'doc', id: 'portal/portal' },
          items: [
            'portal/create-tenant',
            'portal/suspend-tenant',
            'portal/tenant-usage',
            'portal/api-tokens',
            'portal/change-plan',
            'portal/notifications',
            'portal/activity',
          ],
        },
        'platform/managed-grafana',
        'grafana-datasources',
        'rules-and-alerts',
      ],
    },

    // ── Reference ────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Integrations catalogue',
          collapsed: true,
          link: { type: 'doc', id: 'integrations/integrations' },
          items: [
            {
              type: 'category',
              label: 'Infrastructure',
              collapsed: true,
              items: [
                'integrations/linux',
                'integrations/kubernetes',
                'integrations/docker',
                'integrations/windows',
                'integrations/macos',
                'integrations/raspberry-pi',
                'integrations/vmware-vsphere',
              ],
            },
            {
              type: 'category',
              label: 'Cloud',
              collapsed: true,
              items: [
                'integrations/aws-cloudwatch',
                'integrations/google-cloud',
                'integrations/azure-monitor',
                'integrations/cloudflare',
                'integrations/openstack',
                'integrations/minio',
                'integrations/confluent-cloud',
              ],
            },
            {
              type: 'category',
              label: 'Databases',
              collapsed: true,
              items: [
                'integrations/postgresql',
                'integrations/mysql',
                'integrations/redis',
                'integrations/mongodb',
                'integrations/elasticsearch',
                'integrations/opensearch',
                'integrations/clickhouse',
                'integrations/cockroachdb',
                'integrations/mssql',
                'integrations/oracle',
                'integrations/cassandra',
                'integrations/couchbase',
                'integrations/couchdb',
                'integrations/aerospike',
                'integrations/hbase',
                'integrations/influxdb',
                'integrations/db2',
                'integrations/sap-hana',
                'integrations/snowflake',
                'integrations/supabase',
                'integrations/pgbouncer',
              ],
            },
            {
              type: 'category',
              label: 'Web Servers',
              collapsed: true,
              items: [
                'integrations/nginx',
                'integrations/apache',
                'integrations/haproxy',
                'integrations/traefik',
                'integrations/caddy',
                'integrations/envoy',
                'integrations/varnish',
                'integrations/tomcat',
                'integrations/wildfly',
                'integrations/iis',
                'integrations/f5-bigip',
              ],
            },
            {
              type: 'category',
              label: 'Message Queues',
              collapsed: true,
              items: [
                'integrations/kafka',
                'integrations/rabbitmq',
                'integrations/activemq',
                'integrations/ibm-mq',
                'integrations/nsq',
              ],
            },
            {
              type: 'category',
              label: 'Networking',
              collapsed: true,
              items: [
                'integrations/netflow',
                'integrations/istio',
                'integrations/consul',
                'integrations/etcd',
                'integrations/coredns',
                'integrations/cilium',
                'integrations/ubiquiti',
                'integrations/juniper-mist',
                'integrations/dnsmasq',
                'integrations/snmp',
              ],
            },
            {
              type: 'category',
              label: 'Languages & Runtimes',
              collapsed: true,
              items: [
                'integrations/nodejs',
                'integrations/go',
                'integrations/jvm',
                'integrations/spring-boot',
                'integrations/ruby',
                'integrations/tensorflow',
                'integrations/apollo',
              ],
            },
            {
              type: 'category',
              label: 'Developer Tools',
              collapsed: true,
              items: [
                'integrations/jenkins',
                'integrations/github',
                'integrations/gitlab',
                'integrations/gitea',
                'integrations/awx',
                'integrations/jira',
                'integrations/discourse',
              ],
            },
            {
              type: 'category',
              label: 'Observability',
              collapsed: true,
              items: [
                'integrations/loki',
                'integrations/mimir',
                'integrations/grafana-agent',
                'integrations/metrics-endpoint',
                'integrations/opentelemetry-integration',
              ],
            },
            {
              type: 'category',
              label: 'Security',
              collapsed: true,
              items: [
                'integrations/vault',
                'integrations/cert-manager',
                'integrations/openldap',
              ],
            },
            {
              type: 'category',
              label: 'Storage',
              collapsed: true,
              items: [
                'integrations/memcached',
                'integrations/ceph',
                'integrations/rclone',
                'integrations/velero',
              ],
            },
            {
              type: 'category',
              label: 'Other',
              collapsed: true,
              items: [
                'integrations/spark',
                'integrations/hadoop',
                'integrations/airflow',
                'integrations/solr',
                'integrations/nomad',
                'integrations/presto',
                'integrations/openai-monitoring',
                'integrations/temporal',
                'integrations/asterisk',
                'integrations/home-assistant',
                'integrations/catchpoint',
              ],
            },
          ],
        },
        'endpoints',
        'limits',
        'troubleshooting',
        {
          type: 'category',
          label: 'API reference',
          collapsed: true,
          items: [...apiSidebar],
        },
      ],
    },
  ],
};

export default sidebars;
