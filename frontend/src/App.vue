<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>


body, html {
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

.boundary {
  /*border-style: dashed;*/
  border-style: solid;
  border-color: #d3dce6;
  border-width: 0.5px;
  border-radius: 3px;
}

.mini_head {
    background: rgb(243, 243, 243);
    width: 100%;
    height: 25px;
    z-index: 9999;
}

.mini_title {
    font-family: 'Avenir Medium';
    height: 22px;
    font-size: 0.8em;
    padding-left: 4px;
    display: table-cell;
    vertical-align: middle;
    z-index: 9999;
}

</style>
