'use strict';

class Product{
    constructor(product_name){
        this._name = product_name;
    }

    get name(){
        return this._name;
    }
}