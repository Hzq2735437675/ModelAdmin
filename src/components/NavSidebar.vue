<template>
  <div class="nav-sidebar">
    <el-menu
      default-active="1"
      class="nav-menu"
      :collapse="isCollapse"
    >
      <el-menu-item index="1">
        <el-icon><Monitor /></el-icon>
        <span>模型预览</span>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><List /></el-icon>
        <span>模型列表</span>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Monitor, List, Setting } from '@element-plus/icons-vue'

const isCollapse = ref(false)
</script>

<style lang="scss" scoped>
.nav-sidebar {
  height: 100%;
  .nav-menu {
    height: 100%;
    border-right: none;
  }
}
</style> 