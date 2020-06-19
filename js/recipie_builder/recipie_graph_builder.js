"use strict";

class RecipieGraphBuilder{
  constructor(){
    this.recipie_graph_text = "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
    this.buildGraph();
  }

  buildGraph(){
    for(let task of recipieBuilder.tasks){
      let task_name = task.name;
      if(task_name.lastIndexOf("\\") !== -1){
        task_name += " ";
      }

      let row = " \"" + task_name + "\" [ label = < <B>\\N</B><BR/>"

      if(task.equipments.length > 0){
        row += "{";
        for(let equipment of task.equipments){
          row += equipment + ",";
        }
        row = row.substring(0, row.length - 1);
        row += "}";
      }
      row += "> ]";

      this.recipie_graph_text += row;
    }

    for(let precedence of recipieBuilder.precedences){
      let row = "\"" + precedence.from.name + "\" -> \"" + precedence.to.name + "\"";
      let proctime = precedence.from.equipment_and_proctime.proctime;
      if(proctime !== undefined && proctime !== -1){
        row += "[ label = " + proctime + " ]";
      }

      this.recipie_graph_text += row;
    }

    let last_tasks = this.getLastTasks();
    for(let task of last_tasks){
      let row = "\"" + task.name + "\" -> \"" + task.product + "\"";
      let proctime = task.equipment_and_proctime.proctime;
      if(proctime !== undefined && proctime !== -1){
        row += "[ label = " + proctime + " ]";
      }

      this.recipie_graph_text += row;
    }

    this.recipie_graph_text += "}";
  }

  getLastTasks(){
    let last_tasks = [];

    for(let p1 of recipieBuilder.precedences){
      let add = true;
      for(let p2 of recipieBuilder.precedences){
        if(p1.to.name === p2.from.name){
          add = false;
        }
      }
      if(add){
        if(!this.isTaskInArray(p1.to, last_tasks)){
          last_tasks.push(p1.to);
        }
      }
    }

    return last_tasks;
  }

  isTaskInArray(task, array){
    for(let item of array){
      if(task.name === item.name){
        return true;
      }
    }

    return false;
  }

  get recipieGraphText(){
    //console.log(this.recipie_graph_text);
    return this.recipie_graph_text;
    //return "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>] \"a1\" [ label = < <B>\\N</B><BR/>{e}> ] \"a2\" [ label = < <B>\\N</B><BR/>{e}> ]\"a2\" -> \"a\" [ label = 2 ]\"a1\" -> \"a2\" [ label = 1 ]}";
  }
}