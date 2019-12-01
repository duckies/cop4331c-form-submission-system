import { join } from 'path'
import colors from 'vuetify/es5/util/colors'
require('dotenv').config({ path: join(__dirname, '../config.env') })

export default {
  mode: 'universal',

  server: {
    port: process.env.FRONTEND_PORT || 3030,
    host: process.env.FRONTEND_HOST || '127.0.0.1'
  },
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s',
    title: 'Form Submission System',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto+Mono:400,700&display=swap'
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['~/assets/styles.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/vee-validate', '~/plugins/axios'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],
  /**
   * Dotenv Configuration
   * See https://github.com/nuxt-community/dotenv-module
   */
  dotenv: {
    only: [],
    path: join(__dirname, '..'),
    filename: 'config.env',
    systemvars: true
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    https: process.env.BACKEND_HTTPS || false,
    host: process.env.BACKEND_HOST || '127.0.0.1',
    port: process.env.BACKEND_PORT || 3000
  },

  auth: {
    redirect: {
      login: '/admin/login',
      logout: '/admin/login',
      home: '/admin'
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/login', method: 'post', propertyName: 'token' },
          logout: false,
          user: false
        }
      }
    }
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    icons: { iconFont: 'mdiSvg' },
    customVariables: ['~/assets/variables.scss'],
    frameworkOptions: {
      theme: {
        dark: true,
        themes: {
          dark: {
            primary: '#cddc39',
            accent: colors.grey.darken3,
            secondary: colors.amber.darken3,
            info: colors.teal.lighten1,
            warning: colors.amber.base,
            error: colors.deepOrange.accent4,
            success: colors.green.accent3
          }
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
    transpile: ['vee-validate/dist/rules'],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
}
