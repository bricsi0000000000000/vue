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

      taskEquipment:[], //which task which equipments | task, eqs[]

      vizGraphTxt:"",

      show:false,
    }
  }, 
  methods:{
    addTask(){
        this.tasks.push({name: this.taskName, product: this.productName});
        this.taskName='';
        this.productName='';
        this.addTasksAndProducts();
        this.deleteEmptyTask();
        this.deleteSameTasks();
        this.deleteDuplicateTasks();
    },
    deleteTask(id){
      deleteTask = this.tasks[id].name;

      //DELETE PRECEDENCE
      deleteIds=[];

      for(i=0; i< this.precedences.length; i++){
        if(this.precedences[i].task1 === deleteTask || this.precedences[i].task2 === deleteTask){
          deleteIds.push(i);
        }
      }

      for(i=0; i < deleteIds.length; i++){
        this.deletePrecendence(deleteIds[i]);
      }

      //DELETE PROCTIME
      deleteIds=[];

      for(i=0; i< this.proctimes.length; i++){
        if(this.proctimes[i].task === deleteTask ){
          deleteIds.push(i);
        }
      }

      for(i=0; i < this.proctimes.length; i++){
        this.deleteProctime(deleteIds[i]);
      }

      this.tasks.splice(id,1);
      this.addTasksAndProducts();
    },
    deleteSameTasks(){
      for(i=0; i< this.tasks.length; i++){
        if(this.tasks[i].name === this.tasks[i].product){
          this.deleteTask(i);
          this.showWarning("Same tasks");
        }
      }

      for(i=0; i < this.tasks.length; i++){
        for(j=i+1; j < this.tasks.length; j++){
          if(this.tasks[j].product === this.tasks[i].name){
            this.deleteTask(j);
            this.showWarning("Same tasks");
          }
        }
      }
    },
    deleteDuplicateTasks(){
      for(i=0; i < this.tasks.length; i++){
        for(j=i+1; j < this.tasks.length; j++){
          if(this.tasks[j].name === this.tasks[i].name &&
            this.tasks[j].product === this.tasks[i].product ){
            this.deleteTask(j);
            this.showWarning("Same tasks");
          }
        }
      }
    },
    addTasksAndProducts(){
      this.tasksAndProducts=[];

      for(j=0; j< this.tasks.length; j++){
        this.tasksAndProducts.push(this.tasks[j].name);

        yes=true;
        for(i=0; i< this.tasksAndProducts.length; i++){
          if(this.tasksAndProducts[i] === this.tasks[j].product){
            yes=false;
          }
        }
        if(yes){
          this.tasksAndProducts.push(this.tasks[j].product);
        }
      }
    },
    addEquipment(){
      this.equipments.push(this.equipmentName);
      this.equipmentName='';

      this.deleteEmptyEq();
      this.deleteDuplicateEquipments();
    },
    deleteEq(id){
      this.equipments.splice(id,1);
    },
    deleteDuplicateEquipments(){
      for(i=0; i < this.equipments.length; i++){
        for(j=i+1; j < this.equipments.length; j++){
          if(this.equipments[j] === this.equipments[i]){
            this.deleteEq(j);
            this.showWarning("Same equipments");
          }
        }
      }
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
    deleteDuplicatePrecedence(){
      for(i=0; i < this.precedences.length; i++){
        for(j=i+1; j < this.precedences.length; j++){
          if(this.precedences[j].task1 === this.precedences[i].task1 &&
            this.precedences[j].task2 === this.precedences[i].task2){
            this.deletePrecendence(j);
            this.showWarning("Same precedences");
          }
        }
      }
    },
    deleteSamePrecedences(){
      for(i=0; i< this.precedences.length; i++){
        if(this.precedences[i].task1 === this.precedences[i].task2){
          this.deletePrecendence(i);
          this.showWarning("Same tasks");
        }
      }
    },
    addProctime(){
      this.proctimes.push({task: this.proctime_task, eq: this.proctime_eq, proctime: this.proctime});
      this.proctime="";
      this.proctime_task="",
      this.proctime_eq="",

      this.deleteEmptyProctime();
      this.deleteDuplicateProctimes();
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
    deleteDuplicateProctimes(){
      for(i=0; i < this.proctimes.length; i++){
        for(j=i+1; j < this.proctimes.length; j++){
          if(this.proctimes[j].task === this.proctimes[i].task &&
            this.proctimes[j].eq === this.proctimes[i].eq &&
            this.proctimes[j].proctime === this.proctimes[i].proctime ){
            this.deleteProctime(j);
            this.showWarning("Same proctimes");
          }
        }
      }

      for(i=0; i < this.proctimes.length; i++){
        for(j=i+1; j < this.proctimes.length; j++){
          if(this.proctimes[j].task === this.proctimes[i].task &&
            this.proctimes[j].eq === this.proctimes[i].eq){
            this.deleteProctime(j);
            this.showWarning("Same proctimes");
          }
        }
      }

      for(i=0; i < this.proctimes.length; i++){
        if(this.proctimes[i].proctime[0] === '0'){
          this.deleteProctime(i);
          this.showWarning("0 proctime");
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
      this.show = true;
    },
    equipmentsToTask(){
      this.taskEquipment=[];
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

        tempProctimes=[];
        tempTask = this.precedences[i].task1;
        for(j=0; j< this.proctimes.length; j++){
          if(this.proctimes[j].task === tempTask){
            tempProctimes.push(this.proctimes[j].proctime);
          }
        }
           
        minProctime = tempProctimes[0];
        for(j=0; j< tempProctimes.length; j++){
          if(tempProctimes[j] < minProctime){
            minProctime = tempProctimes[j];
          }
        }

        this.vizGraphTxt += " [ label = " + minProctime + " ]";
      }
      this.vizGraphTxt += "}";

      document.getElementById('vizGraphPlace').innerHTML="";

      var viz = new Viz();
      viz.renderSVGElement(this.vizGraphTxt)
      .then(function(element) {
        document.getElementById('vizGraphPlace').appendChild(element);
      })
      .catch(error => {
        viz = new Viz();
        console.error(error);
      });
    },
  },
})