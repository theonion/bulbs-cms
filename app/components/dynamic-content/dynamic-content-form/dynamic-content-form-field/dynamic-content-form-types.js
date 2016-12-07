'use strict';

angular.module('bulbs.cms.dynamicContent.form.types', [])
  .constant('FIELD_TYPES_META', {
    array: {
      tagName: 'dynamic-content-form-field-list'
    },
    boolean: {
      tagName: 'dynamic-content-form-field-boolean'
    },
    color: {
      tagName: 'dynamic-content-form-field-color'
    },
    content: {
      tagName: 'dynamic-content-form-field-content-reference'
    },
    datetime: {
      tagName: 'dynamic-content-form-field-date-time'
    },
    image: {
      tagName: 'dynamic-content-form-field-image'
    },
    invalid: {
      tagName: 'dynamic-content-form-field-invalid'
    },
    object: {
      tagName: 'dynamic-content-form-field-object'
    },
    richtext: {
      tagName: 'dynamic-content-form-field-richtext'
    },
    string: {
      tagName: 'dynamic-content-form-field-text'
    },
    integer: {
      tagName: 'dynamic-content-form-field-integer'
    },
    slideshow_ids: {
      tagName: 'dynamic-content-form-field-slideshow-ids'
    }
  });
