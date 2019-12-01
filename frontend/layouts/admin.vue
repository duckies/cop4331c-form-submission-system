<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary app>
      <v-list nav>
        <v-list-item
          v-for="tab in tabs"
          :key="tab.text"
          :to="tab.to"
          nuxt
          link
          exact
        >
          <v-list-item-icon>
            <v-icon v-text="tab.icon" />
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ tab.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="$auth.logout()" block>Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app elevate-on-scroll class="header" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <nuxt-link nuxt to="/admin" class="page-title">
        <v-toolbar-title class="primary--text"
          >Form Submission System</v-toolbar-title
        >
      </nuxt-link>

      <v-spacer></v-spacer>

      <v-tabs class="d-none d-md-flex">
        <v-tab v-for="tab in tabs" :key="tab.name" :to="tab.to" exact nuxt>
          {{ tab.text }}
        </v-tab>
      </v-tabs>

      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text class="d-none d-md-flex">
            Admin <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="$auth.logout()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      drawer: false,
      title: 'Admin Panel'
    }
  },
  computed: {
    tabs() {
      return [
        {
          text: 'Home',
          to: {
            name: 'admin'
          },
          show: true,
          icon: 'mdi-home'
        },
        {
          text: 'Form',
          to: {
            name: 'admin-form-id-edit',
            params: { id: this.$route.params.id }
          },
          show: this.$route.params.id,
          icon: 'mdi-help'
        },
        {
          text: 'Submissions',
          to: {
            name: 'admin-form-id-submissions',
            params: { id: this.$route.params.id }
          },
          show: this.$route.params.id,
          icon: 'mdi-folder'
        },
        {
          text: 'Submission',
          to: {
            name: 'admin-form-id-submission-sub',
            params: { id: this.$route.params.id, sub: this.$route.params.sub }
          },
          show: this.$route.params.sub,
          icon: 'mdi-folder-account'
        }
      ].filter((tab) => tab.show !== undefined)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-family: Roboto, sans-serif;
  font-weight: bold;
  margin-right: 20px;
}
</style>
