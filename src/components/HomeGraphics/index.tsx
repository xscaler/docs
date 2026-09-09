import type { ReactNode } from 'react';
import styles from './styles.module.css';

/* ─── Signal sparks ───────────────────────────────────────────────── */
/* Three 300x52 figures, one per signal, ported from the design canvas.
 * Metrics is a rising line, logs are lines with one match highlighted, traces
 * are a span waterfall. Two-series colours come from the validated palette. */

const METRICS_LINE =
  'M0 40 22 34 44 37 66 26 88 30 110 18 132 24 154 12 176 20 198 9 220 15 242 6 264 11 286 4 300 7';

export function MetricsSpark(): ReactNode {
  return (
    <svg
      className={styles.spark}
      viewBox="0 0 300 52"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className={styles.s1Line} d={METRICS_LINE} />
      <path className={styles.s1Fill} d={`${METRICS_LINE}V52H0Z`} />
    </svg>
  );
}

export function LogsSpark(): ReactNode {
  return (
    <svg className={styles.spark} viewBox="0 0 300 52" fill="none" aria-hidden="true">
      <rect className={styles.logLine} x="0" y="4" width="196" height="4" rx="2" />
      <rect className={styles.logLine} x="0" y="16" width="248" height="4" rx="2" />
      <rect className={styles.logMatch} x="0" y="28" width="150" height="4" rx="2" />
      <rect className={styles.logLine} x="0" y="40" width="224" height="4" rx="2" />
      <rect className={styles.logChip} x="262" y="26" width="38" height="10" rx="3" />
    </svg>
  );
}

export function TracesSpark(): ReactNode {
  return (
    <svg className={styles.spark} viewBox="0 0 300 52" fill="none" aria-hidden="true">
      <rect className={styles.span1} x="0" y="4" width="290" height="7" rx="3.5" />
      <rect className={styles.span2} x="26" y="16" width="180" height="7" rx="3.5" />
      <rect className={styles.span3} x="48" y="28" width="96" height="7" rx="3.5" />
      <rect className={styles.span4} x="152" y="28" width="44" height="7" rx="3.5" />
      <rect className={styles.span5} x="62" y="40" width="52" height="7" rx="3.5" />
    </svg>
  );
}

/* ─── Capability icons ────────────────────────────────────────────── */

export function IconTemplate(): ReactNode {
  return (
    <svg className={styles.capIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="7" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="3.5" y="14.5" width="17" height="5" rx="2" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

export function IconBox(): ReactNode {
  return (
    <svg className={styles.capIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGlobe(): ReactNode {
  return (
    <svg className={styles.capIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function IconChat(): ReactNode {
  return (
    <svg className={styles.capIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 15.5V7.8a1.8 1.8 0 0 1 1.8-1.8h12.4A1.8 1.8 0 0 1 20 7.8v7.7a1.8 1.8 0 0 1-1.8 1.8H12l-4 3v-3H5.8A1.8 1.8 0 0 1 4 15.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── AI section graphics ─────────────────────────────────────────── */

/** A coding agent calling MCP tools, which resolve against the tenant. */
export function McpGraphic(): ReactNode {
  return (
    <svg
      className={styles.aiGraphic}
      viewBox="0 0 440 132"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A coding agent speaks MCP to three tools, query_metrics, get_trace and query_logs, which read from xScaler."
    >
      <rect x="8" y="38" width="106" height="56" rx="11" className={styles.aiPanel} />
      <text x="61" y="63" className={styles.aiPanelTitle} textAnchor="middle">
        Agent
      </text>
      <text x="61" y="80" className={styles.aiPanelSub} textAnchor="middle">
        MCP
      </text>

      <path d="M118 58h44" className={`${styles.aiEdge} ${styles.flow}`} />
      <path d="M118 66h44" className={`${styles.aiEdge} ${styles.flow} ${styles.d2}`} />
      <path d="M118 74h44" className={`${styles.aiEdge} ${styles.flow} ${styles.d3}`} />

      <rect x="166" y="14" width="122" height="26" rx="7" className={styles.aiTool} />
      <text x="178" y="31" className={styles.aiToolLabel}>
        query_metrics
      </text>
      <rect x="166" y="53" width="122" height="26" rx="7" className={styles.aiTool} />
      <text x="178" y="70" className={styles.aiToolLabel}>
        get_trace
      </text>
      <rect x="166" y="92" width="122" height="26" rx="7" className={styles.aiTool} />
      <text x="178" y="109" className={styles.aiToolLabel}>
        query_logs
      </text>

      <path d="M292 27h34l14 39-14 39h-34" className={styles.aiBrace} />
      <circle cx="392" cy="66" r="26" className={styles.aiPanel} />
      <path d="M380 74 388 58l4.6 9.2 3.2-5.2L404 74" className={styles.aiCoreGlyph} />
    </svg>
  );
}

/** Token usage split by type: two validated series, direct-labelled. */
export function TokensGraphic(): ReactNode {
  const bars: Array<[number, number, number, number]> = [
    // [input x, input y, output x, output y] — heights derive from y.
    [44, 66, 66, 84],
    [110, 52, 132, 76],
    [176, 40, 198, 68],
    [242, 58, 264, 80],
    [308, 30, 330, 62],
    [374, 46, 396, 72],
  ];

  return (
    <svg
      className={styles.aiGraphic}
      viewBox="0 0 440 132"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A bar chart of tokens per second over six intervals, each interval split into input and output tokens."
    >
      <line x1="34" y1="112" x2="424" y2="112" className={styles.axis} />
      {bars.map(([ix, iy, ox, oy]) => (
        <g key={ix}>
          <rect className={styles.barInput} x={ix} y={iy} width="20" height={110 - iy} rx="4" />
          <rect className={styles.barOutput} x={ox} y={oy} width="20" height={110 - oy} rx="4" />
        </g>
      ))}
      <text x="34" y="20" className={styles.axisLabel}>
        tokens/s
      </text>
      <text x="318" y="24" className={styles.legendInput}>
        input
      </text>
      <text x="360" y="24" className={styles.legendOutput}>
        output
      </text>
    </svg>
  );
}
