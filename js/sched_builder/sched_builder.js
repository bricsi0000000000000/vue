"use strict";

Vue.use(VueDraggable.default);
var schedBuilder = new Vue({
  data(){
    return{
      equipments: [],
      sched_precedences: []
    }
  },
  methods:{
    buildSchedGraph(){
      let schedGraphBuilder = new SchedGraphBuilder();

      var viz_graph = new Viz();
      viz_graph.renderSVGElement(schedGraphBuilder.SchedGraphText)
        .then(function (element) {
          document.getElementById('sched-graph').innerHTML = "";
          document.getElementById('sched-graph').appendChild(element);
          schedGraphBuilder.makeGanttDiagram();
        })
        .catch(error => {
          viz_graph = new Viz();
          console.error(error);
        });

    },
    buildDragAndDrop(){
      if(recipieBuilder.dragDropPrecedences.length <= 0){
        recipieBuilder.dragDropPrecedences = [];
        for(let equipment of recipieBuilder.equipments){
          recipieBuilder.dragDropPrecedences.push({equipment: equipment.name, tasks: []});
        }
      
        for(let task of recipieBuilder.tasks){
          for(let equipment of recipieBuilder.dragDropPrecedences){
            if(typeof task.equipment_and_proctime.equipment === 'object'){
              if(task.equipment_and_proctime.equipment.name === equipment.equipment){
                equipment.tasks.push(task.name);
              }
            }
            else{
              if(task.equipment_and_proctime.equipment === equipment.equipment){
                equipment.tasks.push(task.name);
              }
            }
          }
        }
      }
    },
    isEdgeLoop(from, to){
      if(from === to){
        return true;
      }
      else{
        return false;
      }
    },
    makeSchedPrecedences(drag_drop){
      this.sched_precedences = [];

      let index;
      for(index = 0; index < drag_drop.length; index++){
        if(recipieBuilder.uis){
          let task_index;
          for(task_index = 0; task_index < drag_drop[index].tasks.length - 1; task_index++){
            if(!this.isEdgeLoop(drag_drop[index].tasks[task_index], drag_drop[index].tasks[task_index + 1])){
              this.sched_precedences.push({from: drag_drop[index].tasks[task_index], to: drag_drop[index].tasks[task_index + 1]});
            }
          }
        }
        else{
          let task_index;
          for(task_index = 0; task_index < drag_drop[index].tasks.length - 1; task_index++){
            let precedence_index;
            let found = false;
            for(precedence_index = 0; precedence_index < recipieBuilder.precedences.length; precedence_index++){
              if(recipieBuilder.precedences[precedence_index].from.name === drag_drop[index].tasks[task_index]){
                found = true;
                if(!this.isEdgeLoop(recipieBuilder.precedences[precedence_index].to.name, drag_drop[index].tasks[task_index + 1])){
                  this.sched_precedences.push({from: recipieBuilder.precedences[precedence_index].to.name, to: drag_drop[index].tasks[task_index + 1]});
                }
              }
            }
            if(!found){
              let add_product = '';
              for(let task of recipieBuilder.tasks){
                if(task.name == drag_drop[index].tasks[task_index]){
                  add_product = task.product;
                }
              }
              if(!this.isEdgeLoop(add_product, drag_drop[index].tasks[task_index + 1])){
                this.sched_precedences.push({from: add_product, to: drag_drop[index].tasks[task_index + 1]});
              }
            }
          }
        }
      }
    }
  }
});