<template>
  <div class="property-panel">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="属性" name="properties">
        <el-form label-position="top">
          <el-form-item label="名称">
            <el-input v-model="properties.name" />
          </el-form-item>
          <el-form-item label="场景亮度">
            <el-slider
              v-model="properties.lightIntensity"
              :min="0"
              :max="2"
              :step="0.1"
              @input="updateLightIntensity"
            />
          </el-form-item>
          <el-form-item label="位置">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-input-number v-model="properties.position.x" controls-position="right" size="small" />
              </el-col>
              <el-col :span="8">
                <el-input-number v-model="properties.position.y" controls-position="right" size="small" />
              </el-col>
              <el-col :span="8">
                <el-input-number v-model="properties.position.z" controls-position="right" size="small" />
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="动画" name="animation">
        <explosion-control :model-parts="modelParts" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import ExplosionControl from './ExplosionControl/ExplosionControl.vue'

const store = useStore()
const activeTab = ref('properties')
const properties = ref({
  name: '示例模型',
  position: { x: 0, y: 0, z: 0 },
  lightIntensity: 1
})

const modelParts = ref([])

// 监听 store 中的模型变化
watch(() => store.state.currentModel, (newModel) => {
  if (newModel) {
    modelParts.value = []
    newModel.traverse((child) => {
      if (child.isMesh) {
        modelParts.value.push(child)
      }
    })
  }
}, { deep: true })

const updateLightIntensity = (value) => {
  store.commit('SET_LIGHT_INTENSITY', value)
}
</script>

<style lang="scss" scoped>
.property-panel {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style> 