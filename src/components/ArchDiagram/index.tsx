import { useState, type ReactNode } from 'react';
import { useHistory } from '@docusaurus/router';
import styles from './styles.module.css';

type NodeId =
  | 'app'
  | 'collector'
  | 'sdk'
  | 'alloy'
  | 'custViz'
  | 'fleet'
  | 'metrics'
  | 'logs'
  | 'traces'
  | 'xViz';

interface Node {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  rightLabel?: string;
  to: string;
  highlight?: boolean;
  chips?: string[];
}

const NODES: Record<NodeId, Node> = {
  // ── Customer infrastructure ──
  app: { x: 50, y: 100, w: 250, h: 54, title: 'Your Application', sub: 'your services & hosts', to: '/getting-started' },
  collector: { x: 50, y: 172, w: 250, h: 64, title: 'OpenTelemetry Collector', sub: 'xScaler Agent · OpAMP-managed', to: '/ingest/opentelemetry-collector', highlight: true },
  sdk: { x: 50, y: 254, w: 250, h: 54, title: 'OTel SDK', sub: 'instrument your app directly', to: '/ingest/otel-sdk-python' },
  alloy: { x: 50, y: 326, w: 250, h: 54, title: 'Grafana Alloy', sub: 'existing Alloy / Agent config', to: '/ingest/grafana-alloy' },
  custViz: { x: 50, y: 432, w: 250, h: 118, title: 'Visualization', sub: 'your query tooling', chips: ['Grafana', 'Jaeger'], to: '/grafana' },
  // ── xScaler hosted ──
  fleet: { x: 430, y: 100, w: 460, h: 54, title: 'Fleet Management', sub: 'agent-api · OpAMP control plane', to: '/fleet-management' },
  metrics: { x: 470, y: 196, w: 400, h: 56, title: 'Metrics', sub: 'remote_write / OTLP in · PromQL out', to: '/query/overview' },
  logs: { x: 470, y: 270, w: 400, h: 50, title: 'Logs', sub: 'OTLP / push in · LogQL out', to: '/log-query/overview' },
  traces: { x: 470, y: 336, w: 400, h: 56, title: 'Traces', sub: 'OTLP in · Jaeger / TraceQL out', to: '/trace-query/overview' },
  xViz: { x: 470, y: 432, w: 400, h: 118, title: 'Visualization', rightLabel: 'xScaler Insight', chips: ['Dashboards', 'Drilldown', 'Explore', 'Alerting'], to: '/grafana' },
};

const VIZ_IDS: NodeId[] = ['custViz', 'xViz'];

interface Edge {
  id: string;
  d: string;
  nodes: NodeId[];
  flow?: boolean;
  dashed?: boolean;
  arrow?: boolean;
}

const EDGES: Edge[] = [
  // App fans out to the three agents via a left rail.
  { id: 'app-rail', d: 'M175 154 L175 164 L40 164 L40 353', nodes: ['app'], arrow: false },
  { id: 'st-col', d: 'M40 204 L50 204', nodes: ['app', 'collector'] },
  { id: 'st-sdk', d: 'M40 281 L50 281', nodes: ['app', 'sdk'] },
  { id: 'st-alloy', d: 'M40 353 L50 353', nodes: ['app', 'alloy'] },
  // Agents converge at the ingest hub, then split into the three signals.
  { id: 'col-hub', d: 'M300 204 C335 204 340 290 355 290', nodes: ['collector'], flow: true, arrow: false },
  { id: 'sdk-hub', d: 'M300 281 C335 281 345 290 355 290', nodes: ['sdk'], flow: true, arrow: false },
  { id: 'alloy-hub', d: 'M300 353 C335 353 340 290 355 290', nodes: ['alloy'], flow: true, arrow: false },
  { id: 'hub-met', d: 'M355 290 C410 290 420 224 470 224', nodes: ['metrics'], flow: true },
  { id: 'hub-log', d: 'M355 290 L470 295', nodes: ['logs'], flow: true },
  { id: 'hub-tra', d: 'M355 290 C410 290 420 364 470 364', nodes: ['traces'], flow: true },
  // Fleet Management pushes agent config over OpAMP (control plane, dashed).
  { id: 'fleet-col', d: 'M430 132 C360 150 330 168 300 184', nodes: ['fleet', 'collector'], dashed: true },
  // Each signal feeds the hosted visualization surface.
  { id: 'met-viz', d: 'M870 224 L890 224 L890 474 L872 474', nodes: ['metrics', 'xViz'], flow: true },
  { id: 'log-viz', d: 'M870 295 L890 295 L890 490 L872 490', nodes: ['logs', 'xViz'], flow: true },
  { id: 'tra-viz', d: 'M870 364 L890 364 L890 506 L872 506', nodes: ['traces', 'xViz'], flow: true },
];

