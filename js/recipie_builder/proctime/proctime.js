'use strict';

class Proctime{
  constructor(task_name, equipment_name, proctime){
    this._task = task_name;
    this._equipment = equipment_name;
    this._proctime = proctime;
  }

  get task(){
    return this._task;
  }

  get equipment(){
    return this._equipment;
  }

  get proctime(){
    return this._proctime;
  }
}