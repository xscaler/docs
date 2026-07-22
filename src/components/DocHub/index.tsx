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

/* ─── Hero wrapper ────────────────────────────────────────────────── */

export function Hero({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.hero}>{children}</div>;
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

export function HubCard({
  title,
  to,
  icon,
  emoji,
  children,
}: {
  title: string;
  to: string;
  icon?: keyof typeof ICONS;
  emoji?: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardHeader}>
        <Glyph icon={icon} emoji={emoji} className={styles.cardIcon} />
        <span className={styles.cardTitle}>{title}</span>
      </div>
      {children ? <span className={styles.cardDesc}>{children}</span> : null}
    </Link>
  );
}
