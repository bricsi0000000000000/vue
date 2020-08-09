'use strict';

class RecipieGraphBuilder{
  constructor(){
    this._recipieGraphText = "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
    this.buildGraph();
  }

  buildGraph(){
    for(let task of main.taskManager.Tasks){
      let task_name = task.name;
      if(task_name.lastIndexOf('\\') !== -1){
        task_name += ' ';
      }

      let row = ' "' + task_name + '" [ label = < <B>\\N</B><BR/>';

      let equipments = [];
      for(let proctime of main.proctimeManager.Proctimes){
        if(proctime.task === task.name){
          equipments.push(proctime.equipment);
        }
      }

      if(equipments.length > 0){
        row += '{';
        for(let equipment of equipments){
          row += equipment + ',';
        }
        row = row.substring(0, row.length - 1);
        row += '}';
      }

      row += '> ]';

      this._recipieGraphText += row;
    }

    for(let precedence of main.precedenceManager.Precedences){
      let row = '"' + precedence.from + '" -> "' + precedence.to + '"';
      let proctime = main.proctimeManager.GetMinimumProctime(precedence.from);
      //let proctime = recipieBuilder.taskManager.GetTask(precedence.from).proctime;
      if(proctime === Infinity || proctime === -1){
         proctime = '""';
      }
      row += '[ label = ' + proctime + ' ]';

      this._recipieGraphText += row;
    }

    let last_tasks = main.precedenceManager.GetLastTasks();
    for(let task of last_tasks){
      let row = '"' + task + '" -> "' + main.taskManager.GetProduct(task) + '"';
      let proctime = main.proctimeManager.GetMinimumProctime(task);
      //let proctime = recipieBuilder.taskManager.GetTask(task).proctime;
      if(proctime === Infinity || proctime === -1){
        proctime = '""';
      }
      row += '[ label = ' + proctime + ' ]';

      this._recipieGraphText += row;
    }

    this._recipieGraphText += "}";
  }

  get recipieGraphText(){
   // console.log(this.recipie_graph_text);
    return this._recipieGraphText;
    //return "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>] \"a1\" [ label = < <B>\\N</B><BR/>{e}> ] \"a2\" [ label = < <B>\\N</B><BR/>{e}> ]\"a2\" -> \"a\" [ label = 2 ]\"a1\" -> \"a2\" [ label = 1 ]}";
  }
}