'use strict';

angular.module('cms.image', [
  'cms.config',
  'jquery'
])
  .service('CmsImage', [
    '$', 'CmsConfig',
    function ($, CmsConfig) {

      /* We can request an image at every possible width, but let's limit it to a reasonable number
         We can set these so they correspond to our more common sizes.
      */

      var styleCrop = function (response) {
        var cropDetails;
        if (this.crop === 'original') {
          createStyle('.image[data-image-id="' + this.id + '"]>div', {
            'padding-bottom': ((response.height / response.width) * 100) + '%'
          }, 'image-css-' + this.id);

          cropDetails = {
            x0: 0,
            x1: response.width,
            y0: 0,
            y1: response.height
          };
        } else {
          cropDetails = response.selections[this.crop];
        }

        computeStyle(this.elementDiv, response, cropDetails);
      };

      var styleOriginalCrop = function () {
        if (this.crop === 'original') {
          //default to 16x9
          createStyle('.image[data-image-id="' + this.id + '"]>div', {
            'padding-bottom': '56.25%', // default to 16x9 for errors
            'background-color': 'rgba(200, 0,0, .5)'
          }, 'image-css-' + this.id);
        }
      };

      var computeStyle = function (element, image, selection) {
        var selector = '.image[data-image-id="' + image.id + '"]>div';
        var elementWidth = $(selector).width();

        var scale;
        var elementHeight = (image.height / image.width) * elementWidth;
        var s_width = selection.x1 - selection.x0;
        var s_height = selection.y1 - selection.y0;
        var tmp_selection = selection;

        if (!s_width || !s_height) {
          /*
              If we have bogus selections, make
              the crop equal to the whole image
          */
          s_width = elementWidth;
          s_height = elementHeight;
          tmp_selection = {
            'x0': 0,
            'y0': 0,
            'x1': s_width,
            'y1': s_height
          };
        }

        var imageUrl = CmsConfig.buildImageServerUrl(
          '/' + image.id + '/original/' + CmsConfig.getImageDefaultWidth() + '.jpg'
        );
        scale = elementWidth / s_width;

        var rules = {
          'background-image': 'url(' + imageUrl + ')',
          'background-size': scaleNumber(image.width, scale) + 'px',
          'background-position': '-' + scaleNumber(tmp_selection.x0, scale) + 'px ' +
            '-' + scaleNumber(tmp_selection.y0, scale) + 'px',
          'background-repeat': 'no-repeat'
        };
        createStyle(selector, rules, 'image-css-' + image.id);
      };

      var createStyle = function (selector, rules, classname) {
        var styleNode = document.createElement('style');
        styleNode.type = 'text/css';
        styleNode.className = classname;
        var css = '';

        var temp = '' + selector + '{';
        for (var rule in rules) {
          temp += rule + ':' + rules[rule] + ';';
        }
        temp += '}';
        css += temp;

        if (styleNode.styleSheet) {
          styleNode.styleSheet.cssText = css;
        } else {
          styleNode.appendChild(document.createTextNode(css));
        }
        $(document).find('head').append(styleNode);
      };

      var scaleNumber = function (num, by_scale) {
        return Math.floor(num * by_scale);
      };

      var computeAspectRatio = function (_w, _h) {
        if (_w !== 0 && _h !== 0) {
          var aspectRatio = Math.ceil(_w / _h * 10);
          var crop = 'original';
          //smooth out rounding issues.
          switch (aspectRatio) {
            case 30:
            case 31:
              crop = '3x1';
              break;
            case 20:
              crop = '2x1';
              break;
            case 14:
              crop = '4x3';
              break;
            case 18:
              crop = '16x9';
              break;
            case 8:
              crop = '3x4';
              break;
            case 10:
              crop = '1x1';
              break;
          }
          return crop;
        } else {
          return '16x9';
        }
      };

      this.picturefill = function (element) {
        var ps;
        if (element && element.getAttribute('data-type') === 'image') {
          ps = [element];
        } else {
          if (typeof element === 'undefined') {
            element = document;
          }
          ps = element.getElementsByTagName('div');
        }

        for (var i = 0, il = ps.length; i < il; i++) {
          var el = ps[i];
          if (el.getAttribute('data-type') !== 'image') {
            continue;
          }
          var div = el.getElementsByTagName('div')[0];
          if (el.getAttribute('data-image-id') !== null) {
            var id = el.getAttribute('data-image-id'),
              crop = el.getAttribute('data-crop'),
              format = '';
            var _w = div.offsetWidth,
              _h = div.offsetHeight;

            if (!crop || crop === '' || crop === 'auto') {
              crop = computeAspectRatio(_w, _h);
            }
            if (el.getAttribute('data-format')) {
              format = el.getAttribute('data-format');
            } else {
              format = 'jpg';
            }

            var elementDiv = div;
            if (id) {
              $('.image-css-' + id).remove();
              $.ajax({
                url: CmsConfig.buildImageServerUrl('/api/' + id),
                headers: {
                  'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
                  'Content-Type': undefined
                },
                success: styleCrop.bind({
                  elementDiv: elementDiv,
                  id: id,
                  crop: crop
                }),
                error: styleOriginalCrop.bind({
                  id: id,
                  crop: crop
                })
              });
            }
          }
        }
      };

      return this;
    }
  ]);
