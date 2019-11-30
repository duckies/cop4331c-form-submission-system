<template>
  <div>
    <!-- Question Editor Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <validation-observer v-slot="{ handleSubmit }">
        <v-card>
          <v-card-title>Edit Field</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error">
              {{ error }}
            </v-alert>

            <v-container>
              <v-form @submit.prevent="handleSubmit(onSubmit)">
                <v-row>
                  <v-col cols="12">
                    <validation-provider v-slot="{ errors }" rules="required">
                      <v-text-field
                        v-model="editedItem.title"
                        :errors-messages="errors"
                        label="Question Title"
                        required
                        outlined
                      />
                    </validation-provider>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.label"
                      label="Label"
                      outlined
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="editedItem.required"
                      label="Is the field required?"
                    />
                  </v-col>
                  <v-col v-if="canHaveChoices" cols="12">
                    <v-combobox
                      v-model="editedItem.choices"
                      label="What choices should the field have?"
                      hint="Press enter after each value to separate them."
                      chips
                      multiple
                    />
                  </v-col>
                  <v-col v-if="canHaveMultiple" cols="12">
                    <v-checkbox
                      v-model="editedItem.multiple"
                      :label="
                        `Should multiple ${
                          editedItem.type === 'FileInput'
                            ? 'file uploads'
                            : 'selections'
                        } be allowed?`
                      "
                    />
                  </v-col>
                  <v-col
                    v-if="
                      editedItem.type === 'FileInput' && editedItem.multiple
                    "
                    cols="12"
                  >
                    <v-slider
                      v-model="editedItem.fileMaxCount"
                      label="Number of uploads?"
                      thumb-label="always"
                      min="2"
                      max="10"
                      ticks
                    />
                  </v-col>
                  <v-col v-if="editedItem.type === 'FileInput'" cols="12">
                    <v-select
                      v-model="editedItem.mimeTypes"
                      :items="mimetypes"
                      multiple
                      item-text="extension"
                      item-value="mimetype"
                      label="Allowed file types"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="save" :loading="formLoading" type="submit" text
              >Save Changes</v-btn
            >
          </v-card-actions>
        </v-card>
      </validation-observer>
    </v-dialog>

    <!-- Question Deletion Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Delete question?</v-card-title>

        <v-card-text>
          Deleting a question will not delete any of its answers if there are
          any but will no longer appear on the form. Are you sure you wish to
          delete this question?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false" text>Nevermind</v-btn>
          <v-btn
            @click="deleteQuestion"
            :loading="formLoading"
            text
            color="error"
          >
            Delete Question
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="mb-4">
      <v-card-title>
        {{ question.title }}
      </v-card-title>

      <v-card-text>
        <!-- Requires v-model to ascertain the value of a form field -->
        <validation-provider :rules="rules" v-slot="{ errors }">
          <component
            v-model="data"
            :is="question.type"
            :question="question"
            :readonly="readonly"
            :errors="errors"
          />
        </validation-provider>
      </v-card-text>

      <v-card-actions v-if="editable">
        <v-spacer />
        <v-btn @click="dialog = true" text>
          Edit
        </v-btn>
        <v-btn @click="deleteDialog = true" text>Delete</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import Checkbox from '@/components/fields/Checkbox.vue'
import Dropdown from '@/components/fields/Dropdown.vue'
import FileInput from '@/components/fields/FileInput.vue'
import Radio from '@/components/fields/Radio.vue'
import TextArea from '@/components/fields/TextArea.vue'
import TextInput from '@/components/fields/TextInput.vue'

export default {
  name: 'Field',
  components: {
    Checkbox,
    Dropdown,
    FileInput,
    Radio,
    TextArea,
    TextInput,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      required: false
    },
    readonly: {
      type: Boolean,
      required: false
    }
  },
  data: () => {
    return {
      dialog: false,
      deleteDialog: false,
      editedItem: {},
      error: null,
      mimetypes: [
        { extension: 'DOC', mimetype: 'application/msword' },
        {
          extension: 'DOCX',
          mimetype: 'application/vnd.openxmlformats-officedocument'
        },
        { extension: 'PDF', mimetype: 'application/pdf' },
        { extension: 'TXT', mimetype: 'text/plain' },
        { extension: 'ANY', mimetype: 'any' }
      ]
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
    },
    rules() {
      return {
        required: this.question.required || false,
        mimes: this.question.mimeTypes ? this.mimes : false
      }
    },
    formLoading() {
      return this.$store.state.form.status === 'loading'
    },
    formError() {
      return this.$store.state.form.error
    },
    canHaveChoices() {
      return (
        this.question.type === 'Dropdown' ||
        this.question.type === 'Radio' ||
        this.question.type === 'Checkbox'
      )
    },
    canHaveMultiple() {
      return (
        this.question.type === 'Dropdown' ||
        this.question.type === 'FileInput' ||
        this.question.type === 'Checkbox'
      )
    },
    mimes() {
      if (!this.question.mimeTypes) return false

      return this.question.mimeTypes.map((mime) =>
        mime.replace(
          'application/vnd.openxmlformats-officedocument',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      )
    }
  },
  created() {
    this.editedItem = Object.assign({}, this.question)
  },
  methods: {
    async save() {
      // We have to remove these fields as the update method does not want them.
      const {
        id,
        type,
        formId,
        lastUpdated,
        deleted,
        answered,
        ...data
      } = this.editedItem

      // We remove properties we did not set, as their presence is not wanted for some field types.
      Object.keys(data).forEach((key) => data[key] == null && delete data[key])

      try {
        const resp = await this.$axios.$patch(`/question/${id}`, data)
        this.$store.commit('form/setQuestion', resp)
        this.dialog = false
      } catch (error) {
        this.error = error
      }
    },
    async deleteQuestion() {
      await this.$store.dispatch('form/deleteQuestion', this.question.id)

      if (!this.formError) {
        this.deleteDialog = false
      }
    }
  }
}
</script>
