angular.module('app', ['angular-dayparts',
                       'mgcrea.ngStrap',
                       'mgcrea.ngStrap.tooltip'])
  .controller('MainCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {

    $scope.items = [
      {"value":"all", "label":"All hours and days"},
      {"value":"weekend", "label":"Weekends (Sat-Sun)"},
      {"value":"weekdays", "label":"Weekdays (Mon-Fri)"},
      {"value":"businessHours", "label":"Business Hours (Mon-Fri, 9am-5pm)"},
      {"value":"eveningHours", "label":"Evenings (6pm-12pm)"},
      {"value":"custom", "label":"Custom", disabled: true}
    ];

    $scope.selectedItem = $scope.items[0].value;

    const getDaypart = (day, start, end) => {
      var part = [];
      for (var i = start; i <= end; i++) {
        part.push(`${day}-${i}`);
      }
      return part;
    }

    const weekendPreset = function (sat, sun) {
      var preset = sat.concat(sun);
      return preset;
    }

    const weekdayPreset = (mon, tue, wed, thur, fri) => {
      var preset = mon.concat(tue, wed, thur, fri);
      return preset;
    }

    const weekPreset = (mon, tue, wed, thur, fri, sat, sun) => {
      var preset = mon.concat(tue, wed, thur, fri, sat, sun);
      return preset;
    }

    const weekend = weekendPreset(getDaypart('sunday', 0, 23),
                                  getDaypart('saturday', 0, 23));

    const weekdays = weekdayPreset(getDaypart('monday', 0, 23),
                                   getDaypart('tuesday', 0, 23),
                                   getDaypart('wednesday', 0, 23),
                                   getDaypart('thursday', 0, 23),
                                   getDaypart('friday', 0, 23));

    const businessHours = weekdayPreset(getDaypart('monday', 9, 16),
                                        getDaypart('tuesday', 9, 16),
                                        getDaypart('wednesday', 9, 16),
                                        getDaypart('thursday', 9, 16),
                                        getDaypart('friday', 9, 16));

    const eveningHours = weekPreset(getDaypart('sunday', 18, 23),
                                       getDaypart('monday', 18, 23),
                                       getDaypart('tuesday', 18, 23),
                                       getDaypart('wednesday', 18, 23),
                                       getDaypart('thursday', 18, 23),
                                       getDaypart('friday', 18, 23),
                                       getDaypart('saturday', 18, 23));

    const week = weekPreset(getDaypart('sunday', 0, 23),
                            getDaypart('monday', 0, 23),
                            getDaypart('tuesday', 0, 23),
                            getDaypart('wednesday', 0, 23),
                            getDaypart('thursday', 0, 23),
                            getDaypart('friday', 0, 23),
                            getDaypart('saturday', 0, 23));

    $scope.selectedItemChanged = function () {
      if ($scope.selectedItem === 'all') {
        $rootScope.$broadcast('allPreset', week);
      } else if ($scope.selectedItem === 'weekend') {
        $rootScope.$broadcast('weekendPreset', weekend);
      } else if ($scope.selectedItem === 'weekdays') {
        $rootScope.$broadcast('weekdaysPreset', weekdays);
      } else if ($scope.selectedItem === 'businessHours') {
        $rootScope.$broadcast('businessHoursPreset', businessHours);
      } else if ($scope.selectedItem === 'eveningHours') {
        $rootScope.$broadcast('eveningHoursPreset', eveningHours);
      }
    }


    $scope.$on('allPreset', (e) => {
      $scope.selectedItem = $scope.items[0].value;
    })

    $scope.$on('weekendPreset', (e) => {
      $scope.selectedItem = $scope.items[1].value;
    })

    $scope.$on('weekdayPreset', (e) => {
      $scope.selectedItem = $scope.items[2].value;
    })

    $scope.$on('businessHoursPreset', (e) => {
      $scope.selectedItem = $scope.items[3].value;
    })

    $scope.$on('eveningHoursPreset', (e) => {
      $scope.selectedItem = $scope.items[4].value;
    })

    $scope.$on('customPreset', (e) => {
      $scope.selectedItem = $scope.items[5].value;
    })

    const days = moment.weekdays().map((day, i) => {
      return { name: day.toLowerCase(), position: i + 1 };
    })

    $scope.options = {
      reset: false,
      onChange: function(selected) {
          console.log('selected: ', selected)
      },
      days: days,
      selected: week,
      disableRowSelection: false,
      disableColumnSelection: false
    }

    $scope.tooltip = {
      title: 'Click and drag to select multiple hours.',
      checked: false
    }

  }])

  .config(function($tooltipProvider) {
    angular.extend($tooltipProvider.defaults, {
      animation: 'am-flip-x',
      placement: 'right',
      trigger: 'hover'
    })
  })

angular.element(document).ready(function() {
  angular.bootstrap(document, ['app'])
})
