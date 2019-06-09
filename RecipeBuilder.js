var vm = new Vue({
  el: '#content',
  data() {
    return{
      products:[],
      productName: '',

      tasks: [], 
      taskName: '',

      tasksAndProducts:[], //name, product  //which task which product
      product:'',

      equipmentName:'',
      equipments: [],

      warningTxt:"",

      task1:"",
      task2:"",
      precedences: [], //task1, task2
      precedencesWithProducts:[], //task, product

      proctimes:[], //task, eq, proctime
      proctime:"",
      proctime_task:"",
      proctime_eq:"",

      taskEquipment:[], //which task which equipments | task, eqs[]

      vizGraphTxt:"",

      show:false,

      tmpTask1:[],
      tmpTask2:[],
    }
  }, 
  methods:{
    /*--------ADD--------*/
    addProduct(){
      if(this.productName === ""){
        this.showWarning("PROUDCT: product name is empty");
      }
      else{
          this.products.push(this.productName);
          this.deleteDuplicateProducts();
      }
      this.productName='';
    },
    addTask(){ 
      if(this.taskName === "" || this.product === ""){
        this.showWarning("TASK: task name is empty");
      }
      else{
        if(this.products.length <= 0){
          this.showWarning("TASK: products are empty");
        }
        else{
          add=true;
          for(i=0; i< this.products.length; i++){
            if(this.taskName === this.products[i]){
              add=false;
            }
          }
          if(add===true){
            this.tasks.push(this.taskName);
            this.precedencesWithProducts.push({task: this.taskName, product: this.product});

            this.addTasksAndProducts(); 
            this.deleteDuplicateTasks();
          }
          else{
            this.showWarning("TASK: New task name equals to a product name");
          }
        }
      }
      this.taskName='';
      this.product='';

      this.vizGraphTxtOut();
    },
    addTmpTask12(){
      this.tmpTask1.push(this.taskName);
      this.tmpTask2.push(this.taskName);
    },
    addEquipment(){
      if(this.equipmentName === ""){
        this.showWarning("EQ: equipment name is empty");
      }
      else{
        this.equipments.push(this.equipmentName);
        this.deleteDuplicateEquipments();
      }
      this.equipmentName='';
    },
    addPrecedence(){
      if(this.task1 === "" || this.task2 === ""){
        if(this.task1 ===""){
          this.showWarning("PRECEDENCE: task1 is empty");
        }
        if(this.task2 ===""){
          this.showWarning("PRECEDENCE: task2 is empty");
        }
      }
      else{
        if(this.task1 !== "" && this.task2 !== ""){
          product="";
          this.precedences.push({task1: this.task1, task2: this.task2});
         
          for(i=0; i < this.precedencesWithProducts.length; i++){
            if(this.precedencesWithProducts[i].task === this.task1){
              this.deletePrecedencesWithProducts(i);
              this.precedencesWithProducts.push({task: this.task1, product: this.task2});
            }
          }

          this.deleteDuplicatePrecedence();
          this.fillUpTmpTaks12();
        }
        else{
          this.showWarning("PRECEDENCE: task1 and task2 are empty");
        }
      }
      this.task1="";
      this.task2="";
      this.deleteEmptyPrecedences();

      this.vizGraphTxtOut();
    },
    addProctime(){ 
      if(this.proctime_task === "" || this.proctime_eq === "" || this.proctime === ""){
        if(this.proctime_task ===""){
          this.showWarning("PROCTIMES: Task is empty");
        }
        if(this.proctime_eq ===""){
          this.showWarning("PROCTIMES: Eq is empty");
        }
        else{
          this.showWarning("PROCTIMES: Proctime is empty");
        }
      }
      else{
        if(this.proctime < 0){
          this.showWarning("PROCTIMES: Proctime is negativ");
        }
        else{
          this.proctimes.push({task: this.proctime_task, eq: this.proctime_eq, proctime: this.proctime});
        }
      }
      this.proctime="";
      this.proctime_task="";
      this.proctime_eq="";

      this.deleteDuplicateProctimes();

      this.vizGraphTxtOut();
    },
    addTasksAndProducts(){
      this.tasksAndProducts.push({name: this.taskName , product: this.product});
    },
    /*-------------------*/

    /*--------FILL-------*/
    fillUpTmpTaks12(){
      this.tmpTask1=[];
      this.tmpTask2=[];
      for(i=0; i< this.tasks.length; i++){
        this.taskName=this.tasks[i];
        this.addTmpTask12();
      }
      this.taskName="";
    },
    /*-------------------*/

    /*------REMOVE-------*/
    removeTmpTask1(){
      this.fillUpTmpTaks12();
      for(i=0; i< this.tmpTask1.length; i++){
        if(this.tmpTask1[i] === this.task2){
          this.tmpTask1.splice(i,1);
        }
      }
    },
    removeTmpTask2(){
      this.fillUpTmpTaks12();
      for(i=0; i< this.tmpTask2.length; i++){
        if(this.tmpTask2[i] === this.task1){
          this.tmpTask2.splice(i,1);
        }
      }
    },
    /*-------------------*/

    /*--------DELETE-ID--------*/
    deleteProduct(id){
      productName="";
      for(i=0; i < this.products.length; i++){
        if(id === i){
          productName = this.products[i];
        }
      }
      this.products.splice(id,1);
      this.updateTasksAndProducts(productName);
      this.updateTasks();
      this.updatePrecedences();
      this.updatePrecedencesWithProducts();
      this.updateProctimes();
      this.vizGraphTxtOut();
    },
    deleteTaskAndTasksAndProducts(id){
      task="";
      for(i=0; i < this.tasks.length; i++){
        if(id === i){
          task = this.tasks[i];
        }
      }
      this.updatePrecedencesFromTask(task);
      this.updateProctimesFromProduct(task);
      this.tasks.splice(id,1);
      this.deleteTasksAndProducts(id);
      this.updatePrecedences();
      this.updatePrecedencesWithProductsFromTasks(task);
      this.vizGraphTxtOut();
    },
    deleteTask(id){
      this.tasks.splice(id,1);
    },
    deleteTmpTask1(id){
      this.tmpTask1.splice(id,1);
    },
    deleteTmpTask2(id){
      this.tmpTask2.splice(id,1);
    },
    deleteTasksAndProducts(id){
      this.tasksAndProducts.splice(id,1);
    },
    deleteEq(id){
      this.equipments.splice(id,1);
      this.updateProctimesFromEq();
      this.updateProctimes();
      this.vizGraphTxtOut();
    },
    deletePrecendence(id){
      this.precedences.splice(id,1);
    },
    deletePrecedenceFromHtml(id){
      task1="";
      task2="";
      for(i=0; i < this.precedences.length; i++){
        if(i === id){
          task1 = this.precedences[i].task1;
          task2 = this.precedences[i].task2;
        }
      }
      this.deletePrecendence(id);
      this.updatePrecedencesWithProductsFromPrecedence(task1, task2);
      this.vizGraphTxtOut();
    },
    deleteProctimeFromHtml(id){
      this.proctimes.splice(id,1);
      this.updateProctimes();
      this.vizGraphTxtOut();
    },
    deleteProctime(id){
      this.proctimes.splice(id,1);
      this.updateProctimes();
    },
    deleteEmptyPrecedences(){
      for(i=0; i < this.precedences.length; i++){
        if(this.precedences[i].task1 === undefined || this.precedences[i].task2 === undefined){
          this.deletePrecendence(i);
        }
      }
    },
    deletePrecedencesWithProducts(id){
      this.precedencesWithProducts.splice(id,1);
    },
    /*-------------------------*/

    /*----------UPDATE---------*/
    updateTasks(){
      deleteThis=[];
      for(i=0; i < this.tasks.length; i++){
        add=true;
        for(j=0; j < this.tasksAndProducts.length; j++){//name, product 
          if(this.tasks[i] === this.tasksAndProducts[j].name){
            add=false;
          }
        }
        if(add===true){
          deleteThis.push(this.tasks[i]);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.tasks.length; j++){
          if(deleteThis[i] === this.tasks[j]){
            this.deleteTask(j);
          }
        }
      }
    },
    updateTasksAndProducts(productName){
      deleteThis=[];
      for(i=0; i < this.tasksAndProducts.length; i++){
        if(productName === this.tasksAndProducts[i].product){
          deleteThis.push({name: this.tasksAndProducts[i].name , product: this.tasksAndProducts[i].product});
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.tasksAndProducts.length; j++){
          if(deleteThis[i].name === this.tasksAndProducts[j].name){
            this.deleteTasksAndProducts(j);
          }
        }
      }
     /* for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.tasks.length; j++){
          if(deleteThis[i].name === this.tasks[j]){
            this.deleteTask(j);
          }
        }
      }*/
    },
    updatePrecedences(){
      deleteThis=[];
      for(i=0; i < this.precedences.length; i++){
        add=true;
        for(j=0; j < this.tasks.length; j++){
          if(this.precedences[i].task1 === this.tasks[j] ||
             this.precedences[i].task2 === this.tasks[j]){
            add=false;
          }
        }
        if(add==true){
          deleteThis.push(this.precedences[i].task1);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.precedences.length; j++){
          if(deleteThis[i] === this.precedences[j].task1){
            this.deletePrecendence(j);
          }
        }
      }

      this.fillUpTmpTaks12();
    },
    updatePrecedencesFromTask(task){
      deleteThis=[];
      for(i=0; i < this.precedences.length; i++){
        if(task === this.precedences[i].task1 ||
           task === this.precedences[i].task2){
             deleteThis.push({task1: this.precedences[i].task1, task2: this.precedences[i].task2});
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.precedences.length; j++){
          if(deleteThis[i].task1 === this.precedences[j].task1 &&
             deleteThis[i].task2 === this.precedences[j].task2){
            this.deletePrecendence(j);
          }
        }
      }

      this.fillUpTmpTaks12();
    },
    updateProctimes(){
      deleteThis=[];
      for(i=0; i < this.proctimes.length; i++){//task, eq, proctime
        add=true;
        for(j=0; j < this.tasks.length; j++){
          if(this.proctimes[i].task === this.tasks[j]){
            add=false;
          }
        }
        if(add==true){
          deleteThis.push(this.proctimes[i].task);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.proctimes.length; j++){
          if(deleteThis[i] === this.proctimes[j].task){
            this.proctimes.splice(j,1);
          }
        }
      }
    },
    updateProctimesFromProduct(task){
      deleteThis=[];
      for(i=0; i < this.proctimes.length; i++){
        if(task === this.proctimes[i].task){
             deleteThis.push(this.proctimes[i].task);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.proctimes.length; j++){
          if(deleteThis[i] === this.proctimes[j].task){
            this.deleteProctime(j);
          }
        }
      }
    },
    updateProctimesFromEq(){
      deleteThis=[];
      for(i=0; i < this.proctimes.length; i++){ //task, eq, proctime
        add=true;
        for(j=0; j < this.equipments.length; j++){
          if(this.proctimes[i].eq === this.equipments[j]){
            add=false;
          }
        }
        if(add==true){
          deleteThis.push(this.proctimes[i].eq);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.proctimes.length; j++){
          if(deleteThis[i] === this.proctimes[j].eq){
            this.deleteProctime(j);
          }
        }
      }
    },
    updatePrecedencesWithProducts(){
      deleteThis=[];
      for(i=0; i < this.precedencesWithProducts.length; i++){ //task, product
        add=true;
        for(j=0; j < this.tasks.length; j++){
          if(this.precedencesWithProducts[i].task === this.tasks[j] ||
             this.precedencesWithProducts[i].product === this.tasks[j]){
            add=false;
          }
        }
        if(add==true){
          deleteThis.push(this.precedencesWithProducts[i].task);
        }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.precedencesWithProducts.length; j++){
          if(deleteThis[i] === this.precedencesWithProducts[j].task){
            this.deletePrecedencesWithProducts(j);
          }
        }
      }
    },
    updatePrecedencesWithProductsFromTasks(task){
      deleteThis=[];
      for(i=0; i < this.precedencesWithProducts.length; i++){ //task, product
        if(task ===  this.precedencesWithProducts[i].task ||
           task ===  this.precedencesWithProducts[i].product){
            deleteThis.push({task: this.precedencesWithProducts[i].task, product: this.precedencesWithProducts[i].product});
          }
      }

      for(i=0; i < deleteThis.length; i++){
        for(j=0; j < this.precedencesWithProducts.length; j++){
          if(deleteThis[i].task === this.precedencesWithProducts[j].task ||
             deleteThis[i].product === this.precedencesWithProducts[j].product){
             this.deletePrecedencesWithProducts(j);
          }
        }
      }

      for(i=0; i < this.tasks.length; i++){
        add=true;
        for(j=0; j < this.precedencesWithProducts.length; j++){ //task, product
          if(this.tasks[i] === this.precedencesWithProducts[j].task){
            add=false;
          }
        }
        if(add==true){
          for(j=0; j < this.tasksAndProducts.length; j++){
            if(this.tasks[i] === this.tasksAndProducts[j].name){
              this.precedencesWithProducts.push({task: this.tasks[i], product: this.tasksAndProducts[j].product});
            }
          }
        }
      }
    },
    updatePrecedencesWithProductsFromPrecedence(task1){
      for(i=0; i < this.precedencesWithProducts.length; i++){ //task, product
        if(task1 === this.precedencesWithProducts[i].task){
          this.deletePrecedencesWithProducts(i);
          for(j=0; j < this.tasksAndProducts.length; j++){
            if(task1 === this.tasksAndProducts[j].name){
              this.precedencesWithProducts.push({task: task1, product: this.tasksAndProducts[j].product});
            }
          }
        }
      }
    },
    /*-------------------------*/

    /*--------DELETE-DUPLICATE--------*/
    deleteDuplicateProducts(){
      for(i=0; i < this.products.length; i++){
        for(j=i+1; j < this.products.length; j++){
          if(this.products[j] === this.products[i]){
            this.deleteProduct(j);
            this.showWarning("Same products");
          }
        }
      }
    },
    deleteDuplicateTasks(){
      yes=true;
      for(i=0; i < this.tasksAndProducts.length; i++){
        for(j=i+1; j < this.tasksAndProducts.length; j++){
          if(this.tasksAndProducts[j].name === this.tasksAndProducts[i].name &&
            this.tasksAndProducts[j].product === this.tasksAndProducts[i].product ){
            yes=false;
            break;
        }
      }
      if(!yes){
        break;
      }
     }

     if(!yes){
      this.deleteTasksAndProducts(j);
      this.showWarning("Same tasks and products");
     }
     else{
      this.addTmpTask12();
     }
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
    /*--------------------------------*/

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

      for(i=0; i< this.precedencesWithProducts.length; i++){
        this.vizGraphTxt += this.precedencesWithProducts[i].task + " -> " + this.precedencesWithProducts[i].product;
 

        tempProctimes=[];
        tempTask = this.precedencesWithProducts[i].task;
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

     // console.log(this.vizGraphTxt);
    },
  },
})