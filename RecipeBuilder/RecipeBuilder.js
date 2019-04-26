var vm = new Vue({
  el: '#RecipeBuilder',
  data() {
    return{
      taskName: '',
      productName: '',
      tasks: [], //name, product

      equipmentName:'',
      equipments: [],

      warningTxt:"",

      task1:"",
      task2:"",
      precedences: [], //task1, task2

      tasksAndProducts:[],

      proctimes:[], //task, eq, proctime
      proctime:"",
      proctime_task:"",
      proctime_eq:"",

      taskEquipment:[], //which task which equipments | task, eqs []

      vizGraphTxt:"",
    }
  }, 
  methods:{
    addTask(){
        this.tasks.push({name: this.taskName, product: this.productName});
        this.addTasksAndProducts();
        this.taskName='';
        this.productName='';
        this.deleteEmptyTask();
    },
    deleteTask(id){
      this.tasks.splice(id,1);
    },
    addTasksAndProducts(){
      this.tasksAndProducts.push(this.taskName);

      yes=true;
      for(i=0; i< this.tasksAndProducts.length; i++){
        if(this.tasksAndProducts[i] === this.productName){
          yes=false;
        }
      }
      if(yes){
        this.tasksAndProducts.push(this.productName);
      }
    },
    addEquipment(){
      this.equipments.push(this.equipmentName);
      this.equipmentName='';

      this.deleteEmptyEq();
    },
    deleteEq(id){
      this.equipments.splice(id,1);
    },
    addPrecedence(){
      this.precedences.push({task1: this.task1, task2: this.task2});

      this.task1="";
      this.task2="";

      this.deleteSamePrecedences();
      this.deleteDuplicatePrecedence();
    },
    deletePrecendence(id){
      this.precedences.splice(id,1);
    },
    addProctime(){
      this.proctimes.push({task: this.proctime_task, eq: this.proctime_eq, proctime: this.proctime});
      this.proctime="";
      this.proctime_task="",
      this.proctime_eq="",

      this.deleteEmptyProctime();
    },
    deleteProctime(id){
      this.proctimes.splice(id,1);
    },
    deleteEmptyProctime(){
      for(i=0; i< this.proctimes.length; i++){
        if(this.proctimes[i].task === ""){
          this.deleteProctime(i);
          this.showWarning("PROCTIME: task name is empty");
        }
        else if(this.proctimes[i].eq === ""){
          this.deleteProctime(i);
          this.showWarning("PROCTIME: equipment name is empty");
        }
        else if(this.proctimes[i].proctime === ""){
          this.deleteProctime(i);
          this.showWarning("PROCTIME: proctime name is empty");
        }
        else{
          this.warningTxt="";
        }
      }
    },
    deleteEmptyTask(){
      for(i=0; i< this.tasks.length; i++){
        if(this.tasks[i].name === ''){
          this.deleteTask(i);
          this.showWarning("TASKS: task name is empty");
        }
        else if(this.tasks[i].product === ''){
          this.deleteTask(i);
          this.showWarning("TASKS: product name is empty");
        }
        else{
          this.warningTxt="";
        }
      }
    },
    deleteEmptyEq(){
      for(i=0; i< this.equipments.length; i++){
        if(this.equipments[i] === ''){
          this.deleteEq(i);
          this.showWarning("EQUIPMENTS: Equipment name is empty");
        }
        else{
          this.warningTxt="";
        }
      }
    },
    showWarning(text){
      this.warningTxt = text;
    },
    deleteDuplicatePrecedence(){
      for(i=0; i < this.precedences.length-1; i++){
        if(this.precedences[i].task1 === this.precedences[i+1].task1 &&
          this.precedences[i].task2 === this.precedences[i+1].task2){
          this.deletePrecendence(i,1);
          this.showWarning("Same precedences");
          }
      }
    },
    deleteSamePrecedences(){
      for(i=0; i< this.precedences.length; i++){
        if(this.precedences[i].task1 === this.precedences[i].task2){
          this.deletePrecendence(i,1);
          this.showWarning("Same tasks");
        }
      }
    },
    equipmentsToTask(){
      for(i=0; i< this.proctimes.length; i++){
        taskTemp = this.proctimes[i].task;
        eqTemp=[];
        for(j=0; j< this.proctimes.length; j++){
          if(this.proctimes[j].task === taskTemp){
            eqTemp.push(this.proctimes[j].eq);
          }
        }
       
        yes=true;
        for(j=0; j< this.taskEquipment.length; j++){
          if(this.taskEquipment[j].task === taskTemp){
            yes=false;
          }
        }
        if(yes){
          this.taskEquipment.push({task: taskTemp, eqs: eqTemp});
        }
      }
    },
    vizGraphTxtOut(){
      this.equipmentsToTask();
      this.vizGraphTxt ="digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]"
      for(i=0; i< this.taskEquipment.length; i++){
        this.vizGraphTxt += " " + this.taskEquipment[i].task + " [ " + "label = < <B>\\N</B><BR/>{";
        for(j=0; j< this.taskEquipment[i].eqs.length; j++){
          this.vizGraphTxt += this.taskEquipment[i].eqs[j] +",";
        }
        this.vizGraphTxt = this.vizGraphTxt.substring(0,this.vizGraphTxt.length-1);
        this.vizGraphTxt += "}> ]";
      }

      for(i=0; i< this.precedences.length; i++){
        this.vizGraphTxt += this.precedences[i].task1 + " -> " + this.precedences[i].task2;

        minProctime = this.proctimes[0].proctime;
        for(j=0; j< this.proctimes.length; j++){
          if(this.proctimes[j].task === this.precedences[i].task1){
            if(this.proctimes[j].proctime < minProctime){
              minProctime = this.proctimes[j].proctime;
            }
          }
        }
        this.vizGraphTxt += " [ label = " + minProctime + " ]";
      }
      this.vizGraphTxt += "}";
    },
  },
})