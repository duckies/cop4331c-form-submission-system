export default function({ $axios, app, redirect }) {
  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status)

    // If the token expires we will catch an unauthenticated request.
    if (code === 401) {
      app.$auth.logout()
      redirect('/admin/login')
    }
  })
}
