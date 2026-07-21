import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

const config: Config = {
  title: 'xScaler Labs Docs',
  tagline: 'Managed Metrics Backend — Prometheus-compatible, built for scale',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.xscalerlabs.com',
  baseUrl: '/',

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

  themes: [
    '@docusaurus/theme-mermaid',
    'docusaurus-theme-openapi-docs',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        indexBlog: false,
        docsRouteBasePath: '/',
        searchBarPosition: 'auto',
      },
    ],
  ],

  plugins: [
    // The OpenAPI theme pulls in postman-code-generators for request samples,
    // which imports the Node `path` builtin. The Rspack bundler (enabled by
    // @docusaurus/faster) does not auto-polyfill Node core modules for the
    // browser bundle, so map `path` to its browser shim.
    function nodePolyfillPlugin() {
      return {
        name: 'node-polyfill-fallback',
        configureWebpack() {
          return {
            resolve: {
              fallback: {
                path: require.resolve('path-browserify'),
              },
            },
          };
        },
      };
    },
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          xscaler: {
            specPath: 'openapi/xscaler.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
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
          to: '/api/xscaler-customer-api',
          label: 'API',
          position: 'left',
        },
        {
          type: 'search',
          position: 'left',
        },
        {
          href: 'https://portal.xscalerlabs.com',
          label: 'Portal',
          position: 'right',
        },
        {
          href: 'https://portal.xscalerlabs.com/support',
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
            { label: 'Portal', href: 'https://portal.xscalerlabs.com' },
            { label: 'Support', href: 'https://portal.xscalerlabs.com/support' },
          ],
        },
        {
          title: 'Legal',
          items: [
            { label: 'Legal & Open Source Notices', to: '/legal' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms & Conditions', to: '/terms' },
            { label: 'Security', to: '/security' },
            { label: 'Cookie Policy', to: '/cookies' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} xScaler Ltd. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'yaml', 'python', 'go', 'promql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
