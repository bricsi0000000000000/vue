var schedGraphBuilder = new Vue({
  data() {
    return {
      schedGraphTxt: "",
      schedPrecedencesWithProducts: [], //task, product, schedEdge(true/false)
      schedTasks: [],
      schedTasksArray: [],
      lastInCol: [],
      allEdges: [], //task1, task2
      longestPath: [], //task1, task2
      circleTaskPairs: [], //task1, task2
      gantt: [], //eq, tasks -> task, start_time, end_time
      nisSchedPrecedences: [], //task1, task2, proctime
      longestPathMembers: [],
    }
  },
  methods: {
    getProctime(task) {
      var proctime = -1;

      recipieBuilder.proctimes.forEach(p => {
        if (p.task === task) {
          proctime = p.proctime;
        }
      });

      return proctime;
    },
    getProctimeForDijkstra(task1, task2) {
      var proctime = -1;
      this.nisSchedPrecedences.forEach(n => {
        if (n.task1 === task1 && n.task2 === task2) {
          proctime = n.proctime;
        }
      });

      return proctime;
    },
    getProctime1(task1, task2, uis) {
      var proctime = -1;
      if (uis) {
        proctime = this.getProctime(task1);
      }
      else {
        this.schedPrecedencesWithProducts.forEach(s => {
          if (s.task == task1 && s.product == task2) {
            if (s.schedEdge) {
              proctime = 0;
            }
            else {
              proctime = this.getProctime(task1);
            }
          }
        });
      }

      return proctime;
    },
    getEquipment(task) {
      var equipment = "";
      recipieBuilder.taskEquipment.forEach(eq => { //task, eqs
        if (eq.task === task) {
          equipment = eq.eqs[0];
        }
      });

      return equipment;
    },
    getLongestPath(task, max) {
      var path = []; //max_time, tasks[]

      var prev_tasks = []; //task1, task2, n
      this.nisSchedPrecedences.forEach(element => { //task1, task2
        if (task === element.task2) {
          prev_tasks.push({ task1: element.task1, task2: element.task2, n: +0 });
        }
      });

      this.nisSchedPrecedences.forEach(p => {
        prev_tasks.forEach(element => {
          if (element.task1 === p.task1 && element.task2 == p.task2) {
            element.n = this.getProctimeForDijkstra(p.task1, p.task2);
          }
        });
      });

      var tasks = [];
      var max_task = "";
      var longest_path_hier;
      var max = 0;
      prev_tasks.forEach(element => {
        longest_path_hier = this.getLongestPath(element.task1, +0);
        if ((longest_path_hier[0].max_time  + +element.n) > max) {
          max = longest_path_hier[0].max_time  + +element.n;
          tasks = longest_path_hier[0].tasks;
          max_task = element.task1;
        }
      });
      tasks.push(max_task);

      path.push({max_time: max, tasks: tasks});

      return path;
    },
    drawLongestPath() {
      this.circleCheck();
      if (!recipieBuilder.circle) {
        var schedText = "";
        var text = this.schedGraphTxt.split("@");

        for (var i = 0; i < text.length; i++) {
          if (i % 2 === 0) {
            schedText += text[i];
          }
          else {
            var tempTasks = text[i].split(";");
            for (var j = 0; j < this.longestPath.length; j++) { //task1, task2
              if (tempTasks[0] === this.longestPath[j].task1 && tempTasks[1] === this.longestPath[j].task2) {
                schedText += "5";
              }
            }
          }
        }
      }
      else {
        var schedText = "";
        var text = this.schedGraphTxt.split("@");
        for (var i = 0; i < text.length; i++) {
          if (i % 2 === 0) {
            schedText += text[i];
          }
          else {
            var tempTasks = text[i].split(";");
            for (var j = 0; j < this.circleTaskPairs.length; j++) { //task1, task2
              if (tempTasks[0] === this.circleTaskPairs[j].task1 && tempTasks[1] === this.circleTaskPairs[j].task2) {
                schedText += "5";
              }
            }
          }
        }
      }

      var viz = new Viz();
      viz.renderSVGElement(schedText)
        .then(function (element) {
          document.getElementById('schedGraph').innerHTML = "";
          document.getElementById('schedGraph').appendChild(element);
        })
        .catch(error => {
          viz = new Viz();
          console.error(error);
        });
    },
    canAddToGantt(task){
      add = true;

      this.gantt.forEach(g => {
        g.tasks.forEach(t => {
          if(t.task === task){
            add = false;
          }
        });
      });

      return add;
    },
    async makeGantDiagram(uis) {
      if (!recipieBuilder.circle) {
        this.gantt = [];
        recipieBuilder.equipments.forEach(equipment => {
          this.gantt.push({ eq: equipment, tasks: [] });
        });

        this.schedPrecedencesWithProducts.forEach(s => {
          var act_eq = this.getEquipment(s.task);
          var add_task = "";
          var start_time = "";
          this.gantt.forEach(g => {
            if (g.eq === act_eq) {
              var longest_path_hier = this.getLongestPath(s.task, +0);

              /*longest_path_hier.forEach(g => {
                console.log(g.max_time);
                g.tasks.forEach(task => {
                  console.log(task);
                });
              });*/

              //console.log(longest_path_hier[0].max_time);

              start_time = +longest_path_hier[0].max_time;
             // console.log(start_time);
              if(this.canAddToGantt(s.task)){
                g.tasks.push({ task: s.task, start_time: start_time, end_time: (start_time + +this.getProctimeForDijkstra(s.task, s.product)) });
              }  
            }
          });
        });
         /*console.log("-------gantt----------");
         this.gantt.forEach(g => {
           console.log(g.eq);
           g.tasks.forEach(t => {
             console.log("\t" + t.task + " " + t.start_time + " " + t.end_time);
           });
         });*/

        var color = "black";
        var x = 0;
        var y = 0;
        var width = 0;
        const height = 40;
        var font_size = 15;
        var font_family = "Verdana";

        var width_unit = 40;
        var y_unit = height;

        var text_x = 10;
        var text_y = -15;

        document.getElementById("ganttDiagram").innerHTML = "";
        var svgNS = "http://www.w3.org/2000/svg";
        for (var i = 0; i < this.gantt.length; i++) {
          width = 40;
          y = y_unit * i;
          color = "black";

          rect = document.createElementNS(svgNS, "rect");
          rect.setAttributeNS(null, "x", x);
          rect.setAttributeNS(null, "y", y);
          rect.setAttributeNS(null, "width", width);
          rect.setAttributeNS(null, "height", height);
          rect.setAttributeNS(null, "fill", color);
          rect.setAttributeNS(null, "stroke", "black");
          rect.setAttributeNS(null, "stroke-width", "2px");
          document.getElementById("ganttDiagram").appendChild(rect);

          text_y += 40;
          color = "white";
          txt = document.createElementNS(svgNS, "text");
          txt.setAttributeNS(null, "x", text_x);
          txt.setAttributeNS(null, "y", text_y);
          txt.setAttributeNS(null, "font-family", font_family);
          txt.setAttributeNS(null, "font-size", font_size);
          txt.setAttributeNS(null, "fill", color);
          text_node = document.createTextNode(this.gantt[i].eq);
          txt.appendChild(text_node);
          document.getElementById("ganttDiagram").appendChild(txt);
        }

        x = +40;
        text_y = -15;
        for (var j = 0; j < this.gantt.length; j++) {
          for (var i = 0; i < this.gantt[j].tasks.length; i++) {
            width = (this.gantt[j].tasks[i].end_time - this.gantt[j].tasks[i].start_time) * width_unit;
            y = y_unit * j;
            x = 40 + this.gantt[j].tasks[i].start_time * 40;
            color = "grey";

            rect = document.createElementNS(svgNS, "rect");
            rect.setAttributeNS(null, "x", x);
            rect.setAttributeNS(null, "y", y);
            rect.setAttributeNS(null, "width", width);
            rect.setAttributeNS(null, "height", height);
            rect.setAttributeNS(null, "fill", color);
            rect.setAttributeNS(null, "stroke", "black");
            rect.setAttributeNS(null, "stroke-width", "2px");
            document.getElementById("ganttDiagram").appendChild(rect);

            text_y = y + 25;
            text_x = x + 10;
            color = "white";
            txt = document.createElementNS(svgNS, "text");
            txt.setAttributeNS(null, "x", text_x);
            txt.setAttributeNS(null, "y", text_y);
            txt.setAttributeNS(null, "font-family", font_family);
            txt.setAttributeNS(null, "font-size", font_size);
            txt.setAttributeNS(null, "fill", color);
            text_node = document.createTextNode(this.gantt[j].tasks[i].task);
            txt.appendChild(text_node);
            document.getElementById("ganttDiagram").appendChild(txt);
          }
        }
      }
      else {
        document.getElementById("ganttDiagram").innerHTML = "";
      }
    },
    getTasks(first) {
      var tasks = [];

      if (first) {
        for (var i = 0; i < recipieBuilder.tasksToEq2.length; i++) {
          tasks.push(recipieBuilder.tasksToEq2[i].eq);
          for (var j = 0; j < recipieBuilder.tasksToEq2[i].tasks.length; j++) {
            tasks.push(recipieBuilder.tasksToEq2[i].tasks[j]);
          }
        }

      }
      else {
        var schedTable = document.getElementsByClassName("schedTable");
        var texts = [];
        for (var i = 0; i < schedTable.length; i++) {
          texts.push(schedTable[i].innerHTML);
        }

        var datas = [];
        for (var i = 0; i < texts.length; i++) {
          datas.push(texts[i].split(">"));
        }

        for (var i = 0; i < datas.length; i++) {
          for (var j = 0; j < datas[i].length; j++) {
            if (datas[i][j].indexOf("</span") !== -1) {
              var data = datas[i][j].split('<');
              var taskWithEq = data[0].split('/');
              tasks.push(taskWithEq[0]);
            }
          }
        }
      }

      recipieBuilder.updateTasksToEq2(tasks);
      this.dragAndDropList(tasks);
    },
    dragAndDropList(tasks) {
      this.schedTasks = [];
      this.schedTasksArray = [];
      this.lastInCol = [];
      for (var i = 0; i < tasks.length; i++) {
        var yes = true;
        for (var j = 0; j < recipieBuilder.equipments.length; j++) {
          if (recipieBuilder.equipments[j] === tasks[i]) {
            yes = false;
          }
        }
        if (yes) {
          this.schedTasks.push({ task: tasks[i] });
          this.schedTasksArray.push({ task: tasks[i] });
        }
        else {
          this.schedTasksArray.push({ task: "--" });
          if (i > 0) {
            this.lastInCol.push(tasks[i - 1]);
          }
        }
      }

      if (recipieBuilder.uisNisChk) {
        this.waitForIt(true, false);
      }
      else {
        this.waitForIt(true, true);
      }
    },
    makeSchedPrecedencesWithProducts(uis) {
      this.schedPrecedencesWithProducts = [];
      for (var i = 0; i < recipieBuilder.precedencesWithProducts.length; i++) {  //task, product
        this.schedPrecedencesWithProducts.push({ task: recipieBuilder.precedencesWithProducts[i].task, product: recipieBuilder.precedencesWithProducts[i].product, schedEdge: false });
      }

      //if(recipieBuilder.uisNisChk){
      if (uis) {
        var addThese = []; //task1, task2
        for (var i = 0; i < this.schedTasksArray.length - 1; i++) { //task
          if (this.schedTasksArray[i].task !== "--") {
            if (this.schedTasksArray[i + 1].task !== "--") {
              addThese.push({ task1: this.schedTasksArray[i].task, task2: this.schedTasksArray[i + 1].task });
            }
          }
        }
      }
      else {
        var addThese = []; //task1, task2
        for (var i = 0; i < this.schedTasksArray.length - 1; i++) { //task
          if (this.schedTasksArray[i].task !== "--") {
            if (this.schedTasksArray[i + 1].task !== "--") {
              addThese.push({ task1: this.schedTasksArray[i].task, task2: this.schedTasksArray[i + 1].task });
            }
          }
        }
      }

      for (var i = 0; i < addThese.length; i++) { //task1, task2
        this.schedPrecedencesWithProducts.push({ task: addThese[i].task1, product: addThese[i].task2, schedEdge: true });
      }
    },
    isInStartTasks(start_tasks, task){
      var yes = false;

      for(var i = 0; i < start_tasks.length && !yes; i++){
        if(task === start_tasks[i]){
          yes = true;
        }
      }

      return yes;
    },
    getStartTasks(){
      var start_tasks = [];

      recipieBuilder.precedences.forEach( p => {
        var yes = true;
        for (var i = 0; i < recipieBuilder.precedences.length && yes; i++){
          if(p.task1 === recipieBuilder.precedences[i].task2){
            yes = false;
          }
        }

        if(yes){
          if(!this.isInStartTasks(start_tasks, p.task1)){
            start_tasks.push(p.task1);
          }
        }
      });

      return start_tasks;
    },
    getTask2s(compare_task){
      task2s = [];
      this.allEdges.forEach(a => {
        if(compare_task === a.task1){
          task2s.push(a.task2);
        }
      });

      return task2s;
    },
    getCircleTaskPairs(tmp_arr){
      for (var i = 0; i < tmp_arr.length - 1; i++) {
        yes = true;
        for (var u = 0; u < this.circleTaskPairs.length && yes; u++) {
          if (this.circleTaskPairs[u].task1 === tmp_arr[i] && this.circleTaskPairs[u].task2 === tmp_arr[i + 1]) {
            yes = false;
          }
        }
        if (yes) {
          this.circleTaskPairs.push({ task1: tmp_arr[i], task2: tmp_arr[i + 1] });
        }
      }
    },
    circleCheck() {
      recipieBuilder.circle = false;

      var startTasks = this.getStartTasks();

    
      for (var startTaskIndex = 0; startTaskIndex < startTasks.length; startTaskIndex++) {
        var task2S = this.getTask2s(startTasks[startTaskIndex]);

       

        var circleArr = []; //task, task2S, end
        circleArr.push({ task: startTasks[startTaskIndex], task2S: task2S, end: true });

        for (var r = 0; r < this.allEdges.length && !recipieBuilder.circle; r++) {
          var endTask = []; //task, task2S, end
          for (var i = 0; i < circleArr.length; i++) { //task, task2S, end
            if (circleArr[i].end) {
              endTask.push({ task: circleArr[i].task, task2S: circleArr[i].task2S, end: true });
            }
          }

          task2S = this.getTask2s(endTask[0].task2S[0]);

         
          //megnézem hogy ezek közül van e amivel kör lesz
          for (var i = 0; i < task2S.length && !recipieBuilder.circle; i++) {
            for (var j = 0; j < circleArr.length && !recipieBuilder.circle; j++) { //task, task2S, end
              if (task2S[i] === circleArr[j].task) {
                recipieBuilder.circle = true;
                //console.log(recipieBuilder.circle); 
                circleArr.push({ task: circleArr[circleArr.length - 1].task2S[0], task2S: [], end: false });
                circleArr.push({ task: task2S[i], task2S: [], end: false });
              }
            }
          }

          if (recipieBuilder.circle) {
            endTask = circleArr[circleArr.length - 1].task;
            var go = true;
            for (var i = 0; i < circleArr.length && go; i++) { //task, task2S, end
              if (circleArr[i].task === endTask) {
                go = false;
              }
            }

            var tmpArr = [];
            for (var j = i - 1; j < circleArr.length; j++) { //task, task2S, end
              tmpArr.push(circleArr[j].task);
            }

            this.circleTaskPairs = [];
            this.getCircleTaskPairs(tmpArr); //task1, task2
          }
          else {
            var end = task2S.length > 0;

            circleArr.push({ task: endTask[0].task2S[0], task2S: task2S, end: end });

            var tmpArr = [];
            for (var i = 1; i < endTask[0].task2S.length; i++) {
              tmpArr.push(endTask[0].task2S[i]);
            }

            endTask[0].task2S = tmpArr;

            circleArr[circleArr.length - 2] = endTask[0];

            for (var i = 0; i < circleArr.length; i++) { //task, task2S, end
              if (circleArr[i].task2S.length > 0) {
                circleArr[i].end = true;

                for (var j = 0; j < i; j++) { //task, task2S, end
                  circleArr[j].end = false;
                }
              }
            }

            //el kell venni az end utániakat
            var tmpArr = []; //task, task2S, end
            var go = true;
            for (var i = 0; i < circleArr.length && go; i++) { //task, task2S, end
              if (circleArr[i].end) {
                go = false;
                tmpArr.push({ task: circleArr[i].task, task2S: circleArr[i].task2S, end: circleArr[i].end });
              }
              else {
                tmpArr.push({ task: circleArr[i].task, task2S: circleArr[i].task2S, end: circleArr[i].end });
              }
            }

            var circleArr = [];//task, task2S, end
            for (var i = 0; i < tmpArr.length; i++) { //task, task2S, end
              circleArr.push({ task: tmpArr[i].task, task2S: tmpArr[i].task2S, end: tmpArr[i].end });
            }
          }
        }
      }
    },
    async schedGraphTxtOut(drag, uis) {
      if (!drag) {
        this.schedTasks = recipieBuilder.taskEquipment;
      }

      this.makeSchedPrecedencesWithProducts(uis);

      this.allEdges = [];

      recipieBuilder.equipmentsToTask();

      this.schedGraphTxt = "digraph SGraph { rankdir=LR  splines=true node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>,pin=true]";

      var xPosDist = 2;
      var yPosDist = 1.1;

      //Collect all task to product
      var productWithTasks = []; //product, tasks[]
      for (var i = 0; i < recipieBuilder.products.length; i++) {
        var add = [];
        var act_product = "";
        for (var j = 0; j < recipieBuilder.tasksAndProducts.length; j++) { //name, product
          if (recipieBuilder.products[i] === recipieBuilder.tasksAndProducts[j].product) {
            act_product = recipieBuilder.tasksAndProducts[j].product;
            add.push(recipieBuilder.tasksAndProducts[j].name);
          }
        }
        productWithTasks.push({ product: act_product, tasks: add });
      }

      /* Collect all precedence to product */
      var productWithPrecedence = []; //product, precedences[] - task1, task2
      for (var i = 0; i < productWithTasks.length; i++) { //product, tasks[]
        var add = [];
        for (var j = 0; j < productWithTasks[i].tasks.length; j++) {
          for (var u = 0; u < recipieBuilder.precedencesWithProducts.length; u++) { //task, product
            if (productWithTasks[i].tasks[j] === recipieBuilder.precedencesWithProducts[u].task) {
              add.push({ task1: recipieBuilder.precedencesWithProducts[u].task, task2: recipieBuilder.precedencesWithProducts[u].product });
            }
          }
        }
        productWithPrecedence.push({ product: productWithTasks[i].product, precedences: add });
      }

      /* Sort the productWithPrecedence array */
      /* Add first task to array */
      var sortedProductWithTasks = []; //product tasks[]
      for (var i = 0; i < productWithPrecedence.length; i++) { //product, precedences[] - task1, task2
        var add = [];
        for (var j = 0; j < productWithPrecedence[i].precedences.length; j++) {
          act_index = 0;
          for (var u = 0; u < productWithPrecedence[i].precedences.length; u++) {
            if (productWithPrecedence[i].precedences[j].task1 === productWithPrecedence[i].precedences[u].task2) {
              act_index++;
            }
          }
          if (act_index === 0) {
            add.push(productWithPrecedence[i].precedences[j].task1);
          }
        }
        sortedProductWithTasks.push({ product: productWithPrecedence[i].product, tasks: add });
      }

      /* Add the rest tasks to array */
      for (var i = 0; i < productWithPrecedence.length; i++) { //product, precedences[] - task1, task2
        for (var z = 0; z < productWithPrecedence[i].precedences.length; z++) { //product, precedences[] - task1, task2
          var add = "";
          for (var j = 0; j < sortedProductWithTasks[i].tasks.length; j++) { //product tasks[]
            for (var u = 0; u < productWithPrecedence[i].precedences.length; u++) {
              if (sortedProductWithTasks[i].tasks[j] === productWithPrecedence[i].precedences[u].task1) {
                add = productWithPrecedence[i].precedences[u].task2;
              }
            }
          }
          var yes = true;
          for (var j = 0; j < sortedProductWithTasks[i].tasks.length; j++) { //product tasks[]
            if (add === sortedProductWithTasks[i].tasks[j]) {
              yes = false;
            }
          }
          if (yes) {
            sortedProductWithTasks[i].tasks.push(add);
          }
        }
      }

      /* To which task goes multiple edges */
      var multipleTasksToOneProduct = []; //task, product, count
      for (var i = 0; i < recipieBuilder.precedencesWithProducts.length; i++) {  //task, product
        var act_task = recipieBuilder.precedencesWithProducts[i].task;
        var act_product = recipieBuilder.precedencesWithProducts[i].product;
        var act_index = -1;
        for (var j = 0; j < recipieBuilder.precedencesWithProducts.length; j++) {  //task, product
          if (recipieBuilder.precedencesWithProducts[j].product === act_product) {
            act_index++;
          }
        }
        multipleTasksToOneProduct.push({ task: act_task, product: act_product, count: act_index });
      }

      /* How many edges goes to a task */
      var howManyEdgesToTask = []; //task, count
      for (var i = 0; i < multipleTasksToOneProduct.length; i++) { //task, product, count
        if (multipleTasksToOneProduct[i].count > 0) {
          var add = true;
          for (var j = 0; j < howManyEdgesToTask.length; j++) { //task, count
            if (howManyEdgesToTask[j].task === multipleTasksToOneProduct[i].product) {
              add = false;
            }
          }
          if (add) {
            howManyEdgesToTask.push({ task: multipleTasksToOneProduct[i].product, count: 1 });
          }
          else {
            for (var j = 0; j < howManyEdgesToTask.length; j++) { //task, count
              if (howManyEdgesToTask[j].task === multipleTasksToOneProduct[i].product) {
                howManyEdgesToTask[j].count += 1;
              }
            }
          }
        }
      }

      /* X positions */
      var xPositions = []; //task, xPos
      for (var i = 0; i < sortedProductWithTasks.length; i++) { //product tasks[]
        var xPos = 0;
        for (var j = 0; j < sortedProductWithTasks[i].tasks.length; j++) {
          for (var u = 0; u < multipleTasksToOneProduct.length; u++) { //task, product, count
            if (sortedProductWithTasks[i].tasks[j] === multipleTasksToOneProduct[u].product) {
              if (multipleTasksToOneProduct[u].count > 0) {
                if (sortedProductWithTasks[i].tasks[j - 1] === multipleTasksToOneProduct[u].task) {
                  xPos += xPosDist;
                }
              }
              else {
                xPos += xPosDist;
              }
            }
          }
          xPositions.push({ task: sortedProductWithTasks[i].tasks[j], xPos: xPos });
        }
      }

      var tasksAsXPos = []; //xPos, tasks[]
      for (var i = 0; i < xPositions.length; i++) {  //task, xPos
        var add = [];
        for (var j = 0; j < xPositions.length; j++) {  //task, xPos
          if (xPositions[i].xPos === xPositions[j].xPos) {
            add.push(xPositions[j].task);
          }
        }
        var yes = true;
        for (var j = 0; j < tasksAsXPos.length; j++) { //xPos, tasks[]
          if (xPositions[i].xPos === tasksAsXPos[j].xPos) {
            yes = false;
          }
        }
        if (yes) {
          tasksAsXPos.push({ xPos: xPositions[i].xPos, tasks: add });
        }
      }

      /* Y positions */
      var yPositions = []; //task, yPos
      for (var i = 0; i < tasksAsXPos.length; i++) { //xPos, tasks[]
        for (var u = 0; u < xPositions.length; u++) { //task, xPos
          for (var j = 0; j < tasksAsXPos[i].tasks.length; j++) {
            var yes = true;
            for (var z = 0; z < yPositions.length; z++) { //task, yPos
              if (yPositions[z].task === tasksAsXPos[i].tasks[j]) {
                yes = false;
              }
            }
            if (yes) {
              yPos = 0 - j * yPosDist;

              /*HA KELL A SOROK KÖZÉ PLUSZ HELY AZT ITT KELL*/

              /*for (var  = 0; z < sortedProductWithTasks.length; z++){ //product, tasks[]
                for (var  = 0; t < sortedProductWithTasks[z].tasks.length; t++){
                  if(sortedProductWithTasks[z].tasks[t] === tasksAsXPos[i].tasks[j]){
                    if(z + 1 < sortedProductWithTasks.length){
                      if(sortedProductWithTasks[z + 1].product !== sortedProductWithTasks[z].product){
                       yPos += .5;
                      }
                    }
                  }
                }
              }*/

              /*  for (var  = 0; z < recipieBuilder.tasksAndProducts.length; z++){ //name, product
                  if(tasksAsXPos[i].tasks[j] === recipieBuilder.tasksAndProducts[z].name){
                    if(z + 1 < recipieBuilder.tasksAndProducts.length){
                      if(recipieBuilder.tasksAndProducts[z + 1].product !== recipieBuilder.tasksAndProducts[z].product){
                        yPos -= .5;
                      }
                    }
                  }
                }
   */
              yPositions.push({ task: tasksAsXPos[i].tasks[j], yPos: yPos });
            }
          }
        }
      }

      for (var i = 0; i < yPositions.length; i++) { //task, yPos
        for (var j = 0; j < howManyEdgesToTask.length; j++) { //task, count
          if (yPositions[i].task === howManyEdgesToTask[j].task) {
            if (howManyEdgesToTask[j].count > 0) {
              var edgesToThisTask = [];
              for (var u = 0; u < recipieBuilder.precedencesWithProducts.length; u++) { //task, product
                if (yPositions[i].task === recipieBuilder.precedencesWithProducts[u].product) {
                  edgesToThisTask.push(recipieBuilder.precedencesWithProducts[u].task);
                }
              }
              var middleItem = edgesToThisTask[edgesToThisTask.length % 2];
              var act_y_pos = 0;
              for (var z = 0; z < yPositions.length; z++) { //task, yPos
                if (yPositions[z].task === middleItem) {
                  if (edgesToThisTask.length % 2 !== 0) {
                    act_y_pos = yPositions[z].yPos;
                  }
                  else {
                    act_y_pos = yPositions[z].yPos - yPosDist / 2;
                  }
                }
              }
              yPositions[i].yPos = act_y_pos;

              var prevItem = "";
              for (var u = 0; u < recipieBuilder.precedencesWithProducts.length; u++) { //task, product
                if (middleItem === recipieBuilder.precedencesWithProducts[u].task) {
                  prevItem = recipieBuilder.precedencesWithProducts[u].product;
                }
              }

              for (var z = 0; z < sortedProductWithTasks.length; z++) {  //product tasks[]
                for (var t = 0; t < sortedProductWithTasks[z].tasks.length; t++) {
                  for (var u = 0; u < recipieBuilder.precedencesWithProducts.length; u++) { //task, product
                    if (recipieBuilder.precedencesWithProducts[u].task === prevItem) {
                      var act_y_pos = 0;
                      for (var r = 0; r < yPositions.length; r++) { //task, yPos
                        if (prevItem === yPositions[r].task) {
                          act_y_pos = yPositions[r].yPos;
                        }
                      }
                      for (var r = 0; r < yPositions.length; r++) { //task, yPos
                        if (recipieBuilder.precedencesWithProducts[u].product === yPositions[r].task) {
                          yPositions[r].yPos = act_y_pos;
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

      var productsWithMultipleInEdges = [];
      for (var i = 0; i < sortedProductWithTasks.length; i++) { //product tasks[]
        for (var j = 0; j < sortedProductWithTasks[i].tasks.length; j++) {
          for (var u = 0; u < howManyEdgesToTask.length; u++) { //task, count
            if (howManyEdgesToTask[u].task === sortedProductWithTasks[i].tasks[j]) {
              productsWithMultipleInEdges.push(sortedProductWithTasks[i].product);
            }
          }
        }
      }

      for (var i = 0; i < sortedProductWithTasks.length; i++) { //product tasks[]
        var yes = true;
        for (var j = 0; j < productsWithMultipleInEdges.length; j++) {
          if (productsWithMultipleInEdges[j] === sortedProductWithTasks[i].product) {
            yes = false;
          }
        }
        if (yes) {
          var act_y_pos = 0;
          for (var j = 0; j < yPositions.length; j++) { //task, yPos
            for (var u = 0; u < sortedProductWithTasks[i].tasks.length; u++) {
              if (yPositions[j].task === sortedProductWithTasks[i].tasks[u]) {
                act_y_pos = yPositions[j].yPos;
                break;
              }
            }
            if (act_y_pos !== 0) {
              break;
            }
          }
          for (var j = 0; j < yPositions.length; j++) { //task, yPos
            for (var u = 0; u < sortedProductWithTasks[i].tasks.length; u++) {
              if (yPositions[j].task === sortedProductWithTasks[i].tasks[u]) {
                yPositions[j].yPos = act_y_pos;
              }
            }
          }
        }
      }

      for (var i = 0; i < sortedProductWithTasks.length; i++) { //product tasks[]
        /* Search x position */
        for (var j = 0; j < sortedProductWithTasks[i].tasks.length; j++) { //product tasks[]
          var xPos = 0;
          for (var u = 0; u < xPositions.length; u++) { //task, xPos
            if (xPositions[u].task === sortedProductWithTasks[i].tasks[j]) {
              xPos = xPositions[u].xPos;
            }
          }

          /* Search y position */
          var yPos = 0;
          for (var u = 0; u < yPositions.length; u++) { //task, yPos
            if (yPositions[u].task === sortedProductWithTasks[i].tasks[j]) {
              yPos = yPositions[u].yPos;
            }
          }

          /* Add task/product to schedGraphTxt */
          this.schedGraphTxt += " \"";

          var act_product = "";
          for (var u = 0; u < sortedProductWithTasks[i].tasks[j].length; u++) {
            if (sortedProductWithTasks[i].tasks[j][u] === "\"") {
              act_product += "\\" + sortedProductWithTasks[i].tasks[j][u];
            }
            else {
              act_product += sortedProductWithTasks[i].tasks[j][u];
            }
          }

          if (act_product[act_product.length - 1] === "\\") {
            act_product += " ";
          }

          this.schedGraphTxt += act_product + "\" [ pos=\"" + xPos + "," + yPos + "\", label = < <B>\\N</B><BR/>";

          var isProduct = false;
          for (var u = 0; u < recipieBuilder.products.length; u++) {
            if (sortedProductWithTasks[i].tasks[j] === recipieBuilder.products[u]) {
              isProduct = true;
            }
          }
          if (!isProduct) {
            this.schedGraphTxt += "{";
            /* Add equipments to task*/
            for (var u = 0; u < recipieBuilder.taskEquipment.length; u++) { //task, eqs[]
              if (recipieBuilder.taskEquipment[u].task === sortedProductWithTasks[i].tasks[j]) {
                for (var z = 0; z < recipieBuilder.taskEquipment[u].eqs.length; z++) {
                  this.schedGraphTxt += recipieBuilder.taskEquipment[u].eqs[z] + ",";
                }
              }
            }
            this.schedGraphTxt = this.schedGraphTxt.substring(0, this.schedGraphTxt.length - 1);
            this.schedGraphTxt += "}";
          }
          this.schedGraphTxt += "> ]";
        }
      }

      /* Search minimum proctime to task */
      this.schedTasksArray.push({ task: "--" });

      var tasks = [];
      var r = [];
      for (var j = 1; j < this.schedTasksArray.length; j++) {
        if (this.schedTasksArray[j].task === "--") {
          if (r.length > 0) {
            tasks.push(r);
            r = [];
          }
        }
        else {
          r.push(this.schedTasksArray[j].task);
        }
      }
      /*  for (var  = 0; j < t.length; j++){
          //console.log(t[j]);
        }*/


      for (var i = 0; i < this.schedPrecedencesWithProducts.length; i++) { //task, product, schedEdge(true/false)

        t1 = "";
        for (var u = 0; u < this.schedPrecedencesWithProducts[i].task.length; u++) {
          if (this.schedPrecedencesWithProducts[i].task[u] === "\"") {
            t1 += "\\" + this.schedPrecedencesWithProducts[i].task[u];
          }
          else {
            t1 += this.schedPrecedencesWithProducts[i].task[u];
          }
        }

        if (t1[t1.length - 1] === "\\") {
          t1 += " ";
        }

        t2 = "";
        for (var u = 0; u < this.schedPrecedencesWithProducts[i].product.length; u++) {
          if (this.schedPrecedencesWithProducts[i].product[u] === "\"") {
            t2 += "\\" + this.schedPrecedencesWithProducts[i].product[u];
          }
          else {
            t2 += this.schedPrecedencesWithProducts[i].product[u];
          }
        }

        if (t2[t2.length - 1] === "\\") {
          t2 += " ";
        }
        if (!this.schedPrecedencesWithProducts[i].schedEdge) {
          this.schedGraphTxt += "\"" + t1 + "\" -> \"" + t2 + "\"";

          this.allEdges.push({ task1: t1, task2: t2 });
        }


        if (this.schedPrecedencesWithProducts[i].schedEdge) {
          i1 = -1;
          i2 = -1;
          for (var j = 0; j < t.length; j++) {
            for (var u = 0; u < t[j].length; u++) {
              if (t1 === t[j][u]) {
                i1 = j;
              }
              if (t2 === t[j][u]) {
                i2 = j;
              }
            }
          }

          if (i1 === i2) {
            tempProctimes = [];
            tempTask = this.schedPrecedencesWithProducts[i].task;
            for (var j = 0; j < recipieBuilder.proctimes.length; j++) {
              if (recipieBuilder.proctimes[j].task === tempTask) {
                tempProctimes.push(recipieBuilder.proctimes[j].proctime);
              }
            }

            minProctime = tempProctimes[0];
            for (var j = 0; j < tempProctimes.length; j++) {
              if (tempProctimes[j] < minProctime) {
                minProctime = tempProctimes[j];
              }
            }

            if (!uis) {
              tempT1 = "";
              for (var j = 0; j < this.schedPrecedencesWithProducts.length; j++) { //task, product, schedEdge(true/false)
                if (!this.schedPrecedencesWithProducts[j].schedEdge) {
                  if (this.schedPrecedencesWithProducts[j].task === t1) {
                    tempT1 = this.schedPrecedencesWithProducts[j].product;
                  }
                }
              }
              t1 = tempT1;
              minProctime = -1;
            }


            this.schedGraphTxt += "\"" + t1 + "\" -> \"" + t2 + "\"";

            this.allEdges.push({ task1: t1, task2: t2 });

            if (minProctime !== -1) {
              this.schedGraphTxt += " [ label = " + minProctime + ", style=\"dashed\"";
            }
            else {
              this.schedGraphTxt += " [ style=\"dashed\"";
            }
            this.nisSchedPrecedences.push({ task1: t1, task2: t2, proctime: minProctime });

            /* addPenWidth = false;
             for (var  = 0; j < this.longestPath.length; j++){ //task1, task2
               if(t1 === this.longestPath[j].task1 && t1 === this.longestPath[j].task1){
                 addPenWidth = true;
               }
             }*/

            this.schedGraphTxt += " penwidth=\"@" + t1 + ";" + t2 + "@\" ]";
          }
        }
        else {
          tempProctimes = [];
          tempTask = this.schedPrecedencesWithProducts[i].task;
          for (var j = 0; j < recipieBuilder.proctimes.length; j++) {
            if (recipieBuilder.proctimes[j].task === tempTask) {
              tempProctimes.push(recipieBuilder.proctimes[j].proctime);
            }
          }

          minProctime = tempProctimes[0];
          for (var j = 0; j < tempProctimes.length; j++) {
            if (tempProctimes[j] < minProctime) {
              minProctime = tempProctimes[j];
            }
          }

          this.schedGraphTxt += " [ label = " + minProctime + " penwidth=\"@" + t1 + ";" + t2 + "@\" ]";

          /* addPenWidth = false;
           for (var  = 0; j < this.longestPath.length; j++){ //task1, task2
             if(t1 === this.longestPath[j].task1 && t1 === this.longestPath[j].task1){
               addPenWidth = true;
             }
           }*/
        }
      }


      this.schedGraphTxt += "layout=\"neato\"";
      this.schedGraphTxt += "}";


      recipieBuilder.precedencesWithProducts.forEach(s => {
        var add = true;
        this.nisSchedPrecedences.forEach(n => {
          if (n.task1 == s.task && n.task2 == s.product) {
            add = false;
          }
        });
        if (add) {
          this.nisSchedPrecedences.push({ task1: s.task, task2: s.product, proctime: this.getProctime1(s.task, s.product, true) });
        }
      });

      this.nisSchedPrecedences.forEach(n => {
        if (n.proctime === -1) {
          n.proctime = +0;
        }
      });

      this.nisSchedPrecedences.forEach(n => {
        recipieBuilder.precedencesWithProducts.forEach(p => {
          if (n.task1 == p.task && n.task2 == p.product) {
            n.proctime = this.getProctime(n.task1);
          }
        });
      });

     /* console.log("nisSchedPrecedences");
      this.nisSchedPrecedences.forEach(n => {
        console.log(n.task1 + " " + n.task2 + " " + n.proctime);
      });
*/

      this.circleCheck();
      if(!recipieBuilder.circle){
        this.makeLongestPath();
      }
      else{
        this.drawLongestPath();
      }
    },
    makeLongestPath(){
      var max_product = "";
      var path = {max_time: -1, tasks:[]};
      recipieBuilder.products.forEach(p => {
        var tmp_path = this.getLongestPath(p)[0];
        if(tmp_path.max_time > path.max_time){
          path = tmp_path;
          max_product = p;
        }
      });


      this.longestPath = [];
      for(var i = 0; i < path.tasks.length - 1; i++){
        this.longestPath.push({task1: path.tasks[i], task2: path.tasks[i + 1]});
      }
      this.longestPath.push({task1: this.longestPath[this.longestPath.length - 1].task2, task2: max_product});

      recipieBuilder.ganttWidth = path.max_time * 40 + 41;

      this.drawLongestPath();
    },
    async waitForIt(drag, uis) {
      this.nisSchedPrecedences = []; //task1, task2, proctime

      await this.schedGraphTxtOut(drag, uis);

      /* console.log("schedPrecedencesWithProducts");
       this.schedPrecedencesWithProducts.forEach(n => {
         console.log(n.task + " " + n.product + " " + n.schedEdge);
       });*/


     /* console.log("nisSchedPrecedences");
      this.nisSchedPrecedences.forEach(n => {
        console.log(n.task1 + " " + n.task2 + " " + n.proctime);
      });
      console.log(this.getLongestPath("a1", +0));
*/
     /* this.getLongestPath("b", +0).forEach(g => {
        console.log(g.max_time);
        g.tasks.forEach(task => {
          console.log(task);
        });
      });*/

      this.makeGantDiagram(uis);
    }
  }
});