import { useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import {
  siPrometheus,
  siGrafana,
  siOpentelemetry,
  siNodedotjs,
  siGo,
  siKubernetes,
  siPython,
  siDocker,
  siLinux,
  siRedis,
  siPostgresql,
  siMysql,
  siMongodb,
  siClickhouse,
  siNginx,
  siJavascript,
  siOpenjdk,
  siCloudflare,
  siGooglecloud,
} from 'simple-icons';
import styles from './styles.module.css';

type SimpleIcon = { path: string; hex: string; title: string };

/**
 * Named tech logos available to hub tiles/cards. Keys are referenced from MDX
 * via the `icon` prop. Anything not here should use the `emoji` prop.
 */
const ICONS: Record<string, SimpleIcon> = {
  prometheus: siPrometheus,
  grafana: siGrafana,
  opentelemetry: siOpentelemetry,
  nodejs: siNodedotjs,
  go: siGo,
  kubernetes: siKubernetes,
  python: siPython,
  docker: siDocker,
  linux: siLinux,
  redis: siRedis,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  clickhouse: siClickhouse,
  nginx: siNginx,
  javascript: siJavascript,
  java: siOpenjdk,
  cloudflare: siCloudflare,
  googlecloud: siGooglecloud,
};

function Glyph({
  icon,
  emoji,
  className,
}: {
  icon?: keyof typeof ICONS;
  emoji?: string;
  className: string;
}): ReactNode {
  const si = icon ? ICONS[icon] : null;
  if (si) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d={si.path} fill="currentColor" />
      </svg>
    );
  }
  if (emoji) {
    return (
      <span className={className} aria-hidden="true">
        {emoji}
      </span>
    );
  }
  return null;
}

/** Full-colour brand logo — same source as the /integrations catalog:
 * a devicon SVG, falling back to a colour-filled simple-icon, then emoji. */
const DEVICONS_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

function BrandLogo({
  devIcon,
  icon,
  emoji,
  className,
}: {
  devIcon?: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  className: string;
}): ReactNode {
  const [failed, setFailed] = useState(false);
  const si = icon ? ICONS[icon] : null;

  if (devIcon && !failed) {
    return (
      <img
        src={`${DEVICONS_BASE}/${devIcon}.svg`}
        alt=""
        aria-hidden="true"
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }
  if (si) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d={si.path} fill={`#${si.hex}`} />
      </svg>
    );
  }
  if (emoji) {
    return (
      <span className={className} aria-hidden="true">
        {emoji}
      </span>
    );
  }
  return null;
}

/* ─── Hero search ─────────────────────────────────────────────────── */

export function SearchHero({
  placeholder = 'Search the docs…',
}: {
  placeholder?: string;
}): ReactNode {
  const [query, setQuery] = useState('');
  const history = useHistory();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    history.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <form className={styles.search} onSubmit={submit} role="search">
      <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <input
        className={styles.searchInput}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search the documentation"
      />
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */

/** Two-column hero: copy on the left, `aside` (the pipeline graphic) right.
 *  The dot grid and the corner glow are the artboard's background layers. */
export function Hero({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}): ReactNode {
  return (
    <div className={styles.hero}>
      <div className={styles.heroDots} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>{children}</div>
        {aside ? <div className={styles.heroAside}>{aside}</div> : null}
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }): ReactNode {
  return (
    <span className={styles.eyebrow}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
        <path
          d="m8.5 12 2.5 2.5 4.5-5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

/** The searches people actually run, offered as one-click links. */
export function Hints({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.hints}>{children}</div>;
}

export function Hint({
  to,
  mono,
  children,
}: {
  to: string;
  /** A literal (a config key, a header name) set in mono ahead of the label.
   *  A prop rather than <code> in MDX, which the global inline-code chrome
   *  would draw a box inside the chip. */
  mono?: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.hint}>
      {mono ? <span className={styles.hintMono}>{mono}</span> : null}
      {mono && children ? ' ' : null}
      {children}
    </Link>
  );
}

/* ─── Section header ──────────────────────────────────────────────── */

/** An eyebrow, a title, an optional marker, and a lead paragraph. */
export function Section({
  eyebrow,
  title,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  badge?: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionEyebrow}>{eyebrow}</div>
      <h2 className={styles.sectionTitle}>
        {title}
        {badge ? <span className={styles.badgeMarker}>{badge}</span> : null}
      </h2>
      {children ? <div className={styles.sectionDesc}>{children}</div> : null}
    </div>
  );
}

/* ─── Hairline grid ──────────────────────────────────────────────── */

/** Cells separated by one-pixel gaps over a border, so the grid reads as a
 *  single object rather than a row of floating cards. */
export function HairlineGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}): ReactNode {
  return (
    <div className={styles.hairlineGrid} data-columns={columns}>
      {children}
    </div>
  );
}

