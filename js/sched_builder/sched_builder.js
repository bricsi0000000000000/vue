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
  }
});