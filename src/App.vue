<template>
  <el-container class="app-container">
    <el-aside width="250px">
      <nav-sidebar />
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
    <el-aside width="300px">
      <property-panel />
    </el-aside>
  </el-container>
</template>

<script setup>
import NavSidebar from '@/components/NavSidebar.vue'
import PropertyPanel from '@/components/PropertyPanel.vue'
</script>

<style lang="scss">
.app-container {
  height: 100vh;
  
  .el-aside {
    background: #f5f7fa;
    border-right: 1px solid #e6e6e6;
  }
  
  .el-main {
    padding: 0;
    position: relative;
  }
}
</style> 