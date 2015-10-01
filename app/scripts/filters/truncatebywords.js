'use strict';

angular.module('bulbsCmsApp')
  .filter('truncateByWords', function () {
    return function (input, words, maxLength) {
      var output = '';

      if (typeof(input) === 'string') {
        var wordsParsed = Number(words);
        var maxLengthParsed = Number(maxLength);

        if (!isNaN(maxLengthParsed) && maxLengthParsed > 0 && input.length >= maxLengthParsed) {
          output = input.slice(0, maxLengthParsed) + '...';
        } else if (!isNaN(wordsParsed) && wordsParsed > 0) {

          var inputWords = input.split(/\s+/);
          if (inputWords.length > wordsParsed) {
            output = inputWords.slice(0, wordsParsed).join(' ') + '...';
          }
        }
      }

      return output;
    };
  });
