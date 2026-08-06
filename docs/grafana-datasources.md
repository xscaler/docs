---
id: grafana-datasources
title: Connect Grafana Datasources
sidebar_label: Connect Grafana Datasources
slug: /grafana-datasources
---

# Connect Grafana Datasources

Connect Grafana to all three xScaler signals — metrics, logs, and traces — as native Prometheus, Loki, and Tempo datasources. Once connected you can query, correlate, and alert across all signals from a single Grafana instance.

Works with **Grafana 9.1+** — both self-hosted and Grafana Cloud.

---

## Before you start

You need the following from the xScaler portal for each tenant you want to query:

| Item | Where to find it |
|------|-----------------|
| **API token** | [Organization → Tenants → tenant name → API keys](/portal/api-tokens) |
| **Tenant ID** | Shown in the tenant list and on the tenant detail page |
| **Region endpoints** | See [Regions & Endpoints](/regions) |

For the `euw1-01` region:

| Signal | Query endpoint |
|--------|---------------|
| Metrics | `https://euw1-01.m.xscalerlabs.com` |
| Logs | `https://euw1-01.l.xscalerlabs.com` |
| Traces | `https://euw1-01.t.xscalerlabs.com` |

:::tip One token, three datasources
A single API token works for all three signals as long as it is scoped for read access. Create it once and reuse it across all datasource configs.
:::

---

## Metrics — Prometheus datasource

### Step 1 — Add a new connection

In Grafana, go to **Connections → Add new connection**. Search for **Prometheus** and click the **Prometheus** card.

![Grafana — Add new connection, search for Prometheus](/img/grafana/metrics-01-connections.png)

### Step 2 — Set the server URL

In the **Prometheus server URL** field enter the metrics endpoint for your region:

```
https://euw1-01.m.xscalerlabs.com
```

![Grafana — Prometheus server URL field](/img/grafana/metrics-03-server-url.png)

:::tip No path suffix
Enter the host root only. Grafana appends `/api/v1/query` automatically — do not add any path.
:::

### Step 3 — Add HTTP headers

Scroll down to the **HTTP Headers** section and add two headers:

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <your-api-token>` |
| `X-Scope-OrgID` | `<your-tenant-id>` |

![Grafana — HTTP Headers section with Authorization and X-Scope-OrgID](/img/grafana/metrics-04-http-headers.png)

:::danger Use HTTP Headers only
Do **not** use the Basic Auth fields or the Grafana Authentication section. xScaler authentication is Bearer-token only via custom HTTP headers.
:::

### Step 4 — Save & test

Click **Save & test**. A successful response shows:

```
Successfully queried the Prometheus API.
```

![Grafana — Prometheus Save & Test success](/img/grafana/metrics-04-save.png)

---

## Logs — Loki datasource

### Step 1 — Add a new connection

In Grafana, go to **Connections → Add new connection**. Search for **Loki** and click the **Loki** card.

![Grafana — Loki datasource settings](/img/grafana/logs-01-select-loki.png)

### Step 2 — Set the URL

In the **URL** field enter the logs endpoint:

```
https://euw1-01.l.xscalerlabs.com
```

![Grafana — Loki URL field](/img/grafana/logs-02-url.png)

### Step 3 — Add HTTP headers

Scroll to **HTTP Headers** and add:

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <your-api-token>` |
| `X-Scope-OrgID` | `<your-tenant-id>` |

![Grafana — Loki HTTP Headers](/img/grafana/logs-03-http-headers.png)

### Step 4 — Save & test

Click **Save & test**. A successful response shows:

```
Data source successfully connected.
```

![Grafana — Loki Save & Test success](/img/grafana/logs-04-save-test.png)

:::note No data yet?
If the connection succeeds but queries return empty results, logs haven't been ingested yet for this tenant. Send logs first using [Grafana Alloy](/logs/grafana-alloy) or the [OTel Collector](/logs/opentelemetry-collector).
:::

---

## Traces — Tempo datasource

### Step 1 — Add a new connection

In Grafana, go to **Connections → Add new connection**. Search for **Tempo** and click the **Tempo** card.

![Grafana — Tempo datasource settings](/img/grafana/traces-01-select-tempo.png)

### Step 2 — Set the URL

In the **URL** field enter the traces endpoint:

```
https://euw1-01.t.xscalerlabs.com
```

![Grafana — Tempo URL field](/img/grafana/traces-02-url.png)

### Step 3 — Add HTTP headers

Scroll to **HTTP Headers** and add:

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <your-api-token>` |
| `X-Scope-OrgID` | `<your-tenant-id>` |

![Grafana — Tempo HTTP Headers](/img/grafana/traces-03-http-headers.png)

### Step 4 — Save & test

Click **Save & test**. A successful response shows:

```
Data source is working
```

![Grafana — Tempo Save & Test success](/img/grafana/traces-04-save-test.png)

---

## Link signals together

With all three datasources connected, configure Grafana to jump between signals automatically.

### Trace to logs

In the Tempo datasource settings scroll to **Trace to logs**:

| Field | Value |
|-------|-------|
| **Data source** | Your Loki datasource |
| **Tags** | `service.name` |
| **Filter by trace ID** | Enabled |

This adds a **Logs** button on every span view that jumps to the correlated log lines for the same service and time window.

### Trace to metrics

In the Tempo datasource settings scroll to **Trace to metrics**:

| Field | Value |
|-------|-------|
| **Data source** | Your Prometheus datasource |
| **Query** | `rate(traces_spanmetrics_duration_bucket{service="${__span.tags.service.name}"}[$__rate_interval])` |

### Metrics to logs (Correlations)

1. Go to **Administration → Correlations**.
2. Click **Add correlation**.
3. Set **Source** to your Prometheus datasource.
4. Set **Target** to your Loki datasource.
5. Use `{job="${job}"}` as the target query and map the `job` label from the metric series.

---

## Verify all three in Explore

Open **Explore** to confirm each signal works end-to-end.

**Metrics** — select the Prometheus datasource and run:
```promql
up
```

**Logs** — select the Loki datasource and run:
```logql
{job=~".+"}
```

**Traces** — select the Tempo datasource, switch to the **Search** tab, and click **Run query** with no filters.

---

## Troubleshooting

**"Bad Gateway" on Save & Test**
- Verify the URL is the host root only (e.g. `https://euw1-01.m.xscalerlabs.com`) with no path suffix and no trailing slash.
- Confirm HTTPS — HTTP is not accepted.

**"Forbidden" (403) on Save & Test**
- The token may be `write`-only. Generate a `read` or `read+write` token: go to **Organization → Tenants → tenant name → API keys** in the portal and create a new key.

**401 Unauthorized**
- The `Authorization` header value must be exactly `Bearer <token>` — capital B, one space, then the raw token.
- Check that the header is in the **HTTP Headers** section, not in the Grafana Authentication panel.

**"No org id" error in queries**
- The `X-Scope-OrgID` header is missing. Add it to the **HTTP Headers** section of the datasource config.

**Loki: "Data source connected" but no labels**
- No logs have been ingested yet for this tenant.
- The label browser only shows labels active in the selected time range — widen the time picker.

**Tempo: No traces found**
- Use the **Search** tab with a wide time range and no service filter to confirm traces exist.
- Check the time range — it must cover the period when traces were sent.
