<template>
  <div ref="container" class="model-viewer">
    <div class="controls" v-if="loaded">
      <el-button-group>
        <el-button @click="resetCamera">重置视角</el-button>
        <el-button @click="toggleExplode">{{ isExploded ? '复原' : '分解' }}</el-button>
      </el-button-group>
    </div>
    <div class="loading" v-if="!loaded">
      <el-progress type="circle" :percentage="loadingProgress"></el-progress>
    </div>
    <div class="annotations">
      <annotation
        v-for="annotation in annotations"
        :key="annotation.id"
        :position="annotation.position"
        :text="annotation.text"
        @delete="removeAnnotation(annotation.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import gsap from 'gsap'
import Annotation from '../Annotation/Annotation.vue'
import { useStore } from 'vuex'

const props = defineProps({
  modelUrl: {
    type: String,
    required: true
  }
})

const store = useStore()
const container = ref(null)
const loaded = ref(false)
const loadingProgress = ref(0)
const isExploded = ref(false)
const annotations = ref([])

let scene, camera, renderer, controls, labelRenderer
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let lights = {
  ambient: null,
  directional: null
}

// 初始化Three.js场景
const initScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  
  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)
  
  // 初始化标注渲染器
  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  container.value.appendChild(labelRenderer.domElement)
  
  // 初始化控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = true
  controls.enableZoom = true
  controls.enablePan = true
  controls.minDistance = 1
  controls.maxDistance = 100
  
  // 设置基础场景
  lights.ambient = new THREE.AmbientLight(0xffffff, store.state.lightIntensity)
  scene.add(lights.ambient)
  
  lights.directional = new THREE.DirectionalLight(0xffffff, store.state.lightIntensity)
  lights.directional.position.set(0, 1, 0)
  scene.add(lights.directional)
  
  camera.position.z = 5
  
  // 添加事件监听
  window.addEventListener('resize', onWindowResize)
  container.value.addEventListener('click', onMouseClick)
  
  animate()
}

// 加载模型
const loadModel = async () => {
  const loader = new GLTFLoader()
  
  try {
    // 添加跨域处理
    const manager = new THREE.LoadingManager()
    manager.setURLModifier((url) => {
      // 如果是跨域URL，添加跨域处理
      if (url.startsWith('http')) {
        return url
      }
      return url
    })
    
    loader.manager = manager
    
    const gltf = await loader.loadAsync(props.modelUrl, (xhr) => {
      loadingProgress.value = Math.round((xhr.loaded / xhr.total) * 100)
    })
    
    scene.add(gltf.scene)
    
    // 自适应模型大小
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    // 计算合适的缩放比例
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 5 // 目标显示大小
    const scale = targetSize / maxDim
    
    // 应用缩放
    gltf.scene.scale.multiplyScalar(scale)
    
    // 重新计算包围盒
    box.setFromObject(gltf.scene)
    box.getCenter(center)
    box.getSize(size)
    
    // 居中模型
    gltf.scene.position.x -= center.x
    gltf.scene.position.y -= center.y
    gltf.scene.position.z -= center.z
    
    // 调整相机位置
    const fov = camera.fov * (Math.PI / 180)
    const distance = Math.abs(targetSize / Math.tan(fov / 2))
    camera.position.z = distance * 1.5
    
    // 更新控制器
    controls.target.set(0, 0, 0)
    controls.update()
    
    // 添加模型拖动功能
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.userData.draggable = true
      }
    })
    
    store.commit('SET_CURRENT_MODEL', gltf.scene)
    loaded.value = true
    
  } catch (error) {
    console.error('Error loading model:', error)
  }
}

// 窗口大小改变处理
const onWindowResize = () => {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  labelRenderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

// 鼠标点击处理
const onMouseClick = (event) => {
  if (isDragging) return // 如果正在拖动则不添加标注
  
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  if (intersects.length > 0) {
    const point = intersects[0].point
    addAnnotation(point)
  }
}

// 添加标注
const addAnnotation = (position) => {
  const annotation = {
    id: Date.now(),
    position: {
      x: position.x * 100,
      y: position.y * 100
    },
    text: '新标注'
  }
  annotations.value.push(annotation)
}

// 移除标注
const removeAnnotation = (id) => {
  annotations.value = annotations.value.filter(a => a.id !== id)
}

// 重置相机
const resetCamera = () => {
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 5,
    duration: 1
  })
}

// 切换爆炸视图
const toggleExplode = () => {
  isExploded.value = !isExploded.value
  
  const model = scene.children.find(child => child.isGroup)
  if (!model) return
  
  model.traverse((child) => {
    if (child.isMesh) {
      const direction = new THREE.Vector3()
      child.getWorldPosition(direction)
      direction.normalize()
      
      const targetPosition = isExploded.value
        ? direction.multiplyScalar(2) // 爆炸距离
        : new THREE.Vector3(0, 0, 0)
      
      gsap.to(child.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1,
        ease: 'power2.inOut'
      })
    }
  })
  
  store.dispatch('toggleExplode')
}

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

// 添加拖动相关的方法
const onMouseDown = (event) => {
  event.preventDefault()
  
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  if (intersects.length > 0 && intersects[0].object.userData.draggable) {
    controls.enabled = false
    isDragging = true
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
}

const onMouseMove = (event) => {
  if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    }
    
    const model = scene.children.find(child => child.isGroup)
    if (model) {
      // 计算拖动距离
      const deltaRotation = new THREE.Vector3(
        deltaMove.y * 0.005,
        deltaMove.x * 0.005,
        0
      )
      
      model.rotation.x += deltaRotation.x
      model.rotation.y += deltaRotation.y
    }
    
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }
}

const onMouseUp = () => {
  isDragging = false
  controls.enabled = true
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// 添加光照强度监听
watch(() => store.state.lightIntensity, (newIntensity) => {
  if (lights.ambient && lights.directional) {
    lights.ambient.intensity = newIntensity
    lights.directional.intensity = newIntensity
  }
})

onMounted(() => {
  initScene()
  loadModel()
  container.value.addEventListener('mousedown', onMouseDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  container.value?.removeEventListener('click', onMouseClick)
  container.value?.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  scene.dispose()
  renderer.dispose()
})
</script>

<style lang="scss" scoped>
.model-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  
  .controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }
  
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
  }
  
  .annotations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style> 