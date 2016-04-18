'use strict';

angular.module('bulbsCmsApp.mockApi.poll', [
  'bulbsCmsApp.mockApi.data'
])
.run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    // poll
    var rePoll = {
      list: /^\/cms\/api\/v1\/poll\/(\?.*)?$/,
    };
    mockApiData.polls = [{
      id: 1,
      title: 'Interesting Poll',
      question_text: 'How do you spell what?',
      answers: ['what', 'wut'],
      authors: ['Inky'],
      sodahead_id: 17,
      published: null,
      end_date: null
    }, {
      id: 2,
      title: 'Meduim-level Interesting Poll',
      question_text: 'What kind of apple?',
      answers: ['gala', 'fuji', 'macbook pro'],
      authors: ['Blinky', 'Pinky'],
      sodahead_id: 9,
      published: null,
      end_date: null
    }, {
      id: 3,
      title: 'unInteresting Poll',
      question_text: '7?',
      answers: ['7', '789', '11'],
      authors: ['Clyde'],
      sodahead_id: 11,
      published: null,
      end_date: null
    }];
    $httpBackend.whenGET(rePoll.list).respond(function (method, url, data) {
      return [200, {
        count: mockApiData.polls.length,
        results: mockApiData.polls
      }];
    });
  }]);
