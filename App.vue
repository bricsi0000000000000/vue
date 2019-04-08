<template>
  <div>
    <precendence/>
  </div>
</template>

<script>
import precendence from './components/precendence.vue'

export default {
  name: 'app',
  components: {
    precendence,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
