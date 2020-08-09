"use strict";

class SchedGraphBuilder {
    constructor() {
        this._schedGraphText = "digraph SGraph { rankdir=LR  splines=true node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>,pin=true]";
        this._precedencesWithProducts = [];
        this._circleTaskPairs = [];
        this._longestPath = [];
        this._schedPrecedences = [];

        this.makePrecedencesWithProducts();
        this.buildGraph();
    }

    makePrecedencesWithProducts() {
        for (let precedence of main.precedenceManager.Precedences) {
            this._precedencesWithProducts.push(precedence);
        }
        for (let task of main.precedenceManager.GetLastTasks()) {
            this._precedencesWithProducts.push({ from: task, to: main.taskManager.GetProduct(task) });
        }
    }
    buildGraph() {
        let circle = new Circle(this._precedencesWithProducts);
        circle.CheckCircle();

        let coordinates = this.makeCoordinates();

        for (let coordinate of coordinates) {
            this._schedGraphText += '"' + coordinate.task + '" [ pos="' + coordinate.x + ',' + coordinate.y + '",';
            let get_task = main.taskManager.GetTask(coordinate.task);
            if(get_task !== null){
                this._schedGraphText += 'label = < <B>\\N</B><BR/>' + main.taskManager.GetTask(coordinate.task).equipment + '> ]';
            }
            else{
                this._schedGraphText += 'label = < <B>\\N</B><BR/>> ]';
            }
        }

        if (!main.circle) {
            this.makeLongestPath();
        }

        let precedences = [];
        for (let precedence of this._precedencesWithProducts) {
            precedences.push(precedence);
            this._schedGraphText += '"' + precedence.from + '" -> "' + precedence.to;
            this._schedGraphText += '" [ label = "';
            //let proctime = recipieBuilder.proctimeManager.GetMinimumProctime(precedence.from);
            let get_task = main.taskManager.GetTask(precedence.from);
            let proctime = get_task === null ? -1 : get_task.proctime;
            this._schedGraphText += proctime === -1 ? '' : proctime;
            this._schedGraphText += '" penwidth="';
            if (this.isInLongestPath(precedence.from, precedence.to) || circle.isInCircle(precedence.from, precedence.to)) {
                this._schedGraphText += '4';
            } else {
                this._schedGraphText += '1';
            }
            this._schedGraphText += '" ]';
        }

        for (let precedence of schedBuilder.sched_precedences) {
            if(this.isInPrecedences(precedence, precedences)){
                continue;
            }
            this._schedGraphText += '"' + precedence.from + '" -> "' + precedence.to + '" [ label = "';
            if(main.uis){
                //let proctime = recipieBuilder.proctimeManager.GetMinimumProctime(precedence.from);
                let get_task = main.taskManager.GetTask(precedence.from);
                let proctime = get_task === null ? -1 : get_task.proctime;
                this._schedGraphText += proctime === -1 ? '' : proctime;
            }
            this._schedGraphText += '" style="dashed" penwidth="';
            if (this.isInLongestPath(precedence.from, precedence.to) || circle.isInCircle(precedence.from, precedence.to)) {
                this._schedGraphText += '4';
            } else {
                this._schedGraphText += '1';
            }
            this._schedGraphText += '" ]';
        }

        this._schedGraphText += 'layout="neato"}';

       // console.log(this.sched_graph_text);
    }
    isInPrecedences(search_precedence, precedences){
        for(let precedence of precedences){
            if(precedence.from === search_precedence.from &&
               precedence.to === search_precedence.to)
            {
                return true;
            }
        }
        return false;
    }
    isInLongestPath(from, to) {
        for (let path of this._longestPath) {
            if (from === path.from && to === path.to) {
                return true;
            }
        }

        return false;
    }
    makeLongestPath() {
        let max_product = '';
        let path = { max_time: -1, tasks: [] };
        for (let product of main.productManager.Products) {
            let tmp_path = this.getLongestPath(product.name)[0];
            if (tmp_path.max_time > path.max_time) {
                path = tmp_path;
                max_product = product.name;
            }
        }

        this._longestPath = [];
        let index;
        for (index = 0; index < path.tasks.length - 1; index++) {
            this._longestPath.push({ from: path.tasks[index], to: path.tasks[index + 1] });
        }
        this._longestPath.push({ from: this._longestPath[this._longestPath.length - 1].to, to: max_product });

        main.ganttWidth = Math.round(path.max_time, 1) * 40 + 41;
        main.longestPathStartTask = path.tasks[1];
        main.longestPathEndTask = max_product;
        main.longestPathTime = path.max_time;
    }
    getLongestPath(task) {
        let path = []; //max_time, tasks[]
        let prev_tasks = []; //from, to, number

        let circle = new Circle(this._precedencesWithProducts);
        let all_edges = circle.allEdges();

        all_edges.forEach(edge => {
            if (task === edge.to) {
                let get_task = main.taskManager.GetTask(edge.from);
                prev_tasks.push({ from: edge.from, to: edge.to, n:  get_task === null ? 0 : get_task.proctime });
            }
        });

        let tasks = [];
        let max_task = '';
        let max = 0;
        prev_tasks.forEach(element => {
            let longest_path_hier = this.getLongestPath(element.from);
            if ((longest_path_hier[0].max_time + +element.n) > max) {
                max = longest_path_hier[0].max_time + +element.n;
                tasks = longest_path_hier[0].tasks;
                max_task = element.from;
            }
        });

        tasks.push(max_task);
        path.push({ max_time: max, tasks: tasks });

        return path;
    }
    makeCoordinates() {
        let coordinates = []; //task, x, y
        let product_with_tasks = this.getProductwithTasks();
        let x_distance = 2;
        let y_distance = 1;

        for (let product_task of product_with_tasks) {
            let x_position = 0;
            let index = 1;
            for (let task of product_task.tasks) {
                if (this.firstTask(task)) {
                    coordinates.push({ task: task, x: 0, y: 0 });
                } else {
                    x_position = x_distance * index;
                    index++;
                    coordinates.push({ task: task, x: x_position, y: 0 });
                }
            }
            x_position = x_distance * index;
            coordinates.push({ task: product_task.product, x: x_position, y: 0 });
        }

        for (let coordinate of coordinates) {
            let y_position = 0;

            let edges_to_task = this.getEdgesToTask(coordinate.task);

            let i;
            for (i = 0; i < edges_to_task.length; i++) {
                for (let c of coordinates) {
                    if (c.task === edges_to_task[i]) {
                        y_position = y_distance * i;
                        c.y -= y_position;
                    }
                }
            }

            let product = main.taskManager.GetProduct(coordinate.task);

            for (let c of coordinates) {
                for (let task of main.taskManager.Tasks) {
                    if (main.taskManager.GetProduct(task.name) === product) {
                        if (c.task === task.name) {
                            let yes = true;
                            for (let edge of edges_to_task) {
                                if (c.task === edge) {
                                    yes = false;
                                }
                            }
                            if (yes) {
                                c.y -= y_position / 2;
                            }
                        }
                    }
                }
                if (c.task === product) {
                    c.y -= y_position / 2;
                }
            }
        }

        let rows = this.makeRows();
        
        for (let row of rows) {
            let height = 0;
            for (let row_task of row.tasks) {
                for (let coordinate of coordinates) {
                    if (row_task === coordinate.task) {
                        if (coordinate.y < height) {
                            height = coordinate.y;
                        }
                    }
                }
            }
            row.height = height - y_distance;
        }

        let row_distance = -.3;
        let i;
        for (i = 1; i < rows.length; i++) {
            let height = row_distance * i;
            let index;
            for (index = 0; index < i; index++) {
                height += rows[index].height;
            }
            for (let row_task of rows[i].tasks) {
                for (let coordinate of coordinates) {
                    if (row_task === coordinate.task) {
                        coordinate.y += height;
                    }
                }
            }
        }

        return coordinates;
    }
    makeRows() {
        let rows = []; //product, tasks[]

        for (let product of main.productManager.Products) {
            let tasks = [];
            for (let task of main.taskManager.Tasks) {
                if (main.taskManager.GetProduct(task.name) === product.name) {
                    tasks.push(task.name);
                }
            }
            tasks.push(product.name);

            rows.push({ product: product.name, tasks: tasks, height: 0 });
        }

        return rows;
    }
    getEdgesToTask(task) {
        let edges_to_task = [];
        for (let precedence of this._precedencesWithProducts) {
            if (task === precedence.to) {
                edges_to_task.push(precedence.from);
            }
        }

        return edges_to_task;
    }
    firstTask(task) {
        let first_task = true;

        for (let precedence of this._precedencesWithProducts) {
            if (precedence.to === task) {
                first_task = false;
            }
        }

        return first_task;
    }
    getProductwithTasks() {
        let product_with_tasks = [];

        for (let product of main.productManager.Products) {
            product_with_tasks.push({ product: product.name, tasks: [] });
        }

        for (let task_product of product_with_tasks) {
            for (let task of main.taskManager.Tasks) {
                if (task_product.product === main.taskManager.GetProduct(task.name)) {
                    task_product.tasks.push(task.name);
                }
            }
        }

        return product_with_tasks;
    }
    canAddToGantt(task) {
        let add = true;

        this.gantt.forEach(g => {
            g.tasks.forEach(t => {
                if (t.task === task) {
                    add = false;
                }
            });
        });

        return add;
    }
    makeGanttDiagram() {
        if (!main.circle) {
            this.gantt = [];
            main.equipmentManager.Equipments.forEach(equipment => {
                this.gantt.push({ eq: equipment.name, tasks: [] });
            });

            this._precedencesWithProducts.forEach(precedence => {
                let act_equipment = main.taskManager.GetTask(precedence.from).equipment;
                let start_time = '';
                this.gantt.forEach(g => {
                    if (g.eq === act_equipment) {
                        let longest_path_hier = this.getLongestPath(precedence.from);

                        start_time = +longest_path_hier[0].max_time;
                        if (this.canAddToGantt(precedence.from)) {
                            g.tasks.push({ task: precedence.from, start_time: start_time, end_time: (start_time + +main.taskManager.GetTask(precedence.from).proctime) });
                        }
                    }
                });
            });

            let color = "black";
            let x = 0;
            let y = 0;
            let width = 0;
            const height = 40;
            const font_size = 15;
            const font_family = "Roboto";

            let width_unit = 40;
            let y_unit = height;

            let text_x = 10;
            let text_y = -15;

            let stroke_color = "#c7c7c7";

            document.getElementById("gantt-diagram").innerHTML = "";
            const svgNS = "http://www.w3.org/2000/svg";
            let index = 0;
            for (index = 0; index < this.gantt.length; index++) {
                width = 40;
                y = y_unit * index;
                color = "#333333";

                let rect = document.createElementNS(svgNS, "rect");
                rect.setAttributeNS(null, "id", "rect-" + this.gantt[index].eq);
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);
                rect.setAttributeNS(null, "width", width);
                rect.setAttributeNS(null, "height", height);
                rect.setAttributeNS(null, "fill", color);
                rect.setAttributeNS(null, "stroke", stroke_color);
                rect.setAttributeNS(null, "stroke-width", "1px");
                rect.setAttributeNS(null, "data-toggle", "tooltip");
                rect.setAttributeNS(null, "data-placement", "top");
                rect.setAttributeNS(null, "title", this.gantt[index].eq);
                document.getElementById("gantt-diagram").appendChild(rect);
                $("[data-toggle='tooltip']").tooltip();

                text_y += 40;
                color = "white";
                let txt = document.createElementNS(svgNS, "text");
                txt.setAttributeNS(null, "x", text_x);
                txt.setAttributeNS(null, "y", text_y);
                txt.setAttributeNS(null, "font-family", font_family);
                txt.setAttributeNS(null, "font-size", font_size);
                txt.setAttributeNS(null, "fill", color);
                let inner_text = this.gantt[index].eq + '';
                if (inner_text.length > 2) {
                    inner_text = inner_text.substring(0, 2) + '..';
                }
                let text_node = document.createTextNode(inner_text);
                txt.appendChild(text_node);
                txt.setAttributeNS(null, "data-toggle", "tooltip");
                txt.setAttributeNS(null, "data-placement", "top");
                txt.setAttributeNS(null, "title", this.gantt[index].eq);
                document.getElementById("gantt-diagram").appendChild(txt);
                $("[data-toggle='tooltip']").tooltip();
            }

            let offset = Math.ceil((main.longestPathTime + 1) / (document.getElementById("gantt-diagram").parentElement.offsetWidth / 40));

            x = +40;
            text_y = -15;
            index = 0;
            for (index = 0; index < this.gantt.length; index++) {
                let i;
                for (i = 0; i < this.gantt[index].tasks.length; i++) {

                    width = (this.gantt[index].tasks[i].end_time - this.gantt[index].tasks[i].start_time) * width_unit;
                    width /= offset;
                    y = y_unit * index;
                    x = this.gantt[index].tasks[i].start_time * 40;
                    x /= offset;
                    x += 40;
                    color = "#E2E2E2";

                    let rect = document.createElementNS(svgNS, "rect");
                    rect.setAttributeNS(null, "x", x);
                    rect.setAttributeNS(null, "y", y);
                    rect.setAttributeNS(null, "width", width);
                    rect.setAttributeNS(null, "height", height);
                    rect.setAttributeNS(null, "fill", color);
                    rect.setAttributeNS(null, "stroke", stroke_color);
                    rect.setAttributeNS(null, "stroke-width", "1px");
                    rect.setAttributeNS(null, "data-toggle", "tooltip");
                    rect.setAttributeNS(null, "data-placement", "top");
                    rect.setAttributeNS(null, "title", this.gantt[index].tasks[i].task);
                    document.getElementById("gantt-diagram").appendChild(rect);
                    $("[data-toggle='tooltip']").tooltip();

                    text_y = y + 25;
                    text_x = x + 5;
                    color = "#333333";
                    let txt = document.createElementNS(svgNS, "text");
                    txt.setAttributeNS(null, "x", text_x);
                    txt.setAttributeNS(null, "y", text_y);
                    txt.setAttributeNS(null, "font-family", font_family);
                    txt.setAttributeNS(null, "font-size", font_size);
                    txt.setAttributeNS(null, "id", this.gantt[index].tasks[i].task);
                    let inner_text = this.gantt[index].tasks[i].task + '';

                    let text_node = document.createTextNode(inner_text);
                    txt.appendChild(text_node);
                    document.getElementById("gantt-diagram").appendChild(txt);

                    let txt_width = txt.getBBox().width;

                    document.getElementById("gantt-diagram").removeChild(txt);

                    txt = document.createElementNS(svgNS, "text");
                    txt.setAttributeNS(null, "x", text_x);
                    txt.setAttributeNS(null, "y", text_y);
                    txt.setAttributeNS(null, "font-family", font_family);
                    txt.setAttributeNS(null, "font-size", font_size);
                    txt.setAttributeNS(null, "fill", color);
                    txt.setAttributeNS(null, "id", this.gantt[index].tasks[i].task);
                    inner_text = this.gantt[index].tasks[i].task + '';

                    if (width < txt_width) {
                        inner_text = inner_text.substring(0, (width / 40 * 3)) + '..';
                    }
                    text_node = document.createTextNode(inner_text);
                    txt.appendChild(text_node);
                    txt.setAttributeNS(null, "data-toggle", "tooltip");
                    txt.setAttributeNS(null, "data-placement", "top");
                    txt.setAttributeNS(null, "title", this.gantt[index].tasks[i].task);
                    document.getElementById("gantt-diagram").appendChild(txt);
                    $("[data-toggle='tooltip']").tooltip();
                }
            }

            y = main.equipmentManager.EquipmentsLength * 40;
            x = -40;
            text_x = 10;
            text_y = y + 25;

            index = 0;
            for (index = 0; index < main.longestPathTime + 2; index += offset) {
                x += 40;

                color = "white";
                let rect = document.createElementNS(svgNS, "rect");
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);
                rect.setAttributeNS(null, "width", 40);
                rect.setAttributeNS(null, "height", 40);
                rect.setAttributeNS(null, "fill", color);
                if (index > 0) {
                    rect.setAttributeNS(null, "stroke", stroke_color);
                    rect.setAttributeNS(null, "stroke-width", "1px");
                }
                rect.setAttributeNS(null, "data-toggle", "tooltip");
                rect.setAttributeNS(null, "data-placement", "top");
                rect.setAttributeNS(null, "title", index);
                document.getElementById("gantt-diagram").appendChild(rect);
                $("[data-toggle='tooltip']").tooltip();

                if (index < 10) {
                    text_x = x + 25;
                } else if (index < 100) {
                    text_x = x + 20;
                } else {
                    text_x = x + 15;
                }
                color = "#333333";
                if (index > 0) {
                    let txt = document.createElementNS(svgNS, "text");
                    txt.setAttributeNS(null, "x", text_x);
                    txt.setAttributeNS(null, "y", text_y);
                    txt.setAttributeNS(null, "font-family", font_family);
                    txt.setAttributeNS(null, "font-size", font_size);
                    txt.setAttributeNS(null, "fill", color);
                    let text_node = document.createTextNode(index);
                    txt.appendChild(text_node);
                    txt.setAttributeNS(null, "data-toggle", "tooltip");
                    txt.setAttributeNS(null, "data-placement", "top");
                    txt.setAttributeNS(null, "title", index);
                    document.getElementById("gantt-diagram").appendChild(txt);
                    $("[data-toggle='tooltip']").tooltip();
                }
            }
        } else {
            document.getElementById("gantt-diagram").innerHTML = "";
        }
    }

    get SchedGraphText() {
        //console.log(this._schedGraphText);
        return this._schedGraphText;
    }
}