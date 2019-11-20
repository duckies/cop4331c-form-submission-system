<template>
  <v-file-input :name="question.id" :multiple="question.multiple" @change="fileChange" />
</template>

<script>
export default {
  name: 'FileInput',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  data: () => {
    return {
      formData: {}
    }
  },
  methods: {
    fileChange(fileList) {
      console.log(fileList)
      const formData = new FormData()

      if (!fileList.length) return

      Array.from(Array(fileList).keys()).map((x) => formData.append('name', fileList[x]))

      this.formData = formData
    }
  }
}
</script>
