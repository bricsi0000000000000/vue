'use strict';

class Task {
    constructor(task_name, product_name) {
        this._name = task_name;
        this._product = product_name;
        this._equipment = '';
        this._proctime = -1;
    }

    get name(){
        return this._name;
    }

    get product(){
        return this._product;
    }

    get equipment(){
        return this._equipment;
    }
    set equipment(equipment){
        this._equipment = equipment;
    }

    get proctime(){
        return this._proctime;
    }
    set proctime(proctime){
        this._proctime = proctime;
    }
}
