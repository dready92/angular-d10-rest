'use strict';

export default class D10RestEvent {

  constructor(action, data) {
    this.action = action;
    this.data = data;
  }

  setResponse(response) {
    this.response = response;
  }

  setError(error) {
    this.error = error;
  }

  toJson() {
    let obj = {
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
}
