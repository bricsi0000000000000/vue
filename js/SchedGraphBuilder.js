var schedGraphBuilder = new Vue({
  data(){
      return{
        schedGraphTxt:"",
        schedPrecedencesWithProducts:[], //task, product, schedEdge(true/false)
        schedTasks:[], 
        schedTasksArray:[], 
        lastInCol:[],
        allEdges:[], //task1, task2
        longestPath:[], //task1, task2
        circleTaskPairs: [], //task1, task2
      }
  },
  methods:{
    makeGantDiagram(){
      console.clear();
      if(!recipieBuilder.circle){

      /*  console.log("--precedences---");
        //UIS
        for(i = 0; i < recipieBuilder.precedences.length; i++){ //task1, task2
          console.log(recipieBuilder.precedences[i].task1 + " " + recipieBuilder.precedences[i].task2);
        }
*/
      /*  console.log("--tasksToEq---");
        for(i = 0; i < recipieBuilder.tasksToEq.length; i++){ //eq, tasks
          console.log(recipieBuilder.tasksToEq[i].eq + " " + recipieBuilder.tasksToEq[i].tasks);
        }

       /* console.log("--proctimes---");
        for(i = 0; i < recipieBuilder.proctimes.length; i++){ //task, eq, proctime
          console.log(recipieBuilder.proctimes[i].task + " " + recipieBuilder.proctimes[i].eq + " " + recipieBuilder.proctimes[i].proctime);
        }*/
      //  console.log("----------------------");

    
       /* act_tasks = []; //eq, tasks -> task, proctime

        for(i = 0; i < recipieBuilder.tasksToEq.length; i++){ //eq, tasks
          cur_eq = recipieBuilder.tasksToEq[i].eq;
          tasks = []; //task, proctime
          for(j = 0; j < recipieBuilder.tasksToEq[i].tasks.length; j++){
            cur_task = recipieBuilder.tasksToEq[i].tasks[j];

            yes = false;
            for(u = 0; u < act_tasks.length && yes; u++){ //eq, task, proctime
              if(cur_task === act_tasks[u].task){
                yes = true;
              }
            }
            if(!yes){
              cur_proctime = -1;
              for(u = 0; u < recipieBuilder.proctimes.length && cur_proctime === -1; u++){ //task, eq, proctime
                if(cur_task === recipieBuilder.proctimes[u].task){
                  cur_proctime = recipieBuilder.proctimes[u].proctime;
                }
              }
            
              tasks.push({task: cur_task, proctime: cur_proctime});
            }
          }

          act_tasks.push({eq: cur_eq, tasks: tasks});
        }

        console.log("-----act_tasks---");
        for(i = 0; i < act_tasks.length; i++){ //eq, tasks -> task, proctime
          console.log(act_tasks[i].eq);
          for(j = 0; j < act_tasks[i].tasks.length; j++){ 
            console.log(act_tasks[i].tasks[j].task + " " + act_tasks[i].tasks[j].proctime);
          }
        }

        console.log("--------");

        recipieBuilder.gant = []; //eq; tasks -> task, proctime, endTime(meddig)

        //ALAPHELYZET AZ ELSŐ PRODUCTAL
       // for(act_product_index = 0; act_product_index < recipieBuilder.products.length; act_product_index++){ 
         // cur_product = recipieBuilder.products[act_product_index];
        for(i = 0; i < act_tasks.length; i++){ //eq, tasks -> task, proctime
          cur_eq = act_tasks[i].eq;

          for(j = 0; j < act_tasks[i].tasks.length; j++){
            cur_task = act_tasks[i].tasks[j].task;
            cur_proctime = act_tasks[i].tasks[j].proctime;

            //console.log("cur_task: " + cur_task);

            first_product = false;
            for(u = 0; u < recipieBuilder.tasksAndProducts.length && !first_product; u++){ //name, product
              if(cur_task === recipieBuilder.tasksAndProducts[u].name){
                if(recipieBuilder.tasksAndProducts[u].product === recipieBuilder.products[0]){
                  first_product = true;
                }
              }
            }

            prev_task = "";

            start_task = true;
            for(u = 0; u < recipieBuilder.precedences.length && start_task; u++){ //task1, task2
              if(cur_task === recipieBuilder.precedences[u].task2){
                start_task = false;
                prev_task = recipieBuilder.precedences[u].task1;
              }
            }

            // console.log("prev_task: " + prev_task);

            if(first_product){
              if(start_task){
                tasks = [];
                tasks.push({task: cur_task, proctime: cur_proctime, endTime: cur_proctime});
                recipieBuilder.gant.push({eq: cur_eq, tasks: tasks});
              }
              else{
                tasks = [];

                current_row_proctime = +0;
                for(u = 0; u < recipieBuilder.gant.length; u++){ //eq; tasks -> task, proctime, endTime(meddig)
                  for(z = 0; z < recipieBuilder.gant[u].tasks.length; z++){ //task, proctime, endTime(meddig)
                    if(prev_task === recipieBuilder.gant[u].tasks[z].task){
                      current_row_proctime += +recipieBuilder.gant[u].tasks[z].endTime;
                      tasks.push({task: "üres", proctime: current_row_proctime, endTime: current_row_proctime + cur_proctime});
                      current_row_proctime += +cur_proctime;
                    }
                  }
                }

                tasks.push({task: cur_task, proctime: cur_proctime, endTime: current_row_proctime});
                recipieBuilder.gant.push({eq: cur_eq, tasks: tasks});
              }
            }
          }
        }
        //}

        console.log("----------recipieBuilder.gant------------");
        for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime(meddig)
          console.log(recipieBuilder.gant[i].eq);
          for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //eq; tasks -> task, proctime, endTime(meddig)
            console.log(recipieBuilder.gant[i].tasks[j].task + " " + recipieBuilder.gant[i].tasks[j].proctime + " " + recipieBuilder.gant[i].tasks[j].endTime);
          }
        }
        console.log("----------------------");

        recipieBuilder.gant = []; //eq; tasks -> task, proctime, endTime(meddig)

        //ALAPHELYZET AZ ELSŐ PRODUCTAL
       // for(act_product_index = 0; act_product_index < recipieBuilder.products.length; act_product_index++){ 
         // cur_product = recipieBuilder.products[act_product_index];
        for(i = 0; i < act_tasks.length; i++){ //eq, tasks -> task, proctime
          cur_eq = act_tasks[i].eq;

          for(j = 0; j < act_tasks[i].tasks.length; j++){
            cur_task = act_tasks[i].tasks[j].task;
            cur_proctime = act_tasks[i].tasks[j].proctime;

            //console.log("cur_task: " + cur_task);

            first_product = false;
            for(u = 0; u < recipieBuilder.tasksAndProducts.length && !first_product; u++){ //name, product
              if(cur_task === recipieBuilder.tasksAndProducts[u].name){
                if(recipieBuilder.tasksAndProducts[u].product === recipieBuilder.products[0]){
                  first_product = true;
                }
              }
            }

            prev_task = "";

            start_task = true;
            for(u = 0; u < recipieBuilder.precedences.length && start_task; u++){ //task1, task2
              if(cur_task === recipieBuilder.precedences[u].task2){
                start_task = false;
                prev_task = recipieBuilder.precedences[u].task1;
              }
            }

            // console.log("prev_task: " + prev_task);

            if(first_product){
              if(start_task){
                tasks = [];
                tasks.push({task: cur_task, proctime: cur_proctime, endTime: cur_proctime});
                recipieBuilder.gant.push({eq: cur_eq, tasks: tasks});
              }
              else{
                tasks = [];

                current_row_proctime = +0;
                for(u = 0; u < recipieBuilder.gant.length; u++){ //eq; tasks -> task, proctime, endTime(meddig)
                  for(z = 0; z < recipieBuilder.gant[u].tasks.length; z++){ //task, proctime, endTime(meddig)
                    if(prev_task === recipieBuilder.gant[u].tasks[z].task){
                      current_row_proctime += +recipieBuilder.gant[u].tasks[z].endTime;
                      tasks.push({task: "üres", proctime: current_row_proctime, endTime: current_row_proctime + cur_proctime});
                      current_row_proctime += +cur_proctime;
                    }
                  }
                }

                tasks.push({task: cur_task, proctime: cur_proctime, endTime: current_row_proctime});
                recipieBuilder.gant.push({eq: cur_eq, tasks: tasks});
              }
            }
          }
        }
        //}

        console.log("----------recipieBuilder.gant------------");
        for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime(meddig)
          console.log(recipieBuilder.gant[i].eq);
          for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //eq; tasks -> task, proctime, endTime(meddig)
            console.log(recipieBuilder.gant[i].tasks[j].task + " " + recipieBuilder.gant[i].tasks[j].proctime + " " + recipieBuilder.gant[i].tasks[j].endTime);
          }
        }
        console.log("----------------------");*/
        //A TÖBBI PRODUCT TASZKJAIT HELYRE RAKNI
       /* new_gantt = [];

        for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime(meddig)
          for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime(meddig)

          }
        }*/

        /*for(i = 0; i < act_tasks.length; i++){ //eq, tasks -> task, proctime
          cur_eq = act_tasks[i].eq;
          tasks = []; //task, proctime, endTime

          for(j = 0; j < act_tasks[i].tasks.length; j++){
            cur_task = act_tasks[i].tasks[j].task;
            cur_proctime = act_tasks[i].tasks[j].proctime;

            cur_product = "";
            for(u = 0; u < recipieBuilder.tasksAndProducts.length && cur_product === ""; u++){ //name, product
              if(cur_task === recipieBuilder.tasksAndProducts[u].name){
                cur_product = recipieBuilder.tasksAndProducts[u].product;
              }
            }

            prev_task = "";
            start_task = true;
            for(r = 0; r < recipieBuilder.precedences.length && start_task; r++){ //task1, task2
              if(cur_task === recipieBuilder.precedences[r].task2){
                start_task = false;
                prev_task = recipieBuilder.precedences[r].task1;
              }
            }

            current_row_proctime = +0;
            for(u = 0; u < recipieBuilder.gant.length; u++){ //eq; tasks -> task, proctime, endTime(meddig)
              for(z = 0; z < recipieBuilder.gant[u].tasks.length; z++){ //task, proctime, endTime(meddig)
                if(prev_task === recipieBuilder.gant[u].tasks[z].task){
                  current_row_proctime = +recipieBuilder.gant[u].tasks[z].endTime;
                }
              }
            }

            if(cur_product === recipieBuilder.products[0]){
              console.log("cur_task: " + cur_task);
              tasks.push({task: cur_task, proctime: cur_proctime, endTime: current_row_proctime});
            }
            else{
              /*current_row_proctime += +cur_proctime;

              if(start_task){
                tasks.push({task: cur_task, proctime: cur_proctime, endTime: current_row_proctime});
              }
              else{

              }*/

             /* prev_gantt_task = "";
              for(u = 0; u < recipieBuilder.tasksToEq.length; u++){ //eq, tasks
                for(z = 1; z < recipieBuilder.tasksToEq.length; z++){
                  if(cur_task === recipieBuilder.tasksToEq[z]){
                    prev_gantt_task = recipieBuilder.tasksToEq[z - 1];
                  }
                }
              }*/

            /*  console.log("cur_task: " + cur_task + "\tcur_product: " + cur_product + "\tprev_task: " + prev_task + "\tstart_task: " + start_task/* + "\tprev_gantt_task: " + prev_gantt_task*///);
           // }
           
           

            /*if(not_first_product){
              console.log("cur_task: " + cur_task);
              prev_gantt_task = "";
              for(u = 0; u < recipieBuilder.tasksToEq.length; u++){ //eq, tasks
                for(z = 1; z < recipieBuilder.tasksToEq.length; z++){
                  if(cur_task === recipieBuilder.tasksToEq[z]){
                    prev_gantt_task = recipieBuilder.tasksToEq[z - 1];
                  }
                }
              }

              current_row_proctime = +0;

              for(u = 0; u < recipieBuilder.gant.length; u++){ //eq; tasks -> task, proctime, endTime(meddig)
                for(z = 0; z < recipieBuilder.gant[u].tasks.length; z++){ //task, proctime, endTime(meddig)
                  if(prev_gantt_task === recipieBuilder.gant[u].tasks[z].task){
                    current_row_proctime += +recipieBuilder.gant[u].tasks[z].endTime;
                    tasks.push({task: "üres", proctime: current_row_proctime, endTime: current_row_proctime + cur_proctime});
                    current_row_proctime += +cur_proctime;
                  }
                  else{
                    tasks.push({task: recipieBuilder.gant[u].tasks[z].task, proctime: recipieBuilder.gant[u].tasks[z].proctime, endTime: recipieBuilder.gant[u].tasks[z].endTime});
                  }
                }
              }
            }
            new_gantt.push({eq: cur_eq, tasks: tasks});
          }*/
         // new_gantt.push({eq: cur_eq, tasks: tasks});

       // }

        /*recipieBuilder.gant = [];
        for(u = 0; u < new_gantt.length; u++){ //eq; tasks -> task, proctime, endTime(meddig)
          recipieBuilder.gant.push({eq: new_gantt[u].eq, tasks: new_gantt[u].tasks});
        }

        console.log("----------recipieBuilder.gant------------");
        for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime(meddig)
          console.log(recipieBuilder.gant[i].eq);
          for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //eq; tasks -> task, proctime, endTime(meddig)
            console.log(recipieBuilder.gant[i].tasks[j].task + " " + recipieBuilder.gant[i].tasks[j].proctime + " " + recipieBuilder.gant[i].tasks[j].endTime);
          }
        }
        console.log("----------------------");
*/



        startTasks = [];
        for(i = 0; i < recipieBuilder.precedencesWithProducts.length; i++){ //task, product
          yes = true;
          for(j = 0; j < recipieBuilder.precedencesWithProducts.length && yes; j++){ //task, product
            if(recipieBuilder.precedencesWithProducts[i].task === recipieBuilder.precedencesWithProducts[j].product){
              yes = false;
            }
          }
          if(yes){
            startTasks.push(recipieBuilder.precedencesWithProducts[i].task);
          }
        }

        console.log("--startTasks---");
        for(i = 0; i < startTasks.length; i++){ 
          console.log(startTasks[i]);
        }

        console.log("--precedences---");
        for(i = 0; i < recipieBuilder.precedences.length; i++){ //task1, task2
          console.log(recipieBuilder.precedences[i].task1 + " " + recipieBuilder.precedences[i].task2);
        }

        console.log("--tasksToEq---");
        for(i = 0; i < recipieBuilder.tasksToEq.length; i++){ //eq, tasks
          console.log(recipieBuilder.tasksToEq[i].eq + " " + recipieBuilder.tasksToEq[i].tasks);
        }
        console.log("----------------------");

        recipieBuilder.gant = []; //eq; tasks -> task, proctime, endTime(meddig)

        for(i = 0; i < recipieBuilder.tasksToEq2.length; i++){ //eq, tasks
          currentEq = recipieBuilder.tasksToEq2[i].eq;
          tmpTasks = []; //task, proctime, endTime
          currentRowEndTime = +0;
          for(j = 0; j < recipieBuilder.tasksToEq2[i].tasks.length; j++){ 
            currentTask = recipieBuilder.tasksToEq2[i].tasks[j];
            
            start = false;
            for(u = 0; u < startTasks.length && !start; u++){ 
              if(startTasks[u] === currentTask){
                start = true;
              }
            }

            proctime = "";
            for(u = 0; u < recipieBuilder.proctimes.length && proctime === ""; u++){ //task, eq, proctime
              if(recipieBuilder.proctimes[u].task === currentTask){
                proctime = recipieBuilder.proctimes[u].proctime;
              }
            }

            currentRowEndTime += +proctime;

            prevTask = "";
            for(precedencesIndex = 0; precedencesIndex < recipieBuilder.precedences.length; precedencesIndex++){ //task1, task2
              if(recipieBuilder.precedences[precedencesIndex].task2 === currentTask){
                prevTask = recipieBuilder.precedences[precedencesIndex].task1;
              }
            }

            maxProctime = +0;
            for(gantIndex = 0; gantIndex < recipieBuilder.gant.length; gantIndex++){ //eq; tasks -> task, proctime, endTime
              for(gantTaskIndex = 0; gantTaskIndex < recipieBuilder.gant[gantIndex].tasks.length; gantTaskIndex++){ //task, proctime, endTime
                if(prevTask === recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].task){
                  //console.log("\t\t" + recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].task + " " + recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].endTime);
                  maxProctime = recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].endTime;
                  console.log("\t\tcur_task: " + currentTask + "\t\t" + maxProctime + "\t\t" + currentRowEndTime);
                }
              }
            }

            if(start){
              tmpTasks.push({task: currentTask, proctime: proctime, endTime: currentRowEndTime});
            }
            else{
              if(j === 0){
                tmpTasks.push({task: "", proctime: maxProctime, endTime: maxProctime});
                currentRowEndTime += +maxProctime;
                tmpTasks.push({task: currentTask, proctime: proctime, endTime: currentRowEndTime});
              }
              else{
                tmpTasks.push({task: currentTask, proctime: proctime, endTime: currentRowEndTime});
              }
            }
          }
          recipieBuilder.gant.push({eq: currentEq, tasks: tmpTasks});
        }
      
        console.log("---gant1---");
        for(i = 0; i < recipieBuilder.gant.length; i++){ //task, eq
          console.log(recipieBuilder.gant[i].eq);
          for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, eq
            console.log("\t" + recipieBuilder.gant[i].tasks[j].task + " " + recipieBuilder.gant[i].tasks[j].proctime + " " + recipieBuilder.gant[i].tasks[j].endTime);
          }
        }
        console.log("-----");


//assdfghjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj

        again = true;
        
        //while(again)
        for(ii = 0; ii < 3; ii++)
        {
          tmpGant = []; //eq; tasks -> task, proctime, endTime

          for(gantIndex = 0; gantIndex < recipieBuilder.gant.length; gantIndex++){ //eq; tasks -> task, proctime, endTime
            tmpTasks = []; //task, proctime, endTime
            currentEq = recipieBuilder.gant[gantIndex].eq;
            currentRowEndTime = +0;

            for(gantTaskIndex = 0; gantTaskIndex < recipieBuilder.gant[gantIndex].tasks.length; gantTaskIndex++){ //task, proctime, endTime
              //console.log("index: " + gantTaskIndex);
              currentTask = recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].task;
              currentProctime = recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].proctime;
            
              console.log("-------------");
              console.log("current Task: |" + currentTask + "|");
              start = false;
              for(u = 0; u < startTasks.length && !start; u++){ 
                if(startTasks[u] === currentTask){
                  start = true;
                }
              }

              currentRowEndTime += +currentProctime;

              if(!start && gantTaskIndex > 0){
                prevTasks = [];
                for(precedencesIndex = 0; precedencesIndex < recipieBuilder.precedences.length; precedencesIndex++){ //task1, task2
                  if(recipieBuilder.precedences[precedencesIndex].task2 === currentTask){
                    prevTasks.push(recipieBuilder.precedences[precedencesIndex].task1);
                  }
                }

                
               /*endTime = +0;
                for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    if(prevTask === tmpGant[i].tasks[j].task){
                      endTime = +tmpGant[i].tasks[j].endTime;
                    }
                  }
                }
              // console.log(endTime);
                if(endTime === +0){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(prevTask === recipieBuilder.gant[i].tasks[j].task){
                        endTime = +recipieBuilder.gant[i].tasks[j].endTime;
                      }
                    }
                  }
                }*/

                prevGantTask = "";

               /* for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    if(j > 0){
                      if(currentTask === tmpGant[i].tasks[j].task){
                        prevGantTask = tmpGant[i].tasks[j - 1].task;
                        prevGantTaskEndTime = tmpGant[i].tasks[j - 1].endTime;
                      }
                    }
                  }
                }*/
              // console.log("prevGantTask1: " + prevGantTask);
                if(prevGantTask === ""){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(j > 0){
                        if(currentTask === recipieBuilder.gant[i].tasks[j].task){
                          prevGantTask = recipieBuilder.gant[i].tasks[j - 1].task;
                        }
                      }
                    }
                  }
                }

                /*if(prevGantTaskEndTime === ""){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(j > 0){
                        if(currentTask === recipieBuilder.gant[i].tasks[j].task){
                          prevGantTaskEndTime = recipieBuilder.gant[i].tasks[j - 1].endTime;
                        }
                      }
                    }
                  }
                }*/
              // console.log("prevGantTask2: " + prevGantTask);


                currentEndtime = recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].endTime;
                prevTaskEndTime = "";
               /* prevGantTaskEndTimes = [];

                for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    if(j > 0){
                      for(u = 0; u < prevTasks.length; u++){
                        if(prevTasks[u] === tmpGant[i].tasks[j].task){
                          prevGantTaskEndTimes.push(tmpGant[i].tasks[j - 1].endTime);
                        }
                      }
                    }
                  }
                }
                if(currentTask === "a4"){
                  console.log("\t\t\telőtte\tprevGantTaskEndTimes: " + prevGantTaskEndTimes);
                }
                if(prevGantTaskEndTimes.length === +0){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(j > 0){
                        for(u = 0; u < prevTasks.length; u++){
                          if(prevTasks[u] === recipieBuilder.gant[i].tasks[j].task){
                            prevGantTaskEndTimes.push(recipieBuilder.gant[i].tasks[j - 1].endTime);
                          }
                        }
                      }
                    }
                  }
                }
                if(currentTask === "a4"){
                  console.log("\t\t\tutána\tprevGantTaskEndTimes: " + prevGantTaskEndTimes);
                }*/



                prevGantTaskEndTime = "";
                for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    if(j > 0){
                      if(currentTask === tmpGant[i].tasks[j].task){
                        prevGantTaskEndTime = tmpGant[i].tasks[j - 1].endTime;
                      }
                    }
                  }
                }
                if(currentTask === "a4"){
                  console.log("\t\t\telőtte\tprevGantTaskEndTime: " + prevGantTaskEndTime);
                }
                if(prevGantTaskEndTime === ""){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(j > 0){
                        if(currentTask === recipieBuilder.gant[i].tasks[j].task){
                          prevGantTaskEndTime = recipieBuilder.gant[i].tasks[j - 1].endTime;
                        }
                      }
                    }
                  }
                }
                if(currentTask === "a4"){
                  console.log("\t\t\tutána\tprevGantTaskEndTime: " + prevGantTaskEndTime);
                }







                prevProduct = "";
                currentProduct = "";

                for(i = 0; i < recipieBuilder.tasksAndProducts.length; i++){ //name, product
                  if(recipieBuilder.tasksAndProducts[i].name === prevTask){
                    prevProduct = recipieBuilder.tasksAndProducts[i].product;
                  }
                  if(recipieBuilder.tasksAndProducts[i].name === currentTask){
                    currentProduct = recipieBuilder.tasksAndProducts[i].product;
                  }
                }


                //console.log("currentTask: " + currentTask + "\tprevTask: " + prevTask + "\tprevGantTask: |" + prevGantTask+"|");
                //console.log("currentProduct: " + currentProduct + "\tprevProduct: " + prevProduct);
               // console.log("currentEndtime: " + currentEndtime + "\tgantEndTime: " + endTime + "\tcurrentProctime: " + currentProctime);
              // console.log(/*"endTime: " + endTime +*/// "prevGantTaskEndTime: " + prevGantTaskEndTime);
              // console.log("currentRowEndTime: " + currentRowEndTime);

                //SORBAN KÉBNE VÉGIGMENNI NEM PEDIG FENTRŐL LE

                //ha ez előtte lévő pl.: a2 -> a3 taszknak az endTime-ja (a2) kisebb mint az akt taszknak a kezdőtime-ja (a3) akkor
              /* if(prevGantTask === ""){
                  console.log("---------ÜRES--------");
                  console.log("currentTask: " + currentTask);
                  console.log("prevTask: " + prevTask);
                  console.log("currentEndtime: " + currentEndtime);
                  console.log("currentProctime: " + currentProctime);
                  console.log("gantEndTime: " + endTime);
                  console.log("---------ÜRESVÉGE--------");
                }
                else{*/
                  //if(prevProduct === currentProduct){

               // prevTasks = [];
                prevGanttTask = "";
                //prevGanttEndTime = +0;
                prevEndTimes = [];

                //prevTask
               /* for(precedencesIndex = 0; precedencesIndex < recipieBuilder.precedences.length; precedencesIndex++){ //task1, task2
                  if(recipieBuilder.precedences[precedencesIndex].task2 === currentTask){
                    prevTasks.push(recipieBuilder.precedences[precedencesIndex].task1);
                  }
                }*/

                //prevGanttTask
                for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    if(j > 0){
                      if(currentTask === tmpGant[i].tasks[j].task){
                        prevGanttTask = tmpGant[i].tasks[j - 1].task;
                      }
                    }
                  }
                }
                if(prevGanttTask === ""){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      if(j > 0){
                        if(currentTask === recipieBuilder.gant[i].tasks[j].task){
                          prevGanttTask = recipieBuilder.gant[i].tasks[j - 1].task;
                        }
                      }
                    }
                  }
                }

                //prevEndTime
                for(i = 0; i < tmpGant.length; i++){ //eq; tasks -> task, proctime, endTime
                  for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, proctime, endTime
                    for(u = 0; u < prevTasks.length; u++){ 
                      if(prevTasks[u] === tmpGant[i].tasks[j].task){
                        prevEndTimes.push(+tmpGant[i].tasks[j].endTime);
                      }
                    }
                    /*if(prevTask === tmpGant[i].tasks[j].task){
                      prevEndTime = +tmpGant[i].tasks[j].endTime;
                    }*/
                  }
                }
                if(prevEndTimes.length === +0){
                  for(i = 0; i < recipieBuilder.gant.length; i++){ //eq; tasks -> task, proctime, endTime
                    for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, proctime, endTime
                      for(u = 0; u < prevTasks.length; u++){ 
                        if(prevTasks[u] === recipieBuilder.gant[i].tasks[j].task){
                          prevEndTimes.push(+ recipieBuilder.gant[i].tasks[j].endTime);
                        }
                      }
                    }
                  }
                }

                endTime = -1;
                for(i = 0; i < prevEndTimes.length; i++){ 
                  if(prevEndTimes[i] > endTime){
                    endTime = prevEndTimes[i];
                  }
                }

                /*prevGantTaskEndTime = -1;
                for(i = 0; i < prevGantTaskEndTimes.length; i++){ 
                  if(prevGantTaskEndTimes[i] > prevGantTaskEndTime){
                    prevGantTaskEndTime = prevGantTaskEndTimes[i];
                  }
                }*/

                console.log("-----------------");
                console.log("currentTask: " + currentTask);
                console.log("prevTasks: " + prevTasks);
                console.log("prevGanttTask: |" + prevGanttTask + "|");
                //console.log("prevGanttEndTime: " + prevGanttEndTime);
                console.log("prevEndTimes: " + prevEndTimes);
                console.log("endTime: " + endTime);
                console.log("currentRowEndTime: " + currentRowEndTime);
                console.log("currentProctime: " + currentProctime);
                console.log("prevGantTaskEndTime: " + prevGantTaskEndTime);

                if(currentTask !== ""){
                  if((currentRowEndTime - currentProctime) < endTime){
                    console.log("(currentRowEndTime - currentProctime) < endTime");
                    
                    currentRowEndTime += +(endTime - prevGantTaskEndTime);
                    tmpTasks.push({task: "", proctime: (endTime  - prevGantTaskEndTime) , endTime: currentRowEndTime  - currentProctime});
                  }
                  else if (currentEndtime === endTime){
                    console.log("currentEndtime === endTime");
                    tmpTasks.push({task: "", proctime: currentProctime, endTime: currentRowEndTime});
                    currentRowEndTime += currentProctime;
                  }
                }
                tmpTasks.push({task: currentTask, proctime: currentProctime, endTime: currentRowEndTime});

                console.log("-----" + currentEq + "----");
                  for(i = 0; i < tmpTasks.length; i++){ 
                    console.log(tmpTasks[i].task + " " + tmpTasks[i].proctime + " " + tmpTasks[i].endTime);
                  }
                console.log("---------");
                //meg kell néznem a sorban az aktuális előtti taszkot, majd ki kell vonni
                //pl.: a1,b11,b3 -> a1,b11,üres,b3

                //recipieBuilder.gant[gantIndex].tasks[gantTaskIndex].endTime = endTime;
              }
              else{
                //console.log("\telse: " + currentTask + " " + start + " " + currentProctime);
                tmpTasks.push({task: currentTask, proctime: currentProctime, endTime: currentRowEndTime});
              }
            }

            // EGY KÜLÖN TÖMBE KELL RAKNI MERT VÉGTELEN CIKLUS
            tmpGant.push({eq: currentEq, tasks: tmpTasks});
          }

          
          if(tmpGant.length === recipieBuilder.gant){
            again = false;
          }
          console.log(ii);
          console.log("--tmpGant---");
          for(i = 0; i < tmpGant.length; i++){ //task, eq
            console.log(tmpGant[i].eq);
            for(j = 0; j < tmpGant[i].tasks.length; j++){ //task, eq
              console.log("\t" + tmpGant[i].tasks[j].task + " " + tmpGant[i].tasks[j].proctime + " " + tmpGant[i].tasks[j].endTime);
            }
          }
          console.log(tmpGant.length);
          console.log("-----");
  
          recipieBuilder.gant = [];
          for(i = 0; i < tmpGant.length; i++){ //task, eq
            recipieBuilder.gant.push({eq: tmpGant[i].eq, tasks: tmpGant[i].tasks});
          }
  
          console.log("--gant---");
          for(i = 0; i < recipieBuilder.gant.length; i++){ //task, eq
            console.log(recipieBuilder.gant[i].eq);
            for(j = 0; j < recipieBuilder.gant[i].tasks.length; j++){ //task, eq
              console.log("\t" + recipieBuilder.gant[i].tasks[j].task + " " + recipieBuilder.gant[i].tasks[j].proctime + " " + recipieBuilder.gant[i].tasks[j].endTime);
            }
          }
          console.log(recipieBuilder.gant.length);
          console.log("-----");

        }
        //fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

       // console.log("----------------------");
      
      
     
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
  
      /* console.log("-----------");
       for(i=0; i< this.schedTasksArray.length; i++){ 
        console.log(this.schedTasksArray[i].task);
       }*/
       /*for(i=0; i< this.lastInCol.length; i++){ 
        console.log("L " + this.lastInCol[i]);
       }*/
  
       if(recipieBuilder.uisNisChk){
        this.schedGraphTxtOut(true,false);
       }
       else{
        this.schedGraphTxtOut(true,true);
       }
    },
    makeSchedPrecedencesWithProducts(){
    this.schedPrecedencesWithProducts=[];
    for(i=0; i< this.schedTasks.length; i++){ //task
      for(j=0; j< recipieBuilder.precedencesWithProducts.length; j++){  //task, product
        if(this.schedTasks[i].task === recipieBuilder.precedencesWithProducts[j].task){
          this.schedPrecedencesWithProducts.push({task: recipieBuilder.precedencesWithProducts[j].task, product: recipieBuilder.precedencesWithProducts[j].product, schedEdge:false});
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
    getLongestPath(schedGraphText){
      this.circleCheck();
  
      if(!recipieBuilder.circle){
  
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
          a = []; //a1-ből a másik 2 taszk ami jön //piramis
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
            for(j = 0; j < recipieBuilder.proctimes.length; j++){ //task, eq, proctime
              if(recipieBuilder.proctimes[j].task === edges[i].task1){
                edges[i].time = -recipieBuilder.proctimes[j].proctime;
              }
            }
          }
  
          tasksWithProducts = recipieBuilder.tasks;
          for(i = 0; i < recipieBuilder.products.length; i++){
            yes = true;
            for(j = 0; j < tasksWithProducts.length; j++){
              if(tasksWithProducts[j] === recipieBuilder.products[i]){
                yes = false;
              }
            }
            if(yes){
              tasksWithProducts.push(recipieBuilder.products[i]);
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
  
     
        recipieBuilder.longestPathStartTask = longestPathStartTask;
        recipieBuilder.longestPathEndTask = longestPathEndTask;
        recipieBuilder.longestPathTime = -longestPathTime;
  
  
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
 
    //console.log(this.schedGraphTxt);
 
    this.getLongestPath(this.schedGraphTxt);
    this.makeGantDiagram();
    },
  }
});