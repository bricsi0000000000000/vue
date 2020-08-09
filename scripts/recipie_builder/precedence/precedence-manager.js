'use strict';

class PrecedenceManager{
  constructor(){
    this._precedences = [];
    this._fromPrecedences = [];
    this._toPrecedences = [];
  }

  AddPrecedence(new_precedence){
    this._precedences.push(new_precedence);
  }

  RemovePrecedence(from_name, to_name){
    this._precedences.forEach((precedence, index) => {
      if(precedence.from === from_name &&
         precedence.to == to_name)
      {
        this._precedences.splice(index, 1);
        return;
      }
    });
  }
  
  GetPrecedence(from_name, to_name){
    for(let precedence of this._precedences){
      if(precedence.from === from_name &&
         precedence.to == to_name)
      {
        return precedence;
      }
    }

    return null;
  }

  FillFromAndToPrecedences(tasks){
    this._fromPrecedences = [];
    this._toPrecedences = [];
    for(let task of tasks){
      this._fromPrecedences.push(task.name);
      this._toPrecedences.push(task.name);
    }
  }

  RemoveFrom(from_name){
    this._fromPrecedences = [];
    for(let task of main.taskManager.Tasks){
      if(main.taskManager.GetProduct(task.name) === main.taskManager.GetProduct(from_name)){
        if(task.name !== from_name){
          this._fromPrecedences.push(task.name);
        }
      }
    }
  }

  RemoveTo(to_name){
    this._toPrecedences = [];
    for(let task of main.taskManager.Tasks){
      if(main.taskManager.GetProduct(task.name) === main.taskManager.GetProduct(to_name)){
        if(task.name !== to_name){
          this._toPrecedences.push(task.name);
        }
      }
    }
  }

  UpdatePrecedences(tasks){
    let removable_precedences = [];
    this._precedences.forEach(precedence =>{
      let removable = true;
      tasks.forEach(task => {
        if(task.name === precedence.from){
          removable = false;
        }
      });
      if(removable){
        removable_precedences.push(precedence);
      }
    });

    this._precedences.forEach(precedence =>{
      let removable = true;
      tasks.forEach(task => {
        if(task.name === precedence.to){
          removable = false;
        }
      });
      if(removable){
        removable_precedences.push(precedence);
      }
    });

    removable_precedences.forEach(removable_precedence =>{
      this.RemovePrecedence(removable_precedence.from, removable_precedence.to);
    });
  }

  GetLastTasks(){
    let last_tasks = [];

    for(let precedence1 of this._precedences){
      let add = true;
      for(let precedence2 of this._precedences){
        if(precedence1.to === precedence2.from){
          add = false;
        }
      }
      if(add){
        let is_in = false;
        for(let last_task of last_tasks){
          if(precedence1.to === last_task){
            is_in = true;
          }
        }
    
        if(!is_in){
          last_tasks.push(precedence1.to);
        }
      }
    }

    return last_tasks;
  }

  get PrecedencesLength(){
    return this._precedences.length;
  }

  get Precedences(){
    return this._precedences;
  }
  get FromPrecedences(){
    return this._fromPrecedences;
  }
  get ToPrecedences(){
    return this._toPrecedences;
  }

  ClearPrecedences(){
    this._precedences = [];
  }
}