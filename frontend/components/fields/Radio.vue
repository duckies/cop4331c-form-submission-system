<template>
  <v-radio-group v-model="data">
    <v-radio
      v-for="(choice, i) in question.choices"
      :key="i"
      :name="question.id"
      :label="choice"
      :required="question.required"
      :readonly="readonly"
      :value="choice"
      :error-messages="errors"
    />
  </v-radio-group>
</template>

<script>
export default {
  name: 'Radio',
  props: {
    question: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      required: false,
      default: false
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    errors: {
      type: Array,
      required: false,
      default: null
    }
  },
  computed: {
    data: {
      get() {
        return this.$store.state.form.answers[this.question.id]
      },
      set(value) {
        this.$store.commit('form/setAnswer', {
          id: this.question.id,
          value
        })
      }
    }
  }
}
</script>
