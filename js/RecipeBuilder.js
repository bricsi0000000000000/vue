Vue.use(VueDraggable.default);

var recipieBuilder = new Vue({
  el: '#content',
  data() {
    const componentInstance = this
    return {
      /*Arrow images*/
      arrowImgProductsState: false,
      arrowImgProducts: "images/down-arrow.png",

      arrowImgTasksState: false,
      arrowImgTasks: "images/down-arrow.png",

      arrowImgEquipmentsState: false,
      arrowImgEquipments: "images/down-arrow.png",

      arrowImgPrecedencesState: false,
      arrowImgPrecedences: "images/down-arrow.png",

      arrowImgProctimesState: false,
      arrowImgProctimes: "images/down-arrow.png",

      dragAndDropOptions: {
        onDrop(event) {
          if (componentInstance.checkTasksEquipment(event)) {
            componentInstance.updateEquimpents();
          }
          schedGraphBuilder.getTasks(false);
        },
        onDragend(event) {
          if (!componentInstance.checkTasksEquipment(event)) {
            event.stop();
          }
        }
      },
      /*---------------RECIPIE BUILDER---------------*/

      /*-----INPUT DATAS-----*/
      /*new product*/
      inputProductName: '',
      
      /*new task*/
      inputTaskName: '',
      inputTaskProductName: '',

      /*new equipment*/
      inputEquipmentName: '',

      /*new precedence*/
      inputTaskPrecedenceFrom: "",
      inputTaskPrecedenceTo: "",

      /*new proctime*/
      inputProctime: "",
      inputProctimeTask: "",
      inputProctimeEq: "",
      /*------------------*/

      products: [],

      tasks: [],

      tasksAndProducts: [], //task, product  //which task which product

      equipments: [],

      precedences: [], //task1, task2
      precedencesWithProducts: [], //task, product

      proctimes: [], //task, eq, proctime

      taskEquipments: [], //task, eqs[] | which task which equipments
      taskEquipment: [], //task, eq, proctime
      equipmentsWithTasks: [], //eq, tasks
      tasksToEq2: [], //eq, tasks
      tasksToEq: [], //eq, tasks

      recipieGraphTxt: "",

      tmpTask1: [],
      tmpTask2: [],

      seenForms: true,

      tasksLength: 0,
      productsLength: 0,
      eqsLength: 0,
      precedencesLength: 0,
      proctimesLength: 0,

      /*---------------SchedGraphBuilder-------------*/
      uisNisChk: false, //UIS NIS
      longestPathTime: "",
      longestPathStartTask: "",
      longestPathEndTask: "",
      circle: false,
      ganttWidth: 0,
    }
  },
  methods: {
    changeArrowImgProducts() {
      var arrow = document.getElementById('products-arrow');
      var deg = this.arrowImgProductsState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate('+deg+'deg)'; 
      arrow.style.mozTransform    = 'rotate('+deg+'deg)'; 
      arrow.style.msTransform     = 'rotate('+deg+'deg)'; 
      arrow.style.oTransform      = 'rotate('+deg+'deg)'; 
      arrow.style.transform       = 'rotate('+deg+'deg)'; 

      this.arrowImgProductsState = !this.arrowImgProductsState;
    },
    changeArrowImgTasks() {
      var arrow = document.getElementById('tasks-arrow');
      var deg = this.arrowImgTasksState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate('+deg+'deg)'; 
      arrow.style.mozTransform    = 'rotate('+deg+'deg)'; 
      arrow.style.msTransform     = 'rotate('+deg+'deg)'; 
      arrow.style.oTransform      = 'rotate('+deg+'deg)'; 
      arrow.style.transform       = 'rotate('+deg+'deg)'; 

      this.arrowImgTasksState = !this.arrowImgTasksState;
    },
    changeArrowImgEquipments() {
      var arrow = document.getElementById('equipments-arrow');
      var deg = this.arrowImgEquipmentsState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate('+deg+'deg)'; 
      arrow.style.mozTransform    = 'rotate('+deg+'deg)'; 
      arrow.style.msTransform     = 'rotate('+deg+'deg)'; 
      arrow.style.oTransform      = 'rotate('+deg+'deg)'; 
      arrow.style.transform       = 'rotate('+deg+'deg)'; 

      this.arrowImgEquipmentsState = !this.arrowImgEquipmentsState;
    },
    changeArrowImgPrecedences() {
      var arrow = document.getElementById('precedences-arrow');
      var deg = this.arrowImgPrecedencesState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate('+deg+'deg)'; 
      arrow.style.mozTransform    = 'rotate('+deg+'deg)'; 
      arrow.style.msTransform     = 'rotate('+deg+'deg)'; 
      arrow.style.oTransform      = 'rotate('+deg+'deg)'; 
      arrow.style.transform       = 'rotate('+deg+'deg)'; 

      this.arrowImgPrecedencesState = !this.arrowImgPrecedencesState;
    },
    changeArrowImgProctimes() {
      var arrow = document.getElementById('proctimes-arrow');
      var deg = this.arrowImgProctimesState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate('+deg+'deg)'; 
      arrow.style.mozTransform    = 'rotate('+deg+'deg)'; 
      arrow.style.msTransform     = 'rotate('+deg+'deg)'; 
      arrow.style.oTransform      = 'rotate('+deg+'deg)'; 
      arrow.style.transform       = 'rotate('+deg+'deg)'; 

      this.arrowImgProctimesState = !this.arrowImgProctimesState;
    },

    /*---------------SchedGraphBuilder-------------*/
    switchForms() {
      this.updateTaskEquipment(true);

      this.seenForms = !this.seenForms;
      if (!this.seenForms) {
        this.updateTasksToEq();

        schedGraphBuilder.getTasks(true);
        document.title = "Schedule graph builder";
      }
      else {
        this.recipieGraphTxtOut();

        document.title = "Recipie graph builder";
      }

      this.updateProductsLength();
      this.updateTasksLength();
      this.updateEqsLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();
    },
    uisNisSwitch() {
      if (this.uisNisChk) {
        schedGraphBuilder.waitForIt(true, true);
      }
      else {
        schedGraphBuilder.waitForIt(true, false);
      }
      this.uisNisChk = !this.uisNisChk;
    },

    /*---------------RECIPIE BUILDER---------------*/
    /*--------ADD--------*/
    addProduct() {
      if (this.isInputProductValid(this.inputProductName)) {
        if (this.isInputProductNew(this.inputProductName)) {
          this.products.push(this.inputProductName);
        }
        else {
          this.showWarning("This product (" + this.inputProductName + ") is already exists", "error");
        }
      }
      this.inputProductName = '';
      this.updateProductsLength();
    },
    addTask() {
      if(this.inputTaskName === "" && this.inputTaskProductName === ""){
        this.showWarning("Task name and product name are empty", "error");
      }
      else{
        if(this.inputTaskName === ""){
          this.showWarning("Task name is empty", "error");
        }
        else if(this.inputTaskProductName === ""){
          this.showWarning("Product name is empty", "error");
        }
        else{
          if (this.inputTaskName.indexOf("\\\"") !== -1) {
            this.showWarning("Task name contains wrong characters: \\\"", "error");
          }
          else{
            if(this.inputTaskName === this.inputTaskProductName){
              this.showWarning("Task name (" + this.inputTaskName + ") and product (" + this.inputTaskProductName + ") are the same", "error");
            }
            else{
              if(this.isInputTaskAndProductNew(this.inputTaskName, this.inputTaskProductName)){
                this.addTasksAndProducts();
                this.tasks.push(this.inputTaskName);
                this.precedencesWithProducts.push({ task: this.inputTaskName, product: this.inputTaskProductName });
              }
              else{
                this.showWarning("Task name (" + this.inputTaskName + ") and product (" + this.inputTaskProductName + ") is already exists", "error");
              }
            }
          }
        }
      }

      this.inputTaskName = '';
      this.inputTaskProductName = '';

      this.updateTasksLength();
      this.recipieGraphTxtOut();
      this.addTmpTask12();
    },
    addTmpTask12() {
      this.tmpTask1 = [];
      this.tmpTask2 = [];
      this.tasks.forEach(task => {
        this.tmpTask1.push(task);
        this.tmpTask2.push(task);
      })
    },
    addEquipment() {
      if(this.isInputEquipmentValid(this.inputEquipmentName)){
        if(this.isInputEquipmentNew(this.inputEquipmentName)){
          this.equipments.push(this.inputEquipmentName);
        }
        else {
          this.showWarning("This equipment (" + this.inputEquipmentName + ") is already exists!", "error");
        }
      }

      this.inputEquipmentName = '';

      this.updateEqsLength();
    },
    addPrecedence() {
      if((this.inputTaskPrecedenceFrom === "" && this.inputTaskPrecedenceTo === "") ||
         (this.inputTaskPrecedenceFrom === undefined && this.inputTaskPrecedenceTo === undefined))
      {
        this.showWarning("Task1 and task2 are empty", "error");
      }
      else{
        if(this.inputTaskPrecedenceFrom === "" || this.inputTaskPrecedenceFrom === undefined){
          this.showWarning("Task1 is empty", "error");
        }
        else if(this.inputTaskPrecedenceTo === "" || this.inputTaskPrecedenceTo === undefined){
          this.showWarning("Task2 is empty", "error");
        }
        else{
          if(this.isInputPrecedenceNew(this.inputTaskPrecedenceFrom, this.inputTaskPrecedenceTo)){
            this.precedences.push({ task1: this.inputTaskPrecedenceFrom, task2: this.inputTaskPrecedenceTo });

            for (var i = 0; i < this.precedencesWithProducts.length; i++) {
              if (this.precedencesWithProducts[i].task === this.inputTaskPrecedenceFrom) {
                this.deletePrecedencesWithProducts(i);
                this.precedencesWithProducts.push({ task: this.inputTaskPrecedenceFrom, product: this.inputTaskPrecedenceTo });
              }
            }

            this.recipieGraphTxtOut();
            this.updatePrecedencesLength();
          }
          else{
            this.showWarning("Precedence (" + this.inputTaskPrecedenceFrom + " -> " + this.inputTaskPrecedenceTo + ") is already exists", "error");
          }
        }
      }

      this.inputTaskPrecedenceFrom = "";
      this.inputTaskPrecedenceTo = "";

      this.fillUpTmpTaks12();
    },
    addProctime() {
      if (this.inputProctimeTask === "" && this.inputProctimeEq === "" && this.inputProctime === "") {
        this.showWarning("Task, equipment and proctime are empty", "error");
      }
      else{
        if (this.inputProctimeTask === "" && this.inputProctimeEq === "") {
          this.showWarning("Task and equipment are empty", "error");
        }
        else if (this.inputProctimeTask === "" && this.inputProctime === "") {
          this.showWarning("Task and proctime are empty", "error");
        }
        else if (this.inputProctimeEq === "" && this.inputProctime === "") {
          this.showWarning("Equipment and proctime are empty", "error");
        }
        else{
          if (this.inputProctimeTask === "") {
            this.showWarning("Task is empty", "error");
          }
          else if (this.inputProctimeEq === "") {
            this.showWarning("Eq is empty", "error");
          }
          else if (this.inputProctime === "") {
            this.showWarning("Proctime is empty", "error");
          }
          else{
            if(this.inputProctime < 0){
              this.showWarning("Proctime is negativ", "error");
            }
            else{
              if(this.isInputProctimeNew(this.inputProctimeTask, this.inputProctimeEq)){
                this.proctimes.push({ task: this.inputProctimeTask, eq: this.inputProctimeEq, proctime: this.inputProctime });
                this.addTaskEquipment(this.inputProctimeTask, this.inputProctimeEq, this.inputProctime);
                this.recipieGraphTxtOut();
                this.updateProctimesLength();
              }
              else{
                this.showWarning("Proctime (" + this.inputProctimeTask + ", " + this.inputProctimeEq + ") is already exists", "error");
              }
            }
          }
        }
      }

      this.inputProctimeTask = "";
      this.inputProctimeEq = "";
      this.inputProctime = "";
    },
    addTasksAndProducts() {
      this.tasksAndProducts.push({ task: this.inputTaskName, product: this.inputTaskProductName });
    },
    addTaskEquipment(task, eq, proctime) {
      let add = true;
      for (let task_eq in this.taskEquipment) {
        if (this.taskEquipment[task_eq].task !== task &&
            this.taskEquipment[task_eq].eq !== eq)
        {
          if (this.taskEquipment[task_eq].task === task) {
            this.taskEquipment[task_eq].eq = eq;
            this.taskEquipment[task_eq].proctime = proctime;
            add = false;
          }
        }
        else if(this.taskEquipment[task_eq].task === task &&
                this.taskEquipment[task_eq].eq === eq)
        {
          this.taskEquipment[task_eq].proctime = proctime;
          add = false;
        }
        else if(this.taskEquipment[task_eq].task === task){
          this.taskEquipment[task_eq].eq = eq;
          this.taskEquipment[task_eq].proctime = proctime;
          add = false;
        }
      }
      if (add) {
        this.taskEquipment.push({ task: task, eq: eq, proctime: proctime });
      }
    },
    /*-------------------*/

    /*---------CHECK----------*/
    isInputProductValid(new_product) {
      let valid = false;
      if (new_product === "") {
        this.showWarning("Product name is empty", "error");
      }
      else {
        if (new_product.indexOf("\\\"") !== -1) {
          this.showWarning("Product name contains wrong characters: (\\\")", "error");
        }
        else {
          valid = true;
        }
      }

      return valid;
    },
    isInputProductNew(new_product) {
      let product_is_new = true;

      for (let product in this.products) {
        if (product_is_new) {
          if (this.products[product] === new_product) {
            product_is_new = false;
          }
        }
      }

      return product_is_new;
    },

    isInputTaskAndProductNew(new_task, new_product){
      let task_and_product_is_new = true;

      for(let task_and_product in this.tasksAndProducts){
        if (task_and_product_is_new) {
          if (this.tasksAndProducts[task_and_product].task === new_task &&
              this.tasksAndProducts[task_and_product].product === new_product)
          {
              task_and_product_is_new = false;
          }
        }
      }

      return task_and_product_is_new;
    },

    isInputEquipmentValid(new_equipment){
      let valid = false;
      if (new_equipment === "") {
        this.showWarning("Equipment name is empty", "error");
      }
      else {
        if (new_equipment.indexOf("\\\"") !== -1) {
          this.showWarning("Equipment name contains wrong characters: (\\\")", "error");
        }
        else {
          valid = true;
        }
      }

      return valid;
    },
    isInputEquipmentNew(new_equipment){
      let equipment_is_new = true;

      for (let equipment in this.equipments) {
        if (equipment_is_new) {
          if (this.equipments[equipment] === new_equipment) {
            equipment_is_new = false;
          }
        }
      }

      return equipment_is_new;
    },

    isInputPrecedenceNew(task_from, task_to){
      let precedence_is_new = true;

      for (let precedence in this.precedences) {
        if (precedence_is_new) {
          if (this.precedences[precedence].task1 === task_from &&
              this.precedences[precedence].task2 === task_to)
          {
            precedence_is_new = false;
          }
        }
      }

      return precedence_is_new;
    },

    isInputProctimeNew(new_task, new_eq){
      let proctime_is_new = true;

      for(let proctime in this.proctimes){
        if(proctime_is_new){
          if(this.proctimes[proctime].task === new_task &&
             this.proctimes[proctime].eq === new_eq)
          {
            proctime_is_new = false;
          }
        }
      }

      return proctime_is_new;
    },
    
    /*-------------------*/


    /*--------FILL-------*/
    fillUpTmpTaks12() {
      this.tmpTask1 = [];
      this.tmpTask2 = [];
      for(let task in this.tasks){
        let is_product = false;
        for(let product in this.products){
          if(this.tasks[task] === this.products[product]){
            is_product = true;
          }
        }

        if(!is_product){
          this.tmpTask1.push(this.tasks[task]);
          this.tmpTask2.push(this.tasks[task]);
        }
      }
    },
    /*-------------------*/

    /*------REMOVE-------*/
    removeTmpTask1() {
      this.tmpTask1 = [];
      let currrent_product = "";

      this.tasksAndProducts.forEach(task_and_product => {
        if(this.inputTaskPrecedenceTo === task_and_product.task){
          currrent_product = task_and_product.product;
        }
      });

      this.tasksAndProducts.forEach(task_and_product => {
        if(task_and_product.product === currrent_product){
          if(task_and_product.task !== this.inputTaskPrecedenceTo){
            this.tmpTask1.push(task_and_product.task);
          }
        }
      }); 
    },
    removeTmpTask2() {
      this.tmpTask2 = [];
      let currrent_product = "";

      this.tasksAndProducts.forEach(task_and_product => {
        if(this.inputTaskPrecedenceFrom === task_and_product.task){
          currrent_product = task_and_product.product;
        }
      });

      this.tasksAndProducts.forEach(task_and_product => {
        if(task_and_product.product === currrent_product){
          if(task_and_product.task !== this.inputTaskPrecedenceFrom){
            this.tmpTask2.push(task_and_product.task);
          }
        }
      }); 
    },
    /*-------------------*/

    /*--------DELETE-INDEX--------*/
    deleteProduct(index) {
      let product_name = "";
      for (let i = 0; i < this.products.length; i++) {
        if (index === i) {
          product_name = this.products[i];
        }
      }
      this.products.splice(index, 1);
      this.deleteFromTaskEquipmentAsProduct(product_name);
      this.updateTasksAndProducts(product_name);
      this.updateTasks();
      this.updatePrecedences();
      this.updatePrecedencesWithProducts();
      this.updateProctimes();
      this.recipieGraphTxtOut();
      this.updateTasksLength();
      this.updateProductsLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();
    },
    deleteTaskAndTasksAndProducts(index) {
      let task = "";
      for (let i = 0; i < this.tasks.length; i++) {
        if (index === i) {
          task = this.tasks[i];
        }
      }
     
      this.deleteFromTaskEquipmentAsTask(task);
      this.updatePrecedencesFromTask(task);
      this.updateProctimesFromProduct(task);
      this.tasks.splice(index, 1);
      this.deleteTasksAndProducts(index);
      this.updatePrecedences();
      this.updatePrecedencesWithProductsFromTasks(task);

      this.updateTasksLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();

      this.recipieGraphTxtOut();
    },
    deleteTask(index) {
      this.tasks.splice(index, 1);
    },
    deleteTmpTask1(index) {
      this.tmpTask1.splice(index, 1);
    },
    deleteTmpTask2(index) {
      this.tmpTask2.splice(index, 1);
    },
    deleteTasksAndProducts(index) {
      this.tasksAndProducts.splice(index, 1);
    },
    deleteEq(index) {
      let delete_equipment = "";
      for (let i = 0; i < this.equipments.length; i++) {
        if(i === index){
          delete_equipment = this.equipments[i];
        }
      }
      this.equipments.splice(index, 1);
      this.deleteFromTaskEquipmentAsEquipment(delete_equipment);
      this.updateProctimesFromEq();
      this.updateProctimes();
      this.recipieGraphTxtOut();

      this.updateEqsLength();
    },
    deletePrecendence(index) {
      this.precedences.splice(index, 1);
    },
    deletePrecedenceFromHtml(index) {
      let task1 = "";
      let task2 = "";
      this.precedences.forEach((precedence, i) => {
        if (i === index) {
          task1 = precedence.task1;
          task2 = precedence.task2;
        }
      });
      
      this.deletePrecendence(index);
      this.updatePrecedencesWithProductsFromPrecedence(task1, task2);
      this.recipieGraphTxtOut();

      this.updatePrecedencesLength();

      this.fillUpTmpTaks12();
    },
    deleteProctimeFromHtml(index) {
      let delete_proctime = "";
      for (let i = 0; i < this.proctimes.length; i++) {
        if(i === index){
          delete_proctime = this.proctimes[i];
        }
      }
      this.deleteFromTaskEquipmentAsProctime(delete_proctime);
      this.proctimes.splice(index, 1);
      this.updateProctimes();
      this.recipieGraphTxtOut();
      this.updateProctimesLength();
    },
    deleteProctime(index) {
      this.proctimes.splice(index, 1);
      this.updateProctimes();
      this.updateProctimesLength();
    },
    deletePrecedencesWithProducts(index) {
      this.precedencesWithProducts.splice(index, 1);
    },
    /*-------------------------*/

    /*----------UPDATE---------*/
    updateTasks() {
      let delete_these = [];
      this.tasks.forEach(task => {
        let add = true;
        this.tasksAndProducts.forEach(task_and_product => {
          if(task === task_and_product.task){
            add = false;
          }
        });

        if(add){
          delete_these.push(task);
        }
      });

      delete_these.forEach(delete_task => {
        this.tasks.forEach((task,index) => {
          if(delete_task === task){
            this.deleteTask(index);
          }
        });
      });
    },
    updateTasksAndProducts(product_name) {
      let delete_these = [];
      this.tasksAndProducts.forEach(task_and_product => {
        if(product_name === task_and_product.product){
          delete_these.push({task: task_and_product.task, product: task_and_product.product});
        }
      });

      delete_these.forEach(delete_task_and_product => {
        this.tasksAndProducts.forEach((task_and_product, index) => {
          if(delete_task_and_product.task === task_and_product.task){
            this.deleteTasksAndProducts(index);
          }
        });
      });
    },
    updatePrecedences() {
      let delete_these = [];
      this.precedences.forEach(precedence => {
        let add = true;
        this.tasks.forEach(task => {
          if(precedence.task1 === task || precedence.task2 === task){
            add = false;
          }
        });
        if(add){
          delete_these.push(precedence.task1);
        }
      });

      delete_these.forEach(delete_precedence => {
        this.precedences.forEach((precedence, index) => {
          if(delete_precedence === precedence.task1){
            this.deletePrecendence(index);
          }
        });
      });

      this.fillUpTmpTaks12();
    },
    updatePrecedencesFromTask(task) {
      let delete_these = [];
      this.precedences.forEach(precedence => {
        if(task === precedence.task1 || task === precedence.task2){
          delete_these.push({task1: precedence.task1, task2: precedence.task2});
        }
      });

      delete_these.forEach(delete_precedence => {
        this.precedences.forEach((precedence, index) => {
          if(delete_precedence.task === precedence.task1 && delete_precedence.task2 === precedence.task2){
            this.deletePrecendence(index);
          }
        });
      });

      this.fillUpTmpTaks12();
    },
    updateProctimes() {
      let delete_these = [];
      this.proctimes.forEach(proctime => { //task, eq, proctime
        let add = true;
        this.tasks.forEach(task => {
          if(proctime.task === task){}{
            add = false;
          }
        });

        if(add){
          delete_these.push(proctime.task);
        }
      });

      delete_these.forEach(delete_proctime => {
        this.proctimes.forEach((proctime, index) => {
          if(delete_proctime === proctime.task){
            this.proctimes.splice(index, 1);
          }
        });
      });
    },
    updateProctimesFromProduct(task) {
      let delete_these = [];
      this.proctimes.forEach(proctime => {
        if(task === proctime.task){
          delete_these.push(proctime.task);
        }
      });
      delete_these.forEach(delete_proctime => {
        this.proctimes.forEach((proctime, index) => {
          if(delete_proctime === proctime.task){
            this.deleteProctime(index);
          }
        });
      });
    },
    updateProctimesFromEq() {
      let delete_these = [];
      this.proctimes.forEach(proctime => { //task, eq, proctime
        let add = true;
        this.equipments.forEach(equipment => {
          if(proctime.eq === equipment){
            add = false;
          }
        });

        if(add){
          delete_these.push(proctime.eq);
        }
      });

      delete_these.forEach(delete_proctime => {
        this.proctimes.forEach((proctime, index) => {
          if(delete_proctime === proctime.eq){
            this.deleteProctime(index);
          }
        });
      });
    },
    updatePrecedencesWithProducts() {
      let delete_these = [];
      this.precedencesWithProducts.forEach(precedence_with_product => { //task, product
        let add = true;
        this.tasks.forEach(task => {
          if(precedence_with_product.task == task || precedence_with_product.product == task){
            add = false;
          }
        });

        if(add){
          delete_these.push(precedence_with_product.task);
        }
      });

      delete_these.forEach(delete_precedence => {
        this.precedencesWithProducts.forEach((precedence_with_product, index) => {
          if(delete_precedence === precedence_with_product.task){
            this.deletePrecedencesWithProducts(index);
          }
        });
      });
    },
    updatePrecedencesWithProductsFromTasks(update_task) {
      let delete_these = [];
      this.precedencesWithProducts.forEach(precedence_with_product => { //task, product
        if(update_task === precedence_with_product.task || update_task === precedence_with_product.product){
          delete_these.push({task: precedence_with_product.task, product: precedence_with_product.product});
        }
      });

      delete_these.forEach(delete_precedence_with_product => {
        this.precedencesWithProducts.forEach((precedence_with_product, index) => { //task, product
        if(delete_precedence_with_product.task === precedence_with_product.task ||
           delete_precedence_with_product.product === precedence_with_product.product)
        {
          this.deletePrecedencesWithProducts(index);
        }
        });
      });

      this.tasks.forEach(task =>{
        let add = true;
        this.precedencesWithProducts.forEach(precedence_with_product => { //task, product
          if(task === precedence_with_product.task){
            add = false;
          }
        });

        if(add){
          this.tasksAndProducts.forEach(task_and_product => {
            if(task === task_and_product.task){
              this.precedencesWithProducts.push({task: task, product: task_and_product.product});
            }
          });
        }
      });
    },
    updatePrecedencesWithProductsFromPrecedence(task1) {
      this.precedencesWithProducts.forEach((precedence_with_product, index) => { //task, product
        if(task1 === precedence_with_product.task){
          this.deletePrecedencesWithProducts(index);
          this.tasksAndProducts.forEach(task_and_product => {
            if(task1 === task_and_product.task){
              this.precedencesWithProducts.push({ task: task1, product: task_and_product.product });
            }
          });
        }
      });
    },
    updateEquimpents() {
      let dropped = []; //eq, tasks
      let sched_table = document.getElementsByClassName("schedTable");
      for (let child_index = 0; child_index < sched_table.length; child_index++) {
        let act_eq = "";
        let act_tasks = [];
        for (let node_index = 0; node_index < sched_table[child_index].children.length; node_index++) {
          if (node_index === 0) {
            act_eq = sched_table[child_index].children[node_index].textContent;
          }
          else {
            act_tasks.push(sched_table[child_index].children[node_index].textContent);
          }
        }
        dropped.push({ eq: act_eq, tasks: act_tasks });
      }

      dropped.forEach(drop => {
        drop.tasks.forEach(task => {
          this.taskEquipment.forEach(task_eq => {
            if (task === task_eq.task) {
              task_eq.eq = drop.eq;
            }
          });
        });
      });
    },
    updateProductsLength() {
      this.productsLength = this.products.length;
    },
    updateTasksLength() {
      this.tasksLength = this.tasks.length;
    },
    updateEqsLength() {
      this.eqsLength = this.equipments.length;
    },
    updatePrecedencesLength() {
      this.precedencesLength = this.precedences.length;
    },
    updateProctimesLength() {
      this.proctimesLength = this.proctimes.length;
    },
    updateTasksToEq() {
      this.tasksToEq = []; //eq, tasks
      this.equipments.forEach(equipment => {
        let tasks = [];
        this.taskEquipments.forEach(task_equipment =>{ //task, eqs[]
          task_equipment.eqs.forEach(task_eq => {
            if(equipment === task_eq){
              tasks.push(task_equipment.task);
            }
          });
        });
        this.tasksToEq.push({eq: equipment, tasks: tasks});
      });

      this.updateTasksToEqWithProctimes();
    },
    updateTasksToEq2(tasks) {
      if(tasks === ""){
        this.tasksToEq2 = []; //eq, tasks
        this.equipments.forEach(equipment => {
          let tasks = [];
          this.taskEquipment.forEach(task_equipment => {
            if(task_equipment.eq === equipment){
              tasks.push(task_equipment.task);
            }
          });

          this.tasksToEq2.push({eq: equipment, tasks: tasks});
        });
      }
      else{
        let add_equipment = "";
        let add_tasks = [];

        this.tasksToEq2 = []; //eq, tasks
        let add = true;

        this.tasks.forEach(task => {
          if(!add){
            this.tasksToEq2.push({eq: add_equipment, tasks: add_tasks});
          }

          add = true;

          this.equipments.forEach(equipment => {
            if(equipment === task){
              add = false;
            }
          });

          if(add){
            add_tasks.push(task);
          }
          else{
            add_tasks = [];
            add_equipment = task;
          }
        });
      }

      this.updateTasksToEqWithProctimes2();
    },
    updateTasksToEqWithProctimes() {
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time

      this.tasksToEq.forEach(task_to_equipment =>{
        let add_tasks = []; //task, time

        task_to_equipment.tasks.forEach(task => {
          let time = "";
          this.proctimes.forEach(proctime => {
            if(task === proctime.task &&task_to_equipment.eq === proctime.eq){
              time = proctime.proctime;
            }
          });
          add_tasks.push({task: task, time: time});
        });

        this.tasksToEqWithProctimes.push({eq: task_to_equipment.eq, tasks: add_tasks});
      });
    },
    updateTasksToEqWithProctimes2() {
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time

      this.tasksToEq2.forEach(task_to_equipment => {
        let add_tasks = []; //task, time

        task_to_equipment.tasks.forEach(task => {
          let time = "";
          this.proctimes.forEach(proctime => {
            if(task === proctime.task && task_to_equipment.eq === proctime.eq){
              time = proctime.proctimes;
            }
          });

          add_tasks.push({task: task, time: time});
        });

        this.tasksToEqWithProctimes.push({eq: task_to_equipment.eq, tasks: add_tasks});
      });
    },
    updateTaskEquipment(call) {
      if (this.taskEquipment.length === 0) {
        this.taskEquipment = []; //task, eq, proctime
        this.taskEquipments.forEach(task => {
          this.taskEquipment.push({ task: task.task, eq: task.eqs[0], proctime: -1 });
        });
      }
      else {
        this.taskEquipment.forEach(task => {
          this.proctimes.forEach(time => {
            if (task.task === time.task && task.eq === time.eq) {
              task.proctime = time.proctime;
            }
          });
        });
      }

      this.updateEquimpentsWithTasks(call);
    },
    updateEquimpentsWithTasks(call) {
      if (this.equipmentsWithTasks.length === 0 || call) {
        this.equipmentsWithTasks = []; //eq, tasks

        if (this.tasksToEq2.length === 0) {
          this.equipments.forEach(equipment => {
            let act_tasks = [];
            this.taskEquipment.forEach(task => {
              if (task.eq === equipment) {
                act_tasks.push(task.task);
              }
            });
            this.equipmentsWithTasks.push({ eq: equipment, tasks: act_tasks });
          });
        }
        else {
          this.equipments.forEach(equipment => {
            let act_tasks = [];
            this.tasksToEq2.forEach(task_to_eq => {
              if (task_to_eq.eq === equipment) {
                task_to_eq.tasks.forEach(task => {
                  act_tasks.push(task);
                });
              }
            });
            this.equipmentsWithTasks.push({ eq: equipment, tasks: act_tasks });
          });
        }
      }
    },
    /*-------------------------*/

    /*--------DELETE-FROM-TASKEQUIPMENTS--------*/
    deleteFromTaskEquipmentAsProduct(product_name){
      let delete_these = [];
      this.taskEquipment.forEach(task_equipment => {
        if(this.getProduct(task_equipment.task) === product_name){
          delete_these.push(task_equipment);
        }
      });

      delete_these.forEach(delete_item => {
        this.taskEquipment.forEach((taskEquipment, index) => {
          if(delete_item === taskEquipment){
            this.taskEquipment.splice(index, 1);
          }
        });
      });
    },
    deleteFromTaskEquipmentAsTask(task){
      let delete_these = [];

      this.taskEquipment.forEach(task_equipment => {
        if(task_equipment.task === task){
          delete_these.push(task_equipment);
        }
      });

      delete_these.forEach(delete_item => {
        this.taskEquipment.forEach((task_equipment, index) => {
          if(delete_item === task_equipment){
            this.taskEquipment.splice(index, 1);
          }
        });
      });
    },
    deleteFromTaskEquipmentAsEquipment(equipment){
      let delete_these = [];

      this.taskEquipment.forEach(task_equipment => {
        if(task_equipment.eq === equipment){
          delete_these.push(task_equipment);
        }
      });

      delete_these.forEach(delete_item => {
        this.taskEquipment.forEach((task_equipment, index) => {
          if(delete_item === task_equipment){
            this.taskEquipment.splice(index, 1);
          }
        });
      });
    },
    deleteFromTaskEquipmentAsProctime(delete_proctime){
      this.taskEquipment.forEach(task_equipment => {
        if(task_equipment.task === delete_proctime.task &&
           task_equipment.eq === delete_proctime.eq &&
           task_equipment.proctime === delete_proctime.proctime)
        {
          task_equipment.proctime = +0;
        }
      });
    },
    /*--------------------------------*/

    getProduct(task){
      var product = "";
      for(let task_and_product in this.tasksAndProducts){
        if(this.tasksAndProducts[task_and_product].task === task){
          product = this.tasksAndProducts[task_and_product].product;
        }
      }

      return product;
    },
    showWarning(message, type) { //type: success, danger, error, info
      var message = SnackBar({
        message: message,
        status: type
      });
    },
    equipmentsToTask() {
      this.taskEquipments = [];
      for (let i = 0; i < this.proctimes.length; i++) {
        let add_task = this.proctimes[i].task;
        let add_equipments = [];
        for (let j = 0; j < this.proctimes.length; j++) {
          if (this.proctimes[j].task === add_task) {
            add_equipments.push(this.proctimes[j].eq);
          }
        }

        let add = true;
        for (let j = 0; j < this.taskEquipments.length; j++) {
          if (this.taskEquipments[j].task === add_task) {
            add = false;
          }
        }
        if (add) {
          this.taskEquipments.push({ task: add_task, eqs: add_equipments });
        }
      }
    },
    recipieGraphTxtOut() {
      this.equipmentsToTask();

      this.recipieGraphTxt = "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
      for (var i = 0; i < this.taskEquipments.length; i++) {
        this.recipieGraphTxt += " \"";
        var cur_task = "";
        for (var j = 0; j < this.taskEquipments[i].task.length; j++) {
          if (this.taskEquipments[i].task[j] === "\"") {
            cur_task += "\\" + this.taskEquipments[i].task[j];
          }
          else {
            cur_task += this.taskEquipments[i].task[j];
          }
        }

        if (cur_task[cur_task.length - 1] === "\\") {
          cur_task += " ";
        }

        this.recipieGraphTxt += cur_task + "\" [ " + "label = < <B>\\N</B><BR/>{";

        for (var j = 0; j < this.taskEquipments[i].eqs.length; j++) {
          this.recipieGraphTxt += this.taskEquipments[i].eqs[j] + ",";
        }
        this.recipieGraphTxt = this.recipieGraphTxt.substring(0, this.recipieGraphTxt.length - 1);

        this.recipieGraphTxt += "}> ]";
      }

      for (var i = 0; i < this.precedencesWithProducts.length; i++) {
        this.recipieGraphTxt += "\"";
        var cur_task = "";
        for (var j = 0; j < this.precedencesWithProducts[i].task.length; j++) {
          if (this.precedencesWithProducts[i].task[j] === "\"") {
            cur_task += "\\" + this.precedencesWithProducts[i].task[j];
          }
          else {
            cur_task += this.precedencesWithProducts[i].task[j];
          }
        }

        if (cur_task[cur_task.length - 1] === "\\") {
          cur_task += " ";
        }

        this.recipieGraphTxt += cur_task + "\" -> \"";

        cur_task = "";
        for (var j = 0; j < this.precedencesWithProducts[i].product.length; j++) {
          if (this.precedencesWithProducts[i].product[j] === "\"") {
            cur_task += "\\" + this.precedencesWithProducts[i].product[j];
          }
          else {
            cur_task += this.precedencesWithProducts[i].product[j];
          }
        }

        if (cur_task[cur_task.length - 1] === "\\") {
          cur_task += " ";
        }

        this.recipieGraphTxt += cur_task + "\"";

        var proc_time = 0;

        for (var j = 0; j < this.taskEquipment.length; j++) {
          if (this.precedencesWithProducts[i].task === this.taskEquipment[j].task) {
            proc_time = this.taskEquipment[j].proctime;
          }
        }

        this.recipieGraphTxt += " [ label = " + proc_time + " ]";
      }
      this.recipieGraphTxt += "}";

      var viz = new Viz();
      viz.renderSVGElement(this.recipieGraphTxt)
        .then(function (element) {
          document.getElementById('recipieGraph').innerHTML = "";
          document.getElementById('recipieGraph').appendChild(element);
        })
        .catch(error => {
          viz = new Viz();
          console.error(error);
        });
      //console.log(this.recipieGraphTxt);
    },
    checkTasksEquipment(event) {
      var act_task = event.items[0].innerText;
      var dropped_eq = event.droptarget.textContent.split(' ')[0];

      var dropped_eq_is_good = false;
      this.taskEquipments.forEach(task_eq => {
        task_eq.eqs.forEach(eq => {

          if (eq === dropped_eq) {
            if (task_eq.task === act_task) {
              dropped_eq_is_good = true;
            }
          }
        });
      });

      return dropped_eq_is_good;
    },
  },
}).$mount("#content");