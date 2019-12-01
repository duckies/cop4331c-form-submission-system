import Vue from 'vue'

export const state = () => ({
  status: 'unloaded',
  question: {
    title: '',
    label: '',
    type: '',
    required: false,
    choices: [],
    multiple: false,
    fileMaxCount: 1,
    deleted: false,
    formId: -1,
    mimeTypes: []
  },
  error: null
})

export const mutations = {
  setLoading(state) {
    state.status = 'loading'
    state.error = null
  },
  setSuccess(state) {
    state.status = 'success'
  },
  setFailure(state, error) {
    state.status = 'error'
    state.error = error
  },
  setQuestionProperty(state, record) {
    Vue.set(state.question, record.property, record.value)
  }
}

export const actions = {
  async createQuestion({ commit, state }, data) {
    try {
      commit('setLoading')

      const question = Object.assign(
        {},
        {
          title: state.question.title,
          type: state.question.type,
          order: data.order,
          formId: data.formId,
          required: state.question.required
        }
      )

      if (
        state.question.type === 'Dropdown' ||
        state.question.type === 'Checkbox' ||
        state.question.type === 'Radio'
      ) {
        Object.assign(question, {
          choices: state.question.choices
        })
      }

      if (
        state.question.type === 'Dropdown' ||
        state.question.type === 'Checkbox' ||
        state.question.type === 'FileInput'
      ) {
        Object.assign(question, {
          multiple: state.question.multiple
        })
      }

      if (state.question.type === 'FileInput') {
        Object.assign(question, {
          fileMaxCount: parseInt(state.question.fileMaxCount),
          mimeTypes: state.question.mimeTypes
        })
      }

      const resp = await this.$axios.$post('/question', question)

      commit('form/addQuestion', resp, { root: true })
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async reorderQuestion({ commit }, data) {
    try {
      commit('setLoading')
      await this.$axios.$patch(`/question/reorder`, data)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure')
    }
  }
}
