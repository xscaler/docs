import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'xScaler Labs Docs',
  tagline: 'Managed Metrics Backend — Prometheus-compatible, built for scale',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://xscaler.github.io',
  baseUrl: '/docs/',

  organizationName: 'xscaler',
  projectName: 'docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'xScaler Labs',
      logo: {
        alt: 'xScaler Labs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://xscalerlabs.com',
          label: 'Dashboard',
          position: 'right',
        },
        {
          href: 'https://xscalerlabs.com/support',
          label: 'Support',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Get Started',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Quick Start', to: '/getting-started' },
            { label: 'Authentication', to: '/authentication' },
            { label: 'Regions & Endpoints', to: '/regions' },
          ],
        },
        {
          title: 'Send Metrics',
          items: [
            { label: 'Prometheus remote_write', to: '/ingest/prometheus-remote-write' },
            { label: 'Grafana Alloy', to: '/ingest/grafana-alloy' },
            { label: 'OpenTelemetry Collector', to: '/ingest/opentelemetry-collector' },
          ],
        },
        {
          title: 'Links',
          items: [
            { label: 'Dashboard', href: 'https://xscalerlabs.com' },
            { label: 'Support', href: 'https://xscalerlabs.com/support' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} xScaler Labs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'yaml', 'python', 'go', 'promql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
