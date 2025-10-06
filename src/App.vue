<!--
  Main application component
  Provides the root layout and global components
-->
<template>
  <div id="app">
    <Dashboard />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
</script>
