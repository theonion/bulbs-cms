'use strict';

angular.module('bulbs.cms.editor.wrapper', [
  'BettyCropper',
  'bulbs.cms.imageCropModal',
  'bulbs.cms.site.config',
  'jquery',
  'OnionEditor',
])
  .run([
    '$',
    function ($) {
      // NOTE : this is the old editor-cms-bridge.js
      /*
      Image
      This bridges the embed module that the editor exposes & our custom image implementation.
      */
      /* prevents backspace from accidentally triggering a back event */
      $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
          var d = event.srcElement || event.target;
          if (['TEXTAREA', 'INPUT'].indexOf(d.tagName.toUpperCase() !==  -1)) {
            doPrevent = d.readOnly || d.disabled;
          } else if (d.isContentEditable) {
            //we're in a content editable field
            doPrevent = false;
          } else {
            doPrevent = true;
          }
        }
        if (doPrevent) {
          event.preventDefault();
        }
      });
    }
  ])
  .directive('onionEditor', [
    '$', 'BettyCropper', 'CmsConfig', 'OnionEditor', 'openImageCropModal',
      'Zencoder',
    function ($, BettyCropper, CmsConfig, OnionEditor, openImageCropModal,
        Zencoder) {

      var safeApply = function (scope, fn) {
        if (scope.$$phase || scope.$root.$$phase) {
          fn();
        } else {
          scope.$apply(function () {
            fn();
          });
        }
      };

      return {
        controller: [
          '$scope',
          function ($scope) {
            $scope.editor = null;

            this.getEditor = function () {
              return $scope.editor;
            };
          }
        ],
        require: 'ngModel',
        replace: true,
        restrict: 'E',
        templateUrl: CmsConfig.buildComponentPath(
          'editor',
          'editor-wrapper',
          'editor-wrapper.html'
        ),
        scope: {
          ngModel: '='
        },
        link: function (scope, element, attrs, ngModel) {

          if (!ngModel) {
            return;
          }

          var formatting;
          if (attrs.formatting) {
            formatting = attrs.formatting.split(',');
          }

          var options = {};
          var defaultValue = '';

          if (attrs.role === 'multiline') {
            defaultValue = '<p><br></p>';
            options = {
              // global options
              multiline: true,
              formatting: formatting || ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'strike', 'underline'],
              placeholder: {
                text: attrs.placeholder ||  '<p>Write here</p>',
                container: $('.editorPlaceholder', element[0])[0],
              },
              link: {
                domain: attrs.linkDomain || false,
                // Sean, you can figure out a nicer way to handle the search handler.
                searchHandler: window[attrs.linkSearchHandler] || false
              },
              statsContainer: '.wordcount',
              inlineObjects: attrs.inlineObjects || CmsConfig.getInlineObjecsPath(),
              image: {
                insertDialog: BettyCropper.upload,
                editDialog: openImageCropModal,
              },
              video: {
                insertDialog: Zencoder.onVideoFileUpload,
                editDialog: Zencoder.openVideoThumbnailModal,
                videoEmbedUrl: CmsConfig.buildVideoUrl()
              }
            };
          } else {
            $('.document-tools, .embed-tools', element).hide();
            defaultValue = '';
            options = {
              // global options
              multiline: false,
              placeholder: {
                text: attrs.placeholder || 'Write here',
                container: $('.editorPlaceholder', element[0])[0],
              },
              formatting: formatting || []
            };
          }

          scope.editor = new OnionEditor($('.editor', element[0])[0], options);

          ngModel.$render = function () {
            scope.editor.setContent(ngModel.$viewValue || defaultValue);
            // register on change here, after the initial load so angular doesn't get mad...
            setTimeout(function () {
              scope.editor.setChangeHandler(read);
            });
          };

          // Redefine what empty looks like
          ngModel.$isEmpty = function (value) {
            return ! value || scope.editor.scribe.allowsBlockElements() && value === defaultValue;
          };

          // Write data to the model
          function read() {
            safeApply(scope, function () {
              var html = scope.editor.getContent();
              if (html === defaultValue) {
                html = '';
              }
              ngModel.$setViewValue(html);
            });
          }

          scope.$watch(ngModel, function () {
            scope.editor.setContent(ngModel.$viewValue || defaultValue);
            if (window.picturefill) {
              window.picturefill(element[0]);
            }
          });
        }
      };
    }
  ]);
