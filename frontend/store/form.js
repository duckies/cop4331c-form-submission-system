import Vue from 'vue'

export const state = () => ({
  status: 'unloaded',
  form: {},
  forms: [],
  answers: {},
  error: null
})

export const getters = {
  activeQuestions(state) {
    if (!state.form.questions) {
      return []
    }

    return state.form.questions.filter((q) => q.deleted === false)
  }
}

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
  setForm(state, form) {
    state.form = form
  },
  setForms(state, forms) {
    state.forms = forms
  },
  addForm(state, form) {
    state.forms.push(form)
  },
  replaceForm(state, form) {
    if (state.forms.length > 0) {
      Vue.set(
        state.forms,
        state.forms.findIndex((f) => f.id === form.id),
        form
      )
    }
  },
  removeForm(state, id) {
    Vue.delete(
      state.forms,
      state.forms.findIndex((f) => f.id === id)
    )
  },
  setQuestion(state, question) {
    const index = state.form.questions.findIndex((q) => q.id === question.id)

    // Adding properties to an object is not tracked by Vue without special
    // methods like this.
    Vue.set(state.form.questions, index, question)
  },
  setQuestionOrders(state, questions) {
    for (const index in questions) {
      questions[index].order = parseInt(index)
    }

    state.form.questions = questions
  },
  addQuestion(state, question) {
    state.form.questions.push(question)
  },
  deleteQuestion(state, id) {
    Vue.delete(
      state.form.questions,
      state.form.questions.findIndex((q) => q.id === id)
    )
  },
  setAnswer(state, data) {
    Vue.set(state.answers, data.id, data.value)
  },
  setAnswers(state, answers) {
    state.answers = Object.assign({}, answers)
  },
  initializeAnswers(state) {
    if (state.form && state.form.questions) {
      for (const question of state.form.questions) {
        if (question.deleted) continue

        let value

        if (question.multiple) {
          value = []
        } else if (question.type === 'Checkbox') {
          value = false
        } else if (question.type === 'FileInput') {
          value = null
        } else {
          value = ''
        }

        Vue.set(state.answers, question.id, value)
      }
    }
  },
  clearAnswers(state) {
    state.answers = Object.assign({})
  }
}

export const actions = {
  async getForm({ commit }, id) {
    try {
      commit('setLoading')
      const data = await this.$axios.$get(`/form/${id}`)
      commit('setForm', data)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async getForms({ commit }, query) {
    try {
      commit('setLoading')
      const data = await this.$axios.$get(
        `/form?take=${query.take}&skip=${query.skip}`
      )
      commit('setForms', data)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async createForm({ commit }, data) {
    try {
      commit('setLoading')
      const resp = await this.$axios.$post('/form', data)
      commit('addForm', resp)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async submitForm({ commit, state }, formId) {
    try {
      commit('setLoading')
      const formData = new FormData()

      // FormData can receive arrays based on repeatedly appending values
      // with the same key, so we detect arrays and add its values iteratively.
      for (const id in state.answers) {
        if (Array.isArray(state.answers[id])) {
          for (const value of state.answers[id]) {
            formData.append(id, value)
          }
        } else {
          formData.append(id, state.answers[id])
        }
      }

      await this.$axios.$post(`/submission/${formId}`, formData)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async updateForm({ commit }, { data, array }) {
    try {
      commit('setLoading')

      const { id, lastUpdated, ...attributes } = data

      const form = await this.$axios.$patch(`/form/${id}`, attributes)

      if (array) {
        commit('replaceForm', form)
      } else {
        commit('setForm', form)
      }

      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async deleteForm({ commit }, id) {
    try {
      commit('setLoading')

      await this.$axios.$delete(`/form/${id}`, id)

      commit('removeForm', id)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  },
  async deleteQuestion({ commit }, id) {
    try {
      commit('setLoading')
      await this.$axios.$delete(`/question/${id}`)
      commit('deleteQuestion', id)
      commit('setSuccess')
    } catch (error) {
      commit('setFailure', error)
    }
  }
}
