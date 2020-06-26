"use strict";

class Task {
    constructor(task_name) {
        this.name = task_name;
        this.product = "";
        this.equipments = [];
        this.proctimes = [];
        this.equipment_and_proctime = {equipment: '', proctime: -1};
    }

    GetEquipment(search_equipment) {
        for (let equipment of this.equipments) {
            if (equipment === search_equipment) {
                return equipment;
            }
        }
        return null;
    }
    AddEquipment(new_equipment) {
        this.equipments.push(new_equipment);
    }
    RemoveEquipment(equipment) {
        let equipment_index = this.equipments.indexOf(equipment);
        this.equipments.splice(equipment_index, 1);
        return equipment_index;
    }

    GetProctime(search_proctime) {
        for (let proctime of this.proctimes) {
            if (proctime === search_proctime) {
                return proctime;
            }
        }

        return null;
    }
    AddProctime(new_proctime) {
        this.proctimes.push(new_proctime);
    }
    RemoveProctime(proctime) {
        this.proctimes.splice(this.proctimes.indexOf(proctime), 1);
    }

    SetEquipmentAndProctime(equipment, proctime) {
        if(this.equipment_and_proctime.proctime === -1 || proctime < this.equipment_and_proctime.proctime){
            this.equipment_and_proctime = { equipment: equipment, proctime: proctime };
        }
    }
    ChangeEquipmentAndProctime(equipment, proctime) {
        this.equipment_and_proctime = { equipment: equipment, proctime: proctime };
    }
    UpdateEquipmentAndProctime(){
        if(this.proctimes.length > 0){
            let min_proctime = this.proctimes[0];
            let min_index = 0;
            this.proctimes.forEach((proctime, index) => {
                if(proctime < min_proctime){
                    min_proctime = proctime;
                    min_index = index;
                }
            });

            this.equipment_and_proctime = { equipment: this.equipments[min_index], proctime: this.proctimes[min_index] };
        }
        else{
            this.equipment_and_proctime = {equipment: '', proctime: -1};
        }
    }
}
