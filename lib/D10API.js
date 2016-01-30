'use strict';

import D10RestEvent from './D10RestEvent';

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
  let eventName = getEventName(action);
  let restEventName = getRestEventName();
  let evt = new D10RestEvent(action, data);

  pubsub.$broadcast(restEventName, evt);
  pubsub.$broadcast(eventName, evt);

  return evt;
}

function broadcastSuccessOrError(pubsub, action, evt, promise) {
  let eventName = getEventName(action);
  let restEventName = getRestEventName();

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

export default function d10ApiProvider(angular, http, pubsub) {

  class D10API {
    constructor (baseUrl) {
      this.setBaseUrl(baseUrl ? baseUrl : 'http://10er10.com/');
    }

    setBaseUrl (baseUrl) {
      this.baseUrl = baseUrl;
    }

    getApiRoot () {
      return this.baseUrl + 'api/';
    }

    getEndPoint (segments) {
      let suffix;

      if (angular.isArray(segments)) {
        suffix = segments.join('/');
      } else {
        suffix = segments;
      }

      return this.getApiRoot() + suffix;
    }

    login (username, password) {
      let data = {
        username: username,
        password: password
      };
      let action = 'login';
      let evt = broadcastStart(pubsub, action, data);
      let promise = http({
        url: this.getEndPoint('session'),
        method: 'POST',
        data: data
      });

      return broadcastSuccessOrError(pubsub, action, evt, promise);
    }
  }

  return D10API;
}
