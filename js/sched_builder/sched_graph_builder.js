"use strict";

class SchedGraphBuilder{
  constructor(){
    this.sched_graph_text = "digraph SGraph { rankdir=LR  splines=true node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>,pin=true]";
    this.precedencesWithProducts = [];
    this.circleTaskPairs = [];
    this.longestPath = [];
    this.makePrecedencesWithProducts();
    this.buildGraph();
  }

  makePrecedencesWithProducts(){
    for(let precendence of recipieBuilder.precedences){
      this.precedencesWithProducts.push({from: precendence.from.name, to: precendence.to.name});
    }
    for(let precendence of this.getLastTasks()){
      this.precedencesWithProducts.push({from: precendence.name, to: precendence.product});
    }
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
  buildGraph(){
    let circle = new Circle(this.precedencesWithProducts);
    circle.CheckCircle();
    
    let coordinates = this.makeCoordinates();

    for(let coordinate of coordinates){
      this.sched_graph_text += '"' + coordinate.task + '" [ pos="' + coordinate.x + ',' + coordinate.y + '",';
      this.sched_graph_text += 'label = < <B>\\N</B><BR/>' + this.getEquipment(coordinate.task) + '> ]';
    }

    if(!recipieBuilder.circle){
      this.makeLongestPath();
    }

    for(let precedence of this.precedencesWithProducts){
      this.sched_graph_text += '"' + precedence.from + '" -> "' + precedence.to +
      '" [ label = "' + this.getProctime(precedence.from) + '" penwidth="' +
      (this.isInLongestPath(precedence.from, precedence.to) ? 4 : 1) +
      '" ]';
    }

    for(let precedence of schedBuilder.sched_precedences){
      this.sched_graph_text += '"' + precedence.from + '" -> "' + precedence.to +
      '" [ label = "' +
      (recipieBuilder.uis ? this.getProctime(precedence.from) : '') +
      '" style="dashed" penwidth="' +
      (this.isInLongestPath(precedence.from, precedence.to) ? 4 : 1) +
      '" ]';
    }

    this.sched_graph_text += 'layout="neato"}';

    //console.log(this.sched_graph_text);
  }
  isInLongestPath(from, to){
    for(let path of this.longestPath){
      if(from === path.from && to === path.to){
        return true;
      }
    }

    return false;
  }
  makeLongestPath(){
    let max_product = '';
    let path = {max_time: -1, tasks: []};
    for(let product of recipieBuilder.products){
      let tmp_path = this.getLongestPath(product.name)[0];
      if(tmp_path.max_time > path.max_time){
        path = tmp_path;
        max_product = product.name;
      }
    }

    this.longestPath = [];
    let index;
    for(index = 0; index < path.tasks.length - 1; index++){
      this.longestPath.push({from: path.tasks[index], to: path.tasks[index + 1]});
    }
    this.longestPath.push({from: this.longestPath[this.longestPath.length - 1].to, to: max_product});

    recipieBuilder.longestPathStartTask = path.tasks[1];
    recipieBuilder.longestPathEndTask = max_product;
    recipieBuilder.longestPathTime = path.max_time;
  }
  getLongestPath(task){
    let path = []; //max_time, tasks[]
    let prev_tasks = []; //from, to, number

    let circle = new Circle(this.precedencesWithProducts);
    let all_edges = circle.allEdges();

    all_edges.forEach(edge => {
      if(task === edge.to){
        prev_tasks.push({from: edge.from, to: edge.to, n: this.getProctime(edge.from)});
      }
    });

    let tasks = [];
    let max_task = '';
    let max = 0;
    prev_tasks.forEach(element => {
      let longest_path_hier = this.getLongestPath(element.from);
      if((longest_path_hier[0].max_time + +element.n) > max){
        max = longest_path_hier[0].max_time + +element.n;
        tasks = longest_path_hier[0].tasks;
        max_task = element.from;
      }
    });

    tasks.push(max_task);
    path.push({max_time: max, tasks: tasks});

    return path;
  }
  getProctime(search_task){
    for(let task of recipieBuilder.tasks){
      if(task.name === search_task){
        return task.equipment_and_proctime.proctime;
      }
    }

    return -1;
  }
  getEquipment(search_task){
    for(let task of recipieBuilder.tasks){
      if(task.name === search_task){
        if(typeof task.equipment_and_proctime.equipment === 'object'){
          return task.equipment_and_proctime.equipment.name;
        }
        else{
          return task.equipment_and_proctime.equipment;
        }
      }
    }
    return '';
  }
  makeCoordinates(){
    let coordinates = []; //task, x, y
    let product_with_tasks = this.getProductwithTasks();
    let x_distance = 2;
    let y_distance = 1;
 
    for(let product_task of product_with_tasks){
      let x_position = 0;
      let index = 1;
      for(let task of product_task.tasks){
      
        if(this.firstTask(task)){
          coordinates.push({task: task, x: 0, y: 0});
        }
        else{
          x_position = x_distance * index;
          index++;
          coordinates.push({task: task, x: x_position, y: 0});
        }
      }
      x_position = x_distance * index;
      coordinates.push({task: product_task.product, x: x_position, y: 0});
    }
    
    for(let coordinate of coordinates){
      let y_position = 0;

      let edges_to_task = this.getEdgesToTask(coordinate.task);
      
      let i;
      for(i = 0; i < edges_to_task.length; i++){
        for(let c of coordinates){
          if(c.task === edges_to_task[i]){
            y_position = y_distance * i;
            c.y -= y_position;
          }
        }
      }
      
      let product = this.getProduct(coordinate.task);

      for(let c of coordinates){
        for(let task of recipieBuilder.tasks){
          if(task.product === product){
            if(c.task === task.name){
              let yes = true;
              for(let edge of edges_to_task){
                if(c.task === edge){
                  yes = false;
                }
              }
              if(yes){
                c.y -= y_position / 2;
              }
            }
          }
        }
        if(c.task === product){
          c.y -= y_position / 2;
        }
      }
    }

    let rows = this.makeRows(); 

    for(let row of rows){
      let height = 0;
      for(let row_task of row.tasks){
        for(let coordinate of coordinates){
          if(row_task === coordinate.task){
            if(coordinate.y < height)  {
              height = coordinate.y;
            }
          }
        }
      }
      row.height = height - y_distance;
    }

    let row_distance = -.3;
    let i;
    for(i = 1; i < rows.length; i++){
      let height = row_distance * i;
      let index;
      for(index = 0; index < i; index++){
        height += rows[index].height;
      }
      for(let row_task of rows[i].tasks){
        for(let coordinate of coordinates){
          if(row_task === coordinate.task){
            coordinate.y += height;
          }
        }
      }
    }

    return coordinates;
  }
  makeRows(){
    let rows = []; //product, tasks[]

    for(let product of recipieBuilder.products){
      let tasks = [];
      for(let task of recipieBuilder.tasks){
        if(task.product === product.name){
          tasks.push(task.name);
        }
      }
      tasks.push(product.name);

      rows.push({product: product.name, tasks: tasks, height: 0});
    }

    return rows;
  }
  getProduct(search_task){
    let product = '';
    for(let task of recipieBuilder.tasks){
      if(search_task === task.name){
        product = task.product;
      }
    }

    return product;
  }
  getEdgesToTask(task){
    let edges_to_task = [];
    for(let precedence of this.precedencesWithProducts){
      if(task === precedence.to){
        edges_to_task.push(precedence.from);
      }
    }

    return edges_to_task;
  }
  firstTask(task){
    let first_task = true;

    for(let precedence of this.precedencesWithProducts){
      if(precedence.to === task){
        first_task = false;
      }
    }

    return first_task;
  }
  getProductwithTasks(){
    let product_with_tasks = [];

    for(let product of recipieBuilder.products){
      product_with_tasks.push({product: product.name, tasks: []});
    }

    for(let task_product of product_with_tasks){
      for(let task of recipieBuilder.tasks){
        if(task_product.product === task.product){
          task_product.tasks.push(task.name);
        }
      }
    } 

    return product_with_tasks;
  }
  get SchedGraphText(){
    return this.sched_graph_text;
  }
}