export function Cell({
  title,
  query,
  muted,
  graphic,
  children,
}: {
  title: string;
  /** The query language chip, right-aligned in the cell header. */
  query?: string;
  /** Renders the title in secondary ink, for the one cell that is an aside. */
  muted?: boolean;
  graphic?: ReactNode;
  children?: ReactNode;
}): ReactNode {
  return (
    <div className={styles.cell}>
      <div className={styles.cellHead}>
        <span className={muted ? styles.cellTitleMuted : styles.cellTitle}>{title}</span>
        {query ? <span className={styles.cellQuery}>{query}</span> : null}
      </div>
      {graphic}
      {children ? <div className={styles.cellDesc}>{children}</div> : null}
    </div>
  );
}

/** A cell whose title links. Same shell, whole cell is the hit target. */
export function CellLink({
  title,
  to,
  graphic,
  children,
}: {
  title: string;
  to: string;
  graphic?: ReactNode;
  children?: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.cell}>
      <div className={styles.cellHead}>
        <span className={styles.cellTitle}>{title}</span>
      </div>
      {graphic}
      {children ? <div className={styles.cellDesc}>{children}</div> : null}
    </Link>
  );
}

export function CellLinks({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.cellLinks}>{children}</div>;
}

export function CellRoute({ to, children }: { to: string; children: ReactNode }): ReactNode {
  return (
    <Link to={to} className={styles.cellRoute}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12h14m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}

/* ─── Capability claims ──────────────────────────────────────────── */

export function CapCell({
  icon,
  title,
  to,
  children,
}: {
  icon: ReactNode;
  title: string;
  to?: string;
  children: ReactNode;
}): ReactNode {
  const body = (
    <>
      {icon}
      <div className={styles.capTitle}>{title}</div>
      <div className={styles.capDesc}>{children}</div>
    </>
  );
  return to ? (
    <Link to={to} className={styles.cell}>
      {body}
    </Link>
  ) : (
    <div className={styles.cell}>{body}</div>
  );
}

/* ─── Start here: the agent panel ────────────────────────────────── */

/** Two columns: numbered steps left, the config block right. */
export function SplitPanel({
  steps,
  children,
}: {
  steps: ReactNode;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.splitPanel}>
      <div>{steps}</div>
      <div className={styles.splitPanelAside}>{children}</div>
    </div>
  );
}

export function Steps({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.steps}>{children}</div>;
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <div className={styles.step}>
      <div className={styles.stepNumber}>{n}</div>
      <div>
        <div className={styles.stepTitle}>{title}</div>
        {children ? <p className={styles.stepDesc}>{children}</p> : null}
      </div>
    </div>
  );
}

/** The footnote under the config block: the other ways in. */
export function Alternatives({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.alternatives}>{children}</div>;
}

/* ─── Task lists ("What do you want to do?") ─────────────────────── */

export function TaskColumns({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.taskColumns}>{children}</div>;
}

export function TaskGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.taskGroup}>
      <div className={styles.taskGroupTitle}>{title}</div>
      {children}
    </div>
  );
}

