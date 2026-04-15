---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
slug: /troubleshooting
---

# Troubleshooting

Organised by symptom. If the issue you're experiencing is not listed here, contact [support](https://xscalerlabs.com/support).

---

## 400 Bad Request — "no org id"

**Cause:** The `X-Scope-OrgID` header is missing from the request.

**Fix:** Add the header to every request:

```bash
-H "X-Scope-OrgID: <tenant-id>"
```

This header is mandatory on every write and read request. See [Authentication](/authentication) for details.

---

## 401 Unauthorized

**Cause:** The `Authorization` header is missing, has an invalid token, or is malformed.

**Fix:**
1. Verify the header is present and uses the exact format: `Authorization: Bearer <token>` (capital **B**, a space, then the token).
2. Confirm the token is valid and has not been deleted in the dashboard.
3. Ensure no extra whitespace or newline characters are embedded in the token value.

```bash
# Correct
-H "Authorization: Bearer eyJhbGc..."

# Wrong — missing "Bearer" prefix
-H "Authorization: eyJhbGc..."
```

---

## 403 Forbidden

**Cause:** The API token does not have the required scope for the operation.

**Common scenarios:**
- A `write`-only token is used to issue a query.
- A `read`-only token is used for `remote_write`.

**Fix:** Generate a token with the correct scope from **xScaler dashboard → Settings → API Tokens**. Use `read+write` for clients that both send and query metrics (e.g. Grafana Agent / Alloy).

---

## 429 Too Many Requests

**Cause:** The ingest rate limit for your tenant has been exceeded.

**Fix:**
- Reduce the number of active `remote_write` shards: lower `queue_config.max_shards` in your Prometheus or Alloy config.
- Increase `queue_config.batch_send_deadline` to batch more samples per request.
- Drop high-volume, low-value metrics using `write_relabel_configs`.

---

## Metrics not appearing after remote_write

**Diagnosis steps:**

1. **Check the failure counter:**
   ```bash
   curl "https://euw1-01.m.xscalerlabs.com/api/v1/query" \
     -H "Authorization: Bearer <token>" \
     -H "X-Scope-OrgID: <tenant-id>" \
     --data-urlencode 'query=prometheus_remote_storage_failed_samples_total'
   ```
   If this counter is increasing, Prometheus is getting errors back from the backend.

2. **Enable Prometheus debug logging:**
   ```
   --log.level=debug
   ```
   Look for lines containing `remote_write` — they include the HTTP status code returned by the backend.

3. **Verify the ingest URL** ends in `/api/v1/push`:
   ```yaml
   url: https://euw1-01.m.xscalerlabs.com/api/v1/push
   ```
   Not `/api/v1/write`, not `/push`.

4. **Confirm both headers are set** in `prometheus.yml`:
   ```yaml
   authorization:
     credentials: <token>
   headers:
     X-Scope-OrgID: <tenant-id>
   ```

---

## Grafana Alloy: metrics not arriving

1. **Enable debug output:**
   ```bash
   alloy run --stability.level=generally-available config.alloy
   ```

2. **Check the Alloy UI** at `http://localhost:12345`. Components shown in red have errors — click them to see the error message.

3. **Verify the `headers` block** includes `X-Scope-OrgID`:
   ```river
   headers = {
     "X-Scope-OrgID" = "<tenant-id>",
   }
   ```

4. **Check the `authorization` block** — credentials should be the raw token, not `Bearer <token>`:
   ```river
   authorization {
     type        = "Bearer"
     credentials = "<token>"   # no "Bearer" prefix here
   }
   ```

---

## OpenTelemetry Collector: metrics not arriving

1. **Enable debug logging:**
   ```yaml
   service:
     telemetry:
       logs:
         level: debug
   ```

2. **Look for `"failed to export"` in the logs.** The line includes the HTTP status code. Common codes: `400` (missing `X-Scope-OrgID`), `401` (bad token), `404` (wrong endpoint path).

3. **Verify `endpoint` is the base host only:**
   ```yaml
   endpoint: https://euw1-01.m.xscalerlabs.com
   ```
   Do **not** append `/otlp/v1/metrics` — the `otlphttp` exporter adds the path automatically.

4. **Verify both headers are set:**
   ```yaml
   headers:
     Authorization: "Bearer <token>"
     X-Scope-OrgID: "<tenant-id>"
   ```

---

## Grafana "Bad Gateway" or empty results

1. **Check the data source URL** — use the host root, no path suffix:
   ```
   https://euw1-01.m.xscalerlabs.com
   ```

2. **Check both headers** are in the **HTTP Headers** section in Grafana, not in Basic Auth:
   - `Authorization` → `Bearer <token>`
   - `X-Scope-OrgID` → `<tenant-id>`

3. **Run Save & Test** in the data source settings — it confirms connectivity and shows the exact error message if something is misconfigured.

4. **Token scope** — Grafana queries data, so the token must have `read` or `read+write` scope.
