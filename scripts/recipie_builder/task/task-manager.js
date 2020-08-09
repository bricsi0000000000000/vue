'use strict';

class TaskManager{
  constructor(){
    this._tasks = [];
  }

  AddTask(new_task){
    this._tasks.push(new_task);
  }

  RemoveTask(task_name, product_name){
    this._tasks.forEach((task, index) => {
      if(task.name === task_name &&
         task.product === product_name)
      {
        this._tasks.splice(index, 1);
        return;
      }
    });
  }
  
  GetTask(task_name){
    for(let task of this._tasks){
      if(task.name === task_name){
        return task;
      }
    }

    return null;
  }

  GetProduct(search_task){
    for(let task of this._tasks){
      if(task.name === search_task){
        return task.product;
      }
    }
  }

  UpdateTasks(products){
    let removable_tasks = [];
    this._tasks.forEach(task =>{
      let removable = true;
      products.forEach(product =>{
        if(task.product === product.name){
          removable = false;
        }
      });
      if(removable){
        removable_tasks.push(task);
      }
    });

    removable_tasks.forEach(removable_task =>{
      this.RemoveTask(removable_task.name, removable_task.product);
    });
  }

  Update(task_name, equipment_name, proctime){
    this.GetTask(task_name).equipment = equipment_name;
    this.GetTask(task_name).proctime = proctime === null ? main.proctimeManager.GetProctime(task_name, equipment_name).proctime : proctime;
  }

  get TasksLength(){
    return this._tasks.length;
  }

  get Tasks(){
    return this._tasks;
  }

  ClearTasks(){
    this._tasks = [];
  }
}