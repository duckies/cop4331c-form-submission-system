<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 style="display: inline-block;">{{ form.title }}</h1>
        <p v-if="form.description" v-html="form.description" />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-list rounded>
          <v-list-item-group>
            <v-list-item
              v-for="submission in submissions"
              :key="submission.id"
              :to="{
                name: 'admin-form-id-submission-sub',
                params: { id: $route.params.id, sub: submission.id }
              }"
              class="submission-item"
            >
              <v-list-item-icon>
                <v-icon>mdi-format-list-checks</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  >Submission ID: {{ submission.id }}</v-list-item-title
                >
                <v-list-item-subtitle
                  >Submitted
                  {{ relativeDate(submission.createdOn) }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import formatRelative from 'date-fns/formatRelative'
import Field from '@/components/fields/Field.vue'

export default {
  layout: 'admin',
  head() {
    return {
      title: `Editing '${this.form.title}'`
    }
  },
  components: {
    Field
  },
  data() {
    return {
      headers: [
        { text: 'id', value: 'id' },
        { text: 'Created', value: 'createdAt' }
      ]
    }
  },
  computed: {
    submisisons() {
      return this.$store.state.submission.submissions
    },
    form: {
      get() {
        return this.$store.state.form.form
      },
      set(value) {
        // This currently doesn't work, we will need a custom
        // method when a field is dragged to properly find
        // the one that moved and update the order via a patch request.
        return this.$store.commit('setForm', value)
      }
    },
    submissions() {
      return this.$store.state.submission.submissions
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('submission/getSubmissions', params.id)
  },
  methods: {
    relativeDate(date) {
      const then = new Date(date)
      const now = new Date()
      return formatRelative(then, now)
    }
  }
}
</script>
