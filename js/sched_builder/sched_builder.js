"use strict";

Vue.use(VueDraggable.default);
var schedBuilder = new Vue({
  data(){
    return{
      equipments: [],
    }
  },
  methods:{
    buidSchedGraph(){
      let schedGraphBuilder = new SchedGraphBuilder();

      var viz_graph = new Viz();
      viz_graph.renderSVGElement(schedGraphBuilder.SchedGraphText)
        .then(function (element) {
          document.getElementById('sched-graph').innerHTML = "";
          document.getElementById('sched-graph').appendChild(element);
        })
        .catch(error => {
          viz_graph = new Viz();
          console.error(error);
        });
    },
    buildDragAndDrop(){
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
  }
});