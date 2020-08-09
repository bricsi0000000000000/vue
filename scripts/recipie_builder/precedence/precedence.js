'use strict';

class Precedence{
  constructor(from_name, to_name){
    this._from = from_name;
    this._to = to_name;
  }

  get from(){
    return this._from;
  }

  get to(){
    return this._to;
  }
}