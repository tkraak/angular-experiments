angular.module('dayparts', ['angular-dayparts', 'mgcrea.ngStrap', 'mgcrea.ngStrap.tooltip'])
  .controller('MainCtrl', ['$scope', function($scope) {

    $scope.options = {

    reset: true,

    onChange: function(selected) {
        console.log('selected: ', selected)
    },

    selected: ['monday-14', 'monday-15'],

    disableRowSelection: true,

    disableColumnSelection: true
    }

  }])

angular.element(document).ready(function() {
  angular.bootstrap(document, ['dayparts'])
})