/** One task: what you want to do, and where it happens. */
export function Task({
  to,
  dest,
  children,
}: {
  to: string;
  dest: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.task}>
      <span className={styles.taskLabel}>{children}</span>
      <span className={styles.taskDest}>{dest}</span>
    </Link>
  );
}

/* ─── AI two-up ──────────────────────────────────────────────────── */

export function AiCard({
  to,
  title,
  graphic,
  cta,
  children,
}: {
  to: string;
  title: string;
  graphic: ReactNode;
  cta: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.aiCard}>
      {graphic}
      <div className={styles.aiTitle}>{title}</div>
      <div className={styles.aiDesc}>{children}</div>
      <span className={styles.aiCta}>{cta} &rarr;</span>
    </Link>
  );
}

/* ─── Integration pills ──────────────────────────────────────────── */

export function Pills({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.pills}>{children}</div>;
}

export function Pill({
  to,
  accent,
  children,
}: {
  to: string;
  /** The last pill, which is the way into the catalogue. */
  accent?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={accent ? styles.pillAccent : styles.pill}>
      {children}
    </Link>
  );
}

/* ─── Deployment / capability badges ──────────────────────────────── */

export function Badges({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.badges}>{children}</div>;
}

export function Badge({ children }: { children: ReactNode }): ReactNode {
  return <span className={styles.badge}>{children}</span>;
}

export function TileGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}): ReactNode {
  return (
    <div className={styles.tileGrid} data-columns={columns}>
      {children}
    </div>
  );
}

export function Tile({
  title,
  description,
  icon,
  emoji,
  viewAllTo,
  viewAllLabel = 'View all options',
  children,
}: {
  title: string;
  description?: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.tile}>
      <div className={styles.tileHead}>
        <Glyph icon={icon} emoji={emoji} className={styles.tileIcon} />
        <div>
          <div className={styles.tileTitle}>{title}</div>
          {description ? (
            <div className={styles.tileDesc}>{description}</div>
          ) : null}
        </div>
      </div>
      <div className={styles.tileLinks}>{children}</div>
      {viewAllTo ? (
        <Link to={viewAllTo} className={styles.tileViewAll}>
          {viewAllLabel} →
        </Link>
      ) : null}
    </div>
  );
}

export function TileLink({
  to,
  icon,
  emoji,
  children,
}: {
  to: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.tileLink}>
      <Glyph icon={icon} emoji={emoji} className={styles.tileLinkIcon} />
      <span className={styles.tileLinkLabel}>{children}</span>
      <span className={styles.tileLinkArrow}>→</span>
    </Link>
  );
}

/* ─── Logo strip (popular integrations) ───────────────────────────── */

export function LogoStrip({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.logoStrip}>{children}</div>;
}

export function LogoTile({
  to,
  devIcon,
  icon,
  emoji,
  label,
}: {
  to: string;
  devIcon?: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  label: string;
}): ReactNode {
  return (
    <Link to={to} className={styles.logoTile}>
      <BrandLogo devIcon={devIcon} icon={icon} emoji={emoji} className={styles.logoTileIcon} />
      <span className={styles.logoTileLabel}>{label}</span>
    </Link>
  );
}

/* ─── Simple link cards (kept for "Popular docs") ─────────────────── */

export function HubGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}): ReactNode {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
}

/** A card. Without `to` it is a statement rather than a link, and stays static. */
export function HubCard({
  title,
  to,
  icon,
  emoji,
  children,
}: {
  title: string;
  to?: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  children?: ReactNode;
}): ReactNode {
  const body = (
    <>
      <div className={styles.cardHeader}>
        <Glyph icon={icon} emoji={emoji} className={styles.cardIcon} />
        <span className={styles.cardTitle}>{title}</span>
      </div>
      {children ? <span className={styles.cardDesc}>{children}</span> : null}
    </>
  );

  if (!to) {
    return <div className={`${styles.card} ${styles.cardStatic}`}>{body}</div>;
  }

  return (
    <Link to={to} className={styles.card}>
      {body}
    </Link>
  );
}
