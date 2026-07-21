import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    // ── Getting Started ──────────────────────────────────────────────────────
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

    // ── Portal ───────────────────────────────────────────────────────────────
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

    // ── Fleet Management ────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Fleet Management',
      collapsed: false,
      items: [
        'fleet-management/fleet-management',
        'fleet-management/enroll-agents',
        'fleet-management/configure-agents',
        {
          type: 'category',
          label: 'Kubernetes',
          collapsed: false,
          items: [
            'fleet-management/ebpf-instrumentation',
            'fleet-management/traces-auto-instrumentation',
          ],
        },
        'fleet-management/secrets',
        'fleet-management/fleet-troubleshooting',
      ],
    },

    // ── Metrics ──────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Metrics',
      collapsed: false,
      items: [
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
        'grafana-metrics',
      ],
    },

    // ── Logs ─────────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Logs',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Sending Logs',
          collapsed: false,
          items: [
            'logs/grafana-alloy',
            'logs/opentelemetry-collector',
            'logs/otel-sdk-python',
            'logs/otel-sdk-nodejs',
            'logs/otel-sdk-go',
          ],
        },
        {
          type: 'category',
          label: 'Querying',
          collapsed: false,
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

    // ── Traces ───────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Traces',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Sending Traces',
          collapsed: false,
          items: [
            'traces/grafana-alloy',
            'traces/opentelemetry-collector',
            'traces/otel-sdk-python',
            'traces/otel-sdk-nodejs',
            'traces/otel-sdk-go',
          ],
        },
        {
          type: 'category',
          label: 'Querying',
          collapsed: false,
          items: [
            'trace-query/overview',
            'trace-query/search',
          ],
        },
        'grafana-traces',
      ],
    },

    // ── Alerting ─────────────────────────────────────────────────────────────
    'rules-and-alerts',

    // ── Integrations ─────────────────────────────────────────────────────────
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
            'integrations/windows',
            'integrations/macos',
            'integrations/raspberry-pi',
            'integrations/vmware-vsphere',
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
            'integrations/cloudflare',
            'integrations/openstack',
            'integrations/minio',
            'integrations/confluent-cloud',
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
          collapsed: false,
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
          collapsed: false,
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
          collapsed: false,
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
          collapsed: false,
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
          collapsed: false,
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
          collapsed: false,
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
          collapsed: false,
          items: [
            'integrations/vault',
            'integrations/cert-manager',
            'integrations/openldap',
          ],
        },
        {
          type: 'category',
          label: 'Storage',
          collapsed: false,
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
          collapsed: false,
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

    // ── Reference ─────────────────────────────────────────────────────────────
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
