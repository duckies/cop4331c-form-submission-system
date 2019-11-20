<template>
  <v-layout column justify-center align-center>
    <v-flex>
      <v-card v-for="question in schema" :key="question.uuid" class="mb-4">
        <v-card-title class="headline">{{ question.title }}</v-card-title>

        <v-card-text>
          <component
            :is="question.type"
            v-model="data[question.uuid]"
            :items="question.choices"
            :multiple="question.multiple"
            :question="question"
          />
        </v-card-text>
      </v-card>
      <v-btn color="primary" @click="submit">Submit</v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import FileInput from '@/components/FileInput.vue'

export default {
  components: { FileInput },
  data: () => {
    return {
      schema: [
        {
          uuid: '986ed96c-30aa-426a-b70c-ce7668415966',
          title: "What's your name?",
          type: 'v-textarea'
        },
        {
          uuid: 'c54c31c5-3736-4ec4-9923-2fd02eb08a05',
          title: 'Preferred fruit?',
          type: 'v-select',
          choices: ['Apple', 'Banana'],
          multiple: true
        },
        {
          uuid: '7bded8aa-6ee1-4d9f-8f6e-e8a2a63b54e3',
          title: 'Upload all the things!',
          type: 'v-file-input',
          multiple: true
        }
      ],
      data: {}
    }
  },
  methods: {
    async submit() {
      const formData = new FormData()

      Object.keys(this.data).forEach((uuid) => {
        // Split array so we submit 1 value per key.
        // We would also split files, probably.
        if (Array.isArray(this.data[uuid])) {
          this.data[uuid].forEach((value) => {
            formData.append(uuid, value)
          })
        } else {
          formData.append(uuid, this.data[uuid])
        }
      })

      await this.$axios.$post('http://localhost:3000/submission/4', formData)
    }
  }
}
</script>
