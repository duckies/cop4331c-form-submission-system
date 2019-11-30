/* eslint-disable camelcase */
import { extend } from 'vee-validate'
import { required, min_value, mimes } from 'vee-validate/dist/rules'

extend('required', {
  ...required,
  message: 'This field is required'
})

extend('min_value_create', {
  ...min_value,
  message: 'When multiple is selected, you must allow 2 or more uploads.'
})

extend('mimes', {
  ...mimes,
  message: 'That file type is not allowed.'
})
