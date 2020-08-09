'use strict';

Vue.use(VueDraggable.default);

var main = new Vue({
  el: '#main',
  data() {
    const instance = this;
    return {
      dragAndDropOptions: {
        onDrop() {
          let new_drag_drop = []; //equipment, tasks
          let sched_table = document.getElementsByClassName('sched-table');

          for(let table of sched_table){
            let tasks = [];
            let child_index;
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
          for(let equipment of instance.equipmentManager.Equipments){
            document.getElementById(equipment.name).classList.remove("available-equipment");
            document.getElementById(equipment.name).classList.remove("disable-equipment");
          }

          let act_task = event.items[0].innerText;
          let dropped_equipment = event.droptarget.textContent.split(' ')[0];
          if(!instance.proctimeManager.IsEquipment(act_task, dropped_equipment)){
            //instance.showWarning("'" + act_task + "'" + " doesn't have an equipment named '" + dropped_equipment + "'", instance.snackbarMessageTypes.error);
            event.stop();
          }
          else{
            instance.taskManager.Update(act_task, dropped_equipment, null);
           // instance.updateTasksEquipmentAndProctime(act_task, dropped_equipment);
           // instance.updatePrecedencesEquipmentAndProctime(act_task, dropped_equipment);
          }

         
        },
        onDragstart(event){
          let act_task = event.items[0].innerText;
          for(let equipment of instance.equipmentManager.Equipments){
            //if(instance.checkTaskEquipment(act_task, equipment.name)){
            if(instance.proctimeManager.IsEquipment(act_task, equipment.name)){
              document.getElementById(equipment.name).classList.add("available-equipment");
            }
            else{
              document.getElementById(equipment.name).classList.add("disable-equipment");
            }
          }
        }
      },

      //#region ARROW IMAGES
      arrowImgProductsState: false,
      arrowImgProducts: 'images/down-arrow.png',

      arrowImgTasksState: false,
      arrowImgTasks: 'images/down-arrow.png',

      arrowImgEquipmentsState: false,
      arrowImgEquipments: 'images/down-arrow.png',

      arrowImgPrecedencesState: false,
      arrowImgPrecedences: 'images/down-arrow.png',

      arrowImgProctimesState: false,
      arrowImgProctimes: 'images/down-arrow.png',
      //#endregion  ARROW IMAGES

      snackbarMessageTypes: '',

      //#region MANAGERS
      productManager: '',
      taskManager: '',
      equipmentManager: '',
      precedenceManager: '',
      proctimeManager: '',
      //#endregion MANAGERS

      //#region INPUTS
      inputProductName: '',

      inputTaskName: '',
      inputTaskProductName: '',

      inputEquipmentName: '',
      
      inputTaskPrecedenceFrom: "",
      inputTaskPrecedenceTo: "",
      
      inputProctime: "",
      inputProctimeTask: "",
      inputProctimeEquipment: "",
      //#endregion INPUTS

      tasksLength: 0,
      tasksTableTitle: 'no task',
      productsLength: 0,
      productsTableTitle: 'no product',
      equipmentsLength: 0,
      equipmentsTableTitle: 'no equipment',
      precedencesLength: 0,
      precendencesTableTitle: 'no precedence',
      proctimesLength: 0,
      proctimesTableTitle: 'no proctime',

      seenForms: true,
      uis: true,
      circle: false,
      longestPathStartTask: '',
      longestPathEndTask: '',
      longestPathTime: '',
      ganttWidth: 0,
      ganttHeight: 0,

      dragDropPrecedences: [], //equipment, tasks

      schedGraphBuilderSchedPrecedences: [], //from, to
    }
  },
  methods: {
    init(){
      this.productManager = new ProductManager();
      this.taskManager = new TaskManager();
      this.equipmentManager = new EquipmentManager();
      this.precedenceManager = new PrecedenceManager();
      this.proctimeManager = new ProctimeManager();

      this.snackbarMessageTypes ={
        success: 'success',
        danger: 'danger',
        error: 'error',
        info: 'info'
      };
    },

    //#region PRODUCT
    addProduct() {
      if (this.inputProductName === '') {
        this.showWarning('Product name is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProductName.indexOf('"') !== -1) {
        this.showWarning('Product name contains wrong characters: (")', this.snackbarMessageTypes.error);
      }
      else if(this.productManager.GetProduct(this.inputProductName) !== null){
        this.showWarning('This product (' + this.inputProductName + ') is already exists', this.snackbarMessageTypes.error);
      }
      else{
        this.productManager.AddProduct(new Product(this.inputProductName));
        this.updateProductsLength();
      }

      this.inputProductName = '';

      this.showImport = false;
    },
    deleteProduct(delete_product) {
      this.productManager.RemoveProduct(delete_product.name);
      this.taskManager.UpdateTasks(this.productManager.Products);
      this.precedenceManager.UpdatePrecedences(this.taskManager.Tasks);
      this.proctimeManager.UpdateProctimesAsTasks(this.taskManager.Tasks);
      this.deleteFromDragDropPrecedences();

      this.updateProductsLength();
      this.updateTasksLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();

      this.precedenceManager.FillFromAndToPrecedences(this.taskManager.Tasks);

      this.buildRecipieGraph();

      this.showImport = false;
    },
    updateProductsLength() {
      this.productsLength = this.productManager.ProductsLength;
      if(this.productsLength === 0){
        this.productsTableTitle = 'No product';
      }
      else if(this.productsLength === 1){
        this.productsTableTitle = this.productsLength + ' product';
      }
      else{
        this.productsTableTitle = this.productsLength + ' products';
      }
    },
    //#endregion PRODUCT

    //#region TASK
    addTask() {
      if (this.inputTaskName === '' && this.inputTaskProductName === '') {
        this.showWarning('Task name and product name are empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputTaskName === '') {
        this.showWarning('Task name is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputTaskProductName === '') {
        this.showWarning('Product name is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputTaskName.indexOf('"') !== -1) {
        this.showWarning('Task name contains wrong characters: "', this.snackbarMessageTypes.error);
      }
      else if (this.inputTaskName === this.inputTaskProductName) {
        this.showWarning('Task name (' + this.inputTaskName + ') and product (' + this.inputTaskProductName + ') are the same', this.snackbarMessageTypes.error);
      }
      else if (this.taskManager.GetTask(this.inputTaskName) !== null) {
        //if(this.taskManager.GetTask(this.inputTaskName))
        this.showWarning('Task name (' + this.inputTaskName + ') and product (' + this.inputTaskProductName + ') is already exists', this.snackbarMessageTypes.error);
      }
      else {
        this.taskManager.AddTask(new Task(this.inputTaskName, this.inputTaskProductName));
        this.updateTasksLength();
        this.precedenceManager.FillFromAndToPrecedences(this.taskManager.Tasks);
        this.buildRecipieGraph();
      }

      this.inputTaskName = '';
      this.inputTaskProductName = '';

      this.showImport = false;
    },
    deleteTask(delete_task){
      this.taskManager.RemoveTask(delete_task.name, delete_task.product);
      this.precedenceManager.UpdatePrecedences(this.taskManager.Tasks);
      this.proctimeManager.UpdateProctimesAsTasks(this.taskManager.Tasks);
      this.deleteFromDragDropPrecedences();

      this.updateTasksLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();

      this.precedenceManager.FillFromAndToPrecedences(this.taskManager.Tasks);

      this.buildRecipieGraph();

      this.showImport = false;
    },
    updateTasksLength() {
      this.tasksLength = this.taskManager.TasksLength;
      if(this.tasksLength === 0){
        this.tasksTableTitle = "No task";
      }
      else if(this.tasksLength === 1){
        this.tasksTableTitle = this.tasksLength + " task";
      }
      else{
        this.tasksTableTitle = this.tasksLength + " tasks";
      }
    },
    //#endregion TASK

    //#region EQUIPMENT
    addEquipment() {
      if (this.inputEquipmentName === '') {
        this.showWarning('Equipment name is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputEquipmentName.indexOf('"') !== -1) {
        this.showWarning('Equipment name contains wrong characters: (")', this.snackbarMessageTypes.error);
      }
      else if(this.equipmentManager.GetEquipment(this.inputEquipmentName) !== null){
        this.showWarning('This equipment (' + this.inputEquipmentName + ') is already exists', this.snackbarMessageTypes.error);
      }
      else{
        this.equipmentManager.AddEquipment(new Equipment(this.inputEquipmentName));
        this.updateEquipmentsLength();
        this.ganttHeight = this.equipmentManager.EquipmentsLength * 40 + 80;
      }

      this.inputEquipmentName = '';

      this.showImport = false;
    },
    deleteEquipment(delete_equipment){
      this.equipmentManager.RemoveEquipment(delete_equipment.name);
      this.proctimeManager.UpdateProctimesAsEquipments(this.equipmentManager.Equipments);

      this.updateEquipmentsLength();
      this.updateProctimesLength();

      this.buildRecipieGraph();

      this.showImport = false;
    },
    updateEquipmentsLength() {
      this.equipmentsLength = this.equipmentManager.EquipmentsLength;
      if(this.equipmentsLength === 0){
        this.equipmentsTableTitle = 'No equipment';
      }
      else if(this.equipmentsLength === 1){
        this.equipmentsTableTitle = this.equipmentsLength + ' equipment';
      }
      else{
        this.equipmentsTableTitle = this.equipmentsLength + ' equipments';
      }
    },
    //#endregion EQUIPMENT

    //#region PRECEDENCE
    addPrecedence() {
      if(this.inputTaskPrecedenceFrom === '' && this.inputTaskPrecedenceTo === ''){
        this.showWarning('\'from\' and \'to\' tasks are empty', this.snackbarMessageTypes.error);
      }
      else if(this.inputTaskPrecedenceFrom === ''){
        this.showWarning('\'from\' task is empty', this.snackbarMessageTypes.error);
      }
      else if(this.inputTaskPrecedenceTo === ''){
        this.showWarning('\'to\' task is empty',  this.snackbarMessageTypes.error);
      }
      else if(this.precedenceManager.GetPrecedence(this.inputTaskPrecedenceFrom, this.inputTaskPrecedenceTo) !== null){
        this.showWarning('Precedence (' + this.inputTaskPrecedenceFrom.name + ' -> ' + this.inputTaskPrecedenceTo.name + ') is already exists', this.snackbarMessageTypes.error);
      }
      else{
        this.precedenceManager.AddPrecedence(new Precedence(this.inputTaskPrecedenceFrom, this.inputTaskPrecedenceTo));
        this.updatePrecedencesLength();
        this.buildRecipieGraph();
        this.precedenceManager.FillFromAndToPrecedences(this.taskManager.Tasks);
      }

      this.inputTaskPrecedenceFrom = '';
      this.inputTaskPrecedenceTo = '';

      this.showImport = false;
    },
    deletePrecedence(from_name, to_name){
      this.precedenceManager.RemovePrecedence(from_name, to_name);

      this.updatePrecedencesLength();

      this.buildRecipieGraph();

      this.showImport = false;
    },
    updatePrecedencesLength() {
      this.precedencesLength = this.precedenceManager.PrecedencesLength;
      if(this.precedencesLength === 0){
        this.precendencesTableTitle = 'No precedence';
      }
      else if(this.precedencesLength === 1){
        this.precendencesTableTitle = this.precedencesLength + ' precedence';
      }
      else{
        this.precendencesTableTitle = this.precedencesLength + ' precedences';
      }
    },
    deleteFromDragDropPrecedences(){
      this.dragDropPrecedences.forEach(precedence =>{
        let tasks = [];
        precedence.tasks.forEach((task, index) =>{
          if(this.taskManager.GetTask(task) !== null){
            tasks.push(task);
          }
        });
        precedence.tasks = tasks;
      });
    },
    //#endregion PRECEDENCE

    //#region PROCTIME
    addProctime() {
      if (this.inputProctimeTask === '' && this.inputProctimeEquipment === '' && this.inputProctime === '') {
        this.showWarning('Task, equipment and proctime are empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctimeTask === '' && this.inputProctimeEquipment === '') {
        this.showWarning('Task and equipment are empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctimeTask === '' && this.inputProctime === '') {
        this.showWarning('Task and proctime are empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctimeEquipment === '' && this.inputProctime === '') {
        this.showWarning('Equipment and proctime are empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctimeTask === '') {
        this.showWarning('Task is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctimeEquipment === '') {
        this.showWarning('Equipment is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctime === '') {
        this.showWarning('Proctime is empty', this.snackbarMessageTypes.error);
      }
      else if (this.inputProctime < 0){
        this.showWarning('Proctime is negativ', this.snackbarMessageTypes.error);
      }
      else if (this.proctimeManager.GetProctime(this.inputProctimeTask.name, this.inputProctimeEquipment.name) !== null){
        this.showWarning('Proctime (' + this.inputProctimeTask.name + ', ' + this.inputProctimeEquipment.name + ') is already exists', this.snackbarMessageTypes.error);
      }
      else {
        this.proctimeManager.AddProctime(new Proctime(this.inputProctimeTask.name, this.inputProctimeEquipment.name, this.inputProctime));
        this.taskManager.Update(this.inputProctimeTask.name, this.inputProctimeEquipment.name, this.inputProctime);
        this.updateProctimesLength();

        this.buildRecipieGraph();
      }

      this.inputProctimeTask = '';
      this.inputProctimeEquipment = '';
      this.inputProctime = '';

      this.showImport = false;
    },
    deleteProctime(proctime){
      this.proctimeManager.RemoveProctime(proctime.task, proctime.equipment, proctime.proctime);

      this.updateProctimesLength();

      this.buildRecipieGraph();

      this.showImport = false;
    },
    updateProctimesLength() {
      this.proctimesLength = this.proctimeManager.ProctimesLength;
      if(this.proctimesLength === 0){
        this.proctimesTableTitle = 'No proctime';
      }
      else if(this.proctimesLength === 1){
        this.proctimesTableTitle = this.proctimesLength + ' proctime';
      }
      else{
        this.proctimesTableTitle = this.proctimesLength + ' proctimes';
      }
    },
    //#endregion PROCTIME

    showWarning(message, type) {
      var message = SnackBar({
        message: message,
        status: type
      });
    },

    //#region  ARROWS
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
    //#endregion ARROWS

    //#region IMPORT/EXPORT
    download(filename, text) {
      if(this.productManager.ProductsLength === 0 && this.taskManager.TasksLength === 0 && this.equipmentManager.EquipmentsLength === 0){
        this.showWarning('There is nothing to save', this.snackbarMessageTypes.warning);
      }
      else{
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    },
    saveFile(){
      this.download('recipie-graph-data.json', this.convertArraysToText());
      this.showImport = false;
    },
    convertArraysToText(){
      return JSON.stringify(this.productManager.Products) + '\n' +
             JSON.stringify(this.taskManager.Tasks) + '\n' +
             JSON.stringify(this.equipmentManager.Equipments) + '\n' +
             JSON.stringify(this.precedenceManager.Precedences) + '\n' +
             JSON.stringify(this.proctimeManager.Proctimes);
    },

    readTextFile(ev)
    {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        let datas = e.target.result.split('\n');

        this.productManager.ClearProducts();
        for(let new_product of JSON.parse(datas[0])){
          this.productManager.AddProduct(new Product(new_product._name));
        }
        
        this.taskManager.ClearTasks();
        for(let new_task of JSON.parse(datas[1])){
          this.taskManager.AddTask(new Task(new_task._name, new_task._product));
          this.taskManager.Update(new_task._name, new_task._equipment, new_task._proctime);
        }

        this.equipmentManager.ClearEquipments();
        for(let new_equipment of JSON.parse(datas[2])){
          this.equipmentManager.AddEquipment(new Equipment(new_equipment._name));
        }

        this.precedenceManager.ClearPrecedences();
        for(let new_precedence of JSON.parse(datas[3])){
          this.precedenceManager.AddPrecedence(new Precedence(new_precedence._from, new_precedence._to));
        }

        this.proctimeManager.ClearProctimes();
        for(let new_proctime of JSON.parse(datas[4])){
          this.proctimeManager.AddProctime(new Proctime(new_proctime._task, new_proctime._equipment, new_proctime._proctime));
        }

        this.showWarning('File successfully loaded', this.snackbarMessageTypes.success);
        this.buildRecipieGraph();

        this.updateProductsLength();
        this.updateTasksLength();
        this.updateEquipmentsLength();
        this.updatePrecedencesLength();
        this.updateProctimesLength();

        this.ganttHeight = this.equipmentManager.EquipmentsLength * 40 + 80;
      };
      reader.readAsText(file);
    },
    //#endregion IMPORT/EXPORT

    switchForms() {
      if (this.seenForms) {
        schedBuilder.buildDragAndDrop();
        schedBuilder.makeSchedPrecedences(this.dragDropPrecedences);
        schedBuilder.buildSchedGraph();

        document.title = 'Schedule graph builder';
        this.seenForms = !this.seenForms;
      }
      else {
        this.updateDragDropPrecedenes();
        this.buildRecipieGraph();

        document.title = 'Recipie graph builder';
        this.seenForms = !this.seenForms;
      }
      this.showImport = false;
    },

    buildRecipieGraph(){
      let recipieGraphBuilder = new RecipieGraphBuilder();
      var viz_graph = new Viz();
      viz_graph.renderSVGElement(recipieGraphBuilder.recipieGraphText)
        .then(function (element) {
          document.getElementById('recipie-graph').innerHTML = '';
          document.getElementById('recipie-graph').appendChild(element);
        })
        .catch(error => {
          viz_graph = new Viz();
          console.error(error);
        });
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












    /*
    addPrecedence() {
      if((this.inputTaskPrecedenceFrom === "" && this.inputTaskPrecedenceTo === "") ||
         (this.inputTaskPrecedenceFrom === undefined && this.inputTaskPrecedenceTo === undefined))
      {
        this.showWarning("'from' and 'to' tasks are empty", "error");
      }
      else if(this.inputTaskPrecedenceFrom === "" || this.inputTaskPrecedenceFrom === undefined){
        this.showWarning("'from' task is empty", "error");
      }
      else if(this.inputTaskPrecedenceTo === "" || this.inputTaskPrecedenceTo === undefined){
        this.showWarning("'to' task is empty", "error");
      }
      else if(!this.isInputPrecedenceNew(this.inputTaskPrecedenceFrom, this.inputTaskPrecedenceTo)){
        this.showWarning("Precedence (" + this.inputTaskPrecedenceFrom.name + " -> " + this.inputTaskPrecedenceTo.name + ") is already exists", "error");
      }
      else{
        this.precedences.push({ from: this.tasks.find(this.getPrecedenceTaskFrom), to: this.tasks.find(this.getPrecedenceTaskTo) });
        this.buildRecipieGraph();
        this.updatePrecedencesLength();
      }

      this.inputTaskPrecedenceFrom = "";
      this.inputTaskPrecedenceTo = "";

      this.updatePrecedenceFromAndToTasks();

      this.showImport = false;
    },
    addProctime() {
      if (this.inputProctimeTask === "" && this.inputProctimeEquipment === "" && this.inputProctime === "") {
        this.showWarning("Task, equipment and proctime are empty", "error");
      }
      else if (this.inputProctimeTask === "" && this.inputProctimeEquipment === "") {
        this.showWarning("Task and equipment are empty", "error");
      }
      else if (this.inputProctimeTask === "" && this.inputProctime === "") {
        this.showWarning("Task and proctime are empty", "error");
      }
      else if (this.inputProctimeEquipment === "" && this.inputProctime === "") {
        this.showWarning("Equipment and proctime are empty", "error");
      }
      else if (this.inputProctimeTask === "") {
        this.showWarning("Task is empty", "error");
      }
      else if (this.inputProctimeEquipment === "") {
        this.showWarning("Eq is empty", "error");
      }
      else if (this.inputProctime === "") {
        this.showWarning("Proctime is empty", "error");
      }
      else if (this.inputProctime < 0){
        this.showWarning("Proctime is negativ", "error");
      }
      else if (!this.isInputProctimeNew(this.inputProctimeTask, this.inputProctimeEquipment)){
        this.showWarning("Proctime (" + this.inputProctimeTask.name + ", " + this.inputProctimeEquipment.name + ") is already exists", "error");
      }
      else {
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

        this.dragDropPrecedences.forEach(precedence => {
          if(precedence.equipment === this.inputProctimeEquipment.name){
            precedence.tasks.push(add_task.name);
          }
        });
      }

      this.inputProctimeTask = "";
      this.inputProctimeEquipment = "";
      this.inputProctime = "";

      this.showImport = false;
    },
    addPrecedenceTaskFromAndTo() {
      this.precedenceTasksFrom = [];
      this.precedenceTasksTo = [];

      for(let task of this.tasks){
        this.precedenceTasksFrom.push(task);
        this.precedenceTasksTo.push(task);
      }
    },

   /* updateTasks(product){
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

      this.showImport = false;
    },*/
   /* deletePrecedenceFromProduct(product){
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

      this.showImport = false;
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

      this.showImport = false;
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

      this.showImport = false;
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
    deleteProctimeFromTask(search_task){
      let delete_these = [];
      for(let proctime of this.proctimes){
        if(proctime.name === search_task.name){
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
      this.deletePrecedenceFromProctime(this.allProctimes[index].name, this.allProctimes[index].equipment.name, this.allProctimes[index].proctime);
      this.deleteProctimeFromProctime(this.allProctimes[index].name, this.allProctimes[index].equipment.name);
      this.deleteDragdropprecedenceFromProctime(this.allProctimes[index].name, this.allProctimes[index].equipment.name);
      this.deleteTaskFromProctime(this.allProctimes[index]);
      this.proctimes.splice(index, 1);
      this.allProctimes.splice(index, 1);
      this.updateProctimesLength();
      this.updateEquipmentsTasksAsSmallestProctime();

      this.buildRecipieGraph();

      this.showImport = false;
    },
    deleteDragdropprecedenceFromProctime(search_task, search_equipment){
      for(let precedence of this.dragDropPrecedences){
        if(precedence.equipment === search_equipment){
          let index;
          for(index = 0; index < precedence.tasks.length; index++){
            if(precedence.tasks[index] === search_task){
              precedence.tasks.splice(index, 1);
            }
          }
        }
      }
    },
    deleteProctimeFromProctime(search_task, search_equipment){
      let proctime_index;
      for(proctime_index = 0; proctime_index < this.proctimes.length; proctime_index++){
        if(this.proctimes[proctime_index].name === search_task){
          let index;
          for(index = 0; index < this.proctimes[proctime_index].equipments.length; index++){
            if(this.proctimes[proctime_index].equipments[index] === search_equipment){
               this.proctimes[proctime_index].equipments.splice(index, 1);
               this.proctimes[proctime_index].proctimes.splice(index, 1);
            }
          }
        }
      }
    },
    deletePrecedenceFromProctime(search_task, search_equipment, search_proctime){
      let precedence_index;
      for(precedence_index = 0; precedence_index < this.precedences.length; precedence_index++){
        if(this.precedences[precedence_index].from.name === search_task &&
           this.precedences[precedence_index].from.equipment_and_proctime.equipment.name === search_equipment &&
           this.precedences[precedence_index].from.equipment_and_proctime.proctime === search_proctime)
        {
          let index;
          for(index = 0; index < this.precedences[precedence_index].from.equipments.length; index++){
            if(this.precedences[precedence_index].from.equipments[index] === search_equipment){
              this.precedences[precedence_index].from.equipments.splice(index, 1);
              this.precedences[precedence_index].from.proctimes.splice(index, 1);
            }
          }
          if(this.precedences[precedence_index].from.equipments.length <= 0){
            this.precedences[precedence_index].from.equipment_and_proctime.proctime = 0;
          }
          else{
            let min_proctime = Number.MAX_SAFE_INTEGER;
            let min_equipment = '';
            let proctime_index;
            for(proctime_index = 0; proctime_index < this.precedences[precedence_index].from.proctimes.length; proctime_index++){
              if(this.precedences[precedence_index].from.proctimes[proctime_index] < min_proctime){
                min_proctime = this.precedences[precedence_index].from.proctimes[proctime_index];
                min_equipment = this.precedences[precedence_index].from.equipments[proctime_index];
              }
            }
            this.precedences[precedence_index].from.equipment_and_proctime.equipment.name = min_equipment;
            this.precedences[precedence_index].from.equipment_and_proctime.proctime = min_proctime;
          }
        }
        if(this.precedences[precedence_index].to.name === search_task &&
                this.precedences[precedence_index].to.equipment_and_proctime.equipment.name === search_equipment &&
                this.precedences[precedence_index].to.equipment_and_proctime.proctime === search_proctime)
        {
          let index;
          for(index = 0; index < this.precedences[precedence_index].to.equipments.length; index++){
            if(this.precedences[precedence_index].to.equipments[index] === search_equipment){
              this.precedences[precedence_index].to.equipments.splice(index, 1);
              this.precedences[precedence_index].to.proctimes.splice(index, 1);
            }
          }
          if(this.precedences[precedence_index].to.equipments.length <= 0){
            this.precedences[precedence_index].to.equipment_and_proctime.proctime = 0;
          }
          else{
            let min_proctime = Number.MAX_SAFE_INTEGER;
            let min_equipment = '';
            let proctime_index;
            for(proctime_index = 0; proctime_index < this.precedences[precedence_index].to.proctimes.length; proctime_index++){
              if(this.precedences[precedence_index].to.proctimes[proctime_index] < min_proctime){
                min_proctime = this.precedences[precedence_index].to.proctimes[proctime_index];
                min_equipment = this.precedences[precedence_index].to.equipments[proctime_index];
              }
            }
            this.precedences[precedence_index].to.equipment_and_proctime.equipment.name = min_equipment;
            this.precedences[precedence_index].to.equipment_and_proctime.proctime = min_proctime;
          }
        }
      }
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

      this.showImport = false;
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

      this.showImport = false;
    },

    /* ------------- GET ------------- */
   /* getPrecedenceTaskFrom(value) {
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
  /*  isInputProductValid(new_product) {
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
        if(proctime.name === new_task.name && proctime.equipment_and_proctime.equipment === new_equipment.name){
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
    /*updateProductsLength() {
      this.productsLength = this.products.length;
      if(this.productsLength === 0){
        this.productsTableTitle = "No product";
      }
      else if(this.productsLength === 1){
        this.productsTableTitle = this.productsLength + " product";
      }
      else{
        this.productsTableTitle = this.productsLength + " products";
      }
    },
    updateTasksLength() {
      this.tasksLength = this.tasks.length;
      if(this.tasksLength === 0){
        this.tasksTableTitle = "No task";
      }
      else if(this.tasksLength === 1){
        this.tasksTableTitle = this.tasksLength + " task";
      }
      else{
        this.tasksTableTitle = this.tasksLength + " tasks";
      }
    },
    updateEquipmentsLength() {
      this.equipmentsLength = this.equipments.length;
      if(this.equipmentsLength === 0){
        this.equipmentsTableTitle = "No equipment";
      }
      else if(this.equipmentsLength === 1){
        this.equipmentsTableTitle = this.equipmentsLength + " equipment";
      }
      else{
        this.equipmentsTableTitle = this.equipmentsLength + " equipments";
      }
    },
    updatePrecedencesLength() {
      this.precedencesLength = this.precedences.length;
      if(this.precedencesLength === 0){
        this.precendencesTableTitle = "No precedence";
      }
      else if(this.precedencesLength === 1){
        this.precendencesTableTitle = this.precedencesLength + " precedence";
      }
      else{
        this.precendencesTableTitle = this.precedencesLength + " precedences";
      }
    },
    updateProctimesLength() {
      this.proctimesLength = this.proctimes.length;
      if(this.proctimesLength === 0){
        this.proctimesTableTitle = "No proctime";
      }
      else if(this.proctimesLength === 1){
        this.proctimesTableTitle = this.proctimesLength + " proctime";
      }
      else{
        this.proctimesTableTitle = this.proctimesLength + " proctimes";
      }
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
  //  },

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
   /* removePrecedenceTasksTo() {
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

    showWarning(message, type) { //type: success, danger, error, info
      var message = SnackBar({
        message: message,
        status: type
      });
    },

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
        try{
          schedBuilder.buildDragAndDrop();
          schedBuilder.makeSchedPrecedences(this.dragDropPrecedences);
          schedBuilder.buildSchedGraph();

          document.title = "Schedule graph builder";
          this.seenForms = !this.seenForms;
        }
        catch(err){
          this.showWarning("There is not enough data to calculate.", "error");
        }
      }
      else {
        this.updateDragDropPrecedenes();
        this.updateEquipmentsTasks();
        this.buildRecipieGraph();

        document.title = "Recipie graph builder";
        this.seenForms = !this.seenForms;
      }
      this.showImport = false;
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
      if(this.products.length === 0 && this.tasks.length === 0 && this.equipments.length === 0){
        this.showWarning("There is nothing to save", "warning");
      }
      else{
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    },
    
    saveFile(){
      this.download('recipie-graph-data.json', this.convertArraysToText());
      this.showImport = false;
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
        
        this.precedenceTasksFrom = [];
        this.precedenceTasksTo = [];
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
          this.precedenceTasksFrom.push(add_task);
          this.precedenceTasksTo.push(add_task);
        }

        this.equipments = [];
        for(let new_equipment of JSON.parse(datas[2])){
          let add_equipment = new Equipment(new_equipment.name);
          add_equipment.tasks = new_equipment.tasks;
          this.equipments.push(add_equipment);
        }

        this.ganttHeight = this.equipments.length * 40 + 80;

        this.precedences = JSON.parse(datas[3]);
        this.proctimes = JSON.parse(datas[4]);
        this.allProctimes = JSON.parse(datas[5]);
        this.dragDropPrecedences = [];

        if(this.seenForms){
          this.buildRecipieGraph();
        }

        this.updateProductsLength();
        this.updateTasksLength();
        this.updateEquipmentsLength();
        this.updatePrecedencesLength();
        this.updateProctimesLength();

        if(!this.seenForms){
          schedBuilder.buildDragAndDrop();
          schedBuilder.makeSchedPrecedences(this.dragDropPrecedences);
          schedBuilder.buildSchedGraph();
        }

        this.showWarning("File successfully loaded", "success");
      };
      reader.readAsText(file);
    }*/
  },
  beforeMount(){
    this.init();
  }
});