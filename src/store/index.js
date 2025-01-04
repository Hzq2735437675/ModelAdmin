import { createStore } from 'vuex'

export default createStore({
  state: {
    currentModel: null,
    annotations: [],
    selectedPart: null,
    isExploded: false,
    lightIntensity: 1
  },
  
  mutations: {
    SET_CURRENT_MODEL(state, model) {
      state.currentModel = model
    },
    ADD_ANNOTATION(state, annotation) {
      state.annotations.push(annotation)
    },
    REMOVE_ANNOTATION(state, id) {
      state.annotations = state.annotations.filter(a => a.id !== id)
    },
    SET_SELECTED_PART(state, part) {
      state.selectedPart = part
    },
    SET_EXPLODED_STATE(state, isExploded) {
      state.isExploded = isExploded
    },
    SET_LIGHT_INTENSITY(state, intensity) {
      state.lightIntensity = intensity
    }
  },
  
  actions: {
    loadModel({ commit }, modelUrl) {
      commit('SET_CURRENT_MODEL', { url: modelUrl })
    },
    selectPart({ commit }, part) {
      commit('SET_SELECTED_PART', part)
    },
    toggleExplode({ commit, state }) {
      commit('SET_EXPLODED_STATE', !state.isExploded)
    }
  }
}) 