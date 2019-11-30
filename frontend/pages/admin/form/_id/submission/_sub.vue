<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>{{ form.title }}</h1>
        <field
          v-for="question in form.questions"
          :key="question.id"
          :question="question"
          readonly
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Field from '@/components/fields/Field.vue'

export default {
  layout: 'admin',
  head() {
    return {
      title: 'Viewing Submission'
    }
  },
  components: {
    Field
  },
  computed: {
    form() {
      return this.$store.state.form.form
    },
    submission() {
      return this.$store.state.submission.submission
    },
    answers() {
      return this.$store.state.form.answers
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('submission/getSubmission', params.sub)
  }
}
</script>
