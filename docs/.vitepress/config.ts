import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue Intl Controller',

  description:
    'Vue Intl Controller is a plugin for Vue 3 that integrates FormatJS Intl into your Vue applications for easier internationalisation.',

  lang: 'en-GB',

  cleanUrls: true,

  themeConfig: {
    siteTitle: 'Vue Intl Controller',
    nav: [
      { text: 'Docs', link: '/guide/intro' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting started',
          items: [
            {
              link: '/guide/intro',
              text: 'What is Vue Intl Controller?',
            },
            {
              link: '/guide/installation',
              text: 'Installation',
            },
          ],
        },
        {
          text: 'Plugin',
          items: [
            {
              link: '/guide/plugin/setup',
              text: 'Setting up the plugin',
            },
            {
              link: '/guide/plugin/plugin',
              text: 'Additional plugin uses',
            },
          ],
        },
        {
          text: 'Controller',
          items: [
            {
              link: '/guide/controller/concept',
              text: 'The controller concept',
            },
            {
              link: '/guide/controller/configuration',
              text: 'Configuring the controller',
            },
            {
              link: '/guide/controller/data',
              text: 'Accessing the controller data',
            },
            {
              link: '/guide/controller/methods',
              text: 'Using controller methods',
            },
            {
              link: '/guide/controller/events',
              text: 'Listening to controller events',
            },
          ],
        },
        {
          text: 'Extras',
          items: [
            {
              link: '/guide/extras/rollup',
              text: 'Precompiling messages',
            },
            {
              link: '/guide/extras/compact-numbers',
              text: 'Compact numbers',
            },
            {
              link: '/guide/extras/relative-time',
              text: 'Relative time',
            },
          ],
        },
      ],
      '/api': [
        {
          text: 'Options',
          items: [
            {
              link: '/api/controller/options',
              text: 'Controller options',
            },
            {
              link: '/api/plugin/options',
              text: 'Plugin options',
            },
          ],
        },
        {
          text: 'Mixin',
          items: [
            {
              link: '/api/plugin/mixin',
              text: 'Global mixin',
            },
          ],
        },
      ],
    },
    editLink: {
      pattern:
        'https://github.com/brawaru/vue-intl-controller/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT Licence.',
      copyright: `Copyright © ${new Date().getFullYear()} Alexander ‘Brawaru’ Sorokin.`,
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/brawaru/vue-intl-controller',
      },
    ],
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark-dimmed',
    },
  },
  lastUpdated: true,
})
