export const state = () => ({
  status: 'unloaded',
  submission: {},
  submissions: []
})

export const mutations = {
  setStatus(state, status) {
    state.status = status
  },
  setSubmission(state, submission) {
    state.submission = submission
  },
  setSubmissions(state, submissions) {
    state.submissions = submissions
  }
}

export const actions = {
  async getSubmission({ commit }, id) {
    commit('setStatus', 'loading')
    const data = await this.$axios.$get(`/submission/${id}`)
    const { form, ...submission } = data
    commit('setSubmission', submission)
    commit('form/setForm', form, { root: true })
    commit('form/setAnswers', submission.answers, { root: true })
    commit('setStatus', 'success')
  },
  async getSubmissions({ commit }, id) {
    commit('setStatus', 'loading')
    const data = await this.$axios.$get(`/submission/form/${id}`)
    commit('setSubmissions', data)
    commit('setStatus', 'success')
  }
}
