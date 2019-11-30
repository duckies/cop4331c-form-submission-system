<template>
  <v-app>
    <v-app-bar app elevate-on-scroll class="header" dark>
      <nuxt-link nuxt to="/admin" active-class="bogus" class="page-title">
        <v-toolbar-title>Form Submission System</v-toolbar-title>
      </nuxt-link>

      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text>
            Admin <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="$auth.logout()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-slot:extension v-if="$route.params.id">
        <v-tabs align-with-title class="extension">
          <v-tab
            :to="{
              name: 'admin-form-id-edit',
              params: { id: $route.params.id }
            }"
            nuxt
            >Questions</v-tab
          >
          <v-tab
            :to="{
              name: 'admin-form-id-submissions',
              params: { id: $route.params.id }
            }"
            nuxt
            >Responses</v-tab
          >
        </v-tabs>
      </template>
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
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-family: 'Roboto Mono', monospace;
}
</style>
