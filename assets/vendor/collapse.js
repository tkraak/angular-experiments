angular.module('collapse', [])
  .directive('collapse', [function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: { title: '@'},
      templateUrl: 'vendor/collapse.html',
      controller: function ($scope, $element) {
        $scope.opened = true;
        return $scope.toggle = function () {
          return $scope.opened = !$scope.opened;
        };
      }
    }
  }]);
