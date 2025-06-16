<template>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Global styles remain the same */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #343541;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  color: #ececf1;
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>
