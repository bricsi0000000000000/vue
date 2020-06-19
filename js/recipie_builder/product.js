"use strict";

class Product{
    constructor(product_name){
        this.name = product_name;
    }

    get Product(){
        return this.name;
    }
    set Product(new_product){
        this.name = new_product;
    }
}