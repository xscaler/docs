import React, { useState, useMemo } from 'react';
import {
  siLinux, siKubernetes, siDocker, siApple, siRaspberrypi, siVmware,
  siGooglecloud, siCloudflare, siOpenstack, siMinio,
  siPostgresql, siMysql, siMongodb, siRedis, siElasticsearch,
  siClickhouse, siCockroachlabs, siApachecassandra, siCouchbase,
  siApachecouchdb, siApachehbase, siInfluxdb, siSap, siSnowflake, siSupabase,
  siNginx, siApache, siTraefikproxy, siCaddy, siEnvoyproxy, siApachetomcat,
  siApachekafka, siRabbitmq,
  siIstio, siConsul, siCilium, siUbiquiti,
  siJenkins, siGithub, siGitlab, siGitea, siAnsible, siJira, siDiscourse,
  siNodedotjs, siGo, siOpenjdk, siSpring, siRuby, siTensorflow, siApollographql,
  siGrafana, siPrometheus, siOpentelemetry,
  siVault, siLetsencrypt,
  siCeph, siRclone, siEtcd,
  siApachespark, siApachehadoop, siApacheairflow, siApachesolr, siHashicorp,
  siTemporal, siHomeassistant,
} from 'simple-icons';
import styles from './styles.module.css';

type SimpleIcon = { path: string; hex: string; title: string };

const siIconMap: Record<string, SimpleIcon> = {
  linux: siLinux, kubernetes: siKubernetes, docker: siDocker,
  apple: siApple, raspberrypi: siRaspberrypi, vmware: siVmware,
  googlecloud: siGooglecloud, cloudflare: siCloudflare, openstack: siOpenstack, minio: siMinio,
  postgresql: siPostgresql, mysql: siMysql, mongodb: siMongodb, redis: siRedis,
  elasticsearch: siElasticsearch, clickhouse: siClickhouse, cockroachlabs: siCockroachlabs,
  apachecassandra: siApachecassandra, couchbase: siCouchbase, apachecouchdb: siApachecouchdb,
  apachehbase: siApachehbase, influxdb: siInfluxdb, sap: siSap,
  snowflake: siSnowflake, supabase: siSupabase,
  nginx: siNginx, apache: siApache, traefikproxy: siTraefikproxy,
  caddy: siCaddy, envoy: siEnvoyproxy, apachetomcat: siApachetomcat,
  apachekafka: siApachekafka, rabbitmq: siRabbitmq,
  istio: siIstio, consul: siConsul, cilium: siCilium, ubiquiti: siUbiquiti,
  jenkins: siJenkins, github: siGithub, gitlab: siGitlab, gitea: siGitea,
  ansible: siAnsible, jira: siJira, discourse: siDiscourse,
  nodedotjs: siNodedotjs, go: siGo, openjdk: siOpenjdk, spring: siSpring,
  ruby: siRuby, tensorflow: siTensorflow, apollographql: siApollographql,
  grafana: siGrafana, prometheus: siPrometheus, opentelemetry: siOpentelemetry,
  vault: siVault, letsencrypt: siLetsencrypt,
  ceph: siCeph, rclone: siRclone, etcd: siEtcd,
  apachespark: siApachespark, apachehadoop: siApachehadoop, apacheairflow: siApacheairflow,
  apachesolr: siApachesolr, hashicorp: siHashicorp,
  temporal: siTemporal, homeassistant: siHomeassistant,
};

const DEVICONS_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

interface Integration {
  name: string;
  category: string;
  grafanaSlug: string;
  devIcon?: string;
  siIcon?: string;
  color: string;
  internalSlug?: string;
}

const GRAFANA_DOCS_BASE =
  'https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/';

