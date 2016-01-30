'use strict';

import d10ApiProvider from './d10ApiProvider';

(function (angular) {
  angular.module('d10-rest', [])
  .service('d10API', function ($http, $rootScope) {
    return d10ApiProvider(angular, $http, $rootScope);
  });
})(angular);
