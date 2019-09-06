Vue.use(VueDraggable.default);

var vm = new Vue({
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

      options: {
        // dropzoneSelector: 'ul',
        // draggableSelector: 'li',
         //showDropzoneAreas: false,
         //multipleDropzonesItemsDraggingEnabled: true,
        //onDrop(event) {
          onDrop() {
            componentInstance.getTasks(false);
            componentInstance.updateEquimpents();
         },
        // onDragstart(event) {
        //   event.stop();
        // },
        onDragend(event) {
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
        }
      },
     /*---------------RECIPIE BUILDER---------------*/
     products:[],
     productName: '',

     tasks: [], 
     taskName: '',
     onlyTasks: [],

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

     taskEquipment:[], //task, eqs[] | which task which equipments

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

     /*---------------SchedGraphBuilder-------------*/
     schedSequence:[], 

     schedGraphTxt:"",

     schedPrecedencesWithProducts:[], //task, product, schedEdge(true/false)

     schedTasks:[], 
     schedTasksArray:[], 

     lastInCol:[],

     //uisNisChk: "UIS", //UIS NIS
     uisNisChk: false, //UIS NIS

     allEdges:[], //task1, task2

     longestPath:[], //task1, task2

     longestPathTime:"",
     longestPathStartTask:"",
     longestPathEndTask:"",
     circle:false,
     circleTaskPairs: [], //task1, task2
   }
 }, 
 methods:{
   hideAlert(){
    setTimeout(() => this.showWarningTxt = false, 5000);
   },
   uisNisSwitch(){

     if(this.uisNisChk){
       this.schedGraphTxtOut(true,true);
     }
     else{
       this.schedGraphTxtOut(true,false);
     }

     this.uisNisChk = !this.uisNisChk;

    
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
      this.tasksToEq = [];
       for(i=0; i< this.equipments.length; i++){
        t = [];
        for(j=0; j< this.taskEquipment.length; j++){ //task, eqs[]
          for(u=0; u< this.taskEquipment[j].eqs.length; u++){
            if(this.equipments[i] === this.taskEquipment[j].eqs[u]){
              t.push(this.taskEquipment[j].task);
            }
          }
        }
        this.tasksToEq.push({eq: this.equipments[i], tasks: t});
      }

     /* for(i=0; i< this.tasksToEq.length; i++){
        console.log(this.tasksToEq[i].eq + " " + this.tasksToEq[i].tasks);
      }*/

      this.getTasks(true);
      //this.schedGraphTxtOut(false,false);
     }
     else{
       this.recipieGraphTxtOut();
     }
     
     this.updateProductsLength();
     this.updateTasksLength();
     this.updateEqsLength();
     this.updatePrecedencesLength();
     this.updateProctimesLength();
   },

   getTasks(first){
    tasks=[];

    if(first){
      for(i = 0; i < this.tasksToEq.length; i++){ 
        tasks.push(this.tasksToEq[i].eq);
        for(j = 0; j < this.tasksToEq[i].tasks.length; j++){ 
          tasks.push(this.tasksToEq[i].tasks[j]);
        }
      }

    }
    else{
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
    }

    /*for(i = 0; i < tasks.length; i++){ 
     // console.log(tasks[i]);
    }*/

    this.dragAndDropList(tasks);
   },

   dragAndDropList(tasks){
     this.schedTasks = [];
     this.lastInCol = [];
     for(i=0; i< tasks.length; i++){ 
      yes = true;
      for(j = 0; j < this.equipments.length; j++){ 
        if(this.equipments[j] === tasks[i]){
          yes = false;
        }
      }
      if(yes){
        this.schedTasks.push({task: tasks[i]});
        this.schedTasksArray.push({task: tasks[i]});
      }
      else{
        this.schedTasksArray.push({task: "--"});
        if(i > 0){
          this.lastInCol.push(tasks[i - 1]);
        }
      }
     }

     //this.lastInCol.push(tasks[tasks.length-1]);

     /*for(i=0; i< this.schedTasksArray.length; i++){ 
      //console.log(this.schedTasksArray[i].task);
     }
     for(i=0; i< this.lastInCol.length; i++){ 
     // console.log("L " + this.lastInCol[i]);
     }*/

     if(this.uisNisChk){
       this.schedGraphTxtOut(true,false);
     }
     else{
       this.schedGraphTxtOut(true,true);
     }
   },
  
   makeSchedPrecedencesWithProducts(){
    this.schedPrecedencesWithProducts=[];
    for(i=0; i< this.schedTasks.length; i++){ //task
      for(j=0; j< this.precedencesWithProducts.length; j++){  //task, product
        if(this.schedTasks[i].task === this.precedencesWithProducts[j].task){
          this.schedPrecedencesWithProducts.push({task: this.precedencesWithProducts[j].task, product: this.precedencesWithProducts[j].product, schedEdge:false});
        }
      }
    }

    addThis=[];
    for(i = 0; i < this.schedTasks.length - 1; i++){ //task
      yes = true;
      for(j = 0; j < this.schedPrecedencesWithProducts.length - 1; j++){ //task, product, schedEdge(true/false)
        if(this.schedTasks[i].task === this.schedPrecedencesWithProducts[j].task &&
           this.schedTasks[i + 1].task === this.schedPrecedencesWithProducts[j].product){
             yes = false;
          }
      }
      if(yes){
        addThis.push({task: this.schedTasks[i].task, product: this.schedTasks[i + 1].task, schedEdge:true});
      }
    }

    for(i=0; i< addThis.length; i++){
      this.schedPrecedencesWithProducts.push({task: addThis[i].task, product: addThis[i].product, schedEdge: addThis[i].schedEdge});
    }
   },

   circleCheck(){
      this.circle = false;
    /* console.log("--this.alledges--");
      for(i = 0; i < this.allEdges.length; i++){ //task1, task2
        console.log(this.allEdges[i].task1 + " " + this.allEdges[i].task2);
      }*/

      //megkeresem a kezdő taszkokat
      startTasks = [];
      for(i = 0; i < this.precedences.length; i++){ //task1, task2
        yes = true;
        for(j = 0; j < this.precedences.length && yes; j++){ //task1, task2
          if(this.precedences[i].task1 === this.precedences[j].task2){
            yes = false;
          }
        }
        if(yes){
          //csak egyszer rakom bele őket
          for(j = 0; j < startTasks.length && yes; j++){
            if(this.precedences[i].task1 === startTasks[j]){
              yes = false;
            }
          }
          if(yes){
            startTasks.push(this.precedences[i].task1);
          }
        }
      }

      for(startTaskIndex = 0; startTaskIndex < startTasks.length; startTaskIndex++){ 

        startTask = startTasks[startTaskIndex];

        task2S = [];
        for(i = 0; i < this.allEdges.length; i++){ //task1, task2
          if(startTask === this.allEdges[i].task1){
            task2S.push(this.allEdges[i].task2);
          }
        }

        circleArr = []; //task, task2S, end
        circleArr.push({task: startTask, task2S: task2S, end: true});

        for(r = 0; r < this.allEdges.length && !this.circle; r++){
        /*  console.log("--circleArr eleje--");
          for(i = 0; i < circleArr.length; i++){ //task, task2S, end
            console.log(circleArr[i].task + " | " + circleArr[i].task2S + " | " + circleArr[i].task2S.length + " | " + circleArr[i].end);
          }*/

          endTask = []; //task, task2S, end
          for(i = 0; i < circleArr.length; i++){ //task, task2S, end
            if(circleArr[i].end){
              endTask.push({task: circleArr[i].task, task2S: circleArr[i].task2S, end: true});
            }
          }

          /*console.log("--endTask--");
          console.log(endTask[0].task + " | " + endTask[0].task2S + " | " + endTask[0].task2S.length + " | " + endTask[0].end);
  */
          task2S = [];
          for(i = 0; i < this.allEdges.length; i++){ //task1, task2
            if(endTask[0].task2S[0] === this.allEdges[i].task1){
              task2S.push(this.allEdges[i].task2);
            }
          }

          //megnézem hogy ezek közül van e amivel kör lesz
          endCircleTask = "";
          for(i = 0; i < task2S.length && !this.circle; i++){
            for(j = 0; j < circleArr.length && !this.circle; j++){ //task, task2S, end
              if(task2S[i] === circleArr[j].task){
                this.circle = true;
                //console.log("KÖR");
                circleArr.push({task: circleArr[circleArr.length - 1].task2S[0], task2S: [], end: false});
                circleArr.push({task: task2S[i], task2S: [], end: false});
              }
            }
          }

          if(this.circle){
            endTask = circleArr[circleArr.length - 1].task;

            go = true;
            for(i = 0; i < circleArr.length && go; i++){ //task, task2S, end
              if(circleArr[i].task === endTask){
                go = false;
              }
            }

            tmpArr = []; 
            for(j = i - 1; j < circleArr.length; j++){ //task, task2S, end
              tmpArr.push(circleArr[j].task);
            }

          /* console.log("KÖRKÖR");
            for(i = 0; i < tmpArr.length; i++){
              console.log(tmpArr[i]);
            }*/

            this.circleTaskPairs = []; //task1, task2
            for(i = 0; i < tmpArr.length - 1; i++){ 
              yes = true;
              for(u = 0; u < this.circleTaskPairs.length && yes; u++){ 
                if(this.circleTaskPairs[u].task1 === tmpArr[i] && this.circleTaskPairs[u].task2 === tmpArr[i + 1]){
                  yes = false;
                }
              }
              if(yes){
                this.circleTaskPairs.push({task1: tmpArr[i], task2: tmpArr[i + 1]});
              }
            }
      
          /*  console.log(".....this.circleTaskPairs..........");
            for(i = 0; i < this.circleTaskPairs.length; i++){
              console.log(this.circleTaskPairs[i].task1 + " " + this.circleTaskPairs[i].task2);
            }
            console.log("...............");*/

          }
          else{
            end = false;
            if(task2S.length > 0){
              end = true;
            }

            circleArr.push({task: endTask[0].task2S[0], task2S: task2S, end: end});

            tmpArr = [];
            for(i = 1; i < endTask[0].task2S.length; i++){
              tmpArr.push(endTask[0].task2S[i]);
            }

            endTask[0].task2S = tmpArr;

            circleArr[circleArr.length - 2] = endTask[0];

            for(i = 0; i < circleArr.length; i++){ //task, task2S, end
              if(circleArr[i].task2S.length > 0){
                circleArr[i].end = true;

                for(j = 0; j < i; j++){ //task, task2S, end
                  circleArr[j].end = false;
                }
              }
            }

            /*console.log("--circleArr--");
            for(i = 0; i < circleArr.length; i++){ //task, task2S, end
              console.log(circleArr[i].task + " | " + circleArr[i].task2S + " | " + circleArr[i].task2S.length + " | " + circleArr[i].end);
            }*/

            //el kell venni az end utániakat
            tmpArr = []; //task, task2S, end
            go = true;
            for(i = 0; i < circleArr.length && go; i++){ //task, task2S, end
              if(circleArr[i].end){
                go = false;
                tmpArr.push({task: circleArr[i].task, task2S: circleArr[i].task2S, end: circleArr[i].end});
              }
              else{
                tmpArr.push({task: circleArr[i].task, task2S: circleArr[i].task2S, end: circleArr[i].end});
              }
            }

            circleArr = [];//task, task2S, end
            for(i = 0; i < tmpArr.length; i++){ //task, task2S, end
              circleArr.push({task: tmpArr[i].task, task2S: tmpArr[i].task2S, end: tmpArr[i].end});
            }
          }
          /*console.log("--circleArr vége--");
          for(i = 0; i < circleArr.length; i++){ //task, task2S, end
            console.log(circleArr[i].task + " | " + circleArr[i].task2S + " | " + circleArr[i].task2S.length + " | " + circleArr[i].end);
          }*/
        }
      }
   },

   getLongestPath(schedGraphText){
    this.circleCheck();

    if(!this.circle){

      /*for(i = 0; i < this.allEdges.length; i++){ //task1, task2
        console.log(this.allEdges[i].task1 + " " + this.allEdges[i].task2);
      }*/

      //megkeresem a kezdő taszkokat
      startTasks = [];
      for(i = 0; i < this.allEdges.length; i++){ //task1, task2
        yes = true;
        for(j = 0; j < this.allEdges.length && yes; j++){ //task1, task2
          if(this.allEdges[i].task1 === this.allEdges[j].task2){
            yes = false;
          }
        }
        if(yes){
          //csak egyszer rakom bele őket
          for(j = 0; j < startTasks.length && yes; j++){
            if(this.allEdges[i].task1 === startTasks[j]){
              yes = false;
            }
          }
          if(yes){
            startTasks.push(this.allEdges[i].task1);
          }
        }
      }

      longestPathTime = Number.MAX_SAFE_INTEGER;
      longestPathEndTask = "";
      longestPathStartTask = "";
      tempLongestPath = []; //task1, task2
    
     for(startTaskIndex = 0; startTaskIndex < startTasks.length; startTaskIndex++){
       

        startTask = startTasks[startTaskIndex];
        //beállítom az elejét
        a = []; //a1-ből a másik 2 taszk ami jön
        b = []; //segéd tömb
        b.push(startTasks[startTaskIndex]);
        a.push(b);
        t = startTasks[startTaskIndex];

        b = [];
        for(i = 0; i < this.allEdges.length; i++){ //task1, task2
          if(t === this.allEdges[i].task1){
            b.push(this.allEdges[i].task2);
          }
        }
        a.push(b);

        for(i = 0; i < a.length; i++){ 
          if(a[i].length > 1){
            b = [];
            for(j = 0; j < a[i].length; j++){ 
              for(u = 0; u < this.allEdges.length; u++){ //task1, task2
                if(a[i][j] === this.allEdges[u].task1){
                  b.push(this.allEdges[u].task2);
                }
              }
            }
            if(b.length > 1){
              a.push(b);
            }
          }
        }

      /*  console.log("---a---");
        for(i = 0; i < a.length; i++){ 
          console.log(a[i]);
        }*/

        edges = []; //task1, task2, time
        for(i = 0; i < this.allEdges.length; i++){ //task1, task2
          edges.push({task1: this.allEdges[i].task1, task2: this.allEdges[i].task2, time: 0});
        }
        /*for(i = 0; i < a.length; i++){ 
          for(j = 0; j < a[i].length; j++){ 
            for(u = 0; u < this.allEdges.length; u++){ //task1, task2
              if(a[i][j] === this.allEdges[u].task1){
                yes = true;
                for(z = 0; z < edges.length; z++){ //task1, task2, time
                  if(true){
                    if(edges[z].task1 === a[i][j] && edges[z].task2 === this.allEdges[u].task2){
                      yes = false;
                    }
                  }
                }
                if(yes){
                  edges.push({task1: a[i][j], task2: this.allEdges[u].task2, time: 0});
                  console.log("task1: " + a[i][j] + " task2: " + this.allEdges[u].task2);
                }
              }
            }
          }
        }*/

        for(i = 0; i < edges.length; i++){ //task1, task2, time
          for(j = 0; j < this.proctimes.length; j++){ //task, eq, proctime
            if(this.proctimes[j].task === edges[i].task1){
              edges[i].time = -this.proctimes[j].proctime;
            }
          }
        }

        tasksWithProducts = this.tasks;
        for(i = 0; i < this.products.length; i++){
          yes = true;
          for(j = 0; j < tasksWithProducts.length; j++){
            if(tasksWithProducts[j] === this.products[i]){
              yes = false;
            }
          }
          if(yes){
            tasksWithProducts.push(this.products[i]);
          }
        }

        iterations = []; //task, time, from, once
        for(i = 0; i < tasksWithProducts.length; i++){
          iterations.push({task: tasksWithProducts[i], time: Number.MAX_SAFE_INTEGER, from: "",once: false});
        }

        for(i = 0; i < iterations.length; i++){ //task, time, from, once
          if(iterations[i].task === startTasks[startTaskIndex]){
            iterations[i].time = +0;
          }
        }

        
      /*  console.log("---iterations - alap---");
        for(i = 0; i < iterations.length; i++){ //task, time, from, once
          console.log(iterations[i].task + " " + iterations[i].time + " " + iterations[i].from + " " + iterations[i].once);
        }

        console.log("---edges---");
        for(i = 0; i < edges.length; i++){ //task1, task2, time
          console.log(edges[i].task1 + " " + edges[i].task2 + " " + edges[i].time);
        }*/


        for(i = 0; i < iterations.length; i++){ //task, time, from, once
          for(j = 0; j < edges.length; j++){ //task1, task2, time
            prevIterations = [];

            for(u = 0; u < iterations.length; u++){ //task, time, from, once
              prevIterations.push({task: iterations[u].task, time: iterations[u].time,from: iterations[u].from, once: iterations[u].once});
            }

            tasksIn = []; //task, time
            for(u = 0; u < iterations.length; u++){ //task, time, from, once
              if(!iterations[u].once){
                tasksIn.push({task: iterations[u].task, time: iterations[u].time});
              }
            }

          /*  console.log("--tasksIn--");
            for(u = 0; u < tasksIn.length; u++){ //task, time
              console.log(tasksIn[u].task + " " + tasksIn[u].time);
            }*/
    

            minTime = Number.MAX_SAFE_INTEGER;
            k = "";
            for(u = 0; u < tasksIn.length; u++){ //task, time
              if(tasksIn[u].time < minTime){
                minTime = tasksIn[u].time;
                k = tasksIn[u].task;
              }
            }
            for(u = 0; u < iterations.length; u++){ //task, time, from, once
              if(k === iterations[u].task){
                iterations[u].once = true;
              }
            }
            //console.log("közelít: " + k);
            for(u = 0; u < edges.length; u++){ //task1, task2, time
              if(k === edges[u].task1){
                for(z = 0; z < iterations.length; z++){ //task, time, from, once
                  if(edges[u].task2 === iterations[z].task){
                    plusTime = +0;
                    for(r = 0; r < iterations.length; r++){ //task, time, from, once
                      if(edges[u].task1 === iterations[r].task){
                        plusTime = +iterations[r].time;
                      }
                    }
                    iterations[z].time = +edges[u].time + +plusTime;
                    iterations[z].from = edges[u].task1;
                    iterations[z].once = false;
                  }
                }
              }
            }

            /*console.log("--iterations--");
            for(u = 0; u < iterations.length; u++){ //task, time, from, once
              console.log(iterations[u].task + " " + iterations[u].time + " " + iterations[u].from + " " + iterations[u].once);
            }*/
          }

        

          minTime = iterations[0].time;
          for(j = 1; j < iterations.length; j++){ //task, time, from, once
            if(minTime > iterations[j].time){
              minTime = iterations[j].time;
            }
          }
          if(minTime < longestPathTime){
            longestPathTime = minTime;
            longestPathStartTask = startTask;

            for(j = 0; j < iterations.length; j++){ //task, time, from, once
              if(longestPathTime === iterations[j].time){
                longestPathEndTask = iterations[j].task;
              }
            }

            tempLongestPath = []; //task1, task2
            //console.log("-iterations-");
            for(j = 0; j < iterations.length; j++){ //task, time, from, once
              //console.log(iterations[j].from + " " + iterations[j].task);
              if(iterations[j].from !== ""){
                yes = true;
                for(u = 0; u < tempLongestPath.length; u++){ //task1, task2
                  if(tempLongestPath[u].task1 === iterations[j].from && tempLongestPath[u].task2 === iterations[j].task){
                    yes = false;
                  }
                }
                if(yes){
                  tempLongestPath.push({task1: iterations[j].from, task2: iterations[j].task});
                }
              }
            }
          }
        }
     }
      //console.log(".............");
     /*console.log("---tempLongestPath---");
     for(i = 0; i < tempLongestPath.length; i++){ //task1, task2
      console.log(tempLongestPath[i].task1 + " " + tempLongestPath[i].task2);
    }*/ 
   
      tempArray = []; //task1, task2
      lastLength = +0;
      go = false;
      do{
        //balról
        lastLength = tempArray.length;
        tempArray = [];
        for(i = 0; i < tempLongestPath.length; i++){ //task1, task2
          yes = false;
          if(tempLongestPath[i].task1 === longestPathStartTask){
            yes = true;
          }
          for(j = 0; j < tempLongestPath.length && !yes; j++){ //task1, task2
            if(tempLongestPath[i].task1 === tempLongestPath[j].task2){
              yes = true;
            }
          }
          if(yes){
            tempArray.push({task1: tempLongestPath[i].task1, task2: tempLongestPath[i].task2});
          }
        }

        if(lastLength === tempArray.length){
          go = true;
        }

        tempLongestPath = [];
        for(i = 0; i < tempArray.length; i++){ //task1, task2
          tempLongestPath.push({task1: tempArray[i].task1, task2:tempArray[i].task2});
        }

        /*console.log("--tempLongestPath--");
        for(i = 0; i < tempLongestPath.length; i++){ //task1, task2
          console.log(tempLongestPath[i].task1 + " " + tempLongestPath[i].task2);
        }*/
  
      }while(!go);


      tempArray = []; //task1, task2
      lastLength = +0;
      go = false;
      do{
        //jobbról
        lastLength = tempArray.length;
        tempArray = [];
        for(i = 0; i < tempLongestPath.length; i++){ //task1, task2
          yes = false;
          if(tempLongestPath[i].task2 === longestPathEndTask){
            yes = true;
          }
          for(j = 0; j < tempLongestPath.length && !yes; j++){ //task1, task2
            if(tempLongestPath[i].task2 === tempLongestPath[j].task1){
              yes = true;
            }
          }
          if(yes){
            tempArray.push({task1: tempLongestPath[i].task1, task2: tempLongestPath[i].task2});
          }
        }

        if(lastLength === tempArray.length){
          go = true;
        }

        tempLongestPath = [];
        for(i = 0; i < tempArray.length; i++){ //task1, task2
          tempLongestPath.push({task1: tempArray[i].task1, task2:tempArray[i].task2});
        }

        /*console.log("--tempLongestPath--");
        for(i = 0; i < tempLongestPath.length; i++){ //task1, task2
          console.log(tempLongestPath[i].task1 + " " + tempLongestPath[i].task2);
        }*/
  
      }while(!go);

   
      this.longestPathStartTask = longestPathStartTask;
      this.longestPathEndTask = longestPathEndTask;
      this.longestPathTime = -longestPathTime;


      this.longestPath = [];
      for(i = 0; i < tempArray.length; i++){ //task1, task2
        this.longestPath.push({task1: tempArray[i].task1, task2: tempArray[i].task2});
      }

      schedText = "";

      text = schedGraphText.split("@");
      for(i = 0; i < text.length; i++){ 
        if(i % 2 === 0){
          schedText += text[i];
        }
        else{
          tempTasks = text[i].split(";");
          for(j = 0; j < this.longestPath.length; j++){ //task1, task2
            if(tempTasks[0] === this.longestPath[j].task1 && tempTasks[1] === this.longestPath[j].task2){
              schedText += "5";
            }
          }
        }
      }
    }
    else{
      schedText = "";

      text = schedGraphText.split("@");
      for(i = 0; i < text.length; i++){ 
        if(i % 2 === 0){
          schedText += text[i];
        }
        else{
          tempTasks = text[i].split(";");
          for(j = 0; j < this.circleTaskPairs.length; j++){ //task1, task2
            if(tempTasks[0] === this.circleTaskPairs[j].task1 && tempTasks[1] === this.circleTaskPairs[j].task2){
              schedText += "5";
            }
          }
        }
      }
    }

  //  console.log(schedText);

  //console.log(schedText);

    var viz = new Viz();
    viz.renderSVGElement(schedText)
    .then(function(element) {
      document.getElementById('schedGraph').innerHTML="";
      document.getElementById('schedGraph').appendChild(element);
    })
    .catch(error => {
      viz = new Viz();
      console.error(error);
    });

   },

   schedGraphTxtOut(drag , uis){     
     if(!drag){
       this.schedTasks = this.taskEquipment;
     }

     this.makeSchedPrecedencesWithProducts();

     this.allEdges = [];

     this.equipmentsToTask();

     this.schedGraphTxt ="digraph SGraph { rankdir=LR  splines=true node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>,pin=true]"

     xPosDist = 2;
     yPosDist = 1.1;

     /* Collect all task to product  */
     productWithTasks=[]; //product, tasks[]
     for(i=0; i< this.products.length; i++){ 
       add = [];
       p = "";
       for(j=0; j< this.tasksAndProducts.length; j++){ //name, product
         if(this.products[i] === this.tasksAndProducts[j].product){
           p = this.tasksAndProducts[j].product;
           add.push(this.tasksAndProducts[j].name);
         }
       }
       productWithTasks.push({product: p, tasks: add});
     }

     /* Collect all precedence to product */
     productWithPrecedence=[]; //product, precedences[] - task1, task2
     for(i = 0; i < productWithTasks.length; i++){ //product, tasks[]
       add = [];
       for(j = 0; j < productWithTasks[i].tasks.length; j++){
         for(u = 0; u < this.precedencesWithProducts.length; u++){ //task, product
           if(productWithTasks[i].tasks[j] === this.precedencesWithProducts[u].task){
             add.push({task1: this.precedencesWithProducts[u].task, task2: this.precedencesWithProducts[u].product});
           }
         }
       }
       productWithPrecedence.push({product: productWithTasks[i].product, precedences: add});
     }

     /* Sort the productWithPrecedence array */
     /* Add first task to array */
     sortedProductWithTasks=[]; //product tasks[]
     for(i = 0; i < productWithPrecedence.length; i++){ //product, precedences[] - task1, task2
       add=[];
       for(j = 0; j < productWithPrecedence[i].precedences.length; j++){
         c = 0;
         for(u = 0; u < productWithPrecedence[i].precedences.length; u++){
           if(productWithPrecedence[i].precedences[j].task1 ===  productWithPrecedence[i].precedences[u].task2){
             c++;
           }
         }
         if(c === 0){
          add.push(productWithPrecedence[i].precedences[j].task1);
         }
       }
       sortedProductWithTasks.push({product: productWithPrecedence[i].product, tasks: add});
     }
     /* Add the rest tasks to array */
     for(i = 0; i < productWithPrecedence.length; i++){ //product, precedences[] - task1, task2
       for(z = 0; z < productWithPrecedence[i].precedences.length; z++){ //product, precedences[] - task1, task2
         add="";
         for(j = 0; j < sortedProductWithTasks[i].tasks.length; j++){ //product tasks[]
           for(u = 0; u < productWithPrecedence[i].precedences.length; u++){
             if(sortedProductWithTasks[i].tasks[j] === productWithPrecedence[i].precedences[u].task1){
               add = productWithPrecedence[i].precedences[u].task2;
             }
           }
         }
         yes=true;
         for(j = 0; j < sortedProductWithTasks[i].tasks.length; j++){ //product tasks[]
           if(add === sortedProductWithTasks[i].tasks[j]){
             yes = false;
           }
         }
         if(yes){
           sortedProductWithTasks[i].tasks.push(add);
         }
       }
     }

     /* To which task goes multiple edges */
     multipleTasksToOneProduct=[]; //task, product, count
     for(i=0; i< this.precedencesWithProducts.length; i++){  //task, product
       t = this.precedencesWithProducts[i].task;
       p = this.precedencesWithProducts[i].product;
       c = -1;
       for(j=0; j< this.precedencesWithProducts.length; j++){  //task, product
         if(this.precedencesWithProducts[j].product === p){
           c++;
         }
       }
       multipleTasksToOneProduct.push({task: t, product: p, count: c});
     }    

     /* How many edges goes to a task */
     howManyEdgesToTask=[]; //task, count
     for(i = 0; i < multipleTasksToOneProduct.length; i++){ //task, product, count
       if(multipleTasksToOneProduct[i].count > 0){
         add=true;
         for(j = 0; j < howManyEdgesToTask.length; j++){ //task, count
           if(howManyEdgesToTask[j].task === multipleTasksToOneProduct[i].product){
             add = false;
           }
         }
         if(add){
           howManyEdgesToTask.push({task: multipleTasksToOneProduct[i].product, count: 1});
         }
         else{
           for(j = 0; j < howManyEdgesToTask.length; j++){ //task, count
             if(howManyEdgesToTask[j].task === multipleTasksToOneProduct[i].product){
               howManyEdgesToTask[j].count += 1;
             }
           }
         }
       }
     }

     /* X positions */
     xPositions=[]; //task, xPos
     for(i = 0; i < sortedProductWithTasks.length; i++){ //product tasks[]
       xPos=0;
       for(j = 0; j < sortedProductWithTasks[i].tasks.length; j++){
         for(u = 0; u < multipleTasksToOneProduct.length; u++){ //task, product, count
           if(sortedProductWithTasks[i].tasks[j] === multipleTasksToOneProduct[u].product){
             if(multipleTasksToOneProduct[u].count > 0){
               if(sortedProductWithTasks[i].tasks[j-1] === multipleTasksToOneProduct[u].task){
                 xPos += xPosDist;
               }
             }
             else{
               xPos += xPosDist;
             }
           }
         }
         xPositions.push({task: sortedProductWithTasks[i].tasks[j], xPos: xPos});
       }
     }

     tasksAsXPos=[]; //xPos, tasks[]
     for(i = 0; i < xPositions.length; i++){  //task, xPos
       add=[];
       for(j = 0; j < xPositions.length; j++){  //task, xPos
         if(xPositions[i].xPos === xPositions[j].xPos){
           add.push(xPositions[j].task);
         }
       }
       yes = true;
       for(j = 0; j < tasksAsXPos.length; j++){ //xPos, tasks[]
         if(xPositions[i].xPos === tasksAsXPos[j].xPos){
           yes = false;
         }
       }
       if(yes){
         tasksAsXPos.push({xPos: xPositions[i].xPos, tasks: add});
       }
     }

    /* Y positions */
    yPositions=[]; //task, yPos
     for(i = 0; i < tasksAsXPos.length; i++){ //xPos, tasks[]
       for(u = 0; u < xPositions.length; u++){ //task, xPos
         for(j = 0; j < tasksAsXPos[i].tasks.length; j++){
           yes = true;
           for(z = 0; z < yPositions.length; z++){ //task, yPos
             if(yPositions[z].task === tasksAsXPos[i].tasks[j]){
               yes = false;
             }
           }
           if(yes){
             yPos = 0 - j * yPosDist;

             /*HA KELL A SOROK KÖZÉ PLUSZ HELY AZT ITT KELL*/

             /*for(z = 0; z < sortedProductWithTasks.length; z++){ //product, tasks[]
               for(t = 0; t < sortedProductWithTasks[z].tasks.length; t++){
                 if(sortedProductWithTasks[z].tasks[t] === tasksAsXPos[i].tasks[j]){
                   if(z + 1 < sortedProductWithTasks.length){
                     if(sortedProductWithTasks[z + 1].product !== sortedProductWithTasks[z].product){
                      yPos += .5;
                     }
                   }
                 }
               }
             }*/

           /*  for(z = 0; z < this.tasksAndProducts.length; z++){ //name, product
               if(tasksAsXPos[i].tasks[j] === this.tasksAndProducts[z].name){
                 if(z + 1 < this.tasksAndProducts.length){
                   if(this.tasksAndProducts[z + 1].product !== this.tasksAndProducts[z].product){
                     yPos -= .5;
                   }
                 }
               }
             }
*/
             yPositions.push({task: tasksAsXPos[i].tasks[j], yPos: yPos});
           }
         }
       }
     }

     for(i = 0; i < yPositions.length; i++){ //task, yPos
       for(j = 0; j < howManyEdgesToTask.length; j++){ //task, count
         if(yPositions[i].task === howManyEdgesToTask[j].task){
           if(howManyEdgesToTask[j].count > 0){
             edgesToThisTask=[];
             for(u = 0; u < this.precedencesWithProducts.length; u++){ //task, product
               if(yPositions[i].task === this.precedencesWithProducts[u].product){
                 edgesToThisTask.push(this.precedencesWithProducts[u].task);
               }
             }
             middleItem = edgesToThisTask[edgesToThisTask.length % 2];
             y = 0;
             for(z = 0; z < yPositions.length; z++){ //task, yPos
               if(yPositions[z].task === middleItem){
                 if(edgesToThisTask.length % 2 !== 0){
                   y = yPositions[z].yPos;
                 }
                 else{
                   y = yPositions[z].yPos - yPosDist/2;
                 }
               }
             }
             yPositions[i].yPos = y;

             prevItem = "";
             for(u = 0; u < this.precedencesWithProducts.length; u++){ //task, product
               if(middleItem === this.precedencesWithProducts[u].task){
                 prevItem = this.precedencesWithProducts[u].product;
               }
             }

             for(z = 0; z < sortedProductWithTasks.length; z++){  //product tasks[]
               for(t = 0; t < sortedProductWithTasks[z].tasks.length; t++){ 
                 for(u = 0; u < this.precedencesWithProducts.length; u++){ //task, product
                   if(this.precedencesWithProducts[u].task === prevItem){
                     y = 0;
                     for(r = 0; r < yPositions.length; r++){ //task, yPos
                       if(prevItem === yPositions[r].task){
                         y = yPositions[r].yPos;
                       }
                     }
                     for(r = 0; r < yPositions.length; r++){ //task, yPos
                       if(this.precedencesWithProducts[u].product === yPositions[r].task){
                         yPositions[r].yPos = y;
                       }
                     }
                     prevItem = this.precedencesWithProducts[u].product;
                   }
                 }
               }
             }
           }
         }
       }
     }

     productsWithMultipleInEdges = [];
     for(i = 0; i < sortedProductWithTasks.length; i++){ //product tasks[]
       for(j = 0; j < sortedProductWithTasks[i].tasks.length; j++){ 
         for(u = 0; u < howManyEdgesToTask.length; u++){ //task, count
           if(howManyEdgesToTask[u].task === sortedProductWithTasks[i].tasks[j]){
             productsWithMultipleInEdges.push(sortedProductWithTasks[i].product);
           }
         }
       }
     }

     for(i = 0; i < sortedProductWithTasks.length; i++){ //product tasks[]
       yes = true;
       for(j = 0; j < productsWithMultipleInEdges.length; j++){
         if(productsWithMultipleInEdges[j] === sortedProductWithTasks[i].product){
           yes = false;
         }
       }
       if(yes){
         y = 0;
         for(j = 0; j < yPositions.length; j++){ //task, yPos
           for(u = 0; u < sortedProductWithTasks[i].tasks.length; u++){
             if(yPositions[j].task === sortedProductWithTasks[i].tasks[u]){
               y = yPositions[j].yPos;
               break;
             }
           }
           if(y !== 0){
             break;
           }
         }
         for(j = 0; j < yPositions.length; j++){ //task, yPos
           for(u = 0; u < sortedProductWithTasks[i].tasks.length; u++){
             if(yPositions[j].task === sortedProductWithTasks[i].tasks[u]){
               yPositions[j].yPos = y;
             }
           }
         }
       }
     }

     for(i = 0; i < sortedProductWithTasks.length; i++){ //product tasks[]
      /* Search x position */
       for(j = 0; j < sortedProductWithTasks[i].tasks.length; j++){ //product tasks[]
         xPos = 0;
         for(u = 0; u < xPositions.length; u++){ //task, xPos
         if(xPositions[u].task === sortedProductWithTasks[i].tasks[j]){
           xPos = xPositions[u].xPos;
         }
       }

      /* Search y position */
       yPos = 0;
       for(u = 0; u < yPositions.length; u++){ //task, yPos
         if(yPositions[u].task === sortedProductWithTasks[i].tasks[j]){
           yPos = yPositions[u].yPos;
         }
       }
       
       /* Add task/product to schedGraphTxt */
       this.schedGraphTxt += " \"";

       p = "";
       for(u = 0; u < sortedProductWithTasks[i].tasks[j].length; u++){
         if(sortedProductWithTasks[i].tasks[j][u] === "\""){
           p += "\\" + sortedProductWithTasks[i].tasks[j][u];
         }
         else{
           p += sortedProductWithTasks[i].tasks[j][u];
         }
       }

       if(p[p.length - 1] === "\\"){
        p += " ";
      }

       this.schedGraphTxt += p + "\" [ pos=\"" + xPos + "," + yPos + "\", label = < <B>\\N</B><BR/>";

       isProduct = false;
       for(u = 0; u < this.products.length; u++){
         if(sortedProductWithTasks[i].tasks[j] === this.products[u]){
           isProduct = true;
         }
       }
       if(!isProduct){
         this.schedGraphTxt += "{";
         /* Add equipments to task*/
         for(u = 0; u < this.taskEquipment.length; u++){ //task, eqs[]
           if(this.taskEquipment[u].task === sortedProductWithTasks[i].tasks[j]){
             for(z = 0; z < this.taskEquipment[u].eqs.length; z++){
               this.schedGraphTxt += this.taskEquipment[u].eqs[z] +",";
             }
           }
         }
         this.schedGraphTxt = this.schedGraphTxt.substring(0,this.schedGraphTxt.length-1);
         this.schedGraphTxt += "}";
       }
       this.schedGraphTxt += "> ]";
     }
    }

   /* for(j = 0; j < this.schedPrecedencesWithProducts.length; j++){ //task, product, schedEdge(true/false)
      //if(this.schedPrecedencesWithProducts[j].schedEdge){
       // console.log(this.schedPrecedencesWithProducts[j].task + " " + this.schedPrecedencesWithProducts[j].product + " " + this.schedPrecedencesWithProducts[j].schedEdge);
     // }
    }*/

    /* Search minimum proctime to task */

    this.schedTasksArray.push({task: "--"});

    t = [];
    r = [];
    for(j = 1; j < this.schedTasksArray.length; j++){
     if(this.schedTasksArray[j].task === "--"){
       if(r.length > 0){
        t.push(r);
        r = [];
       }
     }
     else{
       r.push(this.schedTasksArray[j].task);
     }
    }
  /*  for(j = 0; j < t.length; j++){
      //console.log(t[j]);
    }*/

    for(i = 0; i < this.schedPrecedencesWithProducts.length; i++){ //task, product, schedEdge(true/false)

      t1 = "";
      for(u = 0; u < this.schedPrecedencesWithProducts[i].task.length; u++){
        if(this.schedPrecedencesWithProducts[i].task[u] === "\""){
          t1 += "\\" +  this.schedPrecedencesWithProducts[i].task[u];
        }
        else{
          t1 +=  this.schedPrecedencesWithProducts[i].task[u];
        }
      }

      if(t1[t1.length - 1] === "\\"){
        t1 += " ";
      }

      t2 = "";
      for(u = 0; u < this.schedPrecedencesWithProducts[i].product.length; u++){
        if( this.schedPrecedencesWithProducts[i].product[u] === "\""){
          t2 += "\\" +  this.schedPrecedencesWithProducts[i].product[u];
        }
        else{
          t2 +=  this.schedPrecedencesWithProducts[i].product[u];
        }
      }

      if(t2[t2.length - 1] === "\\"){
        t2 += " ";
      }
      if(!this.schedPrecedencesWithProducts[i].schedEdge){
        this.schedGraphTxt += "\"" + t1 + "\" -> \"" + t2 + "\"";

        this.allEdges.push({task1: t1, task2: t2});
      }


     if(this.schedPrecedencesWithProducts[i].schedEdge){
        i1 = -1;
        i2 = -1;
        for(j = 0; j < t.length; j++){
          for(u = 0; u < t[j].length; u++){
            if(t1 === t[j][u]){
              i1 = j;
            }
            if(t2 === t[j][u]){
              i2 = j;
            }
          }
        }

        if(i1 === i2){
          tempProctimes=[];
          tempTask = this.schedPrecedencesWithProducts[i].task;
          for(j = 0; j < this.proctimes.length; j++){
            if(this.proctimes[j].task === tempTask){
              tempProctimes.push(this.proctimes[j].proctime);
            }
          }
              
          minProctime = tempProctimes[0];
          for(j = 0; j < tempProctimes.length; j++){
            if(tempProctimes[j] < minProctime){
              minProctime = tempProctimes[j];
            }
          }

          if(!uis){
            tempT1 = "";
            for(j = 0; j < this.schedPrecedencesWithProducts.length; j++){ //task, product, schedEdge(true/false)
              if(!this.schedPrecedencesWithProducts[j].schedEdge){
                if(this.schedPrecedencesWithProducts[j].task === t1){
                  tempT1 = this.schedPrecedencesWithProducts[j].product;
                }
              }
            }
            t1 = tempT1;
            minProctime = -1;
          }

          this.schedGraphTxt += "\"" + t1 + "\" -> \"" + t2 + "\"";

          this.allEdges.push({task1: t1, task2: t2});
      
          if(minProctime !== -1){
            this.schedGraphTxt += " [ label = " + minProctime + ", style=\"dashed\"";
          }
          else{
            this.schedGraphTxt += " [ style=\"dashed\"";
          }

         /* addPenWidth = false;
          for(j = 0; j < this.longestPath.length; j++){ //task1, task2
            if(t1 === this.longestPath[j].task1 && t1 === this.longestPath[j].task1){
              addPenWidth = true;
            }
          }*/

          this.schedGraphTxt += " penwidth=\"@" + t1 + ";" + t2 + "@\" ]";
        }
      }
      else{
        tempProctimes=[];
        tempTask = this.schedPrecedencesWithProducts[i].task;
        for(j = 0; j < this.proctimes.length; j++){
          if(this.proctimes[j].task === tempTask){
            tempProctimes.push(this.proctimes[j].proctime);
          }
        }
          
        minProctime = tempProctimes[0];
        for(j = 0; j < tempProctimes.length; j++){
          if(tempProctimes[j] < minProctime){
            minProctime = tempProctimes[j];
          }
        }

        this.schedGraphTxt += " [ label = " + minProctime + " penwidth=\"@" + t1 + ";" + t2 + "@\" ]";

       /* addPenWidth = false;
        for(j = 0; j < this.longestPath.length; j++){ //task1, task2
          if(t1 === this.longestPath[j].task1 && t1 === this.longestPath[j].task1){
            addPenWidth = true;
          }
        }*/
      }
    }

   this.schedGraphTxt += "layout=\"neato\"";
   this.schedGraphTxt += "}";

   //console.log(this.schedGraphTxt);

   this.getLongestPath(this.schedGraphTxt);
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
     //  console.log(this.tasks[i]);
       
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
     this.recipieGraphTxtOut();

     this.updateTasksLength();
     this.updatePrecedencesLength();
     this.updateProctimesLength();

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

    if(this.uisNisChk){
      this.schedGraphTxtOut(true,false);
    }
    else{
      this.schedGraphTxtOut(true,true);
    }

    /*for(i = 0; i < this.taskEquipment.length; i++){ //task, eq, proctime
     // console.log(this.taskEquipment[i].task + " " + this.taskEquipment[i].eqs);
    }*/
   },

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

    for(i = 0; i < this.onlyTasks.length; i++){
      console.log(this.onlyTasks[i]);
    }
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
       if(this.proctimes[i].proctime[0] === '0'){
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