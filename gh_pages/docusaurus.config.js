// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import remarkBoardVars from './plugins/remarkBoardVars.mjs';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Getting Started with ZephyrOS',
  tagline: 'Microchip Masters Lab Manual  -  24020 FRM6',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Serve lab_manuals/static/ as a second static root so that images placed
  // in lab_manuals/static/images/ are available at /images/ in both dev and
  // production — no symlinks needed, works with the dev server out of the box.
  staticDirectories: ['static', '../lab_manuals/static'],

  url: 'https://sarpuser.github.io',
  baseUrl: '/getting-started-with-zephyr/',

  organizationName: 'sarpuser',
  projectName: 'getting-started-with-zephyr',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    function noSymlinkResolution() {
      return {
        name: 'no-symlink-resolution',
        configureWebpack() {
          // Keep symlink paths unresolved so that same54/ and pic32bz6/
          // are seen as separate docs and the remark board-vars plugin
          // can detect the board from the file path.
          return { resolve: { symlinks: false } };
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../lab_manuals/src',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          exclude: ['**/shared/**'],
          remarkPlugins: [remarkBoardVars],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Getting Started with ZephyrOS',
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'same54Sidebar',
            label: 'SAME54',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'pic32bz6Sidebar',
            label: 'PIC32BZ6',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'appendicesSidebar',
            label: 'Appendices',
            position: 'left',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Microchip Technology Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['cmake', 'powershell'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
          {
            className: 'code-block-bold-line',
            line: 'bold-next-line',
            block: {start: 'bold-start', end: 'bold-end'},
          },
          {
            className: 'code-block-add-line',
            line: 'add-next-line',
            block: {start: 'add-start', end: 'add-end'},
          },
          {
            className: 'code-block-delete-line',
            line: 'delete-next-line',
            block: {start: 'delete-start', end: 'delete-end'},
          },
          {
            className: 'code-block-delete-line',
            line: 'remove-next-line',
            block: {start: 'remove-start', end: 'remove-end'},
          },
        ],
      },
    }),
};

export default config;
