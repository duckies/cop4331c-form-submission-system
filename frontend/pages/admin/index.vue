<template>
  <v-container>
    <!-- Dialog for creating a form -->
    <v-dialog v-model="createDialog" max-width="500">
      <validation-observer ref="form" v-slot="{ passes, invalid }">
        <v-card>
          <v-card-title>Form Creation</v-card-title>

          <v-alert v-if="showCreateError" type="error">
            {{ formError }}
          </v-alert>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12">
                  <validation-provider
                    v-slot="{ errors }"
                    vid="title"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempForm.title"
                      :error-messages="errors"
                      name="title"
                      label="Form Title"
                      hint="The title must be unique."
                      persistent-hint
                      required
                      outlined
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" sm="12">
                  <validation-provider v-slot="{ errors }">
                    <v-textarea
                      v-model="tempForm.description"
                      :error-messages="errors"
                      name="description"
                      label="Form Description"
                      hint="Optional body of text or HTML to show below a form title."
                      persistent-hint
                      outlined
                    />
                  </validation-provider>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="createDialog = false" text>Nevermind</v-btn>
            <v-btn
              @click="passes(createForm)"
              :loading="formLoading"
              :disabled="invalid"
              text
              >Create Form</v-btn
            >
          </v-card-actions>
        </v-card>
      </validation-observer>
    </v-dialog>

    <!-- Dialog for deleting a form -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Delete form?</v-card-title>

        <v-card-text
          >Deletion of a form will permanently remove all data, including
          submissions, of a form. This cannot be undone.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false" text>Nevermind</v-btn>
          <v-btn @click="deleteForm" :loading="formLoading" color="error" text>
            Delete Form
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for renaming a form -->
    <v-dialog v-model="renameDialog" max-width="500">
      <validation-observer ref="renameForm" v-slot="{ passes }">
        <v-form @submit.prevent="passes(renameForm)">
          <v-card>
            <v-card-title>Rename</v-card-title>

            <v-card-subtitle>
              Enter the new name for the form:
            </v-card-subtitle>

            <v-card-text>
              <validation-provider v-slot="{ errors }" vid="title">
                <v-text-field
                  v-model="tempForm.title"
                  :error-messages="errors"
                  required
                  label="Title"
                />
              </validation-provider>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn @click="renameDialog = false" text>Cancel</v-btn>
              <v-btn type="submit" text>Rename</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </validation-observer>
    </v-dialog>

    <v-row>
      <v-col>
        <h2>Forms</h2>
        <p>
          The management panel has {{ forms.length }} form{{
            forms.length !== 1 ? 's' : ''
          }}
          loaded.
        </p>
      </v-col>
    </v-row>

    <v-card>
      <!-- I don't know if I like this for now. -->
      <v-row>
        <v-col>
          <v-toolbar flat>
            <v-toolbar-title>
              Form Actions
            </v-toolbar-title>

            <v-spacer />

            <v-btn @click="createDialog = true" text>Create a Form</v-btn>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-list rounded>
            <v-list-item-group>
              <v-list-item
                v-for="form in forms"
                :key="form.id"
                :to="{
                  name: 'admin-form-id-edit',
                  params: { id: form.id }
                }"
                class="form-item"
              >
                <v-list-item-icon>
                  <v-icon>mdi-format-list-checks</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{ form.title }}</v-list-item-title>
                  <v-list-item-subtitle
                    >Created
                    {{ relativeDate(form.createdOn) }}</v-list-item-subtitle
                  >
                </v-list-item-content>

                <v-list-item-action>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" @click.stop.prevent icon>
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item @click="setupRenameDialog(form)">
                        <v-list-item-icon>
                          <v-icon>mdi-format-size</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Rename</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="setupDeleteDialog(form.id)">
                        <v-list-item-icon>
                          <v-icon>mdi-trash-can</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        :to="{
                          name: 'admin-form-edit-id',
                          params: { id: form.id }
                        }"
                        target="_blank"
                      >
                        <v-list-item-icon>
                          <v-icon>mdi-arrow-top-right</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Open in New Tab</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import formatRelative from 'date-fns/formatRelative'

export default {
  layout: 'admin',
  head() {
    return {
      title: 'Admin Panel'
    }
  },
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data: () => {
    return {
      createDialog: false,
      renameDialog: false,
      deleteDialog: false,
      tempForm: {
        title: '',
        description: ''
      },
      tempId: -1,
      showCreateError: false
    }
  },
  computed: {
    forms() {
      return this.$store.state.form.forms
    },
    formLoading() {
      return this.$store.state.form.status === 'loading'
    },
    formError() {
      return this.$store.state.form.error
    }
  },
  async fetch({ store }) {
    try {
      await store.dispatch('form/getForms', { take: 100, skip: 0 })
    } catch (error) {
      console.error(error)
    }
  },
  methods: {
    async createForm() {
      await this.$store.dispatch('form/createForm', this.tempForm)

      if (!this.formError) {
        // Clearing these if we want to create another form.
        this.createDialog = false
        this.tempForm.title = ''
        this.tempForm.description = ''
      } else if (
        this.formError.response &&
        this.formError.response.status === 409
      ) {
        this.$refs.form.setErrors({
          title: ['This title is already taken.']
        })
      }
    },
    relativeDate(date) {
      const then = new Date(date)
      const now = new Date()
      return formatRelative(then, now)
    },
    setupRenameDialog(form) {
      this.tempForm = Object.assign({}, form)
      this.renameDialog = true
    },
    setupDeleteDialog(id) {
      this.tempId = id
      this.deleteDialog = true
    },
    async deleteForm() {
      await this.$store.dispatch('form/deleteForm', this.tempId)
      this.deleteDialog = false
    },
    async renameForm() {
      await this.$store.dispatch('form/updateForm', {
        data: {
          id: this.tempForm.id,
          title: this.tempForm.title
        },
        array: true
      })

      if (!this.formError) {
        this.renameDialog = false
      } else if (
        this.formError.response &&
        this.formError.response.status === 409
      ) {
        this.$refs.renameForm.setErrors({
          title: ['This title is already taken.']
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  background-color: lighten(#212121, 3%);
}
</style>
