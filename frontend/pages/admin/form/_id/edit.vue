<template>
  <v-container>
    <!-- Question Creation Dialog -->
    <v-dialog v-model="createDialog" max-width="500">
      <validation-observer ref="createForm" v-slot="{ handleSubmit }">
        <v-form @submit.prevent="handleSubmit(createQuestion)">
          <v-card>
            <v-card-title>Add Question</v-card-title>

            <v-card-text>
              Create a new question for the form.

              <validation-provider
                v-slot="{ errors }"
                vid="type"
                rules="required"
              >
                <v-select
                  v-model="questionType"
                  :items="types"
                  :error-messages="errors"
                  label="Field Type"
                  hint="This cannot be changed once the question is made."
                />
              </validation-provider>

              <validation-provider v-slot="{ errors }" rules="required">
                <v-text-field
                  v-model="questionTitle"
                  :error-messages="errors"
                  label="Title"
                  hint="The question to be asked."
                />
              </validation-provider>

              <v-checkbox
                v-model="questionRequired"
                label="Is the question required?"
              />

              <validation-provider
                v-if="
                  questionType === 'Dropdown' ||
                    questionType === 'Radio' ||
                    questionType === 'Checkbox'
                "
                v-slot="{ errors }"
                rules="required"
              >
                <v-combobox
                  v-model="questionChoices"
                  :error-messages="errors"
                  label="Choices"
                  multiple
                  chips
                  hint="The options for selection."
                />
              </validation-provider>

              <validation-provider
                v-if="
                  questionType === 'Dropdown' ||
                    questionType === 'Checkbox' ||
                    questionType === 'FileInput'
                "
                v-slot="{ errors }"
                rules="required"
              >
                <v-checkbox
                  v-model="questionMultiple"
                  :error-messages="errors"
                  :label="
                    `Allow multiple ${
                      questionType === 'FileInput' ? 'uploads' : 'selections'
                    }?`
                  "
                />
              </validation-provider>

              <validation-provider
                v-if="questionType === 'FileInput' && questionMultiple === true"
                v-slot="{ errors }"
                rules="required|min_value_create:2"
              >
                <v-text-field
                  v-model="questionFileMaxCount"
                  :error-messages="errors"
                  type="number"
                  label="How many files can be uploaded?"
                />
              </validation-provider>

              <validation-provider
                v-if="questionType === 'FileInput'"
                v-slot="{ errors }"
                rules="required"
              >
                <v-select
                  v-model="questionMimeTypes"
                  :error-messages="errors"
                  :items="fileTypes"
                  multiple
                  item-text="extension"
                  item-value="mimetype"
                  label="What kind of files are allowed?"
                />
              </validation-provider>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn @click="createDialog = false" text>Nevermind</v-btn>
              <v-btn :loading="questionLoading" type="submit" text>
                Create Question
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </validation-observer>
    </v-dialog>

    <!-- Edit Form Dialog -->
    <v-dialog v-model="editFormDialog" max-width="500">
      <validation-observer ref="editForm" v-slot="{ handleSubmit }">
        <v-form @submit.prevent="handleSubmit(editForm)">
          <v-card>
            <v-card-title>Edit Form</v-card-title>

            <v-card-text>
              <validation-provider
                v-slot="{ errors }"
                vid="title"
                rules="required"
              >
                <v-text-field
                  v-model="tempForm.title"
                  :error-messages="errors"
                  label="Title"
                  hint="The title must be unique."
                  persistent-hint
                  required
                  outlined
                />
              </validation-provider>

              <v-textarea
                v-model="tempForm.description"
                label="Description"
                hint="Optional body of text or HTML to show below a form's title."
                persistent-hint
                outlined
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn @click="editFormDialog = false" text>Nevermind</v-btn>
              <v-btn :loading="formLoading" type="submit" text>Edit Form</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </validation-observer>
    </v-dialog>

    <v-row>
      <v-col>
        <h1 style="display: inline-block;">{{ form.title }}</h1>
        <p v-if="form.description">{{ form.description }}</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-toolbar>
          <v-toolbar-title class="d-none d-md-flex">
            Form Management
          </v-toolbar-title>

          <v-spacer class="d-none d-md-flex" />

          <v-toolbar-items
            v-bind:class="{ 'justify-toolbar': $vuetify.breakpoint.smAndDown }"
          >
            <v-btn @click="createDialog = true" text>Add Question</v-btn>
            <v-btn @click="setupEditForm" text>Edit Form</v-btn>
            <v-btn
              :to="{
                name: 'form-id',
                params: { id: form.id }
              }"
              target="_blank"
              nuxt
              color="info"
              text
            >
              Public URL
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <draggable v-model="questions" @change="updateQuestionOrder">
          <transition-group>
            <field
              v-for="formQuestion in questions"
              :key="formQuestion.id"
              :question="formQuestion"
              editable
            />
          </transition-group>
        </draggable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import draggable from 'vuedraggable'
