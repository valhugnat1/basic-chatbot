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
html, body {
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

/* Code block styles */
.markdown-body pre {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body code {
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-body pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}
</style>
