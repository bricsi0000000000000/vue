'use strict';

class ProductManager{
  constructor(){
    this._products = [];
  }

  AddProduct(new_product){
    this._products.push(new_product);
  }

  RemoveProduct(product_name){
    this._products.forEach((product, index) => {
      if(product.name === product_name){
        this._products.splice(index, 1);
        return;
      }
    });
  }
  
  GetProduct(product_name){
    for(let product of this._products){
      if(product.name === product_name){
        return product;
      }
    }

    return null;
  }

  get ProductsLength(){
    return this._products.length;
  }

  get Products(){
    return this._products;
  }

  ClearProducts(){
    this._products = [];
  }
}