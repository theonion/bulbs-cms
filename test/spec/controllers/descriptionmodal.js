'use strict';

describe('Controller: DescriptionModalCtrl', function () {

    beforeEach(module('bulbsCmsApp'));
    beforeEach(module('cms.templates'));

    var DescriptionModalCtrl,
        scope,
        modal,
        modalService;

    // initialize controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $modal, PARTIALS_URL) {

        scope = $rootScope.$new();

        // mock modal
        var modalUrl = PARTIALS_URL + 'modals/description-modal.html';
        modal = $modal.open({
            templateUrl: modalUrl
        });
        modal.dismiss = function () { return true; };
        modalService = $modal;
        modalService.open = function () { return true; };

        // mock controller
        DescriptionModalCtrl = $controller('DescriptionModalCtrl', {
            $scope: scope,
            $modal: modalService,
            $modalInstance: modal,
            article: {}
        });

    }));

    // no tests to run here...

});
