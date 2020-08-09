'use strict';

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
          document.getElementById('sched-graph').innerHTML = '';
          document.getElementById('sched-graph').appendChild(element);
          schedGraphBuilder.makeGanttDiagram();
        })
        .catch(error => {
          viz_graph = new Viz();
          console.error(error);
        });

    },
    buildDragAndDrop(){
      if(main.dragDropPrecedences.length <= 0){
        main.dragDropPrecedences = [];
        for(let equipment of main.equipmentManager.Equipments){
          main.dragDropPrecedences.push({equipment: equipment.name, tasks: []});
        }
      
        for(let task of main.taskManager.Tasks){
          for(let drag_drop_precedence of main.dragDropPrecedences){
            if(task.equipment === drag_drop_precedence.equipment){
              drag_drop_precedence.tasks.push(task.name);
            }
          }
        }
      }
    },
    makeSchedPrecedences(drag_drop){
      this.sched_precedences = [];

      let index;
      for(index = 0; index < drag_drop.length; index++){
        if(main.uis){
          let task_index;
          for(task_index = 0; task_index < drag_drop[index].tasks.length - 1; task_index++){
            if(drag_drop[index].tasks[task_index] !== drag_drop[index].tasks[task_index + 1]){
              this.sched_precedences.push({from: drag_drop[index].tasks[task_index], to: drag_drop[index].tasks[task_index + 1]});
            }
          }
        }
        else{
          let task_index;
          for(task_index = 0; task_index < drag_drop[index].tasks.length - 1; task_index++){
            let precedence_index;
            let found = false;
            for(precedence_index = 0; precedence_index < main.precedenceManager.PrecedencesLength; precedence_index++){
              if(main.precedenceManager.Precedences[precedence_index].from === drag_drop[index].tasks[task_index]){
                found = true;
                if(main.precedenceManager.Precedences[precedence_index].to !== drag_drop[index].tasks[task_index + 1]){
                  this.sched_precedences.push({from: main.precedenceManager.Precedences[precedence_index].to, to: drag_drop[index].tasks[task_index + 1]});
                }
              }
            }
            if(!found){
              let add_product = '';
              for(let task of main.taskManager.Tasks){
                if(task.name == drag_drop[index].tasks[task_index]){
                  add_product = main.taskManager.GetProduct(task.name);
                }
              }
              if(add_product !== drag_drop[index].tasks[task_index + 1]){
                this.sched_precedences.push({from: add_product, to: drag_drop[index].tasks[task_index + 1]});
              }
            }
          }
        }
      }
    }
  }
});