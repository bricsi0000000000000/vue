<template>
<div>
  <!--task1-->
  <table class="procedenceTabla">
     <tr>
      <td>precedence</td>
    </tr>
    <tr>
      <td>task1</td>
    </tr>
    <tr>
      <td> 
        <form  @submit.prevent="addName">
          <input type="text" placeholder="Task neve..">
        </form>
      </td>
    </tr>
    <tr v-for="(data,index) in taskok" :key='index'>
        <td>{{data.taskNeve}}</td>
    </tr>
    <tr>
      <td>
        <form  @submit.prevent="addTask">
          <input type="text" placeholder="Új task.." v-model="taskNeve" >
        </form>
      </td>
   </tr>
  </table>

  <!--task2-->
  <table class="procedenceTabla">
     <tr>
      <td>precedence</td>
    </tr>
    <tr>
      <td>task2</td>
    </tr>
    <tr>
      <td> 
        <form  @submit.prevent="addName">
          <input type="text" placeholder="Task neve..">
        </form>
      </td>
    </tr>
    <tr v-for="(data,index) in taskok" :key='index'>
        <td>{{data.taskNeve}}</td>
    </tr>
    <tr>
      <td>
        <form  @submit.prevent="addTask">
          <input type="text" placeholder="Új task.." v-model="taskNeve" >
        </form>
      </td>
   </tr>
  </table>
  <button v-on:click="keszBtn">Kész</button>

  <table class="proctimeTabla">
    <tr>
      <td>proctime</td>
    </tr>
    <tr>
      <td>task name</td>
      <td>equipment name</td>
      <td>time</td>
    </tr>
    <tr>
       <td>
         <form  @submit.prevent="addTask">
          <input type="text" placeholder="Task neve.." v-model="taskNeve" >
        </form>
      </td>
       <td>
         <form  @submit.prevent="addTask">
          <input type="text" placeholder="Új gép.." v-model="gep" >
        </form>
      </td>
        <td>
         <form  @submit.prevent="addTask">
          <input type="text" placeholder="Új idő.." v-model="ido" >
        </form>
      </td>
    </tr>
   <!-- <tr v-for="(data,index) in taskok" :key='index'>
      <td>{{data.label}}</td>
      <td>
         <form  @submit.prevent="addEquipment">
          <input type="text" placeholder="Új gép.." v-model="equipment" >
        </form>
      </td>
      <td>
        <form  @submit.prevent="addIdo">
          <input type="text" placeholder="Új idő.." v-model="ido" >
        </form>
      </td>
    </tr>-->
  </table>
  <br>
  <br>
  <br>
  <br>
  <br>
  {{vizgraphSzoveg}}
</div>
</template>

<script>
export default {
  name: 'precendece',
  data() {
   return{
    taskNeve:'',
    task1vagy2:'',
    gep:'',
    ido:'',
    taskok:[{
      taskNeve:'',
      task1vagy2:'',
      gep:'',
      ido:'',
    }
    ],
   /* task1: '',
    tasks1:[],
    task2: '',
    tasks2:[],
    equipment:'',
    equipments:[],
    ido:'',
    idos:[],*/
    vizgraphSzoveg:'',
    }
 },
  methods:{
    addTask(){
      this.taskok.push({taskNeve: this.taskNeve, task1vagy2: this.task1vagy2, gep: this.gep, ido: this.gep})
    },
  /*  addTask1(){
      this.taskok.push({label: this.task1})
      this.tasks1.push({task1: this.task1})
      this.task1='';
    },
    addTask2(){
      this.taskok.push({label: this.task2})
      this.tasks2.push({task2: this.task2})
      this.task2='';
    },
    addEquipment(){
      this.equipments.push({equipment: this.equipment})
      this.equipment='';
    },
    addIdo(){
      this.idos.push({ido: this.ido})
      this.ido='';
    },*/
    keszBtn(){
      this.vizgraphSzoveg+="digraph SGraph { rankdir=LR node [shape=circle,fixedsize=true,width=0.9,label=<<B>\\N</B>>]";
      var i;
      for (i = 0; i < this.taskok.length; i++) {
        this.vizgraphSzoveg+=" " +  this.taskok[i].taskNeve;
        this.vizgraphSzoveg += "[ label = < <B>\\N</B><BR/>{" +  this.taskok[i].gep + "}> ]";
        this.vizgraphSzoveg+=this.taskok[i].taskNeve + " -> " + this.taskok[i+1].taskNeve
        + "[ label = " + this.taskok[i].ido + " ]";
      }
      /*for (i = 0; i < this.tasks2.length; i++) {
        this.vizgraphSzoveg+=" " +  this.tasks2[i].task2;
        this.vizgraphSzoveg += "[ label = < <B>\\N</B><BR/>{" +  this.equipments[i].equipment + "}> ]";
      }*/

     /* for (i = 0; i < this.tasks1.length; i++) {
        this.vizgraphSzoveg+=this.tasks1[i].task1 + " -> " + this.tasks2[i].task2
        + "[ label = " + this.idos[i].ido + " ]";
      }*/
    },
  }
}
</script>
<style scoped>
body{
  color: black;
}
.procedenceTabla{
  float: left;
  padding-left: 20px;
  padding-bottom: 10px;
}
.proctimeTabla{
  float: left;
  padding-left: 20px;
  padding-bottom: 10px;
}
td{
  padding: 5px;
}
</style>
