'use strict';

class Equipment{
  constructor(new_equipment){
    this._name = new_equipment;
  }

  get name(){
    return this._name;
  }
}