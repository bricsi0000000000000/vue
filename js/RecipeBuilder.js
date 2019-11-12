Vue.use(VueDraggable.default);

var recipieBuilder = new Vue({
  el: '#content',
  data() {
    const componentInstance = this
    return{
      arrowImg_products:"images/down-arrow.png",
      downArowImg_products: "images/down-arrow.png",
      upArrowImg_products: "images/up-arrow.png",

      arrowImg_tasks:"images/down-arrow.png",
      downArowImg_tasks: "images/down-arrow.png",
      upArrowImg_tasks: "images/up-arrow.png",

      arrowImg_eqs:"images/down-arrow.png",
      downArowImg_eqs: "images/down-arrow.png",
      upArrowImg_eqs: "images/up-arrow.png",

      arrowImg_precedences:"images/down-arrow.png",
      downArowImg_precedences: "images/down-arrow.png",
      upArrowImg_precedences: "images/up-arrow.png",

      arrowImg_proctimes:"images/down-arrow.png",
      downArowImg_proctimes: "images/down-arrow.png",
      upArrowImg_proctimes: "images/up-arrow.png",

      downUpClick: false,

      dragAndDropOptions: {
        // dropzoneSelector: 'ul',
        // draggableSelector: 'li',
        //showDropzoneAreas: false,
        //multipleDropzonesItemsDraggingEnabled: false,
        //onDrop(event) {
        onDrop() {
          schedGraphBuilder.getTasks(false);
          componentInstance.updateEquimpents();
          //componentInstance.updateTasksToEqOnDrop(tasks);
         // componentInstance.updateTasksToEq();
          //componentInstance.updateTasksToEq2();
         // schedGraphBuilder.makeGantDiagram();
        },
        // onDragstart(event) {
        //   event.stop();
        // },
       /* onDragend(event) {
          // if you need to stop d&d
          // event.stop();

          // you can call component methods, just don't forget 
          // that here `this` will not reference component scope,
          // so out from this returned data object make reference
          // to component instance

          // to detect if draggable element is dropped out
          if (!event.droptarget) {
           // console.log(event);
          }
        }*/
      },
     /*---------------RECIPIE BUILDER---------------*/
     products:["a","b"],
     productName: '',

     tasks: ["b2","a2","a3","b3","a1","b11","b12","a4","b4"], 
     taskName: '',
     onlyTasks: [],

     tasksAndProducts:[{"name":"b2","product":"b"},{"name":"a2","product":"a"},{"name":"a3","product":"a"},{"name":"b3","product":"b"},{"name":"a1","product":"a"},{"name":"b11","product":"b"},{"name":"b12","product":"b"},{"name":"a4","product":"a"},{"name":"b4","product":"b"}], //name, product  //which task which product
     product:'',

     equipmentName:'',
     equipments: ["e1","e2","e3"],

     warningTxt:"",

     task1:"",
     task2:"",
     
     precedences: [{"task1":"a2","task2":"a3"},{"task1":"b2","task2":"b3"},{"task1":"a1","task2":"a2"},{"task1":"b11","task2":"b2"},{"task1":"b12","task2":"b2"},{"task1":"a3","task2":"a4"},{"task1":"b3","task2":"b4"}], //task1, task2

     precedencesWithProducts: [{"task":"a2","product":"a3"},{"task":"b2","product":"b3"},{"task":"a1","product":"a2"},{"task":"b11","product":"b2"},{"task":"b12","product":"b2"},{"task":"a4","product":"a"},{"task":"b4","product":"b"},{"task":"a3","product":"a4"},{"task":"b3","product":"b4"}], //task, product

     proctimes: [{"task":"a1","eq":"e1","proctime":"3"},{"task":"b11","eq":"e1","proctime":"2"},{"task":"b3","eq":"e1","proctime":"1"},{"task":"a2","eq":"e2","proctime":"2"},{"task":"b12","eq":"e2","proctime":"4"},{"task":"b2","eq":"e3","proctime":"3"},{"task":"a3","eq":"e3","proctime":"4"},{"task":"a4","eq":"e2","proctime":"2"},{"task":"b4","eq":"e3","proctime":"4"}], //task, eq, proctime
     proctime:"",
     proctime_task:"",
     proctime_eq:"",

     taskEquipment:[{"task":"a1","eqs":["e1"]},{"task":"b11","eqs":["e1"]},{"task":"b3","eqs":["e1"]},{"task":"a2","eqs":["e2"]},{"task":"b12","eqs":["e2"]},{"task":"b2","eqs":["e3"]},{"task":"a3","eqs":["e3"]},{"task":"a4","eqs":["e2"]},{"task":"b4","eqs":["e3"]}], //task, eqs[] | which task which equipments

     recipieGraphTxt:"",

     showWarningTxt:false,

     tmpTask1:[],
     tmpTask2:[],

     seenForms: true,
     loading: true,

     tasksLength: 0,
     productsLength: 0,
     eqsLength: 0,
     precedencesLength: 0,
     proctimesLength: 0,
     taskToEq2: [],

     /*---------------SchedGraphBuilder-------------*/
     uisNisChk: false, //UIS NIS
     longestPathTime:"",
     longestPathStartTask:"",
     longestPathEndTask:"",
     circle:false,
     svg_text: "",
     ganttWidth: 0,
     //gant:[], //eq; tasks -> task, proctime
   }
  }, 
  methods:{
    hideAlert(){
      setTimeout(() => this.showWarningTxt = false, 5000);
    },

    changeArrowImg_products(){
      this.downUpClick_products = !this.downUpClick_products;

      if(this.downUpClick_products){
        this.arrowImg_products = this.upArrowImg_products;
      }
      else{
        this.arrowImg_products = this.downArowImg_products;
      }
    },
    changeArrowImg_tasks(){
      this.downUpClick_tasks = !this.downUpClick_tasks;

      if(this.downUpClick_tasks){
        this.arrowImg_tasks = this.upArrowImg_tasks;
      }
      else{
        this.arrowImg_tasks = this.downArowImg_tasks;
      }
    },
    changeArrowImg_eqs(){
      this.downUpClick_eqs = !this.downUpClick_eqs;

      if(this.downUpClick_eqs){
        this.arrowImg_eqs = this.upArrowImg_eqs;
      }
      else{
        this.arrowImg_eqs = this.downArowImg_eqs;
      }
    },
    changeArrowImg_precedences(){
      this.downUpClick_precedences = !this.downUpClick_precedences;

      if(this.downUpClick_precedences){
        this.arrowImg_precedences = this.upArrowImg_precedences;
      }
      else{
        this.arrowImg_precedences = this.downArowImg_precedences;
      }
    },
    changeArrowImg_proctimes(){
      this.downUpClick_proctimes = !this.downUpClick_proctimes;

      if(this.downUpClick_proctimes){
        this.arrowImg_proctimes = this.upArrowImg_proctimes;
      }
      else{
        this.arrowImg_proctimes = this.downArowImg_proctimes;
      }
    },
    
    /*---------------SchedGraphBuilder-------------*/
    switchForms(){
      this.updateOnlyTasks();

      this.seenForms = !this.seenForms;
      if(!this.seenForms){
        this.updateTasksToEq();
  
        schedGraphBuilder.getTasks(true);
        //this.schedGraphTxtOut(false,false);
        document.title = "Schedule graph builder";
      }
      else{
        this.recipieGraphTxtOut();

        document.title = "Recipie graph builder";
      }
      
      this.updateProductsLength();
      this.updateTasksLength();
      this.updateEqsLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();
    },
    uisNisSwitch(){
      if(this.uisNisChk){
        schedGraphBuilder.waitForIt(true,true);
      }
      else{
        schedGraphBuilder.waitForIt(true,false);
      }

      this.uisNisChk = !this.uisNisChk;
    },

    /*---------------RECIPIE BUILDER---------------*/
    /*--------ADD--------*/
    addProduct(){
      if(this.productName === ""){
        this.showWarning("PROUDCT: product name is empty");
      }
      else{
      if(this.productName.indexOf("\\\"") !== -1){ /*    ->    \"       */
        this.showWarning("PROUDCT: product name contains wrong characters: \\\"");
      }
      else{
        this.products.push(this.productName);
        this.deleteDuplicateProducts();
      }
      }
      this.productName='';
      this.updateProductsLength();
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
          if(this.taskName.indexOf("\\\"") !== -1){ /*    ->    \"       */
          this.showWarning("TASK: task name contains wrong characters: \\\"");
        }
        else{
          add = true;
          for(i = 0; i < this.products.length && add; i++){
            if(this.taskName === this.products[i]){
              add = false;
            }
          }
          if(add === true){
          yes = true;
          for(i = 0; i < this.tasks.length && yes; i++){
            if(this.taskName === this.tasks[i]){
              yes = false;
            }
          }
          if(yes){
            this.tasks.push(this.taskName);
            this.precedencesWithProducts.push({task: this.taskName, product: this.product});
            this.addTasksAndProducts(); 
            this.deleteDuplicateTasks();
          }
          else{
            this.showWarning("TASK: Same task name");
          }
          }
          else{
            this.showWarning("TASK: New task name equals to a product name");
          }
        }
        }
      }
      this.taskName='';
      this.product='';

      this.updateTasksLength();

      this.recipieGraphTxtOut();

      this.updateOnlyTasks();
      this.addTmpTask12();

    },
    addTmpTask12(){
      this.tmpTask1 = [];
      this.tmpTask2 = [];
      for(i = 0; i < this.onlyTasks.length; i++){
        this.tmpTask1.push(this.onlyTasks[i]);
        this.tmpTask2.push(this.onlyTasks[i]);
      }
    },
    addEquipment(){
      if(this.equipmentName === ""){
        this.showWarning("EQ: equipment name is empty");
      }
      else{
      if(this.equipmentName.indexOf("\\\"") !== -1){ /*    ->    \"       */
        this.showWarning("EQ: equipment name contains wrong characters: \\\"");
      }
      else{
        this.equipments.push(this.equipmentName);
        this.deleteDuplicateEquipments();
      }
      }
      this.equipmentName='';

      this.updateEqsLength();
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

      this.recipieGraphTxtOut();

      this.updatePrecedencesLength();
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

      this.recipieGraphTxtOut();

      this.updateProctimesLength();
    },
    addTasksAndProducts(){
      this.tasksAndProducts.push({name: this.taskName , product: this.product});
    },
    /*-------------------*/

    /*--------FILL-------*/
    fillUpTmpTaks12(){
      this.tmpTask1=[];
      this.tmpTask2=[];
      for(i = 0; i < this.tasks.length; i++){
        notProduct = true;
        for(j = 0; j < this.products.length; j++){
          if(this.tasks[i] === this.products[j]){
            notProduct = false;
          }
        }
        if(notProduct){
          this.tmpTask1.push(this.tasks[i]);
          this.tmpTask2.push(this.tasks[i]);
        }
      }
    
      this.taskName = "";
    },
    /*-------------------*/

    /*------REMOVE-------*/
    removeTmpTask1(){
      this.tmpTask1 = [];
      cur_product = "";
      for(i = 0; i < this.tasksAndProducts.length && cur_product === ""; i++){
        if(this.task2 === this.tasksAndProducts[i].name){
          cur_product = this.tasksAndProducts[i].product;
        }
      }
      tmp_tasks = [];
      for(i = 0; i < this.tasksAndProducts.length; i++){
        if(this.tasksAndProducts[i].product === cur_product){
          if(this.tasksAndProducts[i].name !== this.task2){
            this.tmpTask1.push(this.tasksAndProducts[i].name);
          }
        }
      }
    },
    removeTmpTask2(){
      this.tmpTask2 = [];
      cur_product = "";
      for(i = 0; i < this.tasksAndProducts.length && cur_product === ""; i++){
        if(this.task1 === this.tasksAndProducts[i].name){
          cur_product = this.tasksAndProducts[i].product;
        }
      }

      tmp_tasks = [];
      for(i = 0; i < this.tasksAndProducts.length; i++){
        if(this.tasksAndProducts[i].product === cur_product){
          if(this.tasksAndProducts[i].name !== this.task1){
            this.tmpTask2.push(this.tasksAndProducts[i].name);
          }
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
      this.recipieGraphTxtOut();

      this.updateTasksLength();
      this.updateProductsLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();

      this.updateOnlyTasks();
    },
    deleteTaskAndTasksAndProducts(id){
      task = "";
      for(i = 0; i < this.tasks.length; i++){
        console.log(this.tasks[i]);
        if(id === i){
          p = false;
          for(j = 0; j < this.products.length && !p; j++){
            if(this.tasks[i] === this.products[j]){
              p = true;
            }
          }
          if(p){
            id++;
          }
          else{
            task = this.tasks[i];
          }
        }
      }

    // console.log(id + " " + task);
      this.updatePrecedencesFromTask(task);
      this.updateProctimesFromProduct(task);
      this.tasks.splice(id,1);
      this.updateOnlyTasks();
      this.deleteTasksAndProducts(id);
      this.updatePrecedences();
      this.updatePrecedencesWithProductsFromTasks(task);
      
      this.updateTasksLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();
      
      this.recipieGraphTxtOut();
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
      this.recipieGraphTxtOut();

      this.updateEqsLength();
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
      this.recipieGraphTxtOut();

      this.updatePrecedencesLength();
    },
    deleteProctimeFromHtml(id){
      this.proctimes.splice(id,1);
      this.updateProctimes();
      this.recipieGraphTxtOut();
      this.updateProctimesLength();
    },
    deleteProctime(id){
      this.proctimes.splice(id,1);
      this.updateProctimes();
      this.updateProctimesLength();
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
    updateEquimpents(){
      tasks=[];
      schedTable = document.getElementsByClassName("schedTable");
      a = [];
      for(i = 0; i < schedTable.length; i++){ 
        a.push(schedTable[i].innerHTML);
      }

      s=[];
      for(i = 0; i < a.length; i++){ 
        s.push(a[i].split(">"));
      }

      for(i = 0; i < s.length; i++){ 
        for(j = 0; j < s[i].length; j++){ 
          if(s[i][j].indexOf("</span") !== -1){
            ss = s[i][j].split('<');
            taskWithEq = ss[0].split('/');
            tasks.push(taskWithEq[0]);
          }
        }
      }

      tmpEq = "";
      tmpTasks = [];
      eqWithTasks = []; //eq, tasks[]
      //this.tasksToEq = []; //eq, tasks[]

      for(i = 0; i < tasks.length; i++){ 
        if(!yes){
          eqWithTasks.push({eq: tmpEq, tasks: tmpTasks});
        }
        yes = true;
        for(j = 0; j < this.equipments.length; j++){ 
          if(this.equipments[j] === tasks[i]){
            yes = false;
          }
        }
        if(yes){
          tmpTasks.push(tasks[i]);
        }
        else{
          tmpTasks = [];
          tmpEq = tasks[i];
        }
      }

      for(i = 0; i < this.proctimes.length; i++){ //task, eq, proctime
        for(j = 0; j < eqWithTasks.length; j++){ //eq, tasks
          for(u = 0; u < eqWithTasks[j].tasks.length; u++){ 
            if(eqWithTasks[j].tasks[u] === this.proctimes[i].task){
              this.proctimes[i].eq = eqWithTasks[j].eq;
            }
          }
        }
      }


      this.equipmentsToTask();

     /* if(this.uisNisChk){
        schedGraphBuilder.schedGraphTxtOut(true,false);
      }
      else{
        schedGraphBuilder.schedGraphTxtOut(true,true);
      }*/

      /*for(i = 0; i < this.taskEquipment.length; i++){ //task, eq, proctime
        console.log(this.taskEquipment[i].task + " " + this.taskEquipment[i].eqs);
      }*/
    },

    /*updateTasksToEqOnDrop(tasks){
     /* tasks=[];
      schedTable = document.getElementsByClassName("schedTable");
      a = [];
      for(i = 0; i < schedTable.length; i++){ 
        a.push(schedTable[i].innerHTML);
      }

      s=[];
      for(i = 0; i < a.length; i++){ 
        s.push(a[i].split(">"));
      }

      for(i = 0; i < s.length; i++){ 
        for(j = 0; j < s[i].length; j++){ 
          if(s[i][j].indexOf("</span") !== -1){
            ss = s[i][j].split('<');
            taskWithEq = ss[0].split('/');
            tasks.push(taskWithEq[0]);
          }
        }
      }*/
      /*console.log("-----tasks-----");

      for(i = 0; i < tasks.length; i++){ 
        console.log(tasks[i]);
      }
      console.log("----------");*/

    /*  tmpEq = "";
      tmpTasks = [];
      eqWithTasks = []; //eq, tasks[]

      for(i = 0; i < tasks.length; i++){ 
        if(!yes){
          eqWithTasks.push({eq: tmpEq, tasks: tmpTasks});
        }
        yes = true;
        for(j = 0; j < this.equipments.length; j++){ 
          if(this.equipments[j] === tasks[i]){
            yes = false;
          }
        }
        if(yes){
          tmpTasks.push(tasks[i]);
        }
        else{
          tmpTasks = [];
          tmpEq = tasks[i];
        }
      }

      console.log("---eqWithTasks--");
      for(i = 0; i < eqWithTasks.length; i++){ 
        console.log(eqWithTasks[i].eq + " " + eqWithTasks[i].tasks);
      }

      this.tasksToEq = []; //eq, tasks
      for(i = 0; i < eqWithTasks.length; i++){ 
        if(eqWithTasks[i].eq !== ""){
          this.tasksToEq.push({eq: eqWithTasks[i].eq, tasks: eqWithTasks[i].tasks});
        }
      }

     console.log("tasksToEq");
      for(i = 0; i < this.tasksToEq.length; i++){
        console.log(this.tasksToEq[i].eq + " " + this.tasksToEq[i].tasks);
      }

      this.updateTasksToEqWithProctimes();
    },*/

    updateProductsLength(){
    this.productsLength = this.products.length;
    this.hideAlert();
    },
    updateTasksLength(){
    this.tasksLength = this.tasks.length;
    this.hideAlert();
    },
    updateEqsLength(){
      this.eqsLength = this.equipments.length;
      this.hideAlert();
    },
    updatePrecedencesLength(){
    this.precedencesLength = this.precedences.length;
    this.hideAlert();
    },
    updateProctimesLength(){
      this.proctimesLength = this.proctimes.length;
      this.hideAlert();
    }, 

    updateOnlyTasks(){
    this.onlyTasks = [];
    for(i = 0; i < this.tasks.length; i++){
      add = true;
      for(j = 0; j < this.products.length && add; j++){
        if(this.tasks[i] === this.products[j]){
          add = false;
        }
      }
      if(add){
        this.onlyTasks.push(this.tasks[i]);
      }
    }

    /* for(i = 0; i < this.onlyTasks.length; i++){
      console.log(this.onlyTasks[i]);
    }*/
    },

    updateTasksToEq(){
     /* console.clear();
      console.log("taskEquipment");
      for(i = 0; i < this.taskEquipment.length; i++){
        console.log(this.taskEquipment[i].task + " " + this.taskEquipment[i].eqs);
      }*/

      this.tasksToEq = []; //eq, tasks
      for(i = 0; i < this.equipments.length; i++){
        t = [];
        for(j = 0; j < this.taskEquipment.length; j++){ //task, eqs[]
          for(u = 0; u < this.taskEquipment[j].eqs.length; u++){
            if(this.equipments[i] === this.taskEquipment[j].eqs[u]){
              t.push(this.taskEquipment[j].task);
            }
          }
        }
        this.tasksToEq.push({eq: this.equipments[i], tasks: t});
      }

    /* console.log("tasksToEq");
      for(i = 0; i < this.tasksToEq.length; i++){
        console.log(this.tasksToEq[i].eq + " " + this.tasksToEq[i].tasks);
      }*/

      this.updateTasksToEqWithProctimes();
      this.updateTasksToEq2("");
    },
    updateTasksToEq2(tasks){
      if(tasks === ""){
        this.tasksToEq2 = []; //eq, tasks
        for(i = 0; i < this.equipments.length; i++){
          t = [];
          for(j = 0; j < this.taskEquipment.length; j++){ //task, eqs[]
            for(u = 0; u < this.taskEquipment[j].eqs.length; u++){
              if(this.equipments[i] === this.taskEquipment[j].eqs[u]){
                t.push(this.taskEquipment[j].task);
              }
            }
          }
          this.tasksToEq2.push({eq: this.equipments[i], tasks: t});
        }
      }
      else{
      /*console.log("tasks");
       for(i = 0; i < tasks.length; i++){
         console.log(tasks[i]);
       }*/

       tmpEq = "";
       tmpTasks = [];
       //eqWithTasks = []; //eq, tasks[]
       //this.tasksToEq = []; //eq, tasks[]
       this.tasksToEq2 = []; //eq, tasks
       yes = true;

       for(i = 0; i < tasks.length; i++){ 
         if(!yes){
           this.tasksToEq2.push({eq: tmpEq, tasks: tmpTasks});
         }
         yes = true;
         for(j = 0; j < this.equipments.length; j++){ 
           if(this.equipments[j] === tasks[i]){
             yes = false;
           }
         }
         if(yes){
           tmpTasks.push(tasks[i]);
         }
         else{
           tmpTasks = [];
           tmpEq = tasks[i];
         }
       }
 
 
      /* console.clear();
       console.log("taskEquipment");
       for(i = 0; i < this.taskEquipment.length; i++){
         console.log(this.taskEquipment[i].task + " " + this.taskEquipment[i].eqs);
       }*/
 
    /*   this.tasksToEq2 = []; //eq, tasks
       for(i = 0; i < this.equipments.length; i++){
         t = [];
         for(j = 0; j < this.taskEquipment.length; j++){ //task, eqs[]
           for(u = 0; u < this.taskEquipment[j].eqs.length; u++){
             if(this.equipments[i] === this.taskEquipment[j].eqs[u]){
               t.push(this.taskEquipment[j].task);
             }
           }
         }
         this.tasksToEq2.push({eq: this.equipments[i], tasks: t});
       }*/
 
      /*console.log("tasksToEq2");
       for(i = 0; i < this.tasksToEq2.length; i++){
         console.log(this.tasksToEq2[i].eq + " " + this.tasksToEq2[i].tasks);
       }*/
      }
       this.updateTasksToEqWithProctimes2();
     },

    updateTasksToEqWithProctimes(){ 
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time
      
      for(i = 0; i < this.tasksToEq.length; i++){
        eq = this.tasksToEq[i].eq;
        tmpTasks = []; //task, time
        for(j = 0; j < this.tasksToEq[i].tasks.length; j++){
          time = "";
          for(u = 0; u < this.proctimes.length; u++){
            if(this.tasksToEq[i].tasks[j] === this.proctimes[u].task &&
               this.tasksToEq[i].eq === this.proctimes[u].eq){
              time = this.proctimes[u].proctime;
            }
          }
          tmpTasks.push({task: this.tasksToEq[i].tasks[j], time: time});
        }

        this.tasksToEqWithProctimes.push({eq: eq, tasks: tmpTasks});
      }
      /*console.log("-tasksToEqWithProctimes-");

      for(i = 0; i < this.tasksToEqWithProctimes.length; i++){
        for(j = 0; j < this.tasksToEqWithProctimes[i].tasks.length; j++){
          console.log(this.tasksToEqWithProctimes[i].eq + " " + this.tasksToEqWithProctimes[i].tasks[j].task + " " + this.tasksToEqWithProctimes[i].tasks[j].time);
        }
      }

      console.log("--");*/
    },
    updateTasksToEqWithProctimes2(){ 
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time
      
      for(i = 0; i < this.tasksToEq2.length; i++){
        eq = this.tasksToEq2[i].eq;
        tmpTasks = []; //task, time
        for(j = 0; j < this.tasksToEq2[i].tasks.length; j++){
          time = "";
          for(u = 0; u < this.proctimes.length; u++){
            if(this.tasksToEq2[i].tasks[j] === this.proctimes[u].task &&
               this.tasksToEq2[i].eq === this.proctimes[u].eq){
              time = this.proctimes[u].proctime;
            }
          }
          tmpTasks.push({task: this.tasksToEq2[i].tasks[j], time: time});
        }

        this.tasksToEqWithProctimes.push({eq: eq, tasks: tmpTasks});
      }
      /*console.log("-tasksToEqWithProctimes-");

      for(i = 0; i < this.tasksToEqWithProctimes.length; i++){
        for(j = 0; j < this.tasksToEqWithProctimes[i].tasks.length; j++){
          console.log(this.tasksToEqWithProctimes[i].eq + " " + this.tasksToEqWithProctimes[i].tasks[j].task + " " + this.tasksToEqWithProctimes[i].tasks[j].time);
        }
      }

      console.log("--");*/
    },

    /*-------------------------*/

    /*--------DELETE-DUPLICATE--------*/
    deleteDuplicateProducts(){
      for(i=0; i < this.products.length; i++){
        for(j=i+1; j < this.products.length; j++){
          if(this.products[j] === this.products[i]){
          this.products.splice(j,1);
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
        if(this.proctimes[i].proctime[0] === '0' &&
           this.proctimes[i].proctime[1] !== '.'){
          this.deleteProctime(i);
          this.showWarning("0 proctime");
        }
      }
    },
    /*--------------------------------*/

    showWarning(text){
      this.warningTxt = text;
      this.showWarningTxt = true;
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
    recipieGraphTxtOut(){
      this.equipmentsToTask();

      this.recipieGraphTxt ="digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]"
      for(i=0; i< this.taskEquipment.length; i++){
      this.recipieGraphTxt += " \"";
        //this.recipieGraphTxt += String.raw`${this.taskEquipment[i].task}`;
      p = "";
      for(j = 0; j < this.taskEquipment[i].task.length; j++){
        if(this.taskEquipment[i].task[j] === "\""){
          p += "\\" + this.taskEquipment[i].task[j];
        }
        else{
          p += this.taskEquipment[i].task[j];
        }
      }

      if(p[p.length - 1] === "\\"){
        p += " ";
      }

      this.recipieGraphTxt += p + "\" [ " + "label = < <B>\\N</B><BR/>{";

      for(j=0; j< this.taskEquipment[i].eqs.length; j++){
        this.recipieGraphTxt += this.taskEquipment[i].eqs[j] +",";
      }
      this.recipieGraphTxt = this.recipieGraphTxt.substring(0,this.recipieGraphTxt.length-1);
      this.recipieGraphTxt += "}> ]";
      }

      for(i=0; i< this.precedencesWithProducts.length; i++){
      this.recipieGraphTxt += "\"";
      p = "";
      for(j = 0; j < this.precedencesWithProducts[i].task.length; j++){
        if(this.precedencesWithProducts[i].task[j] === "\""){
          p += "\\" + this.precedencesWithProducts[i].task[j];
        }
        else{
          p += this.precedencesWithProducts[i].task[j];
        }
      }

      if(p[p.length - 1] === "\\"){
        p += " ";
      }

      this.recipieGraphTxt += p + "\" -> \"";

      p = "";
      for(j = 0; j < this.precedencesWithProducts[i].product.length; j++){
        if(this.precedencesWithProducts[i].product[j] === "\""){
          p += "\\" + this.precedencesWithProducts[i].product[j];
        }
        else{
          p += this.precedencesWithProducts[i].product[j];
        }
      }

      if(p[p.length - 1] === "\\"){
        p += " ";
      }

      this.recipieGraphTxt += p + "\"";

        //this.recipieGraphTxt += String.raw`${this.precedencesWithProducts[i].task}`;
      // this.recipieGraphTxt += String.raw`${this.precedencesWithProducts[i].product}`;


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

        this.recipieGraphTxt += " [ label = " + minProctime + " ]";
      }
      this.recipieGraphTxt += "}";


      var viz = new Viz();
      viz.renderSVGElement(this.recipieGraphTxt)
      .then(function(element) {
        document.getElementById('recipieGraph').innerHTML="";
        document.getElementById('recipieGraph').appendChild(element);
      })
      .catch(error => {
        viz = new Viz();
        console.error(error);
      });

    // console.log(this.recipieGraphTxt);
    },
  },
}).$mount("#content");