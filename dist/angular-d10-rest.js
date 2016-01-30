(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = d10ApiProvider;

var _D10RestEvent = require('./D10RestEvent');

var _D10RestEvent2 = _interopRequireDefault(_D10RestEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getRestEventName() {
  return 'd10:rest';
}

function getEventName(action) {
  return getRestEventName() + ':' + action;
}

function toSuccessName(eventName) {
  return eventName + ':success';
}

function toErrorName(eventName) {
  return eventName + ':error';
}

function broadcastStart(pubsub, action, data) {
  var eventName = getEventName(action);
  var restEventName = getRestEventName();
  var evt = new _D10RestEvent2.default(action, data);

  pubsub.$broadcast(restEventName, evt);
  pubsub.$broadcast(eventName, evt);

  return evt;
}

function broadcastSuccessOrError(pubsub, action, evt, promise) {
  var eventName = getEventName(action);
  var restEventName = getRestEventName();

  return promise.then(function (response) {
    evt.setResponse(response);
    pubsub.$broadcast(toSuccessName(eventName), evt);
    pubsub.$broadcast(toSuccessName(restEventName), evt);

    return response;
  }, function (error) {
    evt.setError(error);
    pubsub.$broadcast(toErrorName(eventName), evt);
    pubsub.$broadcast(toErrorName(restEventName), evt);
    throw error;
  });
}

function d10ApiProvider(angular, http, pubsub) {
  var D10API = function () {
    function D10API(baseUrl) {
      _classCallCheck(this, D10API);

      this.setBaseUrl(baseUrl ? baseUrl : 'http://10er10.com/');
    }

    _createClass(D10API, [{
      key: 'setBaseUrl',
      value: function setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
      }
    }, {
      key: 'getApiRoot',
      value: function getApiRoot() {
        return this.baseUrl + 'api/';
      }
    }, {
      key: 'getEndPoint',
      value: function getEndPoint(segments) {
        var suffix = undefined;

        if (angular.isArray(segments)) {
          suffix = segments.join('/');
        } else {
          suffix = segments;
        }

        return this.getApiRoot() + suffix;
      }
    }, {
      key: 'login',
      value: function login(username, password) {
        var data = {
          username: username,
          password: password
        };
        var action = 'login';
        var evt = broadcastStart(pubsub, action, data);
        var promise = http({
          url: this.getEndPoint('session'),
          method: 'POST',
          data: data
        });

        return broadcastSuccessOrError(pubsub, action, evt, promise);
      }
    }]);

    return D10API;
  }();

  return D10API;
}

},{"./D10RestEvent":2}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var D10RestEvent = function () {
  function D10RestEvent(action, data) {
    _classCallCheck(this, D10RestEvent);

    this.action = action;
    this.data = data;
  }

  _createClass(D10RestEvent, [{
    key: 'setResponse',
    value: function setResponse(response) {
      this.response = response;
    }
  }, {
    key: 'setError',
    value: function setError(error) {
      this.error = error;
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      var obj = {
        action: this.action,
        data: this.data
      };

      if (this.response) {
        obj.response = this.response;
      }
      if (this.error) {
        obj.error = this.error;
      }

      return obj;
    }
  }]);

  return D10RestEvent;
}();

exports.default = D10RestEvent;

},{}],3:[function(require,module,exports){
'use strict';

(function (angular) {
  var d10ApiProvider = require('./D10API');

  angular.module('d10-rest', []).service('d10API', function ($http, $rootScope) {
    return d10ApiProvider(angular, $http, $rootScope);
  });
})(angular);

},{"./D10API":1}]},{},[3]);
