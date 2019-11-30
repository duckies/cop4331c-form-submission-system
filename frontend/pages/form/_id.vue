<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>{{ form.title }}</h1>
        <p v-if="form.description">
          {{ form.description }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <validation-observer v-slot="{ invalid, handleSubmit }">
          <v-form @submit.prevent="handleSubmit(submit)">
            <field
              v-for="question in questions"
              :key="question.id"
              :question="question"
              v-on="$listeners"
            />
            <v-btn type="submit">Submit</v-btn>
          </v-form>
        </validation-observer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationObserver } from 'vee-validate'
import Field from '@/components/fields/Field.vue'

export default {
  components: {
    Field,
    ValidationObserver
  },
  computed: {
    form() {
      return this.$store.state.form.form
    },
    questions() {
      return this.$store.state.form.form.questions.filter(
        (q) => q.deleted === false
      )
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('form/getForm', params.id)
    // Initializing answers is required to prevent issues with
    // the checkbox field. It will v-model and see no data,
    // but if marked required will expect "false".
    store.commit('form/initializeAnswers')
  },
  head() {
    return {
      title: this.form.title
    }
  },
  methods: {
    async submit() {
      await this.$store.dispatch('form/submitForm', this.form.id)
    }
  }
}
</script>