import Field from '@/components/fields/Field.vue'

export default {
  layout: 'admin',
  head() {
    return {
      title: `Editing '${this.form.title}'`
    }
  },
  components: {
    draggable,
    Field,
    ValidationProvider,
    ValidationObserver
  },
  data() {
    return {
      createDialog: false,
      editFormDialog: false,
      types: [
        'Dropdown',
        'TextArea',
        'TextInput',
        'Radio',
        'Checkbox',
        'FileInput'
      ],
      fileTypes: [
        { mimetype: 'application/msword', extension: 'DOC' },
        {
          mimetype: 'application/vnd.openxmlformats-officedocument',
          extension: 'DOCX'
        },
        { mimetype: 'application/pdf', extension: 'PDF' },
        { mimetype: 'text/plain', extension: 'TXT' },
        { mimetype: 'any', extension: 'Any' }
      ],
      debounce: false,
      tempForm: {
        title: '',
        description: ''
      }
    }
  },
  computed: {
    questionType: {
      get() {
        return this.$store.state.question.question.type
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'type',
          value
        })
      }
    },
    questionTitle: {
      get() {
        return this.$store.state.question.question.title
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'title',
          value
        })
      }
    },
    questionRequired: {
      get() {
        return this.$store.state.question.question.required
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'required',
          value
        })
      }
    },
    questionChoices: {
      get() {
        return this.$store.state.question.question.choices
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'choices',
          value
        })
      }
    },
    questionMultiple: {
      get() {
        return this.$store.state.question.question.multiple
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'multiple',
          value
        })
      }
    },
    questionFileMaxCount: {
      get() {
        return this.$store.state.question.question.fileMaxCount
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'fileMaxCount',
          value
        })
      }
    },
    questionMimeTypes: {
      get() {
        return this.$store.state.question.question.mimeTypes
      },
      set(value) {
        return this.$store.commit('question/setQuestionProperty', {
          property: 'mimeTypes',
          value
        })
      }
    },
    form: {
      get() {
        return this.$store.state.form.form
      },
      set(value) {
        // This currently doesn't work, we will need a custom
        // method when a field is dragged to properly find
        // the one that moved and update the order via a patch request.
        return this.$store.commit('setForm', value)
      }
    },
    questions: {
      get() {
        return this.$store.getters['form/activeQuestions']
      },
      set(value) {
        return this.$store.commit('form/setQuestionOrders', value)
      }
    },
    formLoading() {
      return this.$store.state.form.status === 'loading'
    },
    questionLoading() {
      return this.$store.state.question.status === 'loading'
    },
    questionError() {
      return this.$store.state.question.error
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('form/getForm', params.id)
  },
  beforeMount() {
    // Prevents inputs from reciving previous submission data.
    this.$store.commit('form/clearAnswers')
  },
  methods: {
    async createQuestion() {
      const order = this.form.questions.length
        ? Math.max(...this.form.questions.map((q) => q.order, 0), 0) + 1
        : 0
      await this.$store.dispatch('question/createQuestion', {
        formId: this.form.id,
        order
      })
      this.createDialog = false
    },
    // This method is debounced to prevent rapid drag-and-drops from
    // thrashing the backend with requests.
    updateQuestionOrder() {
      if (this.debounce) return

      this.debounce = setTimeout(
        async function() {
          this.debounce = false
          await this.$store.dispatch('question/reorderQuestion', {
            questions: this.questions.map((q) => ({ id: q.id, order: q.order }))
          })
        }.bind(this),
        2000
      )
    },

    setupEditForm() {
      this.tempForm = Object.assign({}, this.form)
      this.editFormDialog = true
    },
    editForm() {
      this.$store.dispatch('form/updateForm', {
        data: {
          id: this.tempForm.id,
          title: this.tempForm.title,
          description: this.tempForm.description
        },
        array: false
      })
      this.editFormDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.justify-toolbar {
  justify-content: center;
  flex-grow: 1;
}
</style>
