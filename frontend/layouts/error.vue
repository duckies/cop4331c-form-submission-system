<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="5">
        <v-card>
          <v-card-title>
            <h1 v-if="error.statusCode === 404">
              {{ pageNotFound }}
            </h1>
            <h1 v-else>
              {{ otherError }}
            </h1>
          </v-card-title>
          <v-card-text>
            <p v-if="error.statusCode === 404">
              The page you were looking for does not exist, please check the url
              and try again.
            </p>
            <v-btn @click="$router.go(-1)" color="info">Go Back</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
