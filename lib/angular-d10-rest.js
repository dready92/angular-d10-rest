'use strict';

(function (angular) {
  let D10API = require('./D10API');

  angular.module('d10-rest', [])
  .service('d10API', D10API);
})(angular);
