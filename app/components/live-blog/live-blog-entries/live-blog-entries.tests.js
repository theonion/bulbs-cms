'use strict';

describe('Directive: liveBlogEntries', function () {
  var $;
  var $parentScope;
  var createEntryDeferred;
  var currentUser;
  var deleteEntryDeferred;
  var digest;
  var getEntriesDeferred;
  var html;
  var LiveBlogApi;
  var moment;
  var Raven;
  var sandbox;
  var updateEntryDeferred;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.liveBlog.entries');
    module('jquery');
    module('jsTemplates');

    html = angular.element('<live-blog-entries article="article"></live-blog-entries>');

    inject(function (_$_, _LiveBlogApi_, _moment_, _Raven_, $compile, $q,
        $rootScope, CurrentUserApi) {

      $ = _$_;
      $parentScope = $rootScope.$new();
      LiveBlogApi = _LiveBlogApi_;
      moment = _moment_;
      Raven = _Raven_;

      sandbox.stub(Raven, 'captureMessage');

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

      currentUser = { id: 123 };
      sinon.stub(CurrentUserApi, 'getCurrentUserWithCache').returns($q.when(currentUser));

      $parentScope.article = {
        id: 1,
        recirc_query: {}
      };

      createEntryDeferred = $q.defer();
      sandbox.stub(LiveBlogApi, 'createEntry')
        .returns(createEntryDeferred.promise);

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

  context('recirc', function () {

    it('should initialize recirc_query.included_ids when not provided by backend', function () {
      $parentScope.article = {
        id: 1,
        recirc_query: {}
      };
      var element = digest(html);

      element.scope().$digest();

      expect(angular.isArray($parentScope.article.recirc_query.included_ids)).to.equal(true);
    });
  });

  context('entry interactions', function () {

    context('accordion', function () {
      var element;

      beforeEach(function () {
        element = digest(html);
        getEntriesDeferred.resolve({ results: [{ id: 1 }, { id: 2 }] });
        $parentScope.$digest();
      });

      it('should default to panels being open', function () {

        var contents = element.find('.accordion-list-item-content');

        expect(contents.eq(0).hasClass('ng-hide')).to.equal(false);
        expect(contents.eq(1).hasClass('ng-hide')).to.equal(false);
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

    context('adding', function () {
      var element;

      beforeEach(function () {
        element = digest(html);
      });

      it('should post a new entry', function () {
        var addButton = element.find('button[ng-click^="addEntry"]');
        getEntriesDeferred.resolve({ results: [] });
        var entry = { id: 666 };

        var then = moment();
        addButton.trigger('click');
        createEntryDeferred.resolve(entry);
        $parentScope.$digest();
        var now = moment();

        expect(LiveBlogApi.createEntry.calledWithMatch(sinon.match({
          liveblog: $parentScope.article.id,
          created: sinon.match(function (value) {
            return moment(value).isBetween(then, now, 'second', '[]');
          }),
          created_by: currentUser,
          updated: sinon.match(function (value) {
            return moment(value).isBetween(then, now, 'second', '[]');
          }),
          updated_by: currentUser
        }))).to.equal(true);
        expect(element.find('li').scope().entry).to.equal(entry);
      });

      it('should put the new entry at the top', function () {
        var addButton = element.find('button[ng-click^="addEntry"]');
        var entry1 = { id: 420 };
        getEntriesDeferred.resolve({ results: [entry1] });
        var entry2 = { id: 666 };

        addButton.trigger('click');
        createEntryDeferred.resolve(entry2);
        $parentScope.$digest();

        expect(element.find('li').eq(0).scope().entry).to.equal(entry2);
      });

      it('should show an error message on failure', function () {
        var addButton = element.find('button[ng-click^="addEntry"]');
        getEntriesDeferred.resolve({ results: [] });

        addButton.trigger('click');
        createEntryDeferred.reject();
        $parentScope.$digest();

        expect(element.find('.live-blog-entries-list-error').html())
          .to.have.string('An error occurred attempting to add an entry!');
        expect(Raven.captureMessage.calledOnce).to.equal(true);
      });

      it('should be disabled if another transaction is running', function () {
        var addButton = element.find('button[ng-click^="addEntry"]');
        getEntriesDeferred.resolve({ results: [] });

        addButton.trigger('click');
        addButton.trigger('click');
        $parentScope.$digest();

        expect(addButton.attr('disabled')).to.equal('disabled');
        expect(element.isolateScope().transactionsLocked()).to.equal(true);
        expect(LiveBlogApi.createEntry.calledOnce).to.equal(true);
      });
    });

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
        $parentScope.$digest();
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

      it('should set the entry form pristine', function () {

        headlineInput.val('junk').trigger('change');
        updateButton.trigger('click');
        updateEntryDeferred.resolve();
        $parentScope.$digest();

        expect(element.isolateScope().getEntryForm(entry).$pristine)
          .to.equal(true);
      });
    });

    context('publish', function () {
      var element;
      var entry1;
      var entry2;
      var entry3;
      var publishButtons;

      beforeEach(function () {
        entry1 = { id: 1 };
        entry2 = { id: 2 };
        entry3 = { id: 3 };
        getEntriesDeferred.resolve({ results: [entry1, entry2, entry3] });
        element = digest(html);
        publishButtons = element.find('button[ng-model="entry.published"]');
      });

      it('should allow publish date to be changed', function () {

        var then = moment();
        publishButtons.eq(0).isolateScope().modalOnBeforeClose();
        $parentScope.$digest();
        var now = moment();

        expect(LiveBlogApi.updateEntry.calledWithMatch({
          id: entry1.id,
          updated: sinon.match(function (value) {
            return moment(value).isBetween(then, now, 'second', '[]');
          }),
          updated_by: currentUser
        })).to.equal(true);
      });

      it('should show an error message on failure', function () {

        publishButtons.eq(0).isolateScope().modalOnBeforeClose();
        updateEntryDeferred.reject();
        $parentScope.$digest();

        expect(element.find('.live-blog-entries-list-error').text())
          .to.have.string('An error occurred attempting to save an entry!');
        expect(Raven.captureMessage.calledOnce).to.equal(true);
      });

      it('should reset publish date if save fails', function () {
        var oldPublishDate = moment();
        var newPublishDate = moment().add(1, 'day');
        var buttonScope = publishButtons.eq(0).isolateScope();
        entry1.published = oldPublishDate;

        buttonScope.modalOnBeforeClose();
        entry1.published = newPublishDate;
        updateEntryDeferred.reject();
        $parentScope.$digest();

        expect(entry1.published.isSame(oldPublishDate)).to.equal(true);
      });

      it('should be disabled if another transaction is running', function () {
        var publishButton = publishButtons.eq(0);

        publishButton.isolateScope().modalOnBeforeClose();
        publishButton.isolateScope().modalOnBeforeClose();
        $parentScope.$digest();

        expect(publishButton.attr('disabled')).to.equal('disabled');
        expect(element.isolateScope().transactionsLocked()).to.equal(true);
        expect(LiveBlogApi.updateEntry.calledOnce).to.equal(true);
      });

      it('should reorder entries based on publish date', function () {

        publishButtons.eq(0).isolateScope().modalOnBeforeClose();
        entry1.published = moment();
        updateEntryDeferred.resolve();
        $parentScope.$digest();
        publishButtons.eq(1).isolateScope().modalOnBeforeClose();
        entry2.published = moment().add(1, 'day');
        updateEntryDeferred.resolve();
        $parentScope.$digest();

        var contents = element.find('.accordion-list-item-content');
        expect(contents.eq(0).scope().entry).to.eql(entry3);
        expect(contents.eq(1).scope().entry).to.eql(entry2);
        expect(contents.eq(2).scope().entry).to.eql(entry1);
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
