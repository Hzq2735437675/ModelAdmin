<template>
  <div class="annotation" :style="style" @mousedown="startDrag">
    <div class="annotation-content">
      <div class="annotation-text">{{ text }}</div>
      <el-button 
        class="delete-btn" 
        size="small" 
        type="danger" 
        circle
        @click="$emit('delete')"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
    <div class="annotation-line"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:position', 'delete'])

const style = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))

const startDrag = (event) => {
  const startX = event.clientX - props.position.x
  const startY = event.clientY - props.position.y

  const handleMouseMove = (e) => {
    emit('update:position', {
      x: e.clientX - startX,
      y: e.clientY - startY
    })
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
</script>

<style lang="scss" scoped>
.annotation {
  position: absolute;
  pointer-events: all;
  
  .annotation-content {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .annotation-line {
    position: absolute;
    width: 2px;
    height: 50px;
    background: rgba(255, 255, 255, 0.5);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .delete-btn {
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover .delete-btn {
    opacity: 1;
  }
}
</style> 