Vue.use(VueDraggable.default);

var vm = new Vue({
  el: '#content',
  data() {
    const componentInstance = this
    return{
      options: {
        // dropzoneSelector: 'ul',
        // draggableSelector: 'li',
        // showDropzoneAreas: true,
        // multipleDropzonesItemsDraggingEnabled: true,
        //onDrop(event) {
          onDrop() {
          var schedTable = document.getElementById('schedTable').innerHTML;
          s = schedTable.split(">");
          tasks=[];
          for(i = 0; i < s.length; i++){ 
            if(s[i].indexOf("</span") !== -1){
              ss = s[i].split('<');
              taskWithEq = ss[0].split('/');
              tasks.push(taskWithEq[0]);
            }
          }
          componentInstance.dragAndDropList(tasks);
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
            //console.log('event is dropped out');
          }
        }
      },
     /*---------------RECIPIE BUILDER---------------*/
     products:["a","b","c"],
     productName: '',

     tasks: [
       "a1",
       "a2",
       "b1",
       "b2",
       "c1",
       "c2",
       "c3"
     ], 
     taskName: '',

     tasksAndProducts:[
       {"name":"a1","product":"a"},
       {"name":"a2","product":"a"},
       {"name":"b1","product":"b"},
       {"name":"b2","product":"b"},
       {"name":"c1","product":"c"},
       {"name":"c2","product":"c"},
       {"name":"c3","product":"c"}
     ], //name, product  //which task which product
     product:'',

     equipmentName:'',
     equipments: ["e1","e2"],

     warningTxt:"",

     task1:"",
     task2:"",
     precedences: [
       {"task1":"a1","task2":"a2"},
       {"task1":"b1","task2":"b2"},
       {"task1":"c1","task2":"c2"},
       {"task1":"c2","task2":"c3"}
     ], //task1, task2
     precedencesWithProducts:[
       {"task":"a1","product":"a2"},
       {"task":"a2","product":"a"},
       {"task":"b1","product":"b2"},
       {"task":"b2","product":"b"},
       {"task":"c1","product":"c2"},
       {"task":"c2","product":"c3"},
       {"task":"c3","product":"c"}
     ], //task, product

     proctimes:[
       {"task":"a1","eq":"e1","proctime":"2"},
       {"task":"a2","eq":"e1","proctime":"1"},
       {"task":"b1","eq":"e1","proctime":"3"},
       {"task":"b2","eq":"e2","proctime":"2"},
       {"task":"c1","eq":"e1","proctime":"1"},
       {"task":"c2","eq":"e1","proctime":"2"},
       {"task":"c3","eq":"e2","proctime":"2"}
     ], //task, eq, proctime
     proctime:"",
     proctime_task:"",
     proctime_eq:"",

     taskEquipment:[
       {"task":"a1","eqs":["e1"]},
       {"task":"a2","eqs":["e1"]},
       {"task":"b1","eqs":["e1"]},
       {"task":"b2","eqs":["e2"]},
       {"task":"c1","eqs":["e1"]},
       {"task":"c2","eqs":["e1"]},
       {"task":"c3","eqs":["e2"]}
     ], //task, eqs[] | which task which equipments

     tasksToEq:[], //eq[], tasks[]

     recipieGraphTxt:"",

     showWarningTxt:false,

     tmpTask1:["c1","c2","b2","a2","b1","c3","a1"],
     tmpTask2:["c1","c2","b2","a2","b1","c3","a1"],

     seenForms:true,

     /*---------------SchedGraphBuilder-------------*/
     schedSequence:[], //egyenlőre az a sorrend amit először bevittünk

     schedGraphTxt:"",

     schedPrecedencesWithProducts:[], //task, product, schedEdge(true/false)

     schedTasks:[], //task

     uisNisChk: "NIS", //UIS NIS
   }
 }, 
 methods:{
   uisNisSwitch(){
     if(this.uisNisChk === "NIS"){
       this.schedGraphTxtOut(true,true);
     }
     else if(this.uisNisChk === "UIS"){
       this.schedGraphTxtOut(true,false);
     }
   },
   dragAndDropList(tasks){
     this.schedTasks = [];
     for(i=0; i< tasks.length; i++){ //task
       this.schedTasks.push({task: tasks[i]});
     }

     if(this.uisNisChk === "NIS"){
       this.schedGraphTxtOut(true,false);
     }
     else if(this.uisNisChk === "UIS"){
       this.schedGraphTxtOut(true,true);
     }
   },
   /*---------------SchedGraphBuilder-------------*/
   switchForms(){
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

    /*  for(i=0; i< this.tasksToEq.length; i++){
        console.log(this.tasksToEq[i].eq + " " + this.tasksToEq[i].tasks);
      }*/

       this.schedGraphTxtOut(false,false);
     }
     else{
       this.recipieGraphTxtOut();
     }
   },
   NIS(){
     this.schedPrecedencesWithProducts=[];
     for(i=0; i< this.schedTasks.length; i++){ //task
       for(j=0; j< this.precedencesWithProducts.length; j++){  //task, product
         if(this.schedTasks[i].task === this.precedencesWithProducts[j].task){
           this.schedPrecedencesWithProducts.push({task: this.precedencesWithProducts[j].task, product: this.precedencesWithProducts[j].product, schedEdge:false});
         }
       }
     }

     addThis=[];
     for(i=0; i< this.schedPrecedencesWithProducts.length; i++){ //task, product, schedEdge(true/false)
       if(i < this.schedPrecedencesWithProducts.length - 1){
         if(this.schedPrecedencesWithProducts[i].product !== this.schedPrecedencesWithProducts[i+1].task){
           if(this.schedPrecedencesWithProducts[i].product !== this.schedPrecedencesWithProducts[i+1].product){
             addThis.push({task: this.schedPrecedencesWithProducts[i].product, product: this.schedPrecedencesWithProducts[i+1].task, schedEdge:true});
           }
         }
       }
     }

     for(i=0; i< addThis.length; i++){
       this.schedPrecedencesWithProducts.push({task: addThis[i].task, product: addThis[i].product, schedEdge: addThis[i].schedEdge});
     }
   },
   UIS(){
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
   longestPath(){
    for(i=0; i< this.schedPrecedencesWithProducts.length; i++){ //task, product, schedEdge(true/false)
      //console.log(this.schedPrecedencesWithProducts[i].task + " " + this.schedPrecedencesWithProducts[i].product + " " + this.schedPrecedencesWithProducts[i].schedEdge);
    }
   },
   schedGraphTxtOut(drag , uis){     
     if(!drag){
       this.schedTasks = this.taskEquipment;
     }

     if(uis){
       this.UIS();
     }
     else{
       this.NIS();
     }

     this.longestPath();

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
         if( sortedProductWithTasks[i].tasks[j][u] === "\""){
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


    for(j = 0; j < this.schedPrecedencesWithProducts.length; j++){ //task, product, schedEdge(true/false)
      console.log(this.schedPrecedencesWithProducts[j].task + " " + this.schedPrecedencesWithProducts[j].product + " " + this.schedPrecedencesWithProducts[j].schedEdge);
     }

    /* Search minimum proctime to task */
    for(i=0; i< this.schedPrecedencesWithProducts.length; i++){ //task, product, schedEdge(true/false)

      p = "";
      for(u = 0; u <  this.schedPrecedencesWithProducts[i].task.length; u++){
        if( this.schedPrecedencesWithProducts[i].task[u] === "\""){
          p += "\\" +  this.schedPrecedencesWithProducts[i].task[u];
        }
        else{
          p +=  this.schedPrecedencesWithProducts[i].task[u];
        }
      }

      if(p[p.length - 1] === "\\"){
        p += " ";
      }

     this.schedGraphTxt += "\"" + p + "\" -> \"";
     
     p = "";
     for(u = 0; u <  this.schedPrecedencesWithProducts[i].product.length; u++){
       if( this.schedPrecedencesWithProducts[i].product[u] === "\""){
         p += "\\" +  this.schedPrecedencesWithProducts[i].product[u];
       }
       else{
         p +=  this.schedPrecedencesWithProducts[i].product[u];
       }
     }

     if(p[p.length - 1] === "\\"){
       p += " ";
     }

     this.schedGraphTxt += p + "\"";

     tempProctimes=[];
     tempTask = this.schedPrecedencesWithProducts[i].task;
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

     style="";
     if(this.schedPrecedencesWithProducts[i].schedEdge == true){
       style = "dashed";
       if(!uis){
         minProctime = -1;
       }
     }

     if(minProctime === -1){
       this.schedGraphTxt += " [ label = \"\", style=\"" + style + "\" ]";
     }
     else{
       this.schedGraphTxt += " [ label = " + minProctime + ", style=\"" + style + "\" ]";
     }
   }

   this.schedGraphTxt += "layout=\"neato\"";
   this.schedGraphTxt += "}";

   var viz = new Viz();
   viz.renderSVGElement(this.schedGraphTxt)
   .then(function(element) {
     document.getElementById('schedGraph').innerHTML="";
     document.getElementById('schedGraph').appendChild(element);
   })
   .catch(error => {
     viz = new Viz();
     console.error(error);
   });

   //console.log(this.schedGraphTxt);
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
     }
     this.taskName='';
     this.product='';

     this.recipieGraphTxtOut();
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
      if(this.equipmentName.indexOf("\\\"") !== -1){ /*    ->    \"       */
        this.showWarning("EQ: equipment name contains wrong characters: \\\"");
      }
      else{
       this.equipments.push(this.equipmentName);
       this.deleteDuplicateEquipments();
      }
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

     this.recipieGraphTxtOut();
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
   },
   deleteProctimeFromHtml(id){
     this.proctimes.splice(id,1);
     this.updateProctimes();
     this.recipieGraphTxtOut();
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