<template>
  <div>
    <v-dialog v-model="preview" :fullscreen="fullscreen" max-width="800">
      <v-card height="700">
        <v-card-title>
          {{ tempFile.name }}
          <v-spacer />
          <v-btn @click="fullscreen = !fullscreen" icon>
            <v-icon
              v-text="fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
              large
            ></v-icon>
          </v-btn>
          <v-btn @click="preview = false" icon>
            <v-icon large>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="fill-frame">
          <iframe
            :src="googleViewerBase + tempFile.url + '&embedded=true'"
            class="frame"
            frameborder="0"
            width="100%"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <div v-if="readonly">
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="file in files"
            :key="file.name"
            @click="setupPreview(file)"
          >
            <v-list-item-icon>
              <v-icon v-text="file.icon" />
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title v-text="file.name" />
            </v-list-item-content>

            <v-list-item-action>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.stop.prevent icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item :href="file.url" download target="_blank">
                    <v-list-item-icon>
                      <v-icon>mdi-download</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Download</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :href="googleViewerBase + file.url + '&embedded=true'"
                    target="_blank"
                  >
                    <v-list-item-icon>
                      <v-icon>mdi-arrow-top-right</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Preview in New Tab</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>

    <v-file-input
      v-model="data"
      v-else
      :name="question.id"
      :label="question.label"
      :hint="types"
      :required="question.required"
      :multiple="question.multiple"
      :error-messages="errors"
      persistent-hint
      counter
      filled
    />
  </div>
</template>

<script>
export default {
  name: 'FileInput',
  props: {
    question: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      required: false,
      default: false
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    errors: {
      type: Array,
      required: false,
      default: null
    }
  },
  data() {
    return {
      preview: false,
      fullscreen: false,
      mimetypes: [
        { extension: 'DOC', mimetype: 'application/msword' },
        {
          extension: 'DOCX',
          mimetype: 'application/vnd.openxmlformats-officedocument'
        },
        { extension: 'PDF', mimetype: 'application/pdf' },
        { extension: 'TXT', mimetype: 'text/plain' },
        { extension: 'ANY', mimetype: 'any' }
      ],
      googleViewerBase: 'https://docs.google.com/viewer?url=',
      tempFile: {
        name: '',
        url: '',
        icon: '',
        mime: ''
      }
    }
  },
  computed: {
    files() {
      if (!this.data || !this.data.length) return []

      return this.data.map((file) => ({
        url: `${this.$axios.defaults.baseURL}${file.filename}`,
        mime: file.mimetype,
        name: file.originalname,
        icon:
          file.mimetype === 'application/pdf'
            ? 'mdi-file-pdf'
            : file.mimetype === 'text/plain'
            ? 'mdi-note-text'
            : file.mimetype.includes('image')
            ? 'mdi-file-image'
            : file.mimetype.includes('msword') ||
              file.mimetype.includes('officedocument')
            ? 'mdi-file-word'
            : 'mdi-file'
      }))
    },
    types() {
      const extensions = this.question.mimeTypes.map((mime) => {
        const obj = this.mimetypes.find((type) => type.mimetype === mime)
        if (obj) return obj.extension
      })
      return `The allowable file types are ${extensions.join(', ')}.`
    },
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
    }
  },
  methods: {
    setupPreview(file) {
      this.tempFile = file
      this.preview = true
    }
  }
}
</script>

<style lang="scss" scoped>
.frame {
  display: block;
  height: 100%;
}
.fill-frame {
  height: calc(100% - 80px);
}
</style>
