<template>
  <div class="model-view">
    <model-viewer
      :model-url="currentModel.url"
      @select="handleModelSelect"
      @annotate="handleAnnotate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModelViewer from '@/components/ModelViewer/ModelViewer.vue'
import { modelsList } from '@/config/models'

const currentModel = ref({
  url: modelsList[0].url,
  name: modelsList[0].name
})

const handleModelSelect = (part) => {
  console.log('Selected part:', part)
}

const handleAnnotate = (position) => {
  console.log('Annotation at:', position)
}
</script>

<style lang="scss" scoped>
.model-view {
  width: 100%;
  height: 100%;
}
</style> 