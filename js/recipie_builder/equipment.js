"use strict";

class Equipment{
  constructor(new_equipment){
    this.name = new_equipment;
  }

  get Equipment(){
    return this.name;
  }
  set Equipment(new_equipment){
    this.name = new_equipment;
  }
}