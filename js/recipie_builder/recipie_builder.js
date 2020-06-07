"use strict";

Vue.use(VueDraggable.default);

var recipieBuilder = new Vue({
  el: '#recipie-builder',
  data() {
    const instance = this;
    return {
      dragAndDropOptions: {
        onDrop() {
          let new_drag_drop = []; //equipment, tasks
          let sched_table = document.getElementsByClassName('sched-table');

          for(let table of sched_table){
            let child_index;
            let tasks = [];
            for(child_index = 1; child_index < table.children.length; child_index++){
              if(table.children[child_index].innerText !== ''){
                tasks.push(table.children[child_index].innerText);
              }
            }
            new_drag_drop.push({equipment: table.children[0].innerText, tasks: tasks});
          }
         
          schedBuilder.makeSchedPrecedences(new_drag_drop);
          schedBuilder.buildSchedGraph();
        },
        onDragend(event) {
          let act_task = event.items[0].innerText;
          let dropped_equipment = event.droptarget.textContent.split(' ')[0];
          if(!instance.checkTaskEquipment(act_task, dropped_equipment)){
            event.stop();
          }
          else{
            instance.updateTasksEquipmentAndProctime(act_task, dropped_equipment);
            instance.updatePrecedencesEquipmentAndProctime(act_task, dropped_equipment);
          }
        }
      },
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

      inputProductName: '',
      products: [],

      inputTaskName: '',
      inputTaskProductName: '',
      tasks: [],

      inputEquipmentName: '',
      equipments: [], //TODO delete tasks from equipment, I don't need them

      inputTaskPrecedenceFrom: "",
      inputTaskPrecedenceTo: "",
      precedences: [],

      inputProctime: "",
      inputProctimeTask: "",
      inputProctimeEquipment: "",
      proctimes: [],
      allProctimes: [],

      tasksLength: 0,
      productsLength: 0,
      eqsLength: 0,
      precedencesLength: 0,
      proctimesLength: 0,

      precedenceTasksFrom: [],
      precedenceTasksTo: [], 

      seenForms: true,
      showImport: false,
      uis: true,
      circle: false,
      longestPathStartTask: '',
      longestPathEndTask: '',
      longestPathTime: '',
      ganttWidth: 0,

      dragDropPrecedences: [], //equipment, tasks
    }
  },
  methods: {
    /* ------------- ADD ------------- */
    addProduct() {
      if (this.isInputProductValid(this.inputProductName)) {
        if (this.isInputProductNew(this.inputProductName)) {
          let add_product = new Product(this.inputProductName);
          this.products.push(add_product);
          this.inputProductName = '';
        }
        else {
          this.showWarning("This product (" + this.inputProductName + ") is already exists", "error");
        }
      }
      this.inputProductName = '';
      this.updateProductsLength();
    },
    addTask() {
      if (this.inputTaskName === "" && this.inputTaskProductName === "") {
        this.showWarning("Task name and product name are empty", "error");
      }
      else {
        if (this.inputTaskName === "") {
          this.showWarning("Task name is empty", "error");
        }
        else if (this.inputTaskProductName === "") {
          this.showWarning("Product name is empty", "error");
        }
        else {
          if (this.inputTaskName.indexOf("\\\"") !== -1) {
            this.showWarning("Task name contains wrong characters: \\\"", "error");
          }
          else {
            if (this.inputTaskName === this.inputTaskProductName) {
              this.showWarning("Task name (" + this.inputTaskName + ") and product (" + this.inputTaskProductName + ") are the same", "error");
            }
            else {
              if (this.isInputTaskAndProductNew(this.inputTaskName, this.inputTaskProductName)) {
                let add_task = new Task(this.inputTaskName);
                add_task.product = this.inputTaskProductName;
                this.tasks.push(add_task);
              }
              else {
                this.showWarning("Task name (" + this.inputTaskName + ") and product (" + this.inputTaskProductName + ") is already exists", "error");
              }
            }
          }
        }
      }

      this.inputTaskName = '';
      this.inputTaskProductName = '';

      this.updateTasksLength();
      this.buildRecipieGraph();
      this.addPrecedenceTaskFromAndTo();
    },
    addEquipment() {
      if(this.isInputEquipmentValid(this.inputEquipmentName)){
        if(this.isInputEquipmentNew(this.inputEquipmentName)){
          let add_equipment = new Equipment(this.inputEquipmentName);
          this.equipments.push(add_equipment);
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
              this.precedences.push({ from: this.tasks.find(this.getPrecedenceTaskFrom), to: this.tasks.find(this.getPrecedenceTaskTo) });
              this.buildRecipieGraph();
              this.updatePrecedencesLength();
            }
            else{
              this.showWarning("Precedence (" + this.inputTaskPrecedenceFrom.name + " -> " + this.inputTaskPrecedenceTo.name + ") is already exists", "error");
            }
          }
        }

        this.inputTaskPrecedenceFrom = "";
        this.inputTaskPrecedenceTo = "";

        this.updatePrecedenceFromAndToTasks();
    },
    addProctime() {
      if (this.inputProctimeTask === "" && this.inputProctimeEquipment === "" && this.inputProctime === "") {
        this.showWarning("Task, equipment and proctime are empty", "error");
      }
      else{
        if (this.inputProctimeTask === "" && this.inputProctimeEquipment === "") {
          this.showWarning("Task and equipment are empty", "error");
        }
        else if (this.inputProctimeTask === "" && this.inputProctime === "") {
          this.showWarning("Task and proctime are empty", "error");
        }
        else if (this.inputProctimeEquipment === "" && this.inputProctime === "") {
          this.showWarning("Equipment and proctime are empty", "error");
        }
        else{
          if (this.inputProctimeTask === "") {
            this.showWarning("Task is empty", "error");
          }
          else if (this.inputProctimeEquipment === "") {
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
              if(this.isInputProctimeNew(this.inputProctimeTask, this.inputProctimeEquipment)){
                let change_task = this.tasks.find(this.getProctimeTask);
                //let change_task = new Task(this.tasks.find(this.getProctimeTask));

                change_task.proctimes.push(this.inputProctime);
                change_task.equipments.push(this.inputProctimeEquipment.name);
                //change_task.AddProctime(this.inputProctime);
                //change_task.AddEquipment(this.inputProctimeEquipment.name);
                this.updateTasksFromProctime();
                this.updatePrecedencesFromProctime();
                let add_task = Object.assign(Object.create(Object.getPrototypeOf(change_task)),change_task);
                //add_task.ChangeEquipmentAndProctime(this.inputProctimeEquipment.name, this.inputProctime);
                add_task.equipment_and_proctime = { equipment: this.inputProctimeEquipment.name, proctime: this.inputProctime };
                
                this.proctimes.push(add_task);
                this.buildRecipieGraph();
                this.updateProctimesLength();

                this.allProctimes.push({name: add_task.name, equipment: this.inputProctimeEquipment, proctime: this.inputProctime, product: add_task.product});

                this.updateEquipmentsTasksAsSmallestProctime();
              }
              else{
                this.showWarning("Proctime (" + this.inputProctimeTask.name + ", " + this.inputProctimeEquipment.name + ") is already exists", "error");
              }
            }
          }
        }
      }

      this.inputProctimeTask = "";
      this.inputProctimeEquipment = "";
      this.inputProctime = "";
    },
    addPrecedenceTaskFromAndTo() {
      this.precedenceTasksFrom = [];
      this.precedenceTasksTo = [];

      for(let task of this.tasks){
        this.precedenceTasksFrom.push(task);
        this.precedenceTasksTo.push(task);
      }
    },

    /* ------------- DELETE ------------- */
    deleteProduct(index) {
      let product = this.products[index];
      this.products.splice(index, 1);

      this.updateTasks(product);
      this.updateTasksLength();

      this.updatePrecedenceFromAndToTasks();
      this.deletePrecedenceFromProduct(product);
      this.updatePrecedencesLength();

      this.deleteProctimeFromProduct(product);
      this.deleteAllProctimeFromProduct(product);
      this.updateProctimesLength();
      this.updateEquipmentsTasksAsSmallestProctime();

      this.buildRecipieGraph();
    },
    updateTasks(product){
      let delete_these = [];
      for(let task of this.tasks){
        if(task.product === product.name){
          delete_these.push(task);
        }
      }

      delete_these.forEach(item => {
        this.tasks.forEach((task, index) => {
          if(item.name === task.name){
            this.tasks.splice(index, 1);
          }
        });
      });
    },
    deletePrecedenceFromProduct(product){
      let delete_these = [];
      for(let precedence of this.precedences){
        if(precedence.from.product === product.name ||
           precedence.to.product === product.name){
          delete_these.push(precedence.from);
          delete_these.push(precedence.to);
        }
      }

      delete_these.forEach(item => {
        this.precedences.forEach((precedence, index) => {
          if(item.name === precedence.from.name || item.name == precedence.to.name){
            this.precedences.splice(index, 1);
          }
        });
      });
    },
    deleteProctimeFromProduct(product){
      let delete_these = [];
      for(let proctime of this.proctimes){
        if(proctime.product === product.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.proctimes.forEach((proctime, index) => {
          if(item.name === proctime.name){
            this.proctimes.splice(index, 1);
          }
        });
      });
    },
    deleteAllProctimeFromProduct(product){
      let delete_these = [];
      for(let proctime of this.allProctimes){
        if(proctime.product === product.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.allProctimes.forEach((proctime, index) => {
          if(item.name === proctime.name){
            this.allProctimes.splice(index, 1);
          }
        });
      });
    },
    deleteTask(index){
      let task = this.tasks[index];
      this.tasks.splice(index, 1);

      this.updatePrecedenceFromAndToTasks();
      this.deletePrecedenceFromTask(task);
      this.updatePrecedencesLength();

      this.deleteProctimeFromTask(task);
      this.deleteAllProctimeFromTask(task);
      this.updateProctimesLength();
      this.updateEquipmentsFromTask(task);
      this.updateEquipmentsTasksAsSmallestProctime();

      this.buildRecipieGraph();
    },
    deletePrecedenceFromTask(task){
      let delete_these = [];
      for(let precedence of this.precedences){
        if(precedence.from.name === task.name){
          delete_these.push(precedence.from);
        }
        if(precedence.to.name === task.name){
          delete_these.push(precedence.to);
        }
      }

      delete_these.forEach(item => {
        this.precedences.forEach((precedence, index) => {
          if(item.name === precedence.from.name || item.name == precedence.to.name){
            this.precedences.splice(index, 1);
          }
        });
      });
    },
    deleteProctimeFromTask(task){
      let delete_these = [];
      for(let proctime of this.proctimes){
        if(proctime.name === task.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.proctimes.forEach((proctime, index) => {
          if(item.name === proctime.name){
            this.proctimes.splice(index, 1);
          }
        });
      });
    },
    deleteAllProctimeFromTask(task){
      let delete_these = [];
      for(let proctime of this.allProctimes){
        if(proctime.name === task.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.allProctimes.forEach((proctime, index) => {
          if(item.name === proctime.name){
            this.allProctimes.splice(index, 1);
          }
        });
      });
    },
    deleteProctime(index){
      this.deleteTaskFromProctime(this.allProctimes[index]);
      this.proctimes.splice(index, 1);
      this.allProctimes.splice(index, 1);
      this.updateProctimesLength();
      this.updateEquipmentsTasksAsSmallestProctime();

      this.buildRecipieGraph();
    },
    deleteTaskFromProctime(proctime){
      for(let task of this.tasks){
        if(task.name === proctime.name){
          if(task.equipments.indexOf(proctime.equipment.name) !== -1){
            task.RemoveEquipment(proctime.equipment);
            task.RemoveProctime(proctime);
            task.UpdateEquipmentAndProctime();
          }
        }
      }
    },
    deleteEquipment(index){
      let equipment = this.equipments[index];
      this.equipments.splice(index, 1);
      this.deleteProctimeFromEquipment(equipment);
      this.deleteAllProctimeFromEquipment(equipment);
      this.deleteTaskFromEquipment(equipment);

      this.buildRecipieGraph();
    },
    deleteProctimeFromEquipment(equipment){
      let delete_these = [];
      for(let proctime of this.proctimes){
        if(proctime.equipment_and_proctime.equipment === equipment.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.proctimes.forEach((proctime, index) => {
          if(item.name === proctime.name &&
            item.equipment_and_proctime.equipment === proctime.equipment_and_proctime.equipment){
            this.proctimes.splice(index, 1);
          }
        });
      });
    },
    deleteAllProctimeFromEquipment(equipment){
      let delete_these = [];
      for(let proctime of this.allProctimes){
        if(proctime.equipment.name === equipment.name){
          delete_these.push(proctime);
        }
      }

      delete_these.forEach(item => {
        this.allProctimes.forEach((proctime, index) => {
          if(item.name === proctime.name &&
            item.equipment.name === proctime.equipment.name){
            this.allProctimes.splice(index, 1);
          }
        });
      });
    },
    deleteTaskFromEquipment(equipment){
      for(let task of this.tasks){
        if(task.equipments.indexOf(equipment.name) !== -1){
          let equipment_index = task.RemoveEquipment(equipment.name);
          task.proctimes.splice(equipment_index,1);
          task.UpdateEquipmentAndProctime();
        }
      }
    },
    deletePrecedence(index){
      this.precedences.splice(index, 1);
      this.updatePrecedencesLength();

      this.buildRecipieGraph();
    },

    /* ------------- GET ------------- */
    getPrecedenceTaskFrom(value) {
      return value === this.inputTaskPrecedenceFrom;
    },
    getPrecedenceTaskTo(value) {
      return value === this.inputTaskPrecedenceTo;
    },
    getProctimeTask(value) {
      return value === this.inputProctimeTask;
    },
    getEquipmentsAndTasks(){
      let sched_table = document.getElementsByClassName("sched-table");
      let index;
      let dropped = [];
      for(index = 0; index < this.equipments.length; index++){
        let change_equipment = '';
        let tasks = [];
        let element_index;
        for(element_index = 0; element_index < sched_table[index].children.length; element_index++){
          if(sched_table[index].children[element_index].textContent !== ""){
            if(element_index === 0){
              change_equipment = sched_table[index].children[element_index].textContent;
            }
            else{
              tasks.push({name: sched_table[index].children[element_index].textContent});
            }
          }
        }
        dropped.push({equipment: change_equipment, tasks: tasks});
      }

      return dropped;
    },
    getEquipment(get_task){
      for(let task of this.tasks){
        if(get_task === task.name){
          if(typeof task.equipment_and_proctime.equipment === 'object'){
            return task.equipment_and_proctime.equipment.name;
          }
          else{
            return task.equipment_and_proctime.equipment;
          }
        }
      }
    },

    /* ------------- CHECK ------------- */
    isInputProductValid(new_product) {
      if (new_product === "") {
        this.showWarning("Product name is empty", "error");
      }
      else {
        if (new_product.indexOf("\\\"") !== -1) {
          this.showWarning("Product name contains wrong characters: (\\\")", "error");
        }
        else {
          return true;
        }
      }

      return false;
    },
    isInputProductNew(new_product) {
      for (let product of this.products) {
        if (product.name === new_product) {
          return false;
        }
      }

      return true;
    },
    isInputTaskAndProductNew(new_task, new_product) {
      for (let task of this.tasks) {
        if (task.name === new_task && task.product === new_product) {
          return false;
        }
      }

      return true;
    },
    isInputEquipmentValid(new_equipment){
      if (new_equipment === "") {
        this.showWarning("Equipment name is empty", "error");
      }
      else {
        if (new_equipment.indexOf("\\\"") !== -1) {
          this.showWarning("Equipment name contains wrong characters: (\\\")", "error");
        }
        else {
          return true;
        }
      }

      return false;
    },
    isInputEquipmentNew(new_equipment){
      for (let equipment of this.equipments) {
        if (equipment.name === new_equipment) {
          return false;
        }
      }

      return true;
    },
    isInputPrecedenceNew(task_from, task_to){
      for (let precedence of this.precedences) {
        if (precedence.from.name === task_from.name && precedence.to.name === task_to.name){
          return false;
        }
      }

      return true;
    },
    isInputProctimeNew(new_task, new_equipment){
      for(let proctime of this.proctimes){
        if(proctime.name === new_task.name && proctime.equipment_and_proctime.equipment.name === new_equipment.name){
          return false;
        }
      }

      return true;
    },
    checkTaskEquipment(act_task, dropped_equipment){
      for(let task of this.tasks){
        if(task.name === act_task){
          for(let equipment of task.equipments){
            if(equipment === dropped_equipment){
              return true;
            }
          }
        }
      }

      return false;
    },

    /* ------------- UPDATE ------------- */
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
    updatePrecedenceFromAndToTasks() {
      this.precedenceTasksFrom = [];
      this.precedenceTasksTo = [];
      for(let task of this.tasks){
        this.precedenceTasksFrom.push(task);
        this.precedenceTasksTo.push(task);
      }
    },
    updateTasksFromProctime(){
      for(let task of this.tasks){
        if(task.name === this.inputProctimeTask.name){
          //task.SetEquipmentAndProctime(this.inputProctimeEquipment.name, this.inputProctime);
          task.equipment_and_proctime = {equipment: this.inputProctimeEquipment.name, proctime: this.inputProctime};
        }
      }
    },
    updatePrecedencesFromProctime(){
      for(let precedence of this.precedences){
        if(precedence.from.name === this.inputProctimeTask.name){
          //precedence.from.SetEquipmentAndProctime(this.inputProctimeEquipment, this.inputProctime);
          precedence.from.equipment_and_proctime = {equipment: this.inputProctimeEquipment, proctime: this.inputProctime};
        }
        if(precedence.to.name === this.inputProctimeTask.name){
          //precedence.to.SetEquipmentAndProctime(this.inputProctimeEquipment, this.inputProctime);
          precedence.to.equipment_and_proctime = {equipment: this.inputProctimeEquipment, proctime: this.inputProctime};
        }
      }
    },
    updateEquipmentsFromTask(task){
      for(let equipment of this.equipments){
        if(equipment.tasks.indexOf(task) !== -1){
          equipment.tasks.splice(equipment.tasks.indexOf(task), 1);
        }
      }
    },
    updateEquipmentsTasksAsSmallestProctime(){
      let min_proctime_tasks = [];

      for(let task of this.tasks){
        let min_proctime = Number.MAX_VALUE;
        let min_proctime_task = '';

        for(let proctime of this.allProctimes){
          if(task.name === proctime.name){
            if(proctime.proctime < min_proctime){
              min_proctime = proctime.proctime;
              min_proctime_task = proctime;
            }
          }
        }

        if(min_proctime_task !== ''){
          min_proctime_tasks.push(min_proctime_task);
        }
      }

      for(let equipment of this.equipments){
        equipment.tasks = [];
        for(let proctime of min_proctime_tasks){
          if(equipment.name === proctime.equipment.name){
            equipment.tasks.push(proctime.name);
          }
        }
      }
    },
    updateEquipmentsTasks(){
      for(let equipment of this.equipments){
        for(let sched_equipment of schedBuilder.equipments){
          if(sched_equipment.equipment === equipment.name){
            equipment.tasks = sched_equipment.tasks;
          }
        }
      }
    },
    updateSchedGraphEquipmentsTasks(){
      let dropped = this.getEquipmentsAndTasks();

      for(let drop of dropped){
        schedBuilder.equipments.push({equipment: drop.equipment, tasks: drop.tasks});
      }
    },
    updateTasksEquipmentAndProctime(act_task, dropped_equipment){
      for(let task of this.tasks){
        if(task.name === act_task){
          let index;
          for(index = 0; index < task.equipments.length; index++){
            if(task.equipments[index] === dropped_equipment){
              break;
            }
          }
          task.equipment_and_proctime = { equipment: task.equipments[index], proctime: task.proctimes[index] };
        }
      }
    },
    updatePrecedencesEquipmentAndProctime(act_task, dropped_equipment){
      for(let precedence of this.precedences){
        if(precedence.from.name === act_task){
          let index;
          for(index = 0; index < precedence.from.equipments.length; index++){
            if(precedence.from.equipments[index] === dropped_equipment){
              break;
            }
          }
          precedence.from.equipment_and_proctime = { equipment: precedence.from.equipments[index], proctime: precedence.from.proctimes[index] };
        }
      }
    },
    updateDragDropPrecedenes(){
      this.dragDropPrecedences = [];
      let sched_table = document.getElementsByClassName('sched-table');

      for(let table of sched_table){
        let child_index;
        let tasks = [];
        for(child_index = 1; child_index < table.children.length; child_index++){
          if(table.children[child_index].innerText !== ''){
            tasks.push(table.children[child_index].innerText);
          }
        }
        this.dragDropPrecedences.push({equipment: table.children[0].innerText, tasks: tasks});
      }
      /*for(let task of this.tasks){
        console.log("task: " + this.isTaskLast(task));
        if(this.isTaskLast(task)){
          for(let drag_drop_precedence of this.dragDropPrecedences){
            if(drag_drop_precedence.equipment == task.equipment_and_proctime.equipment){
              drag_drop_precedence.tasks.push(task.product);
            }
          }
        }
      }*/
    },

  /*  isTaskLast(search_task){
      let last = true;
      for(let from_precedence of this.precedences){
        if(from_precedence.from.name == search_task){
          for(let to_precedence of this.precedences){
            if(from_precedence.from.name == to_precedence.to.name){
              last = false;
            }
          }
        }
      }

      return last;
    },*/
    /* ------------- REMOVE ------------- */
    removePrecedenceTasksTo() {
      this.precedenceTasksTo = [];
      for(let task of this.tasks){
        if(task.product === this.inputTaskPrecedenceFrom.product){
          if(task.name !== this.inputTaskPrecedenceFrom.name){
            this.precedenceTasksTo.push(task);
          }
        }
      }
    },
    removePrecedenceTasksFrom() {
      this.precedenceTasksFrom = [];
      for(let task of this.tasks){
        if(task.product === this.inputTaskPrecedenceTo.product){
          if(task.name !== this.inputTaskPrecedenceTo.name){
            this.precedenceTasksFrom.push(task);
          }
        }
      }
    },

    /* ------------- SHOW ------------- */
    showWarning(message, type) { //type: success, danger, error, info
      var message = SnackBar({
        message: message,
        status: type
      });
    },

    /* ------------- ARROWS ------------- */
    changeArrowImgProducts() {
      var arrow = document.getElementById('products-arrow');
      var deg = this.arrowImgProductsState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate(' + deg + 'deg)';
      arrow.style.mozTransform = 'rotate(' + deg + 'deg)';
      arrow.style.msTransform = 'rotate(' + deg + 'deg)';
      arrow.style.oTransform = 'rotate(' + deg + 'deg)';
      arrow.style.transform = 'rotate(' + deg + 'deg)';

      this.arrowImgProductsState = !this.arrowImgProductsState;
    },
    changeArrowImgTasks() {
      var arrow = document.getElementById('tasks-arrow');
      var deg = this.arrowImgTasksState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate(' + deg + 'deg)';
      arrow.style.mozTransform = 'rotate(' + deg + 'deg)';
      arrow.style.msTransform = 'rotate(' + deg + 'deg)';
      arrow.style.oTransform = 'rotate(' + deg + 'deg)';
      arrow.style.transform = 'rotate(' + deg + 'deg)';

      this.arrowImgTasksState = !this.arrowImgTasksState;
    },
    changeArrowImgEquipments() {
      var arrow = document.getElementById('equipments-arrow');
      var deg = this.arrowImgEquipmentsState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate(' + deg + 'deg)';
      arrow.style.mozTransform = 'rotate(' + deg + 'deg)';
      arrow.style.msTransform = 'rotate(' + deg + 'deg)';
      arrow.style.oTransform = 'rotate(' + deg + 'deg)';
      arrow.style.transform = 'rotate(' + deg + 'deg)';

      this.arrowImgEquipmentsState = !this.arrowImgEquipmentsState;
    },
    changeArrowImgPrecedences() {
      var arrow = document.getElementById('precedences-arrow');
      var deg = this.arrowImgPrecedencesState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate(' + deg + 'deg)';
      arrow.style.mozTransform = 'rotate(' + deg + 'deg)';
      arrow.style.msTransform = 'rotate(' + deg + 'deg)';
      arrow.style.oTransform = 'rotate(' + deg + 'deg)';
      arrow.style.transform = 'rotate(' + deg + 'deg)';

      this.arrowImgPrecedencesState = !this.arrowImgPrecedencesState;
    },
    changeArrowImgProctimes() {
      var arrow = document.getElementById('proctimes-arrow');
      var deg = this.arrowImgProctimesState ? 0 : 180;

      arrow.style.webkitTransform = 'rotate(' + deg + 'deg)';
      arrow.style.mozTransform = 'rotate(' + deg + 'deg)';
      arrow.style.msTransform = 'rotate(' + deg + 'deg)';
      arrow.style.oTransform = 'rotate(' + deg + 'deg)';
      arrow.style.transform = 'rotate(' + deg + 'deg)';

      this.arrowImgProctimesState = !this.arrowImgProctimesState;
    },

    buildRecipieGraph(){
      let recipieGraphBuilder = new RecipieGraphBuilder();
      var viz_graph = new Viz();
      viz_graph.renderSVGElement(recipieGraphBuilder.recipieGraphText)
        .then(function (element) {
          document.getElementById('recipie-graph').innerHTML = "";
          document.getElementById('recipie-graph').appendChild(element);
        })
        .catch(error => {
          viz_graph = new Viz();
          console.error(error);
        });
    },

    makeDragDropPrecedences(){
      this.dragDropPrecedences = [];

      for(let equipment of this.equipments){
        this.dragDropPrecedences.push({equipment: equipment.name, tasks: []});
      }

      for(let precedence of this.precedences){
        let equipment = this.getEquipment(precedence.from.name);
        for(let drag_drop of this.dragDropPrecedences){
          if(drag_drop.equipment === equipment){
            if(!this.isTaskInDragDropPrecedences(precedence.from.name)){
              drag_drop.tasks.push(precedence.from.name);
            }
            if(!this.isTaskInDragDropPrecedences(precedence.to.name)){
              drag_drop.tasks.push(precedence.to.name);
            }
          }
        }
      }
    },
    isTaskInDragDropPrecedences(search_task){
      for(let drag_drop of this.dragDropPrecedences){
        for(let task of drag_drop.tasks){
          if(task === search_task){
            return true;
          }
        }
      }

      return false;
    },

    switchForms() {
      if (this.seenForms) {
        //this.makeDragDropPrecedences();
        schedBuilder.buildDragAndDrop();
        schedBuilder.makeSchedPrecedences(this.dragDropPrecedences);
        schedBuilder.buildSchedGraph();
        document.title = "Schedule graph builder";
      }
      else {
        this.updateDragDropPrecedenes();
        this.updateEquipmentsTasks();
        this.buildRecipieGraph();
        
        document.title = "Recipie graph builder";
      }
      this.seenForms = !this.seenForms;
    },

    uisNisSwitch() {
      this.uis = !this.uis;

      let new_drag_drop = []; //equipment, tasks
      let sched_table = document.getElementsByClassName('sched-table');

      for(let table of sched_table){
        let child_index;
        let tasks = [];
        for(child_index = 1; child_index < table.children.length; child_index++){
          if(table.children[child_index].innerText !== ''){
            tasks.push(table.children[child_index].innerText);
          }
        }
        new_drag_drop.push({equipment: table.children[0].innerText, tasks: tasks});
      }
      
      schedBuilder.makeSchedPrecedences(new_drag_drop);
      schedBuilder.buildSchedGraph();
    },

    download(filename, text) {
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    
    save_file(){
      this.download('recipie-graph-datas.json', this.convertArraysToText());
    },
    convertArraysToText(){
      return JSON.stringify(this.products) + '\n' +
             JSON.stringify(this.tasks) + '\n' +
             JSON.stringify(this.equipments) + '\n' +
             JSON.stringify(this.precedences) + '\n' +
             JSON.stringify(this.proctimes) + '\n' +
             JSON.stringify(this.allProctimes);
    },
    readTextFile(ev)
    {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        let datas = e.target.result.split('\n');

        this.products = [];
        for(let new_product of JSON.parse(datas[0])){
          this.products.push(new Product(new_product.name));
        }
        
        this.tasks = [];
        for(let new_task of JSON.parse(datas[1])){
          let add_task = new Task(new_task.name);
          add_task.product = new_task.product;
          for(let new_equipment of new_task.equipments){
            add_task.AddEquipment(new_equipment);
          }
          add_task.proctimes = new_task.proctimes;
          add_task.equipment_and_proctime = new_task.equipment_and_proctime;
          this.tasks.push(add_task);
        }

        this.equipments = [];
        for(let new_equipment of JSON.parse(datas[2])){
          let add_equipment = new Equipment(new_equipment.name);
          add_equipment.tasks = new_equipment.tasks;
          this.equipments.push(add_equipment);
        }

        this.precedences = JSON.parse(datas[3]);
        this.proctimes = JSON.parse(datas[4]);
        this.allProctimes = JSON.parse(datas[5]);
        this.buildRecipieGraph();
        this.showImport = false;
      };
      reader.readAsText(file);
    },
    show_import_file(){
      this.showImport = true;
    }
  }
});