export default function ArchDiagram(): ReactNode {
  const history = useHistory();
  const [active, setActive] = useState<NodeId | null>(null);

  const go = (to: string) => history.push(to);
  const edgeActive = (e: Edge) => active !== null && e.nodes.includes(active);

  return (
    <figure className={styles.wrap}>
      <div className={styles.scroll}>
        <svg
          className={styles.svg}
          viewBox="0 0 960 580"
          role="group"
          aria-label="xScaler architecture: instrumented apps send metrics, logs and traces through a collector into the xScaler hosted backend, managed by Fleet Management and queried back out through Grafana, Jaeger, or xScaler Insight."
        >
          <defs>
            <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowhead} />
            </marker>
          </defs>

          {/* Zones */}
          <g>
            <rect x="24" y="72" width="302" height="500" rx="16" className={styles.zone} />
            <text x="36" y="62" className={styles.zoneLabel}>CUSTOMER INFRASTRUCTURE</text>
            <rect x="358" y="72" width="578" height="500" rx="16" className={styles.zone} />
            <text x="370" y="62" className={styles.zoneLabel}>xSCALER · HOSTED</text>
          </g>

          {/* Edges */}
          {EDGES.map((e) => {
            const on = edgeActive(e);
            return (
              <g key={e.id}>
                <path
                  d={e.d}
                  className={`${styles.edge} ${e.dashed ? styles.edgeDashed : ''} ${on ? styles.edgeActive : ''}`}
                  markerEnd={e.arrow === false ? undefined : 'url(#arch-arrow)'}
                />
                {e.flow ? (
                  <path d={e.d} className={`${styles.flow} ${on ? styles.flowActive : ''}`} />
                ) : null}
              </g>
            );
          })}

          {/* Flow labels */}
          <text x="360" y="256" textAnchor="middle" className={styles.wireLabel}>remote_write · OTLP</text>
          <g>
            <rect x="292" y="304" width="164" height="24" rx="12" className={styles.pill} />
            <text x="374" y="320" textAnchor="middle" className={styles.pillLabel}>token · X-Scope-OrgID</text>
          </g>
          <text x="366" y="112" textAnchor="middle" className={styles.wireLabel}>OpAMP · config pull</text>

          {/* Nodes */}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const isActive = active === id;
            const isViz = VIZ_IDS.includes(id);
            return (
              <g
                key={id}
                className={`${styles.node} ${isActive ? styles.nodeActive : ''} ${n.highlight ? styles.nodeHighlight : ''}`}
                transform={`translate(${n.x} ${n.y})`}
                role="link"
                tabIndex={0}
                aria-label={`${n.title}${n.sub ? ' — ' + n.sub : ''}`}
                onClick={() => go(n.to)}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    go(n.to);
                  }
                }}
                onMouseEnter={() => setActive(id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(id)}
                onBlur={() => setActive(null)}
              >
                <rect width={n.w} height={n.h} rx={12} className={styles.nodeBox} />

                {isViz ? (
                  <>
                    <text x={18} y={26} className={styles.nodeLabel}>{n.title}</text>
                    {n.sub ? <text x={18} y={44} className={styles.nodeSub}>{n.sub}</text> : null}
                    {n.rightLabel ? (
                      <text x={n.w - 16} y={26} textAnchor="end" className={styles.nodeSub}>{n.rightLabel}</text>
                    ) : null}
                    {n.chips?.map((c, i) => {
                      const cols = n.chips!.length;
                      const gap = 10;
                      const startX = 18;
                      const cw = (n.w - startX * 2 - gap * (cols - 1)) / cols;
                      const cx = startX + i * (cw + gap);
                      const cy = 62;
                      return (
                        <g key={c}>
                          <rect x={cx} y={cy} width={cw} height={40} rx={9} className={styles.chip} />
                          <text x={cx + cw / 2} y={cy + 25} textAnchor="middle" className={styles.chipLabel}>{c}</text>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <text x={18} y={n.h / 2 - 6} className={styles.nodeLabel}>{n.title}</text>
                    {n.sub ? <text x={18} y={n.h / 2 + 13} className={styles.nodeSub}>{n.sub}</text> : null}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className={styles.caption}>
        Click any box to open its docs. Agents (OpenTelemetry Collector, OTel SDK,
        or Grafana Alloy) — optionally OpAMP-managed by Fleet Management — ship
        metrics, logs, and traces into xScaler, queried back out with PromQL,
        LogQL, and TraceQL through Grafana, Jaeger, or xScaler Insight.
      </figcaption>
    </figure>
  );
}
