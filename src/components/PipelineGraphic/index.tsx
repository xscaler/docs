import type { ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * The hero flow: sources into the agent, the agent into xScaler, two query
 * lanes out. The agent is the emphasised stage and OpAMP config comes down from
 * the portal. "Your Grafana" is drawn recessive on purpose - the compatible
 * query APIs stay open, but Insights is the destination the docs point at.
 *
 * Geometry is the design canvas artboard (Main.dc.html hero, 500x312) as
 * authored. Colours come through the class names in styles.module.css so the
 * drawing follows the site's light and dark tokens.
 */
export default function PipelineGraphic(): ReactNode {
  return (
    <svg
      className={styles.graphic}
      width="500"
      height="312"
      viewBox="0 0 500 312"
      fill="none"
      role="img"
      aria-label="Four application sources feed one OpenTelemetry agent. The xScaler portal delivers that agent's config over OpAMP. The agent writes OTLP to xScaler, which is read in Insights, or through the Prometheus-, Loki- and Tempo-compatible APIs from your own Grafana."
    >
      {/* ── Sources into the agent ─────────────────────────────── */}
      <path d="M48 74C86 74 96 138 118 150" className={`${styles.src} ${styles.flow}`} />
      <path d="M48 128C84 128 100 146 118 154" className={`${styles.src} ${styles.flow} ${styles.d2}`} />
      <path d="M48 192C84 192 100 172 118 162" className={`${styles.src} ${styles.flow} ${styles.d3}`} />
      <path d="M48 250C88 250 98 178 118 166" className={`${styles.src} ${styles.flow} ${styles.d2}`} />

      {/* ── Agent into xScaler ─────────────────────────────────── */}
      <path d="M256 158h36" className={`${styles.out} ${styles.flow}`} />
      <text x="273" y="148" className={styles.mono10} textAnchor="middle">
        OTLP
      </text>

      {/* ── Config down from the portal ────────────────────────── */}
      <path d="M186 74v48" className={styles.configEdge} />
      <path d="m181 116 5 6 5-6" className={styles.configArrow} />
      <rect x="128" y="42" width="116" height="30" rx="8" className={styles.pill} />
      <text x="186" y="62" className={styles.pillLabel} textAnchor="middle">
        xScaler Portal
      </text>
      <text x="196" y="100" className={styles.configLabel}>
        OpAMP
      </text>

      {/* ── Out of xScaler: Insights primary, Grafana compatible ─ */}
      <path d="M352 150C362 138 358 124 366 116" className={`${styles.out} ${styles.flow}`} />
      <path
        d="M352 168C362 182 358 198 366 208"
        className={`${styles.outFaint} ${styles.flow} ${styles.d3}`}
      />

      {/* ── Source nodes ───────────────────────────────────────── */}
      <g className={styles.gnode}>
        <circle cx="36" cy="74" r="6" className={styles.nodeFill} />
        <circle cx="36" cy="74" r="12.5" className={styles.nodeRing} />
      </g>
      <g className={styles.gnode} style={{ animationDelay: '.6s' }}>
        <circle cx="36" cy="128" r="6" className={styles.nodeFill} />
        <circle cx="36" cy="128" r="12.5" className={styles.nodeRing} />
      </g>
      <g className={styles.gnode} style={{ animationDelay: '1.2s' }}>
        <circle cx="36" cy="192" r="6" className={styles.nodeFill} />
        <circle cx="36" cy="192" r="12.5" className={styles.nodeRing} />
      </g>
      <g className={styles.gnode} style={{ animationDelay: '1.8s' }}>
        <circle cx="36" cy="250" r="6" className={styles.nodeFill} />
        <circle cx="36" cy="250" r="12.5" className={styles.nodeRing} />
      </g>
      <text x="36" y="55" className={styles.srcLabel} textAnchor="middle">
        web
      </text>
      <text x="36" y="109" className={styles.srcLabel} textAnchor="middle">
        api
      </text>
      <text x="36" y="173" className={styles.srcLabel} textAnchor="middle">
        worker
      </text>
      <text x="36" y="231" className={styles.srcLabel} textAnchor="middle">
        k8s
      </text>

      {/* ── The agent: the emphasised stage ────────────────────── */}
      <rect x="118" y="126" width="136" height="64" rx="12" className={styles.agentBox} />
      <rect
        x="112"
        y="120"
        width="148"
        height="76"
        rx="16"
        className={`${styles.haloRect} ${styles.halo}`}
      />
      <path d="M172 147h26M172 158h26M172 169h16" className={styles.configGlyph} />
      <circle cx="161" cy="147" r="2.4" className={styles.nodeFill} />
      <circle cx="161" cy="158" r="2.4" className={styles.nodeFill} />
      <circle cx="161" cy="169" r="2.4" className={styles.nodeFill} />
      <text x="186" y="213" className={styles.agentLabel} textAnchor="middle">
        OpenTelemetry agent
      </text>

      {/* ── xScaler core ───────────────────────────────────────── */}
      <circle cx="324" cy="158" r="42" className={`${styles.haloRing} ${styles.halo}`} />
      <circle
        cx="324"
        cy="158"
        r="34"
        className={`${styles.haloRing2} ${styles.halo} ${styles.h2}`}
      />
      <circle cx="324" cy="158" r="27" className={styles.core} />
      <path d="M313 168 320.5 154.5l4.4 8.4 3-4.8L335 168" className={styles.coreGlyph} />
      <text x="324" y="217" className={styles.coreLabel} textAnchor="middle">
        XSCALER
      </text>

      {/* ── Insights: the emphasised destination ───────────────── */}
      <rect x="366" y="72" width="130" height="86" rx="12" className={styles.insightsBox} />
      <text x="380" y="94" className={styles.destTitle}>
        Insights
      </text>
      <path d="M380 106h102" className={styles.hairline} />
      <text x="380" y="122" className={styles.destItem}>
        Explorer
      </text>
      <text x="380" y="136" className={styles.destItem}>
        Dashboards
      </text>
      <text x="380" y="150" className={styles.destItem}>
        Alerting
      </text>

      {/* ── Grafana: still supported, drawn recessive ──────────── */}
      <rect x="366" y="188" width="130" height="56" rx="12" className={styles.grafanaBox} />
      <text x="380" y="209" className={styles.destTitleFaint}>
        Your Grafana
      </text>
      <text x="380" y="227" className={styles.destMono}>
        Prom / Loki / Tempo
      </text>
    </svg>
  );
}