const integrations: Integration[] = [
  // Infrastructure
  { name: 'Linux', category: 'Infrastructure', grafanaSlug: 'integration-linux-node', devIcon: 'linux/linux-original', color: '#FCC624', internalSlug: 'linux' },
  { name: 'Kubernetes', category: 'Infrastructure', grafanaSlug: 'integration-kubernetes', devIcon: 'kubernetes/kubernetes-plain', color: '#326CE5', internalSlug: 'kubernetes' },
  { name: 'Docker', category: 'Infrastructure', grafanaSlug: 'integration-docker', devIcon: 'docker/docker-original', color: '#2496ED', internalSlug: 'docker' },
  { name: 'Docker Desktop', category: 'Infrastructure', grafanaSlug: 'integration-docker-desktop', devIcon: 'docker/docker-original', color: '#2496ED', internalSlug: 'docker' },
  { name: 'Windows', category: 'Infrastructure', grafanaSlug: 'integration-windows-exporter', devIcon: 'windows8/windows8-original', color: '#0078D4', internalSlug: 'windows' },
  { name: 'Windows Active Directory', category: 'Infrastructure', grafanaSlug: 'integration-windows-active-directory', devIcon: 'windows8/windows8-original', color: '#0078D4', internalSlug: 'windows' },
  { name: 'macOS', category: 'Infrastructure', grafanaSlug: 'integration-macos-node', siIcon: 'apple', color: '#555555', internalSlug: 'macos' },
  { name: 'Raspberry Pi', category: 'Infrastructure', grafanaSlug: 'integration-raspberry-pi-node', devIcon: 'raspberrypi/raspberrypi-original', color: '#A22846', internalSlug: 'raspberry-pi' },
  { name: 'VMware vSphere', category: 'Infrastructure', grafanaSlug: 'integration-vsphere', siIcon: 'vmware', color: '#607078', internalSlug: 'vmware-vsphere' },

  // Cloud
  { name: 'AWS CloudWatch', category: 'Cloud', grafanaSlug: 'integration-cloudwatch', devIcon: 'amazonwebservices/amazonwebservices-plain-wordmark', color: '#FF9900', internalSlug: 'aws-cloudwatch' },
  { name: 'Google Cloud', category: 'Cloud', grafanaSlug: 'integration-google-cloud', siIcon: 'googlecloud', color: '#4285F4', internalSlug: 'google-cloud' },
  { name: 'Azure Monitor', category: 'Cloud', grafanaSlug: 'integration-azure-monitor', devIcon: 'azure/azure-original', color: '#0089D6', internalSlug: 'azure-monitor' },
  { name: 'Cloudflare', category: 'Cloud', grafanaSlug: 'integration-cloudflare', siIcon: 'cloudflare', color: '#F38020', internalSlug: 'cloudflare' },
  { name: 'Cloudflare Workers', category: 'Cloud', grafanaSlug: 'integration-cloudflare-workers', siIcon: 'cloudflare', color: '#F38020', internalSlug: 'cloudflare' },
  { name: 'OpenStack', category: 'Cloud', grafanaSlug: 'integration-openstack', siIcon: 'openstack', color: '#ED1944', internalSlug: 'openstack' },
  { name: 'MinIO', category: 'Cloud', grafanaSlug: 'integration-minio', siIcon: 'minio', color: '#C72E49', internalSlug: 'minio' },
  { name: 'Confluent Cloud', category: 'Cloud', grafanaSlug: 'integration-confluent-cloud', color: '#0089FF', internalSlug: 'confluent-cloud' },

  // Databases
  { name: 'PostgreSQL', category: 'Databases', grafanaSlug: 'integration-postgres', devIcon: 'postgresql/postgresql-original', color: '#4169E1', internalSlug: 'postgresql' },
  { name: 'MySQL', category: 'Databases', grafanaSlug: 'integration-mysql', devIcon: 'mysql/mysql-original', color: '#4479A1', internalSlug: 'mysql' },
  { name: 'MongoDB', category: 'Databases', grafanaSlug: 'integration-mongodb', devIcon: 'mongodb/mongodb-original', color: '#47A248', internalSlug: 'mongodb' },
  { name: 'MongoDB Atlas', category: 'Databases', grafanaSlug: 'integration-mongodb-atlas', devIcon: 'mongodb/mongodb-original', color: '#47A248', internalSlug: 'mongodb' },
  { name: 'Redis', category: 'Databases', grafanaSlug: 'integration-redis', devIcon: 'redis/redis-original', color: '#FF4438', internalSlug: 'redis' },
  { name: 'Redis Enterprise', category: 'Databases', grafanaSlug: 'integration-redis-enterprise', devIcon: 'redis/redis-original', color: '#FF4438', internalSlug: 'redis' },
  { name: 'Elasticsearch', category: 'Databases', grafanaSlug: 'integration-elasticsearch', devIcon: 'elasticsearch/elasticsearch-original', color: '#005571', internalSlug: 'elasticsearch' },
  { name: 'OpenSearch', category: 'Databases', grafanaSlug: 'integration-opensearch', color: '#003B57', internalSlug: 'opensearch' },
  { name: 'ClickHouse', category: 'Databases', grafanaSlug: 'integration-clickhouse', siIcon: 'clickhouse', color: '#FFCC01', internalSlug: 'clickhouse' },
  { name: 'CockroachDB', category: 'Databases', grafanaSlug: 'integration-cockroachdb', siIcon: 'cockroachlabs', color: '#6933FF', internalSlug: 'cockroachdb' },
  { name: 'Microsoft SQL Server', category: 'Databases', grafanaSlug: 'integration-mssql', devIcon: 'microsoftsqlserver/microsoftsqlserver-plain', color: '#CC2927', internalSlug: 'mssql' },
  { name: 'Oracle Database', category: 'Databases', grafanaSlug: 'integration-oracledb', devIcon: 'oracle/oracle-original', color: '#F80000', internalSlug: 'oracle' },
  { name: 'Apache Cassandra', category: 'Databases', grafanaSlug: 'integration-apache-cassandra', devIcon: 'apachecassandra/apachecassandra-plain', siIcon: 'apachecassandra', color: '#1287B1', internalSlug: 'cassandra' },
  { name: 'Couchbase', category: 'Databases', grafanaSlug: 'integration-couchbase', devIcon: 'couchbase/couchbase-original', color: '#EA2328', internalSlug: 'couchbase' },
  { name: 'Apache CouchDB', category: 'Databases', grafanaSlug: 'integration-apache-couchdb', siIcon: 'apachecouchdb', color: '#E42528', internalSlug: 'couchdb' },
  { name: 'Aerospike', category: 'Databases', grafanaSlug: 'integration-aerospike', color: '#C22127', internalSlug: 'aerospike' },
  { name: 'Apache HBase', category: 'Databases', grafanaSlug: 'integration-apache-hbase', siIcon: 'apachehbase', color: '#BE160C', internalSlug: 'hbase' },
  { name: 'InfluxDB', category: 'Databases', grafanaSlug: 'integration-influxdb', devIcon: 'influxdb/influxdb-original', color: '#22ADF6', internalSlug: 'influxdb' },
  { name: 'IBM Db2', category: 'Databases', grafanaSlug: 'integration-ibm-db2', color: '#052FAD', internalSlug: 'db2' },
  { name: 'SAP HANA', category: 'Databases', grafanaSlug: 'integration-sap-hana', siIcon: 'sap', color: '#0FAAFF', internalSlug: 'sap-hana' },
  { name: 'Snowflake', category: 'Databases', grafanaSlug: 'integration-snowflake', siIcon: 'snowflake', color: '#29B5E8', internalSlug: 'snowflake' },
  { name: 'Supabase', category: 'Databases', grafanaSlug: 'integration-supabase', devIcon: 'supabase/supabase-original', color: '#3ECF8E', internalSlug: 'supabase' },
  { name: 'PgBouncer', category: 'Databases', grafanaSlug: 'integration-pgbouncer', devIcon: 'postgresql/postgresql-original', color: '#4169E1', internalSlug: 'pgbouncer' },

  // Web Servers
  { name: 'NGINX', category: 'Web Servers', grafanaSlug: 'integration-nginx', devIcon: 'nginx/nginx-original', color: '#009639', internalSlug: 'nginx' },
  { name: 'Apache HTTP Server', category: 'Web Servers', grafanaSlug: 'integration-apache-http', devIcon: 'apache/apache-original', color: '#D22128', internalSlug: 'apache' },
  { name: 'HAProxy', category: 'Web Servers', grafanaSlug: 'integration-haproxy', color: '#106DA9', internalSlug: 'haproxy' },
  { name: 'Traefik', category: 'Web Servers', grafanaSlug: 'integration-traefik', devIcon: 'traefikproxy/traefikproxy-original', color: '#24A1C1', internalSlug: 'traefik' },
  { name: 'Caddy', category: 'Web Servers', grafanaSlug: 'integration-caddy', siIcon: 'caddy', color: '#1F88C0', internalSlug: 'caddy' },
  { name: 'Envoy', category: 'Web Servers', grafanaSlug: 'integration-envoy', siIcon: 'envoy', color: '#AC6199', internalSlug: 'envoy' },
  { name: 'Varnish Cache', category: 'Web Servers', grafanaSlug: 'integration-varnish-cache', color: '#4A9AD4', internalSlug: 'varnish' },
  { name: 'Apache Tomcat', category: 'Web Servers', grafanaSlug: 'integration-apache-tomcat', devIcon: 'tomcat/tomcat-original', siIcon: 'apachetomcat', color: '#F8DC75', internalSlug: 'tomcat' },
  { name: 'Wildfly', category: 'Web Servers', grafanaSlug: 'integration-wildfly', color: '#EE0000', internalSlug: 'wildfly' },
  { name: 'Microsoft IIS', category: 'Web Servers', grafanaSlug: 'integration-microsoft-iis', color: '#5E5E5E', internalSlug: 'iis' },
  { name: 'F5 BIG-IP', category: 'Web Servers', grafanaSlug: 'integration-f5-bigip', color: '#E4002B', internalSlug: 'f5-bigip' },

  // Message Queues
  { name: 'Apache Kafka', category: 'Message Queues', grafanaSlug: 'integration-kafka', devIcon: 'apachekafka/apachekafka-original', color: '#231F20', internalSlug: 'kafka' },
  { name: 'RabbitMQ', category: 'Message Queues', grafanaSlug: 'integration-rabbitmq', devIcon: 'rabbitmq/rabbitmq-original', color: '#FF6600', internalSlug: 'rabbitmq' },
  { name: 'Apache ActiveMQ', category: 'Message Queues', grafanaSlug: 'integration-apache-activemq', color: '#D42027', internalSlug: 'activemq' },
  { name: 'IBM MQ', category: 'Message Queues', grafanaSlug: 'integration-ibm-mq', color: '#052FAD', internalSlug: 'ibm-mq' },
  { name: 'NSQ', category: 'Message Queues', grafanaSlug: 'integration-nsq', color: '#42BA0F', internalSlug: 'nsq' },

  // Networking
  { name: 'Istio', category: 'Networking', grafanaSlug: 'integration-istio', siIcon: 'istio', color: '#466BB0', internalSlug: 'istio' },
  { name: 'Consul', category: 'Networking', grafanaSlug: 'integration-consul', siIcon: 'consul', color: '#F24C53', internalSlug: 'consul' },
  { name: 'HCP Consul', category: 'Networking', grafanaSlug: 'integration-hcp-consul', siIcon: 'consul', color: '#F24C53', internalSlug: 'consul' },
  { name: 'NetFlow / IPFIX / sFlow', category: 'Networking', grafanaSlug: 'integration-ktranslate-netflow', color: '#1BA0D7', internalSlug: 'netflow' },
  { name: 'CoreDNS', category: 'Networking', grafanaSlug: 'integration-coredns', color: '#2B8FBF', internalSlug: 'coredns' },
  { name: 'Cilium Enterprise', category: 'Networking', grafanaSlug: 'integration-cilium-enterprise', siIcon: 'cilium', color: '#F8C517', internalSlug: 'cilium' },
  { name: 'Ubiquiti EdgeRouter', category: 'Networking', grafanaSlug: 'integration-ubiquiti-edgerouter', siIcon: 'ubiquiti', color: '#0559C9', internalSlug: 'ubiquiti' },
  { name: 'Juniper MIST AI', category: 'Networking', grafanaSlug: 'integration-juniper-mist', color: '#0F9E4E', internalSlug: 'juniper-mist' },
  { name: 'Dnsmasq', category: 'Networking', grafanaSlug: 'integration-dnsmasq', color: '#48A546', internalSlug: 'dnsmasq' },
  { name: 'SNMP', category: 'Networking', grafanaSlug: 'integration-snmp', color: '#1BA0D7', internalSlug: 'snmp' },

  // Developer Tools
  { name: 'Jenkins', category: 'Developer Tools', grafanaSlug: 'integration-jenkins', devIcon: 'jenkins/jenkins-original', color: '#D24939', internalSlug: 'jenkins' },
  { name: 'GitHub', category: 'Developer Tools', grafanaSlug: 'integration-github', devIcon: 'github/github-original', color: '#24292F', internalSlug: 'github' },
  { name: 'GitLab', category: 'Developer Tools', grafanaSlug: 'integration-gitlab', devIcon: 'gitlab/gitlab-original', color: '#FC6D26', internalSlug: 'gitlab' },
  { name: 'Gitea', category: 'Developer Tools', grafanaSlug: 'integration-gitea', siIcon: 'gitea', color: '#609926', internalSlug: 'gitea' },
  { name: 'AWX', category: 'Developer Tools', grafanaSlug: 'integration-awx', devIcon: 'ansible/ansible-original', color: '#EE0000', internalSlug: 'awx' },
  { name: 'Jira', category: 'Developer Tools', grafanaSlug: 'integration-jira', devIcon: 'jira/jira-original', color: '#0052CC', internalSlug: 'jira' },
  { name: 'Discourse', category: 'Developer Tools', grafanaSlug: 'integration-discourse', siIcon: 'discourse', color: '#000000', internalSlug: 'discourse' },

  // Languages & Runtimes
  { name: 'Node.js', category: 'Languages & Runtimes', grafanaSlug: 'integration-nodejs', devIcon: 'nodejs/nodejs-original', color: '#339933', internalSlug: 'nodejs' },
  { name: 'Go', category: 'Languages & Runtimes', grafanaSlug: 'integration-golang', devIcon: 'go/go-original', color: '#00ADD8', internalSlug: 'go' },
  { name: 'JVM', category: 'Languages & Runtimes', grafanaSlug: 'integration-jvm', devIcon: 'java/java-original', color: '#ED8B00', internalSlug: 'jvm' },
  { name: 'Spring Boot', category: 'Languages & Runtimes', grafanaSlug: 'integration-spring-boot', devIcon: 'spring/spring-original', color: '#6DB33F', internalSlug: 'spring-boot' },
  { name: 'Ruby Rack', category: 'Languages & Runtimes', grafanaSlug: 'integration-ruby-rack', devIcon: 'ruby/ruby-original', color: '#CC342D', internalSlug: 'ruby' },
  { name: 'TensorFlow Serving', category: 'Languages & Runtimes', grafanaSlug: 'integration-tensorflow', devIcon: 'tensorflow/tensorflow-original', color: '#FF6F00', internalSlug: 'tensorflow' },
  { name: 'Apollo Server', category: 'Languages & Runtimes', grafanaSlug: 'integration-apollo-server', siIcon: 'apollographql', color: '#311C87', internalSlug: 'apollo' },

  // Observability
  { name: 'Grafana Loki', category: 'Observability', grafanaSlug: 'integration-loki', devIcon: 'grafana/grafana-original', color: '#F46800', internalSlug: 'loki' },
  { name: 'Grafana Mimir', category: 'Observability', grafanaSlug: 'integration-mimir', devIcon: 'grafana/grafana-original', color: '#F46800', internalSlug: 'mimir' },
  { name: 'Grafana Agent', category: 'Observability', grafanaSlug: 'integration-grafana-agent', devIcon: 'grafana/grafana-original', color: '#F46800', internalSlug: 'grafana-agent' },
  { name: 'Grafana Alloy', category: 'Observability', grafanaSlug: 'integration-grafana-alloy', devIcon: 'grafana/grafana-original', color: '#F46800', internalSlug: 'grafana-agent' },
  { name: 'Metrics Endpoint', category: 'Observability', grafanaSlug: 'integration-metrics-endpoint', devIcon: 'prometheus/prometheus-original', color: '#E6522C', internalSlug: 'metrics-endpoint' },
  { name: 'OpenTelemetry', category: 'Observability', grafanaSlug: 'integration-opentelemetry', devIcon: 'opentelemetry/opentelemetry-original', color: '#4E4E4E', internalSlug: 'opentelemetry-integration' },

  // Security
  { name: 'HashiCorp Vault', category: 'Security', grafanaSlug: 'integration-vault', devIcon: 'vault/vault-original', color: '#1563FF', internalSlug: 'vault' },
  { name: 'HCP Vault', category: 'Security', grafanaSlug: 'integration-hcp-vault', devIcon: 'vault/vault-original', color: '#1563FF', internalSlug: 'vault' },
  { name: 'cert-manager', category: 'Security', grafanaSlug: 'integration-cert-manager', siIcon: 'letsencrypt', color: '#003A70', internalSlug: 'cert-manager' },
  { name: 'OpenLDAP', category: 'Security', grafanaSlug: 'integration-openldap', color: '#009BDE', internalSlug: 'openldap' },

  // Storage
  { name: 'Memcached', category: 'Storage', grafanaSlug: 'integration-memcached', color: '#00A95C', internalSlug: 'memcached' },
  { name: 'Ceph', category: 'Storage', grafanaSlug: 'integration-ceph', siIcon: 'ceph', color: '#EF5C55', internalSlug: 'ceph' },
  { name: 'rclone', category: 'Storage', grafanaSlug: 'integration-rclone', siIcon: 'rclone', color: '#3F79AD', internalSlug: 'rclone' },
  { name: 'Velero', category: 'Storage', grafanaSlug: 'integration-velero', color: '#5C4EE5', internalSlug: 'velero' },
  { name: 'etcd', category: 'Storage', grafanaSlug: 'integration-etcd', siIcon: 'etcd', color: '#419EDA', internalSlug: 'etcd' },

  // Other
  { name: 'Apache Spark', category: 'Other', grafanaSlug: 'integration-spark', devIcon: 'apachespark/apachespark-original', color: '#E25A1C', internalSlug: 'spark' },
  { name: 'Apache Hadoop', category: 'Other', grafanaSlug: 'integration-apache-hadoop', devIcon: 'apachehadoop/apachehadoop-original', siIcon: 'apachehadoop', color: '#66CCFF', internalSlug: 'hadoop' },
  { name: 'Apache Airflow', category: 'Other', grafanaSlug: 'integration-apache-airflow', devIcon: 'apacheairflow/apacheairflow-original', color: '#017CEE', internalSlug: 'airflow' },
  { name: 'Apache Solr', category: 'Other', grafanaSlug: 'integration-apache-solr', siIcon: 'apachesolr', color: '#D9411E', internalSlug: 'solr' },
  { name: 'Nomad', category: 'Other', grafanaSlug: 'integration-nomad', siIcon: 'hashicorp', color: '#00CA8E', internalSlug: 'nomad' },
  { name: 'Presto', category: 'Other', grafanaSlug: 'integration-presto', color: '#5890FF', internalSlug: 'presto' },
  { name: 'OpenAI', category: 'Other', grafanaSlug: 'integration-openai', color: '#412991', internalSlug: 'openai-monitoring' },
  { name: 'Temporal', category: 'Other', grafanaSlug: 'integration-temporal', siIcon: 'temporal', color: '#111111', internalSlug: 'temporal' },
  { name: 'Asterisk', category: 'Other', grafanaSlug: 'integration-asterisk', color: '#F47721', internalSlug: 'asterisk' },
  { name: 'Home Assistant', category: 'Other', grafanaSlug: 'integration-home-assistant', siIcon: 'homeassistant', color: '#18BCF2', internalSlug: 'home-assistant' },
  { name: 'Catchpoint', category: 'Other', grafanaSlug: 'integration-catchpoint', color: '#0099CC', internalSlug: 'catchpoint' },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(integrations.map(i => i.category))).sort()];

