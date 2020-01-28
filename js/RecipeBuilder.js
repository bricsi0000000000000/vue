Vue.use(VueDraggable.default);

var recipieBuilder = new Vue({
  el: '#content',
  data() {
    const componentInstance = this
    return {
      arrowImg_products: "images/down-arrow.png",
      downArowImg_products: "images/down-arrow.png",
      upArrowImg_products: "images/up-arrow.png",

      arrowImg_tasks: "images/down-arrow.png",
      downArowImg_tasks: "images/down-arrow.png",
      upArrowImg_tasks: "images/up-arrow.png",

      arrowImg_eqs: "images/down-arrow.png",
      downArowImg_eqs: "images/down-arrow.png",
      upArrowImg_eqs: "images/up-arrow.png",

      arrowImg_precedences: "images/down-arrow.png",
      downArowImg_precedences: "images/down-arrow.png",
      upArrowImg_precedences: "images/up-arrow.png",

      arrowImg_proctimes: "images/down-arrow.png",
      downArowImg_proctimes: "images/down-arrow.png",
      upArrowImg_proctimes: "images/up-arrow.png",

      downUpClick: false,

      dragAndDropOptions: {
        // dropzoneSelector: 'ul',
        // draggableSelector: 'li',
        //showDropzoneAreas: false,
        //multipleDropzonesItemsDraggingEnabled: false,
        //onDrop(event) {
        onDrop(event) {
          if(componentInstance.checkTasksEquipment(event)){
            componentInstance.updateEquimpents();
          }
          schedGraphBuilder.getTasks(false);
        },
       /* onDragstart(event) {
         
        },*/
         onDragend(event) {
          if(!componentInstance.checkTasksEquipment(event)){
            event.stop();
          }

           // if you need to stop d&d
           // event.stop();
 
           // you can call component methods, just don't forget 
           // that here `this` will not reference component scope,
           // so out from this returned data object make reference
           // to component instance
 
           // to detect if draggable element is dropped out
           //if (!event.droptarget) {
            // console.log(event);
           //}
         }
      },
      /*---------------RECIPIE BUILDER---------------*/
      products: ["a", "b"],
      productName: '',

      tasks: ["b2", "a2", "a3", "b3", "a1", "b11", "b12", "a4", "b4"],
      taskName: '',
      onlyTasks: [],

      tasksAndProducts: [{ "name": "b2", "product": "b" }, { "name": "a2", "product": "a" }, { "name": "a3", "product": "a" }, { "name": "b3", "product": "b" }, { "name": "a1", "product": "a" }, { "name": "b11", "product": "b" }, { "name": "b12", "product": "b" }, { "name": "a4", "product": "a" }, { "name": "b4", "product": "b" }], //name, product  //which task which product
      product: '',

      equipmentName: '',
      equipments: ["e1", "e2", "e3"],

      warningTxt: "",

      task1: "",
      task2: "",

      precedences: [{ "task1": "a2", "task2": "a3" }, { "task1": "b2", "task2": "b3" }, { "task1": "a1", "task2": "a2" }, { "task1": "b11", "task2": "b2" }, { "task1": "b12", "task2": "b2" }, { "task1": "a3", "task2": "a4" }, { "task1": "b3", "task2": "b4" }], //task1, task2

      precedencesWithProducts: [{ "task": "a2", "product": "a3" }, { "task": "b2", "product": "b3" }, { "task": "a1", "product": "a2" }, { "task": "b11", "product": "b2" }, { "task": "b12", "product": "b2" }, { "task": "a4", "product": "a" }, { "task": "b4", "product": "b" }, { "task": "a3", "product": "a4" }, { "task": "b3", "product": "b4" }], //task, product

      proctimes: [{ "task": "a1", "eq": "e1", "proctime": "3" },{ "task": "a1", "eq": "e2", "proctime": "6" } , { "task": "b11", "eq": "e1", "proctime": "2" }, { "task": "b3", "eq": "e1", "proctime": "1" }, { "task": "a2", "eq": "e2", "proctime": "2" }, { "task": "b12", "eq": "e2", "proctime": "4" }, { "task": "b2", "eq": "e3", "proctime": "3" }, { "task": "a3", "eq": "e3", "proctime": "4" }, { "task": "a4", "eq": "e2", "proctime": "2" }, { "task": "b4", "eq": "e3", "proctime": "4" }], //task, eq, proctime
      proctime: "",
      proctime_task: "",
      proctime_eq: "",

      taskEquipments: [{ "task": "a1", "eqs": ["e1", "e2"] }, { "task": "b11", "eqs": ["e1"] }, { "task": "b3", "eqs": ["e1"] }, { "task": "a2", "eqs": ["e2"] }, { "task": "b12", "eqs": ["e2"] }, { "task": "b2", "eqs": ["e3"] }, { "task": "a3", "eqs": ["e3"] }, { "task": "a4", "eqs": ["e2"] }, { "task": "b4", "eqs": ["e3"] }], //task, eqs[] | which task which equipments
      taskEquipment: [], //task, eq, proctime
      equipmentsWithTasks:[], //eq, tasks
      recipieGraphTxt: "",

      showWarningTxt: false,

      tmpTask1: [],
      tmpTask2: [],

      seenForms: true,
      loading: true,

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
      svg_text: "",
      ganttWidth: 0,
      //gant:[], //eq; tasks -> task, proctime
    }
  },
  methods: {
    hideAlert() {
      setTimeout(() => this.showWarningTxt = false, 5000);
    },

    changeArrowImg_products() {
      this.downUpClick_products = !this.downUpClick_products;

      if (this.downUpClick_products) {
        this.arrowImg_products = this.upArrowImg_products;
      }
      else {
        this.arrowImg_products = this.downArowImg_products;
      }
    },
    changeArrowImg_tasks() {
      this.downUpClick_tasks = !this.downUpClick_tasks;

      if (this.downUpClick_tasks) {
        this.arrowImg_tasks = this.upArrowImg_tasks;
      }
      else {
        this.arrowImg_tasks = this.downArowImg_tasks;
      }
    },
    changeArrowImg_eqs() {
      this.downUpClick_eqs = !this.downUpClick_eqs;

      if (this.downUpClick_eqs) {
        this.arrowImg_eqs = this.upArrowImg_eqs;
      }
      else {
        this.arrowImg_eqs = this.downArowImg_eqs;
      }
    },
    changeArrowImg_precedences() {
      this.downUpClick_precedences = !this.downUpClick_precedences;

      if (this.downUpClick_precedences) {
        this.arrowImg_precedences = this.upArrowImg_precedences;
      }
      else {
        this.arrowImg_precedences = this.downArowImg_precedences;
      }
    },
    changeArrowImg_proctimes() {
      this.downUpClick_proctimes = !this.downUpClick_proctimes;

      if (this.downUpClick_proctimes) {
        this.arrowImg_proctimes = this.upArrowImg_proctimes;
      }
      else {
        this.arrowImg_proctimes = this.downArowImg_proctimes;
      }
    },

    /*---------------SchedGraphBuilder-------------*/
    switchForms() {
      this.updateOnlyTasks();
      this.updateTaskEquipment();

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
      if (this.productName === "") {
        this.showWarning("PROUDCT: product name is empty");
      }
      else {
        if (this.productName.indexOf("\\\"") !== -1) { /*    ->    \"       */
          this.showWarning("PROUDCT: product name contains wrong characters: \\\"");
        }
        else {
          this.products.push(this.productName);
          this.deleteDuplicateProducts();
        }
      }
      this.productName = '';
      this.updateProductsLength();
    },
    addTask() {
      if (this.taskName === "" || this.product === "") {
        this.showWarning("TASK: task name is empty");
      }
      else {
        if (this.products.length <= 0) {
          this.showWarning("TASK: products are empty");
        }
        else {
          if (this.taskName.indexOf("\\\"") !== -1) { /*    ->    \"       */
            this.showWarning("TASK: task name contains wrong characters: \\\"");
          }
          else {
            var add = true;
            for (var i = 0; i < this.products.length && add; i++) {
              if (this.taskName === this.products[i]) {
                add = false;
              }
            }
            if (add === true) {
              var yes = true;
              for (var i = 0; i < this.tasks.length && yes; i++) {
                if (this.taskName === this.tasks[i]) {
                  yes = false;
                }
              }
              if (yes) {
                this.tasks.push(this.taskName);
                this.precedencesWithProducts.push({ task: this.taskName, product: this.product });
                this.addTasksAndProducts();
                this.deleteDuplicateTasks();
              }
              else {
                this.showWarning("TASK: Same task name");
              }
            }
            else {
              this.showWarning("TASK: New task name equals to a product name");
            }
          }
        }
      }
      this.taskName = '';
      this.product = '';

      this.updateTasksLength();

      this.recipieGraphTxtOut();

      this.updateOnlyTasks();
      this.addTmpTask12();

    },
    addTmpTask12() {
      this.tmpTask1 = [];
      this.tmpTask2 = [];
      for (var i = 0; i < this.onlyTasks.length; i++) {
        this.tmpTask1.push(this.onlyTasks[i]);
        this.tmpTask2.push(this.onlyTasks[i]);
      }
    },
    addEquipment() {
      if (this.equipmentName === "") {
        this.showWarning("EQ: equipment name is empty");
      }
      else {
        if (this.equipmentName.indexOf("\\\"") !== -1) { /*    ->    \"       */
          this.showWarning("EQ: equipment name contains wrong characters: \\\"");
        }
        else {
          this.equipments.push(this.equipmentName);
          this.deleteDuplicateEquipments();
        }
      }
      this.equipmentName = '';

      this.updateEqsLength();
    },
    addPrecedence() {
      if (this.task1 === "" || this.task2 === "") {
        if (this.task1 === "") {
          this.showWarning("PRECEDENCE: task1 is empty");
        }
        if (this.task2 === "") {
          this.showWarning("PRECEDENCE: task2 is empty");
        }
      }
      else {
        if (this.task1 !== "" && this.task2 !== "") {
          this.precedences.push({ task1: this.task1, task2: this.task2 });

          for (var i = 0; i < this.precedencesWithProducts.length; i++) {
            if (this.precedencesWithProducts[i].task === this.task1) {
              this.deletePrecedencesWithProducts(i);
              this.precedencesWithProducts.push({ task: this.task1, product: this.task2 });
            }
          }

          this.deleteDuplicatePrecedence();
          this.fillUpTmpTaks12();
        }
        else {
          this.showWarning("PRECEDENCE: task1 and task2 are empty");
        }
      }
      this.task1 = "";
      this.task2 = "";
      this.deleteEmptyPrecedences();

      this.recipieGraphTxtOut();

      this.updatePrecedencesLength();
    },
    addProctime() {
      if (this.proctime_task === "" || this.proctime_eq === "" || this.proctime === "") {
        if (this.proctime_task === "") {
          this.showWarning("PROCTIMES: Task is empty");
        }
        if (this.proctime_eq === "") {
          this.showWarning("PROCTIMES: Eq is empty");
        }
        else {
          this.showWarning("PROCTIMES: Proctime is empty");
        }
      }
      else {
        if (this.proctime < 0) {
          this.showWarning("PROCTIMES: Proctime is negativ");
        }
        else {
          this.proctimes.push({ task: this.proctime_task, eq: this.proctime_eq, proctime: this.proctime });
        }
      }
      this.proctime = "";
      this.proctime_task = "";
      this.proctime_eq = "";

      
      this.deleteDuplicateProctimes();
      
      this.updateTaskEquipment();
      this.recipieGraphTxtOut();
      
      this.updateProctimesLength();

    },
    addTasksAndProducts() {
      this.tasksAndProducts.push({ name: this.taskName, product: this.product });
    },
    /*-------------------*/

    /*--------FILL-------*/
    fillUpTmpTaks12() {
      this.tmpTask1 = [];
      this.tmpTask2 = [];
      for (var i = 0; i < this.tasks.length; i++) {
        notProduct = true;
        for (var j = 0; j < this.products.length; j++) {
          if (this.tasks[i] === this.products[j]) {
            notProduct = false;
          }
        }
        if (notProduct) {
          this.tmpTask1.push(this.tasks[i]);
          this.tmpTask2.push(this.tasks[i]);
        }
      }

      this.taskName = "";
    },
    /*-------------------*/

    /*------REMOVE-------*/
    removeTmpTask1() {
      this.tmpTask1 = [];
      var cur_product = "";
      for (var i = 0; i < this.tasksAndProducts.length && cur_product === ""; i++) {
        if (this.task2 === this.tasksAndProducts[i].name) {
          cur_product = this.tasksAndProducts[i].product;
        }
      }
      var tmp_tasks = [];
      for (var i = 0; i < this.tasksAndProducts.length; i++) {
        if (this.tasksAndProducts[i].product === cur_product) {
          if (this.tasksAndProducts[i].name !== this.task2) {
            this.tmpTask1.push(this.tasksAndProducts[i].name);
          }
        }
      }
    },
    removeTmpTask2() {
      this.tmpTask2 = [];
      var cur_product = "";
      for (var i = 0; i < this.tasksAndProducts.length && cur_product === ""; i++) {
        if (this.task1 === this.tasksAndProducts[i].name) {
          cur_product = this.tasksAndProducts[i].product;
        }
      }

      for (var i = 0; i < this.tasksAndProducts.length; i++) {
        if (this.tasksAndProducts[i].product === cur_product) {
          if (this.tasksAndProducts[i].name !== this.task1) {
            this.tmpTask2.push(this.tasksAndProducts[i].name);
          }
        }
      }
    },
    /*-------------------*/

    /*--------DELETE-ID--------*/
    deleteProduct(id) {
      var productName = "";
      for (var i = 0; i < this.products.length; i++) {
        if (id === i) {
          productName = this.products[i];
        }
      }
      this.products.splice(id, 1);
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
    deleteTaskAndTasksAndProducts(id) {
      var task = "";
      for (var i = 0; i < this.tasks.length; i++) {
        if (id === i) {
          var ok = false;
          for (var j = 0; j < this.products.length && !ok; j++) {
            if (this.tasks[i] === this.products[j]) {
              ok = true;
            }
          }
          if (ok) {
            id++;
          }
          else {
            task = this.tasks[i];
          }
        }
      }

      this.updatePrecedencesFromTask(task);
      this.updateProctimesFromProduct(task);
      this.tasks.splice(id, 1);
      this.updateOnlyTasks();
      this.deleteTasksAndProducts(id);
      this.updatePrecedences();
      this.updatePrecedencesWithProductsFromTasks(task);

      this.updateTasksLength();
      this.updatePrecedencesLength();
      this.updateProctimesLength();

      this.recipieGraphTxtOut();
    },
    deleteTask(id) {
      this.tasks.splice(id, 1);
    },
    deleteTmpTask1(id) {
      this.tmpTask1.splice(id, 1);
    },
    deleteTmpTask2(id) {
      this.tmpTask2.splice(id, 1);
    },
    deleteTasksAndProducts(id) {
      this.tasksAndProducts.splice(id, 1);
    },
    deleteEq(id) {
      this.equipments.splice(id, 1);
      this.updateProctimesFromEq();
      this.updateProctimes();
      this.recipieGraphTxtOut();

      this.updateEqsLength();
    },
    deletePrecendence(id) {
      this.precedences.splice(id, 1);
    },
    deletePrecedenceFromHtml(id) {
      var task1 = "";
      var task2 = "";
      for (var i = 0; i < this.precedences.length; i++) {
        if (i === id) {
          task1 = this.precedences[i].task1;
          task2 = this.precedences[i].task2;
        }
      }
      this.deletePrecendence(id);
      this.updatePrecedencesWithProductsFromPrecedence(task1, task2);
      this.recipieGraphTxtOut();

      this.updatePrecedencesLength();
    },
    deleteProctimeFromHtml(id) {
      this.proctimes.splice(id, 1);
      this.updateProctimes();
      this.recipieGraphTxtOut();
      this.updateProctimesLength();
    },
    deleteProctime(id) {
      this.proctimes.splice(id, 1);
      this.updateProctimes();
      this.updateProctimesLength();
    },
    deleteEmptyPrecedences() {
      for (var i = 0; i < this.precedences.length; i++) {
        if (this.precedences[i].task1 === undefined || this.precedences[i].task2 === undefined) {
          this.deletePrecendence(i);
        }
      }
    },
    deletePrecedencesWithProducts(id) {
      this.precedencesWithProducts.splice(id, 1);
    },
    /*-------------------------*/

    /*----------UPDATE---------*/
    updateTasks() {
      var deleteThis = [];
      for (var i = 0; i < this.tasks.length; i++) {
        var add = true;
        for (var j = 0; j < this.tasksAndProducts.length; j++) {//name, product 
          if (this.tasks[i] === this.tasksAndProducts[j].name) {
            add = false;
          }
        }
        if (add === true) {
          deleteThis.push(this.tasks[i]);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.tasks.length; j++) {
          if (deleteThis[i] === this.tasks[j]) {
            this.deleteTask(j);
          }
        }
      }
    },
    updateTasksAndProducts(productName) {
      var deleteThis = [];
      for (var i = 0; i < this.tasksAndProducts.length; i++) {
        if (productName === this.tasksAndProducts[i].product) {
          deleteThis.push({ name: this.tasksAndProducts[i].name, product: this.tasksAndProducts[i].product });
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.tasksAndProducts.length; j++) {
          if (deleteThis[i].name === this.tasksAndProducts[j].name) {
            this.deleteTasksAndProducts(j);
          }
        }
      }
    },
    updatePrecedences() {
      var deleteThis = [];
      for (var i = 0; i < this.precedences.length; i++) {
        var add = true;
        for (var j = 0; j < this.tasks.length; j++) {
          if (this.precedences[i].task1 === this.tasks[j] ||
            this.precedences[i].task2 === this.tasks[j]) {
            add = false;
          }
        }
        if (add == true) {
          deleteThis.push(this.precedences[i].task1);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.precedences.length; j++) {
          if (deleteThis[i] === this.precedences[j].task1) {
            this.deletePrecendence(j);
          }
        }
      }

      this.fillUpTmpTaks12();
    },
    updatePrecedencesFromTask(task) {
      var deleteThis = [];
      for (var i = 0; i < this.precedences.length; i++) {
        if (task === this.precedences[i].task1 ||
          task === this.precedences[i].task2) {
          deleteThis.push({ task1: this.precedences[i].task1, task2: this.precedences[i].task2 });
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.precedences.length; j++) {
          if (deleteThis[i].task1 === this.precedences[j].task1 &&
            deleteThis[i].task2 === this.precedences[j].task2) {
            this.deletePrecendence(j);
          }
        }
      }

      this.fillUpTmpTaks12();
    },
    updateProctimes() {
      var deleteThis = [];
      for (var i = 0; i < this.proctimes.length; i++) {//task, eq, proctime
        var add = true;
        for (var j = 0; j < this.tasks.length; j++) {
          if (this.proctimes[i].task === this.tasks[j]) {
            add = false;
          }
        }
        if (add == true) {
          deleteThis.push(this.proctimes[i].task);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.proctimes.length; j++) {
          if (deleteThis[i] === this.proctimes[j].task) {
            this.proctimes.splice(j, 1);
          }
        }
      }
    },
    updateProctimesFromProduct(task) {
      var deleteThis = [];
      for (var i = 0; i < this.proctimes.length; i++) {
        if (task === this.proctimes[i].task) {
          deleteThis.push(this.proctimes[i].task);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.proctimes.length; j++) {
          if (deleteThis[i] === this.proctimes[j].task) {
            this.deleteProctime(j);
          }
        }
      }
    },
    updateProctimesFromEq() {
      var deleteThis = [];
      for (var i = 0; i < this.proctimes.length; i++) { //task, eq, proctime
        var add = true;
        for (var j = 0; j < this.equipments.length; j++) {
          if (this.proctimes[i].eq === this.equipments[j]) {
            add = false;
          }
        }
        if (add == true) {
          deleteThis.push(this.proctimes[i].eq);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.proctimes.length; j++) {
          if (deleteThis[i] === this.proctimes[j].eq) {
            this.deleteProctime(j);
          }
        }
      }
    },
    updatePrecedencesWithProducts() {
      var deleteThis = [];
      for (var i = 0; i < this.precedencesWithProducts.length; i++) { //task, product
        var add = true;
        for (var j = 0; j < this.tasks.length; j++) {
          if (this.precedencesWithProducts[i].task === this.tasks[j] ||
            this.precedencesWithProducts[i].product === this.tasks[j]) {
            add = false;
          }
        }
        if (add == true) {
          deleteThis.push(this.precedencesWithProducts[i].task);
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.precedencesWithProducts.length; j++) {
          if (deleteThis[i] === this.precedencesWithProducts[j].task) {
            this.deletePrecedencesWithProducts(j);
          }
        }
      }
    },
    updatePrecedencesWithProductsFromTasks(task) {
      var deleteThis = [];
      for (var i = 0; i < this.precedencesWithProducts.length; i++) { //task, product
        if (task === this.precedencesWithProducts[i].task ||
          task === this.precedencesWithProducts[i].product) {
          deleteThis.push({ task: this.precedencesWithProducts[i].task, product: this.precedencesWithProducts[i].product });
        }
      }

      for (var i = 0; i < deleteThis.length; i++) {
        for (var j = 0; j < this.precedencesWithProducts.length; j++) {
          if (deleteThis[i].task === this.precedencesWithProducts[j].task ||
            deleteThis[i].product === this.precedencesWithProducts[j].product) {
            this.deletePrecedencesWithProducts(j);
          }
        }
      }

      for (var i = 0; i < this.tasks.length; i++) {
        var add = true;
        for (var j = 0; j < this.precedencesWithProducts.length; j++) { //task, product
          if (this.tasks[i] === this.precedencesWithProducts[j].task) {
            add = false;
          }
        }
        if (add == true) {
          for (var j = 0; j < this.tasksAndProducts.length; j++) {
            if (this.tasks[i] === this.tasksAndProducts[j].name) {
              this.precedencesWithProducts.push({ task: this.tasks[i], product: this.tasksAndProducts[j].product });
            }
          }
        }
      }
    },
    updatePrecedencesWithProductsFromPrecedence(task1) {
      for (var i = 0; i < this.precedencesWithProducts.length; i++) { //task, product
        if (task1 === this.precedencesWithProducts[i].task) {
          this.deletePrecedencesWithProducts(i);
          for (var j = 0; j < this.tasksAndProducts.length; j++) {
            if (task1 === this.tasksAndProducts[j].name) {
              this.precedencesWithProducts.push({ task: task1, product: this.tasksAndProducts[j].product });
            }
          }
        }
      }
    },
    updateEquimpents() {
      var dropped = []; //eq, tasks
      var sched_table = document.getElementsByClassName("schedTable");
      for(var child_index = 0; child_index < sched_table.length; child_index++){
        var act_eq = "";
        var act_tasks = [];
        for(var node_index = 0; node_index < sched_table[child_index].children.length; node_index++){
          if(node_index === 0){
            act_eq = sched_table[child_index].children[node_index].textContent;
          }
          else{
            act_tasks.push(sched_table[child_index].children[node_index].textContent);
          }
        }
        dropped.push({eq: act_eq, tasks: act_tasks});
      }

      dropped.forEach(drop => {
        drop.tasks.forEach(task => {
          this.taskEquipment.forEach(task_eq => {
            if(task === task_eq.task){
              task_eq.eq = drop.eq;
            }
          });
        });
      });
    },
    updateProductsLength() {
      this.productsLength = this.products.length;
      this.hideAlert();
    },
    updateTasksLength() {
      this.tasksLength = this.tasks.length;
      this.hideAlert();
    },
    updateEqsLength() {
      this.eqsLength = this.equipments.length;
      this.hideAlert();
    },
    updatePrecedencesLength() {
      this.precedencesLength = this.precedences.length;
      this.hideAlert();
    },
    updateProctimesLength() {
      this.proctimesLength = this.proctimes.length;
      this.hideAlert();
    },
    updateOnlyTasks() {
      this.onlyTasks = [];
      for (var i = 0; i < this.tasks.length; i++) {
        var add = true;
        for (var j = 0; j < this.products.length && add; j++) {
          if (this.tasks[i] === this.products[j]) {
            add = false;
          }
        }
        if (add) {
          this.onlyTasks.push(this.tasks[i]);
        }
      }
    },
    updateTasksToEq() {
      this.tasksToEq = []; //eq, tasks
      for (var i = 0; i < this.equipments.length; i++) {
        var tasks = [];
        for (var j = 0; j < this.taskEquipments.length; j++) { //task, eqs[]
          for (var u = 0; u < this.taskEquipments[j].eqs.length; u++) {
            if (this.equipments[i] === this.taskEquipments[j].eqs[u]) {
              tasks.push(this.taskEquipments[j].task);
            }
          }
        }
        this.tasksToEq.push({ eq: this.equipments[i], tasks: tasks });
      }

      this.updateTasksToEqWithProctimes();
      this.updateTasksToEq2("");
    },
    updateTasksToEq2(tasks) {
      if (tasks === "") {
        this.tasksToEq2 = []; //eq, tasks
        for (var i = 0; i < this.equipments.length; i++) {
          var tasks = [];
          this.taskEquipment.forEach(task_eq => {
            if(task_eq.eq === this.equipments[i]){
              tasks.push(task_eq.task);
            }
          });
        
          this.tasksToEq2.push({ eq: this.equipments[i], tasks: tasks });
        }
      }
      else {
        var tmpEq = "";
        var tmpTasks = [];

        this.tasksToEq2 = []; //eq, tasks
        var yes = true;

        for (var i = 0; i < tasks.length; i++) {
          if (!yes) {
            this.tasksToEq2.push({ eq: tmpEq, tasks: tmpTasks });
          }
          yes = true;
          for (var j = 0; j < this.equipments.length; j++) {
            if (this.equipments[j] === tasks[i]) {
              yes = false;
            }
          }
          if (yes) {
            tmpTasks.push(tasks[i]);
          }
          else {
            tmpTasks = [];
            tmpEq = tasks[i];
          }
        }
      }
      this.updateTasksToEqWithProctimes2();
    },
    updateTasksToEqWithProctimes() {
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time

      for (var i = 0; i < this.tasksToEq.length; i++) {
        var eq = this.tasksToEq[i].eq;
        var tmpTasks = []; //task, time
        for (var j = 0; j < this.tasksToEq[i].tasks.length; j++) {
          var time = "";
          for (var u = 0; u < this.proctimes.length; u++) {
            if (this.tasksToEq[i].tasks[j] === this.proctimes[u].task &&
              this.tasksToEq[i].eq === this.proctimes[u].eq) {
              time = this.proctimes[u].proctime;
            }
          }
          tmpTasks.push({ task: this.tasksToEq[i].tasks[j], time: time });
        }

        this.tasksToEqWithProctimes.push({ eq: eq, tasks: tmpTasks });
      }
    },
    updateTasksToEqWithProctimes2() {
      this.tasksToEqWithProctimes = []; //eq, tasks[] //task, time

      for (var i = 0; i < this.tasksToEq2.length; i++) {
        var eq = this.tasksToEq2[i].eq;
        var tmpTasks = []; //task, time
        for (var j = 0; j < this.tasksToEq2[i].tasks.length; j++) {
          var time = "";
          for (var u = 0; u < this.proctimes.length; u++) {
            if (this.tasksToEq2[i].tasks[j] === this.proctimes[u].task &&
              this.tasksToEq2[i].eq === this.proctimes[u].eq) {
              time = this.proctimes[u].proctime;
            }
          }
          tmpTasks.push({ task: this.tasksToEq2[i].tasks[j], time: time });
        }

        this.tasksToEqWithProctimes.push({ eq: eq, tasks: tmpTasks });
      }
    },
    updateTaskEquipment(){
      if(this.taskEquipment.length === 0){
        this.taskEquipment = []; //task, eq, proctime
        this.taskEquipments.forEach(task => {
          this.taskEquipment.push({task: task.task, eq: task.eqs[0], proctime: -1});
        });
      }

      this.taskEquipment.forEach(task => {
        this.proctimes.forEach(time => {
          if(task.task === time.task && task.eq === time.eq){
            task.proctime = time.proctime;
          }
        });
      });

      this.updateEquimpentsWithTasks();
    },
    updateEquimpentsWithTasks(){
      this.equipmentsWithTasks = []; //eq, tasks

      this.equipments.forEach(equipment => {
        var act_tasks = [];
        this.taskEquipment.forEach(task => {
          if(task.eq === equipment){
            act_tasks.push(task.task);
          }
        });
        this.equipmentsWithTasks.push({eq: equipment, tasks: act_tasks});
      });
    },
    /*-------------------------*/

    /*--------DELETE-DUPLICATE--------*/
    deleteDuplicateProducts() {
      for (var i = 0; i < this.products.length; i++) {
        for (var j = i + 1; j < this.products.length; j++) {
          if (this.products[j] === this.products[i]) {
            this.products.splice(j, 1);
            this.showWarning("Same products");
          }
        }
      }
    },
    deleteDuplicateTasks() {
      var yes = true;
      for (var i = 0; i < this.tasksAndProducts.length; i++) {
        for (var j = i + 1; j < this.tasksAndProducts.length; j++) {
          if (this.tasksAndProducts[j].name === this.tasksAndProducts[i].name &&
            this.tasksAndProducts[j].product === this.tasksAndProducts[i].product) {
            yes = false;
            break;
          }
        }
        if (!yes) {
          break;
        }
      }

      if (!yes) {
        this.deleteTasksAndProducts(j);
        this.showWarning("Same tasks and products");
      }
      else {
        this.addTmpTask12();
      }
    },
    deleteDuplicateEquipments() {
      for (var i = 0; i < this.equipments.length; i++) {
        for (var j = i + 1; j < this.equipments.length; j++) {
          if (this.equipments[j] === this.equipments[i]) {
            this.deleteEq(j);
            this.showWarning("Same equipments");
          }
        }
      }
    },
    deleteDuplicatePrecedence() {
      for (var i = 0; i < this.precedences.length; i++) {
        for (var j = i + 1; j < this.precedences.length; j++) {
          if (this.precedences[j].task1 === this.precedences[i].task1 &&
            this.precedences[j].task2 === this.precedences[i].task2) {
            this.deletePrecendence(j);
            this.showWarning("Same precedences");
          }
        }
      }
    },
    deleteDuplicateProctimes() {
      for (var i = 0; i < this.proctimes.length; i++) {
        for (var j = i + 1; j < this.proctimes.length; j++) {
          if (this.proctimes[j].task === this.proctimes[i].task &&
            this.proctimes[j].eq === this.proctimes[i].eq &&
            this.proctimes[j].proctime === this.proctimes[i].proctime) {
            this.deleteProctime(j);
            this.showWarning("Same proctimes");
          }
        }
      }

      for (var i = 0; i < this.proctimes.length; i++) {
        for (var j = i + 1; j < this.proctimes.length; j++) {
          if (this.proctimes[j].task === this.proctimes[i].task &&
            this.proctimes[j].eq === this.proctimes[i].eq) {
            this.deleteProctime(j);
            this.showWarning("Same proctimes");
          }
        }
      }

      for (var i = 0; i < this.proctimes.length; i++) {
        if (this.proctimes[i].proctime[0] === '0' &&
          this.proctimes[i].proctime[1] !== '.') {
          this.deleteProctime(i);
          this.showWarning("0 proctime");
        }
      }
    },
    /*--------------------------------*/

    showWarning(text) {
      this.warningTxt = text;
      this.showWarningTxt = true;
    },
    equipmentsToTask() {
      this.taskEquipments = [];
      for (var i = 0; i < this.proctimes.length; i++) {
        var taskTemp = this.proctimes[i].task;
        var eqTemp = [];
        for (var j = 0; j < this.proctimes.length; j++) {
          if (this.proctimes[j].task === taskTemp) {
            eqTemp.push(this.proctimes[j].eq);
          }
        }

        var yes = true;
        for (var j = 0; j < this.taskEquipments.length; j++) {
          if (this.taskEquipments[j].task === taskTemp) {
            yes = false;
          }
        }
        if (yes) {
          this.taskEquipments.push({ task: taskTemp, eqs: eqTemp });
        }
      }
    },
    recipieGraphTxtOut() {
      this.equipmentsToTask();

      this.recipieGraphTxt = "digraph SGraph { rankdir=LR 	node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
      for(var i = 0; i < this.taskEquipments.length; i++){
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

        var proc_time = -1;
        for(var j = 0; j < this.taskEquipment.length; j++){
          if(this.precedencesWithProducts[i].task === this.taskEquipment[j].task){
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
    checkTasksEquipment(event){
      var act_task = event.items[0].innerText;
      var dropped_eq = event.droptarget.textContent.split(' ')[0];

      var dropped_eq_is_good = false;
      this.taskEquipments.forEach(task_eq => {
        task_eq.eqs.forEach(eq => {
          
          if(eq === dropped_eq){
            if(task_eq.task === act_task){
              dropped_eq_is_good = true;
            }
          }
        });
      }); 

      return dropped_eq_is_good;
    },
  },
}).$mount("#content");