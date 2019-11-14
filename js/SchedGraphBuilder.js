var schedGraphBuilder = new Vue({
  data(){
      return{
        schedGraphTxt:"",
        schedPrecedencesWithProducts:[], //task, product, schedEdge(true/false)
        schedTasks:[], 
        schedTasksArray:[], 
        lastInCol:[],
        allEdges:[], //task1, task2
        //longestPathD:[], //task1, task2
        longestPath:[], //task1, task2
        circleTaskPairs: [], //task1, task2
        gantt: [], //eq, tasks -> task, start_time, end_time
      }
  },
  methods:{
    getProctime(task){
      proctime = -1;
      recipieBuilder.proctimes.forEach(p =>{
        if(p.task === task){
          proctime = p.proctime;
        }
      });
      return proctime;
    },
    getTask2DijkstraTime(iterations, task2){
      time = -1;
      iterations.forEach(i =>{
        if(i.task === task2){
          time = i.time;
        }
      });
      return time;
    },
    getEquipment(task){
      equipment = "";
      recipieBuilder.taskEquipment.forEach(eq => { //task, eqs
        if(eq.task === task){
          equipment = eq.eqs[0];
        }
      });

      return equipment;
    },
    dijkstra(){
      this.circleCheck();
      if(!recipieBuilder.circle){
        
        longest_path_times = []; //product, time
        recipieBuilder.products.forEach(p => {
          longest_path_times.push({product: p, time: this.getLongestPath(p, +0)});
        });

        max_time = -1;
        max_product = "";
        longest_path_times.forEach(l => {
          if(l.time > max_time){
            max_time = l.time;
            max_product = l.product;
          }
        });
        recipieBuilder.longestPathTime = max_time;
        recipieBuilder.ganttWidth = max_time * 40 + 41;

       /* longest_path_times.forEach(l => {
          console.log(l.product + " " + l.time);
        });*/

        startTasks = [];
        for(i = 0; i < this.allEdges.length; i++){ //task1, task2
          yes = true;
          for(j = 0; j < this.allEdges.length && yes; j++){ //task1, task2
            if(this.allEdges[i].task1 === this.allEdges[j].task2){
              yes = false;
            }
          }
          if(yes){
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

        iterations = []; //task, time, from_task, once
        //setup
        recipieBuilder.tasks.forEach(p => {
          iterations.push({task: p, time: Number.MAX_SAFE_INTEGER, from_task: "", once: false});
        }); 
        recipieBuilder.products.forEach(p => {
          iterations.push({task: p, time: Number.MAX_SAFE_INTEGER, from_task: "", once: false});
        }); 

        saved_iterations = [];
        startTasks.forEach(start_task =>{
          /*iterations.forEach(i => {
            saved_iterations.push(i);
          });*/
          //console.log(start_task);
          //kezdő taszkot beállítom
          iterations.forEach(i =>{ //task, time, from_task, once
            if(i.task === start_task){
              i.time = +0;
            }
          });

          go = false;
          k = 0;
          do{
            k++;
          
            changes = []; //iterations
            iterations.forEach(i =>{ //task, time, from_task, once
              approximate = "";
              min_time = Number.MAX_SAFE_INTEGER;
              iterations.forEach(j => {
                if(!j.once){
                  if(j.time < min_time){
                    min_time = j.time;
                    approximate = j;
                  }
                }
              });
              this.allEdges.forEach(edge =>{ //task1, task2
                if(approximate.task === edge.task1){
                  tmp_time = (approximate.time + -this.getProctime(approximate.task));
                  if (tmp_time < this.getTask2DijkstraTime(iterations, edge.task2)) {
                    changes.push({task: edge.task2, time: tmp_time, from_task: approximate.task, once: false});
                  }
                }
              });
              
              changes.push({task: approximate.task, time: approximate.time, from_task: approximate.from_task, once: true});

              changes.forEach(c =>{
                iterations.forEach(i =>{
                  if(c.task === i.task){
                    i.time = c.time;
                    i.from_task = c.from_task;
                    i.once = c.once;
                  }
                });
              });
            });

            go = false;
            iterations.forEach(i => {
              longest_path_times.forEach(l => {
                if(i.task === l.product){
                //  console.log(i.task + " " + -i.time + " | " + l.product + " " + l.time);
                  if(-i.time !== l.time){
                    go = true;
                  }
                }
              });
            });

          // console.log(go + " " + k);
          }
          while(k < 3);

          max_time = 0;
          max_product = "";

          iterations.forEach(i => {
            if(max_time > i.time){
              max_time = i.time;
              max_product = i;
            }
          });

          saved_max_time = 0;
          saved_max_product = "";

          saved_iterations.forEach(i => {
            if(saved_max_time > i.time){
              saved_max_time = i.time;
              saved_max_product = i;
            }
          });

          if(saved_max_time < max_time){
            saved_iterations = [];
            iterations.forEach(i => {
              saved_iterations.push(i);
            });
          }
        });


        task_pairs = []; //task1, task2
        iterations.forEach(i => {
          if(i.from_task !== ""){
            task_pairs.push({task1: i.from_task, task2: i.task});
          }
        });

        tmp_tasks = [];
        tmp_tasks1 = [];
        prev_tasks = []; //task1, task2
        go = true;
        do{
          tmp_tasks = [];
          task_pairs.forEach(i => { //task1, task2
            add = true;
            startTasks.forEach(s => {
              if(i.task1 === s){
                add = false;
                tmp_tasks.push(i);
              }
            });

            if(add){
              add = false;
              task_pairs.forEach(j => {
                if(i.task1 === j.task2){
                  add = true;
                }
              });

              if(add){
                tmp_tasks.push(i);
              }
            }
          });

          tmp_tasks1 = []; //task1, task2
          tmp_tasks.forEach(i => { //task1, task2
            add = true;
            if(i.task2 === max_product.task){
              add = false;
              tmp_tasks1.push(i);
            }

            if(add){
              add = false;
              tmp_tasks.forEach(j => {
                if(i.task2 === j.task1){
                  add = true;
                }
              });

              if(add){
                tmp_tasks1.push(i);
              }
            }
          });

          task_pairs = []; //task1, task2
          tmp_tasks1.forEach(t => {
            task_pairs.push(t);
          });

          if(prev_tasks.length === tmp_tasks1.length){
            go = false;
          }

          prev_tasks = [];
          tmp_tasks1.forEach(t => {
            prev_tasks.push(t);
          });
        }
        while(go);

        this.longestPath = []; //task1, task2
        prev_tasks.forEach(i => {
          this.longestPath.push(i);
        });

        /*this.longestPath.forEach(l => {
          console.log(l.task1 + " " +  this.getLongestPath(l.task1, +0) + " | " + l.task2 + " " + this.getLongestPath(l.task2, +0));
        });*/
      }

      this.longestPath.forEach(l =>{
        startTasks.forEach(s =>{
          if(l.task1 === s){
            recipieBuilder.longestPathStartTask = s;
          }
        });
      });
      recipieBuilder.longestPathEndTask = max_product.task;

      this.drawLongestPath();
    },
    getLongestPath(task, max){
      prev_tasks = []; //task, n
      this.schedPrecedencesWithProducts.forEach(element =>{ //task, product
        if(task === element.product){
          prev_tasks.push({task: element.task, n: +0});
        }
      });
  
      recipieBuilder.proctimes.forEach(p =>{
        prev_tasks.forEach(element =>{
          if(element.task === p.task){
            element.n = p.proctime;
          }
        });
      });

      prev_tasks.forEach(element => {
        longest_path_hier = this.getLongestPath(element.task, +0) + +element.n;
        if(longest_path_hier > max){
          max = longest_path_hier;
        //  max_task = element.task;
        }
      });
      //this.longestPath.push(max_task);
    
      return max;
    },
    drawLongestPath(){
      this.circleCheck();
      if(!recipieBuilder.circle){
        schedText = "";
        text = this.schedGraphTxt.split("@");
        
        for(i = 0; i < text.length; i++){ 
          if(i % 2 === 0){
            schedText += text[i];
          }
          else{
            tempTasks = text[i].split(";");
           // console.log(tempTasks[0] + " " + tempTasks[1]);
            for(j = 0; j < this.longestPath.length; j++){ //task1, task2
              if(tempTasks[0] === this.longestPath[j].task1 && tempTasks[1] === this.longestPath[j].task2){
                schedText += "5";
              }
            }
          }
        }
       // console.log(schedText);
      }
      else{
        schedText = "";
        text = this.schedGraphTxt.split("@");
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
    async makeGantDiagram(){
      if(!recipieBuilder.circle){
        this.gantt = [];
        recipieBuilder.equipments.forEach(equipment => {
          this.gantt.push({eq: equipment, tasks: []});
        });

       /* this.schedPrecedencesWithProducts.forEach(l => {
          console.log(l.task + " " + l.product + " " + this.getLongestPath(l.task, +0));
        });*/

        this.schedPrecedencesWithProducts.forEach(s => {
          act_eq = this.getEquipment(s.task);
          this.gantt.forEach(g => {
            if(g.eq === act_eq){
              start_time = +this.getLongestPath(s.task, +0);
              g.tasks.push({task: s.task, start_time: start_time, end_time: (start_time + +this.getProctime(s.task))});
            }
          });
        });

       /* console.log("-------gantt----------");
        this.gantt.forEach(g => {
          console.log(g.eq);
          g.tasks.forEach(t => {
            console.log("\t" + t.task + " " + t.start_time + " " + t.end_time);
          });
        });*/

        color = "black";
        x = 0;
        y = 0;
        width = 0;
        const height = 40;
        font_size = 15;
        font_family = "Verdana";
        
        width_unit = 40;
        y_unit = height;

        text_x = 10;
        text_y = -15;

        document.getElementById("ganttDiagram").innerHTML = "";
        svgNS = "http://www.w3.org/2000/svg";  
        for(i = 0; i < this.gantt.length; i++){
          width = 40;
          y = y_unit * i;
          color = "black";
          
          rect = document.createElementNS(svgNS,"rect");
          rect.setAttributeNS(null,"x",x);
          rect.setAttributeNS(null,"y",y);
          rect.setAttributeNS(null,"width",width);
          rect.setAttributeNS(null,"height", height);
          rect.setAttributeNS(null,"fill",color);
          rect.setAttributeNS(null,"stroke", "black");
          rect.setAttributeNS(null,"stroke-width", "2px");
          document.getElementById("ganttDiagram").appendChild(rect);

          text_y += 40;
          color = "white";
          txt = document.createElementNS(svgNS,"text");
          txt.setAttributeNS(null,"x",text_x);
          txt.setAttributeNS(null,"y",text_y);
          txt.setAttributeNS(null,"font-family",font_family);
          txt.setAttributeNS(null,"font-size", font_size);
          txt.setAttributeNS(null,"fill",color);
          text_node = document.createTextNode(this.gantt[i].eq);
          txt.appendChild(text_node);
          document.getElementById("ganttDiagram").appendChild(txt);
        }

        x = +40;
        text_y = -15;
        for(j = 0; j < this.gantt.length; j++){
          for(i = 0; i < this.gantt[j].tasks.length; i++){
            width = (this.gantt[j].tasks[i].end_time - this.gantt[j].tasks[i].start_time) * width_unit;
            y =  y_unit * j;
            x = 40 + this.gantt[j].tasks[i].start_time * 40;
            color = "grey";

            rect = document.createElementNS(svgNS,"rect");
            rect.setAttributeNS(null,"x",x);
            rect.setAttributeNS(null,"y",y);
            rect.setAttributeNS(null,"width",width);
            rect.setAttributeNS(null,"height", height);
            rect.setAttributeNS(null,"fill",color);
            rect.setAttributeNS(null,"stroke", "black");
            rect.setAttributeNS(null,"stroke-width", "2px");
            document.getElementById("ganttDiagram").appendChild(rect);
          
            text_y = y + 25;
            text_x = x + 10;
            color = "white";
            txt = document.createElementNS(svgNS,"text");
            txt.setAttributeNS(null,"x",text_x);
            txt.setAttributeNS(null,"y",text_y);
            txt.setAttributeNS(null,"font-family",font_family);
            txt.setAttributeNS(null,"font-size", font_size);
            txt.setAttributeNS(null,"fill",color);
            text_node = document.createTextNode(this.gantt[j].tasks[i].task);
            txt.appendChild(text_node);
            document.getElementById("ganttDiagram").appendChild(txt);
          }
        }

        /*this.gantt.forEach(g => {
          console.log(g.eq);
          g.tasks.forEach(t => {
            console.log("\t" + t.task + " " + t.start_time + " " + t.end_time);
          });
        });*/
      }
      else{
        document.getElementById("ganttDiagram").innerHTML = "";
      }
    },
    getTasks(first){
      tasks=[];
  
      if(first){
        for(i = 0; i < recipieBuilder.tasksToEq2.length; i++){ 
          tasks.push(recipieBuilder.tasksToEq2[i].eq);
          for(j = 0; j < recipieBuilder.tasksToEq2[i].tasks.length; j++){ 
            tasks.push(recipieBuilder.tasksToEq2[i].tasks[j]);
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
        console.log(tasks[i]);
      }*/
      recipieBuilder.updateTasksToEq2(tasks);
      this.dragAndDropList(tasks);
    },
    dragAndDropList(tasks){
      this.schedTasks = [];
      this.schedTasksArray = [];
      this.lastInCol = [];
      for(i=0; i< tasks.length; i++){ 
        yes = true;
        for(j = 0; j < recipieBuilder.equipments.length; j++){ 
          if(recipieBuilder.equipments[j] === tasks[i]){
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
  
       /*console.log("-----schedTasksArray-----");
       for(i=0; i< this.schedTasksArray.length; i++){ 
        console.log(this.schedTasksArray[i].task);
       }*/
       /*for(i=0; i< this.lastInCol.length; i++){ 
        console.log("L " + this.lastInCol[i]);
       }*/
  
       if(recipieBuilder.uisNisChk){
         this.waitForIt(true,false);
       }
       else{
         this.waitForIt(true,true);
       }
    },
    makeSchedPrecedencesWithProducts(){
      this.schedPrecedencesWithProducts = [];
      for(i = 0; i < recipieBuilder.precedencesWithProducts.length; i++){  //task, product
        this.schedPrecedencesWithProducts.push({task: recipieBuilder.precedencesWithProducts[i].task, product: recipieBuilder.precedencesWithProducts[i].product, schedEdge:false});
      }

      addThese = []; //task1, task2
      for(i = 0; i < this.schedTasksArray.length - 1; i++){ //task
        if(this.schedTasksArray[i].task !== "--"){
          if(this.schedTasksArray[i + 1].task !== "--"){
            addThese.push({task1: this.schedTasksArray[i].task, task2: this.schedTasksArray[i + 1].task});
          }
        }
      }

      for(i = 0; i < addThese.length; i++){ //task1, task2
        this.schedPrecedencesWithProducts.push({task: addThese[i].task1, product: addThese[i].task2, schedEdge:true});
      }
    },
    circleCheck(){
      recipieBuilder.circle = false;
    /* console.log("--this.alledges--");
      for(i = 0; i < this.allEdges.length; i++){ //task1, task2
        console.log(this.allEdges[i].task1 + " " + this.allEdges[i].task2);
      }*/

      //megkeresem a kezdő taszkokat
      startTasks = [];
      for(i = 0; i < recipieBuilder.precedences.length; i++){ //task1, task2
        yes = true;
        for(j = 0; j < recipieBuilder.precedences.length && yes; j++){ //task1, task2
          if(recipieBuilder.precedences[i].task1 === recipieBuilder.precedences[j].task2){
            yes = false;
          }
        }
        if(yes){
          //csak egyszer rakom bele őket
          for(j = 0; j < startTasks.length && yes; j++){
            if(recipieBuilder.precedences[i].task1 === startTasks[j]){
              yes = false;
            }
          }
          if(yes){
            startTasks.push(recipieBuilder.precedences[i].task1);
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

        for(r = 0; r < this.allEdges.length && !recipieBuilder.circle; r++){
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
          for(i = 0; i < task2S.length && !recipieBuilder.circle; i++){
            for(j = 0; j < circleArr.length && !recipieBuilder.circle; j++){ //task, task2S, end
              if(task2S[i] === circleArr[j].task){
                recipieBuilder.circle = true;
                //console.log("KÖR");
                circleArr.push({task: circleArr[circleArr.length - 1].task2S[0], task2S: [], end: false});
                circleArr.push({task: task2S[i], task2S: [], end: false});
              }
            }
          }

          if(recipieBuilder.circle){
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
    async schedGraphTxtOut(drag , uis){     
      if(!drag){
        this.schedTasks = recipieBuilder.taskEquipment;
      }
 
      this.makeSchedPrecedencesWithProducts();
 
      this.allEdges = [];
 
      recipieBuilder.equipmentsToTask();
 
      this.schedGraphTxt = "digraph SGraph { rankdir=LR  splines=true node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>,pin=true]";
 
      xPosDist = 2;
      yPosDist = 1.1;
 
      /* Collect all task to product  */
      productWithTasks=[]; //product, tasks[]
      for(i=0; i< recipieBuilder.products.length; i++){ 
        add = [];
        p = "";
        for(j=0; j< recipieBuilder.tasksAndProducts.length; j++){ //name, product
          if(recipieBuilder.products[i] === recipieBuilder.tasksAndProducts[j].product){
            p = recipieBuilder.tasksAndProducts[j].product;
            add.push(recipieBuilder.tasksAndProducts[j].name);
          }
        }
        productWithTasks.push({product: p, tasks: add});
      }
 
      /* Collect all precedence to product */
      productWithPrecedence=[]; //product, precedences[] - task1, task2
      for(i = 0; i < productWithTasks.length; i++){ //product, tasks[]
        add = [];
        for(j = 0; j < productWithTasks[i].tasks.length; j++){
          for(u = 0; u < recipieBuilder.precedencesWithProducts.length; u++){ //task, product
            if(productWithTasks[i].tasks[j] === recipieBuilder.precedencesWithProducts[u].task){
              add.push({task1: recipieBuilder.precedencesWithProducts[u].task, task2: recipieBuilder.precedencesWithProducts[u].product});
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
      for(i=0; i< recipieBuilder.precedencesWithProducts.length; i++){  //task, product
        t = recipieBuilder.precedencesWithProducts[i].task;
        p = recipieBuilder.precedencesWithProducts[i].product;
        c = -1;
        for(j=0; j< recipieBuilder.precedencesWithProducts.length; j++){  //task, product
          if(recipieBuilder.precedencesWithProducts[j].product === p){
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
 
            /*  for(z = 0; z < recipieBuilder.tasksAndProducts.length; z++){ //name, product
                if(tasksAsXPos[i].tasks[j] === recipieBuilder.tasksAndProducts[z].name){
                  if(z + 1 < recipieBuilder.tasksAndProducts.length){
                    if(recipieBuilder.tasksAndProducts[z + 1].product !== recipieBuilder.tasksAndProducts[z].product){
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
              for(u = 0; u < recipieBuilder.precedencesWithProducts.length; u++){ //task, product
                if(yPositions[i].task === recipieBuilder.precedencesWithProducts[u].product){
                  edgesToThisTask.push(recipieBuilder.precedencesWithProducts[u].task);
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
              for(u = 0; u < recipieBuilder.precedencesWithProducts.length; u++){ //task, product
                if(middleItem === recipieBuilder.precedencesWithProducts[u].task){
                  prevItem = recipieBuilder.precedencesWithProducts[u].product;
                }
              }
 
              for(z = 0; z < sortedProductWithTasks.length; z++){  //product tasks[]
                for(t = 0; t < sortedProductWithTasks[z].tasks.length; t++){ 
                  for(u = 0; u < recipieBuilder.precedencesWithProducts.length; u++){ //task, product
                    if(recipieBuilder.precedencesWithProducts[u].task === prevItem){
                      y = 0;
                      for(r = 0; r < yPositions.length; r++){ //task, yPos
                        if(prevItem === yPositions[r].task){
                          y = yPositions[r].yPos;
                        }
                      }
                      for(r = 0; r < yPositions.length; r++){ //task, yPos
                        if(recipieBuilder.precedencesWithProducts[u].product === yPositions[r].task){
                          yPositions[r].yPos = y;
                        }
                      }
                      prevItem = recipieBuilder.precedencesWithProducts[u].product;
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
        for(u = 0; u < recipieBuilder.products.length; u++){
          if(sortedProductWithTasks[i].tasks[j] === recipieBuilder.products[u]){
            isProduct = true;
          }
        }
        if(!isProduct){
          this.schedGraphTxt += "{";
          /* Add equipments to task*/
          for(u = 0; u < recipieBuilder.taskEquipment.length; u++){ //task, eqs[]
            if(recipieBuilder.taskEquipment[u].task === sortedProductWithTasks[i].tasks[j]){
              for(z = 0; z < recipieBuilder.taskEquipment[u].eqs.length; z++){
                this.schedGraphTxt += recipieBuilder.taskEquipment[u].eqs[z] +",";
              }
            }
          }
          this.schedGraphTxt = this.schedGraphTxt.substring(0, this.schedGraphTxt.length-1);
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
           for(j = 0; j < recipieBuilder.proctimes.length; j++){
             if(recipieBuilder.proctimes[j].task === tempTask){
               tempProctimes.push(recipieBuilder.proctimes[j].proctime);
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
         for(j = 0; j < recipieBuilder.proctimes.length; j++){
           if(recipieBuilder.proctimes[j].task === tempTask){
             tempProctimes.push(recipieBuilder.proctimes[j].proctime);
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
 
      this.dijkstra();
      
    },
    async waitForIt(drag , uis){
      await this.schedGraphTxtOut(drag , uis);
      this.makeGantDiagram();
    }
  }
});