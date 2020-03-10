module.exports = {
  title: 'Hookstate',
  tagline: 'The simple but incredibly fast and flexible state management that is based on React state hook',
  url: 'https://hookstate.js.org',
  baseUrl: '/',
  favicon: 'img/favicon-32.png',
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'avkonst/hookstate', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      title: 'Hookstate',
      logo: {
        alt: 'Hookstate',
        src: 'img/favicon-196.png',
      },
      links: [
        {to: 'docs/getting-started', label: 'Docs', position: 'left'},
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/avkonst/hookstate',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting started',
              to: 'docs/getting-started',
            },
            {
              label: 'API reference',
              to: 'docs/typedoc-hookstate-core',
            },
          ],
        },
        {
          title: 'Extensions',
          items: [
            {
              label: 'Standard plugins',
              href: 'docs/extensions',
            },
            {
              label: 'Development tools',
              href: 'docs/devtool',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              href: 'https://hookstate.js.org/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/avkonst/hookstate',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/avkonst/hookstate/issues?q=is%3Aissue+is%3Aopen+label%3Aquestion',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hookstate.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
