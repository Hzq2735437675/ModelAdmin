<template>
  <div class="explosion-control">
    <el-slider
      v-model="explosionFactor"
      :min="0"
      :max="100"
      @input="updateExplosion"
    />
    <el-button-group>
      <el-button @click="resetExplosion">重置</el-button>
      <el-button @click="explodeMax">最大分解</el-button>
    </el-button-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import gsap from 'gsap'

const store = useStore()
const explosionFactor = ref(0)

const props = defineProps({
  modelParts: {
    type: Array,
    required: true
  }
})

const updateExplosion = (value) => {
  props.modelParts.forEach((part) => {
    const direction = new THREE.Vector3()
    part.getWorldPosition(direction)
    direction.normalize()
    
    const targetPosition = direction.multiplyScalar(value / 25) // 调整爆炸系数
    
    gsap.to(part.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 0.5
    })
  })
}

const resetExplosion = () => {
  explosionFactor.value = 0
  updateExplosion(0)
}

const explodeMax = () => {
  explosionFactor.value = 100
  updateExplosion(100)
}

// 监听全局爆炸状态
watch(() => store.state.isExploded, (newValue) => {
  explosionFactor.value = newValue ? 100 : 0
  updateExplosion(explosionFactor.value)
})
</script>

<style lang="scss" scoped>
.explosion-control {
  padding: 16px;
  
  .el-button-group {
    margin-top: 16px;
    width: 100%;
    display: flex;
    gap: 8px;
  }
}
</style> 