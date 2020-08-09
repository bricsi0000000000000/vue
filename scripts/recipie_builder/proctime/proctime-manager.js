'use strict';

class ProctimeManager{
  constructor(){
    this._proctimes = [];
  }

  AddProctime(new_proctime){
    this._proctimes.push(new_proctime);
  }

  RemoveProctime(task_name, equipment_name, time){
    this._proctimes.forEach((proctime, index) => {
      if(proctime.task === task_name &&
         proctime.equipment === equipment_name &&
         proctime.proctime === time)
      {
        this._proctimes.splice(index, 1);
        return;
      }
    });
  }
  
  GetProctime(task_name, equipment_name){
    for(let proctime of this._proctimes){
      if(proctime.task === task_name &&
         proctime.equipment === equipment_name)
      {
        return proctime;
      }
    }

    return null;
  }

  UpdateProctimesAsTasks(tasks){
    let removable_proctimes = [];
    this._proctimes.forEach(proctime =>{
      let removable = true;
      tasks.forEach(task =>{
        if(task.name === proctime.task){
          removable = false;
        }
      });
      if(removable){
        removable_proctimes.push(proctime);
      }
    });

    removable_proctimes.forEach(removable_proctime =>{
      this.RemoveProctime(removable_proctime.task, removable_proctime.equipment, removable_proctime.proctime);
    });
  }

  UpdateProctimesAsEquipments(equipments){
    let removable_proctimes = [];
    this._proctimes.forEach(proctime =>{
      let removable = true;
      equipments.forEach(equipment =>{
        if(equipment.name === proctime.equipment){
          removable = false;
        }
      });
      if(removable){
        removable_proctimes.push(proctime);
      }
    });

    removable_proctimes.forEach(removable_proctime =>{
      this.RemoveProctime(removable_proctime.task, removable_proctime.equipment, removable_proctime.proctime);
    });
  }

  GetMinimumProctime(task_name){
    let proctimes = [];
    for(let proctime of this._proctimes){
      if(proctime.task === task_name){
        proctimes.push(proctime.proctime);
      }
    }
    
    if(proctimes.length === 0){
      return -1;
    }

    return Math.min(...proctimes);
  }

  GetEquipments(task){
    let equipments = [];
    for(let proctime of this._proctimes){
      if(proctime.task == task)
      {
        equipments.push(proctime.equipment);
      }
    }

    return equipments;
  }

  IsEquipment(task_name, equipment_name){
    for(let equipment of this.GetEquipments(task_name)){
      if(equipment === equipment_name){
        return true;
      }
    }

    return false;
  }

  get ProctimesLength(){
    return this._proctimes.length;
  }

  get Proctimes(){
    return this._proctimes;
  }

  ClearProctimes(){
    this._proctimes = [];
  }

 /* GetEquipment(task){
    let equipment = '';
    for(let proctime of this.proctimes){
      if(proctime.task == task &&
         proctime.proctime == this.GetMinimumProctime(task))
      {
        equipment = proctime.equipment;
      }
    }

    return equipment;
  }*/
}