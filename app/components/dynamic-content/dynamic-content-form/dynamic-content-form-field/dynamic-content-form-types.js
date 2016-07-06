'use strict';

angular.module('bulbs.cms.dynamicContent.form.types', [])
  .constant('FIELD_TYPES_META', {
    array: {
      tagName: 'dynamic-content-form-field-list',
      initialValue: []
    },
    object: {
      tagName: 'dynamic-content-form-field-object',
      initialValue: {}
    },
    text: {
      tagName: 'dynamic-content-form-field-text',
      initialValue: ''
    },
    'boolean': {
      tagName: 'dynamic-content-form-field-boolean',
      initialValue: false
    },
  });
