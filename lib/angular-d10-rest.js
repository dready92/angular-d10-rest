'use strict';

(function (angular) {
  let d10ApiProvider = require('./D10API');

  angular.module('d10-rest', [])
  .service('d10API', function ($http, $rootScope) {
    return d10ApiProvider(angular, $http, $rootScope);
  });
})(angular);
