'use strict';

class EquipmentManager{
  constructor(){
    this._equipments = [];
  }

  AddEquipment(new_equipment){
    this._equipments.push(new_equipment);
  }

  RemoveEquipment(equipment_name){
    this._equipments.forEach((equipment, index) => {
      if(equipment.name === equipment_name){
        this._equipments.splice(index, 1);
        return;
      }
    });
  }
  
  GetEquipment(equipment_name){
    for(let equipment of this._equipments){
      if(equipment.name === equipment_name){
        return equipment;
      }
    }

    return null;
  }

  get EquipmentsLength(){
    return this._equipments.length;
  }

  get Equipments(){
    return this._equipments;
  }

  ClearEquipments(){
    this._equipments = [];
  }
}