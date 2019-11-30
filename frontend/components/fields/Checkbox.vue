<template>
  <div>
    <!-- The value binding will combine answers into an array. -->
    <v-checkbox
      v-for="(choice, i) in question.choices"
      :key="i"
      v-model="data"
      :name="question.id"
      :label="choice"
      :required="question.required"
      :value="choice"
      :readonly="readonly"
      :multiple="question.multiple"
      :error-messages="errors"
      outlined
    />
  </div>
</template>

<script>
export default {
  name: 'Checkbox',
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
