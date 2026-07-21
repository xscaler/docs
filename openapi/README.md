# Vendored OpenAPI spec

`xscaler.yaml` is a committed copy of the xScaler Customer API spec. The docs
site builds the API reference (`/api`) from this file, so it must live in the
repo: a fresh clone builds without any external checkout or network access.

## Source of truth

The spec is embedded in the xscaler monorepo at:

    services/portal-api/internal/publicapi/openapi.yaml

## Refreshing it

When the API changes, copy the updated spec over this file and commit it. From
the docs repo root, with the monorepo checked out anywhere on your machine:

    cp <path-to-xscaler-monorepo>/services/portal-api/internal/publicapi/openapi.yaml openapi/xscaler.yaml

Then rebuild (`npm run build`) and commit the updated `xscaler.yaml`.
