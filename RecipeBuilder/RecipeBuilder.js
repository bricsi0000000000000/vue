var vm = new Vue({
  el: '#RecipeBuilder',
  data: {
    precedences: [
      { task1: 'A1', task2: 'A2' },
      { task1: 'A2', task2: 'A' },
      { task1: 'B1', task2: 'B2' },
      { task1: 'B2', task2: 'B3' },
      { task1: 'B3', task2: 'B' },
      { task1: 'C1', task2: 'C2' },
      { task1: 'C2', task2: 'C' },
    ],
    proctimes: [
      { task: 'A1', eq: 'E4', proctime: 4 },
      { task: 'A2', eq: 'E3', proctime: 5 },
      { task: 'B1', eq: 'E2', proctime: 7 },
      { task: 'B2', eq: 'E1', proctime: 3 },
      { task: 'B2', eq: 'E2', proctime: 5 },
      { task: 'B3', eq: 'E3', proctime: 6 },
      { task: 'C1', eq: 'E4', proctime: 4 },
      { task: 'C1', eq: 'E3', proctime: 3 },
      { task: 'C2', eq: 'E1', proctime: 6 },
      { task: 'C2', eq: 'E2', proctime: 4 },
    ],
    vizGraphSzoveg:""
  },
  methods:{
    vizGraphOut(){
      this.vizGraphSzoveg += "digraph SGraph { rankdir=LR node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
      for(i=0; i< this.precedences.length; i++){
        this.vizGraphSzoveg += " " + this.precedences[i].task1 + " [ label = < <B>\\N</B><BR/>{";
        for(j=0; j< this.proctimes.length; j++){
          if(this.proctimes[j].task === this.precedences[i].task1){
            this.vizGraphSzoveg += this.proctimes[j].eq + ",";
          }
        }
        this.vizGraphSzoveg = this.vizGraphSzoveg.substring(0,this.vizGraphSzoveg.length-1);
        this.vizGraphSzoveg +="}> ]";
      }

      for(i=0; i< this.precedences.length; i++){
        this.vizGraphSzoveg += " " + this.precedences[i].task1 + " -> " + this.precedences[i].task2;
        for(j=0; j< this.proctimes.length; j++){
          if(this.proctimes[j].task === this.precedences[i].task1){
            this.vizGraphSzoveg += " [ label = " + this.proctimes[j].proctime + " ]";
          }
        }
      }

      this.vizGraphSzoveg += "}";
    }
  }
})