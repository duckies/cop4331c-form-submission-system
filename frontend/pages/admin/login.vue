<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="4">
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <v-form @submit.prevent="handleSubmit(login)">
            <v-card>
              <v-alert v-if="error" outlined type="error">
                {{ error }}
              </v-alert>
              <v-card-title class="card-headline"
                >Admin Panel Login</v-card-title
              >
              <v-card-text>
                <validation-provider
                  v-slot="{ errors }"
                  vid="password"
                  rules="required"
                >
                  <v-text-field
                    v-model="password"
                    :append-icon="pwdToggle ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="pwdToggle ? 'text' : 'password'"
                    :error-messages="errors"
                    @click:append="pwdToggle = !pwdToggle"
                    autofocus
                    password
                    prepend-inner-icon="mdi-key-variant"
                  />
                </validation-provider>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn type="submit" text>Sign In</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </validation-observer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'

export default {
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data: () => {
    return {
      error: null,
      password: '',
      pwdToggle: false
    }
  },
  methods: {
    login() {
      this.$auth
        .loginWith('local', {
          data: {
            id: 1,
            password: this.password
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$refs.form.setErrors({
              password: ['Your password could not be authenticated.']
            })
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-headline {
  font-family: 'Roboto Mono', monospace;
  text-align: center; // Not working?
  text-transform: uppercase;
}
</style>
