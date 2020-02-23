"use strict";

class Equipment{
  constructor(new_equipment){
    this.name = new_equipment;
    this.tasks = [];
  }

  get Equipment(){
    return this.name;
  }
  set Equipment(new_equipment){
    this.name = new_equipment;
  }

  get Tasks(){
    return this.tasks;
  }
  AddTask(task){
    this.tasks.push(task);
  }
}