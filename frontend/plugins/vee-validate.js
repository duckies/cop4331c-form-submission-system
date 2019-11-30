/* eslint-disable camelcase */
import { extend } from 'vee-validate'
import { mimes, min_value, required } from 'vee-validate/dist/rules'

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

extend('maxFiles', {
  validate(value, arg) {
    if (value.length <= arg[0]) {
      return true
    }

    return `The maximum number of uploadable files is ${arg[0]}.`
  }
})
