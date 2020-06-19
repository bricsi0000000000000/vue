"use strict";

class Circle{
  constructor(precedencesWithProducts){
    this.precedencesWithProducts = precedencesWithProducts;
    this.circleTaskPairs = [];
  }
  CheckCircle(){
    recipieBuilder.circle = false;

    let start_tasks = this.getStartTasks();
    for(let start_task of start_tasks){
      let to_tasks = this.getToTasks(start_task);
      let circle_array = [];
      circle_array.push({task: start_task, to_tasks: to_tasks, end: true});

      for(let edge of this.allEdges()){
        if(!recipieBuilder.circle){
          let end_tasks = []; //task, to_tasks, end
          for(let circle_item of circle_array){
            if(circle_item.end){
              end_tasks.push({task: circle_item.task, to_tasks: circle_item.to_tasks, end: true});
            }
          }
          to_tasks = this.getToTasks(end_tasks[0].to_tasks[0]);

          //megnézem hogy ezek közül van e amivel kör lesz
          for(let to_task of to_tasks){
            if(!recipieBuilder.circle){
              for(let circle_item of circle_array){
                if(!recipieBuilder.circle){
                  if(to_task == circle_item.task){
                    recipieBuilder.circle = true;
                    circle_array.push({task: circle_array[circle_array.length - 1].to_tasks[0], to_tasks: [], end: false});
                    circle_array.push({task: to_task, to_tasks: [], end: false});
                  }
                }
              }
            }
          }

          if(recipieBuilder.circle){
            let end_task = circle_array[circle_array.length - 1].task;
            let stop = false;
            let circle_search_item_index;
            for (circle_search_item_index = 0; circle_search_item_index < circle_array.length && !stop; circle_search_item_index++) { //task, to_tasks, end
              if (circle_array[circle_search_item_index].task === end_task) {
                stop = true;
              }
            }

            let tmp_array = [];
            let circle_item_index;
            for(circle_item_index = circle_search_item_index - 1; circle_item_index < circle_array.length; circle_item_index++){
              tmp_array.push(circle_array[circle_item_index].task);
            }

            this.circleTaskPairs = [];
            this.getCircleTaskPairs(tmp_array); //from, to
          }
          else{
            let end = to_tasks.length > 0;
            circle_array.push({task: end_tasks[0].to_tasks[0], to_tasks: to_tasks, end: end});
            let tmp_array = [];

            let end_task_index;
            for(end_task_index = 1; end_task_index < end_tasks[0].to_tasks.length; end_task_index++){
              tmp_array.push(end_tasks[0].to_tasks[end_task_index]);
            }

            end_tasks[0].to_tasks = tmp_array;

            circle_array[circle_array.length - 2] = end_tasks[0];

            let index;
            for(index = 0; index < circle_array.length; index++){
              if(circle_array[index].to_tasks.length > 0){
                circle_array[index].end = true;

                let j;
                for(j = 0; j < index; j++){
                  circle_array[j].end = false;
                }
              }
            }

            //el kell venni az end utániakat
            tmp_array = [];
            let stop = false;
            for(index = 0; index < circle_array.length && !stop; index++){
              if(circle_array[index].end){
                stop = true;
                tmp_array.push({task: circle_array[index].task, to_tasks: circle_array[index].to_tasks, end: circle_array[index].end});
              }
              else{
                tmp_array.push({task: circle_array[index].task, to_tasks: circle_array[index].to_tasks, end: circle_array[index].end});
              }
            }

            circle_array = [];
            tmp_array.forEach(tmp => {
              circle_array.push({task: tmp.task, to_tasks: tmp.to_tasks, end: tmp.end});
            });
          }
        }
      }
    }
  }
  getCircleTaskPairs(tmp_array){
    let index;
    for(index = 0; index < tmp_array.length - 1; index++){
      let stop = false;
      let circle_task_pair_index;
      for(circle_task_pair_index = 0; circle_task_pair_index < this.circleTaskPairs.length & !stop; circle_task_pair_index++){
        if(this.circleTaskPairs[circle_task_pair_index].from === tmp_array[index] &&
           this.circleTaskPairs[circle_task_pair_index].to === tmp_array[index + 1])
          {
            stop = true;
          }
      }
      if(!stop){
        this.circleTaskPairs.push({from: tmp_array[index], to: tmp_array[index + 1]});
      }
    }
  }
  getToTasks(compare_task){
    let to_tasks = [];
    for(let task of this.allEdges()){
      if(compare_task === task.from){
        to_tasks.push(task.to);
      }
    }

    return to_tasks;
  }
  allEdges(){
    let all_edges = [];

    for(let precedence of this.precedencesWithProducts){
      all_edges.push({from: precedence.from, to: precedence.to});
    }

    for(let precedence of schedBuilder.sched_precedences){
      all_edges.push({from: precedence.from, to: precedence.to});
    }

    return all_edges;
  }
  getStartTasks(){
    let start_tasks = [];

    for(let precedence1 of recipieBuilder.precedences){
      let yes = true;
      for(let precedence2 of recipieBuilder.precedences){
        if(precedence1.from.name === precedence2.to.name){
          yes = false;
        }
      }
      if(yes){
        if(!this.isInStartTasks(start_tasks, precedence1.from.name)){
          start_tasks.push(precedence1.from.name);
        }
      }
    }

    return start_tasks;
  }
  isInStartTasks(start_tasks, task){
    let yes = false;
    let index;
    for (index = 0; index < start_tasks.length && !yes; index++) {
      if (task === start_tasks[index]) {
        yes = true;
      }
    }

    return yes;
  }
  isInCircle(from, to){
    for(let edge of this.circleTaskPairs){
      if(from === edge.from && to === edge.to){
        return true;
      }
    }
    
    return false;
  }
}