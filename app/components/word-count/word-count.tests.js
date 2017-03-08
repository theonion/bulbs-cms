'use strict';

describe('Directive: wordCount', function () {

  var $;
  var $interval;
  var $parentScope;
  var testContainer;
  var element;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.wordCount');
    module('jquery');

    inject(function (_$_, _$interval_, $compile, $rootScope) {

      $ = _$_;
      $interval = _$interval_;
      $parentScope = $rootScope.$new();

      testContainer = $('<div class="test-container"></div>');
      $(document.body).append(testContainer);

      element = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      )('<word-count text-containers=".test-container .editor"></word-count>');
    });
  });

  afterEach(function () {
    sandbox.restore();
    testContainer.remove();
  });

  it('should pick up on text elements to count that are added late', function () {

    testContainer.append('<div class="editor">this is four words</div>');
    $interval.flush(1000);
    $parentScope.$digest();

    expect(element.html()).to.equal('4');
  });

  it('should count words from multiple selected text elements', function () {
    testContainer.append('<div class="editor">this is four words</div>');
    testContainer.append('<div class="editor">this is another five words</div>');

    $interval.flush(1000);
    $parentScope.$digest();

    expect(element.html()).to.equal('9');
  });

  it('should update word count each time a keyup event fires on a selected text element', function () {
    var editor = $('<div class="editor">only three words</div>');
    testContainer.append(editor);

    editor.html('this is four words');
    editor.trigger('keyup');
    $parentScope.$digest();

    expect(element.html()).to.equal('4');
  });

  it('should default word count to 0', function () {

    expect(element.html()).to.equal('0');
  });
});
