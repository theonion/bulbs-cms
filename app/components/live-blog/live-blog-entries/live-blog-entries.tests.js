'use strict';

describe('Directive: liveBlogEntries', function () {
  var $;
  var $parentScope;
  var deleteEntryDeferred;
  var digest;
  var getEntriesDeferred;
  var html;
  var LiveBlogApi;
  var Raven;
  var sandbox;
  var updateEntryDeferred;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.liveBlog.entries');
    module('jquery');
    module('jsTemplates');

    html = angular.element('<live-blog-entries article="article"></live-blog-entries>');

    inject(function (_$_, _LiveBlogApi_, _Raven_, $compile, $q, $rootScope) {
      $ = _$_;
      $parentScope = $rootScope.$new();
      LiveBlogApi = _LiveBlogApi_;
      Raven = _Raven_;

      sandbox.stub(Raven, 'captureMessage');

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

      $parentScope.article = { id: 1 };

      getEntriesDeferred = $q.defer();
      sandbox.stub(LiveBlogApi, 'getEntries')
        .returns(getEntriesDeferred.promise);

      deleteEntryDeferred = $q.defer();
      sandbox.stub(LiveBlogApi, 'deleteEntry')
        .returns(deleteEntryDeferred.promise);

      updateEntryDeferred = $q.defer();
      sandbox.stub(LiveBlogApi, 'updateEntry')
        .returns(updateEntryDeferred.promise);
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('initialization', function () {

    it('should do an initial request for entries', function () {
      var entries = [{ id: 1 }, { id: 2 }];
      getEntriesDeferred.resolve({ results: entries });

      var element = digest(html);

      expect(LiveBlogApi.getEntries.calledOnce).to.equal(true);
      expect(element.find('li').length).to.eql(2);
    });

    it('should show an error message if unable to retrieve entries', function () {
      getEntriesDeferred.reject();

      var element = digest(html);

      expect(element.find('.live-blog-entries-list-error').html())
        .to.have.string('An error occurred retrieving entries!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });
  });

  context('entry interactions', function () {
    var element;

    beforeEach(function () {
      element = digest(html);
    });

    context('accordion', function () {

      beforeEach(function () {
        getEntriesDeferred.resolve({ results: [{ id: 1 }, { id: 2 }] });
        $parentScope.$digest();
      });

      it('should have a button to collapse all entries', function () {
        var collapse = element.find('button[ng-click^="collapseAll"]');

        collapse.trigger('click');

        var contents = element.find('.accordion-list-item-content');

        expect(contents.eq(0).hasClass('ng-hide')).to.equal(true);
        expect(contents.eq(1).hasClass('ng-hide')).to.equal(true);
      });

      it('should have a button to expand all entries', function () {
        var collapse = element.find('button[ng-click^="collapseAll"]');
        var contents = element.find('.accordion-list-item-content');
        var expand = element.find('button[ng-click^="expandAll"]');

        collapse.trigger('click');
        $parentScope.$digest();
        expand.trigger('click');

        expect(contents.eq(0).hasClass('ng-hide')).to.equal(false);
        expect(contents.eq(1).hasClass('ng-hide')).to.equal(false);
      });
    });
    //
    // context('adding', function () {
    //
    //   it('should post a new entry', function () {
    //
    //     // TODO : add test code here
    //     throw new Error('Not implemented yet.');
    //   });
    //
    //   it('should show an error message on failure', function () {
    //
    //     // TODO : add test code here
    //     throw new Error('Not implemented yet.');
    //   });
    //
    //   it('should be disabled if another transaction is running', function () {
    //
    //     // TODO : add test code here
    //     throw new Error('Not implemented yet.');
    //   });
    // });

    context('updating', function () {
      var element;
      var entry;
      var headlineInput;
      var updateButton;

      beforeEach(function () {
        entry = { id: 1 };
        getEntriesDeferred.resolve({ results: [entry] });
        element = digest(html);
        headlineInput = element.find('input[ng-model="entry.headline"]');
        updateButton = element.find('button[ng-click^="saveEntry"]');
      });

      it('should put the entry', function () {

        headlineInput.val('junk').trigger('change');
        updateButton.trigger('click');

        expect(LiveBlogApi.updateEntry.withArgs(entry).calledOnce)
          .to.equal(true);
      });

      it('should show an error message on failure', function () {
        var newTitle = 'junk';

        headlineInput.val(newTitle).trigger('change');
        updateButton.trigger('click');
        updateEntryDeferred.reject();
        $parentScope.$digest();

        expect(element.find('.live-blog-entries-list-error').text())
          .to.have.string('An error occurred attempting to save "' + newTitle + '"!');
        expect(Raven.captureMessage.calledOnce).to.equal(true);
      });

      it('should be disabled if another transaction is running', function () {

        headlineInput.val('junk').trigger('change');
        updateButton.trigger('click');
        updateButton.trigger('click');
        $parentScope.$digest();

        expect(updateButton.attr('disabled')).to.equal('disabled');
        expect(element.isolateScope().transactionsLocked()).to.equal(true);
        expect(LiveBlogApi.updateEntry.calledOnce).to.equal(true);
      });

      it('should be disabled if entry form is pristine', function () {

        expect(updateButton.attr('disabled')).to.equal('disabled');
      });
    });

    context('publish', function () {
      var element;
      var entry;
      var publishButton;

      beforeEach(function () {
        entry = { id: 1 };
        getEntriesDeferred.resolve({ results: [entry] });
        element = digest(html);
        publishButton = element.find('button[ng-model="entry.published"]');
      });

      it('should allow publish date to be changed', function () {

        publishButton.isolateScope().modalOnClose();

        expect(LiveBlogApi.updateEntry.withArgs(entry).calledOnce)
          .to.equal(true);
      });

      it('should show an error message on failure', function () {

        publishButton.isolateScope().modalOnClose();
        updateEntryDeferred.reject();
        $parentScope.$digest();

        expect(element.find('.live-blog-entries-list-error').text())
          .to.have.string('An error occurred attempting to save an entry!');
        expect(Raven.captureMessage.calledOnce).to.equal(true);
      });

      it('should be disabled if another transaction is running', function () {

        publishButton.isolateScope().modalOnClose();
        publishButton.isolateScope().modalOnClose();
        $parentScope.$digest();

        expect(publishButton.attr('disabled')).to.equal('disabled');
        expect(element.isolateScope().transactionsLocked()).to.equal(true);
        expect(LiveBlogApi.updateEntry.calledOnce).to.equal(true);
      });
    });

    context('delete', function () {
      var element;
      var entry;
      var deleteButton;

      beforeEach(function () {
        entry = { id: 1 };
        getEntriesDeferred.resolve({ results: [entry] });
        element = digest(html);
        deleteButton = element.find('button[modal-on-ok^="deleteEntry"]');
      });

      it('should allow an entry to be deleted', function () {

        deleteButton.isolateScope().modalOnOk();
        deleteEntryDeferred.resolve();
        $parentScope.$digest();

        expect(LiveBlogApi.deleteEntry.withArgs(entry).calledOnce)
          .to.equal(true);
        expect(element.find('li').length).to.equal(0);
      });

      it('should show an error message on failure', function () {

        deleteButton.isolateScope().modalOnOk();
        deleteEntryDeferred.reject();
        $parentScope.$digest();

        expect(element.find('.live-blog-entries-list-error').text())
          .to.have.string('An error occurred attempting to delete an entry!');
        expect(Raven.captureMessage.calledOnce).to.equal(true);
      });

      it('should be disabled if another transaction is running', function () {

        deleteButton.isolateScope().modalOnOk();
        deleteButton.isolateScope().modalOnOk();
        $parentScope.$digest();

        expect(deleteButton.attr('disabled')).to.equal('disabled');
        expect(element.isolateScope().transactionsLocked()).to.equal(true);
        expect(LiveBlogApi.deleteEntry.calledOnce).to.equal(true);
      });
    });
  });
});
