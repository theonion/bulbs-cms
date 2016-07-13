'use strict';

angular.module('bulbs.cms.dynamicContent.form.types', [])
  .constant('FIELD_TYPES_META', {
    array: {
      tagName: 'dynamic-content-form-field-list',
      initialValue: []
    },
    boolean: {
      tagName: 'dynamic-content-form-field-boolean',
      initialValue: false
    },
    color: {
      tagName: 'dynamic-content-form-field-color',
      initialValue: '#000000' // Paint It Black -- Rolling Stones
    },
    datetime: {
      tagName: 'dynamic-content-form-field-date-time',
      initialValue: null
    },
    image: {
      tagName: 'dynamic-content-form-field-image',
      initialValue: {}
    },
    object: {
      tagName: 'dynamic-content-form-field-object',
      initialValue: {}
    },
    richtext: {
      tagName: 'dynamic-content-form-field-text',
      initialValue: ''
    },
    integer: {
      tagName: 'dynamic-content-form-field-integer',
      initialValue: undefined
    }
  });
