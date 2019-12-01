<template>
  <v-text-field
    v-model="data"
    :name="question.id"
    :label="question.label"
    :required="question.required"
    :readonly="readonly"
    :error-messages="errors"
    filled
  />
</template>

<script>
export default {
  name: 'TextInput',
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