function IntegrationCard({ integration }: { integration: Integration }) {
  const [devIconFailed, setDevIconFailed] = useState(false);
  const siIcon = integration.siIcon ? siIconMap[integration.siIcon] : null;
  const showDevIcon = integration.devIcon && !devIconFailed;

  const href = integration.internalSlug
    ? `/integrations/${integration.internalSlug}`
    : `${GRAFANA_DOCS_BASE}${integration.grafanaSlug}/`;
  const isExternal = !integration.internalSlug;

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={styles.card}
    >
      <div className={styles.logoArea}>
        {showDevIcon ? (
          <img
            src={`${DEVICONS_BASE}/${integration.devIcon}.svg`}
            alt={integration.name}
            className={styles.logo}
            onError={() => setDevIconFailed(true)}
          />
        ) : siIcon ? (
          <svg viewBox="0 0 24 24" className={styles.logo} aria-label={integration.name}>
            <path d={siIcon.path} fill={`#${siIcon.hex}`} />
          </svg>
        ) : (
          <div className={styles.logoFallback} style={{ backgroundColor: integration.color }}>
            {integration.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className={styles.name}>{integration.name}</span>
      <span className={styles.monitorBtn}>Monitor</span>
    </a>
  );
}

export default function IntegrationsCatalog() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return integrations.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className={styles.catalog}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search integrations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.categories}>
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} integration{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className={styles.grid}>
        {filtered.map(i => (
          <IntegrationCard key={i.grafanaSlug} integration={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          No integrations match <strong>{search}</strong>.
        </div>
      )}
    </div>
  );
}
