import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '../router'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)


const API_URL = 'http://127.0.0.1:8000'
export default new Vuex.Store({
  plugins:[
    createPersistedState()
  ],
  state: {
    movies : [],
    token : null,
    likeMovies: [],
    wishMovies:[],
    username: null,
    userProfile : {}
  },
  getters: {
    isLogin(state){
      return state.token ? true : false
    },
    authHeader(state){
      return { Authorization: `Token ${state.token}` }
    }
  },
  mutations: {
    SAVE_TOKEN(state, token){
      state.token = token
      router.push({name:'MovieView'})
    },
    LIKE_MOVIE(state, movie){
      state.likeMovies.push(movie)
    },
    WISH_MOVIE(state,movie){
      state.wishMovies.push(movie)
    },
    SAVE_USERNAME(state,username){
      state.username = username
    },
    GET_USER_PROFILE(state, userInfo){
      state.userProfile = userInfo
    },
    REMOVE_TOKEN(state){
      state.token = null
    }

  },
  actions: {

    signUp(context, payload) {
      const username = payload.username
      const email = payload.email
      const password1 = payload.password1
      const password2 = payload.password2
      axios({
        method: 'post',
        url: `${API_URL}/accounts/signup/`,
        data: {
          username, email, password1, password2
        }
      })
        .then((response) => {
          const { success, access } = response.data // 토큰 정보 받아옴
          context.commit('SAVE_TOKEN', access) // 토큰 저장
          console.log(success)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    login(context, payload) {
      const username = payload.username
      const password = payload.password
    
      axios({
        method: 'post',
        url: `${API_URL}/accounts/login/`,
        data: {
          username, password
        }
      })
        .then((response) => {
          // console.log(response)
          const data1 = JSON.parse(response.config.data)
          // const { success, access } = response.data // 토큰 정보 받아옴
          context.commit('SAVE_TOKEN', response.data.key) // 토큰 저장
          context.commit('SAVE_USERNAME', data1.username)
          // console.log(response.data.key)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    likeMovie(context,movieId){
      axios({
        method:'post',
        url: `${API_URL}/movies/${movieId}/likes/`,
        //가정
        headers: {Authorization: `Token ${localStorage.getItem('token')}`}
      })
      .then((response)=>{
        context.commit('LIKE_MOVIE', response.data)
      })
      .catch((err)=>{
        console.log(err)
      })
    },
    wishMovie(context,movieId){
      axios({
        method: 'post',
        url: `${API_URL}/movies/${movieId}/wish/`,
        headers: {Authorization: `Token ${localStorage.getItem('token')}`}
      })
      .then((response)=>{
        context.commit('WISH_MOVIE', response.data)
      })
      .catch((err)=>{
        console.log(err)
      })
    },
    getUserProfile(context){
      axios({
        method: 'get',
        url: `${API_URL}/accounts/profile/${context.state.username}/`,
      })
      .then((response)=>{
        context.commit('GET_USER_PROFILE', response.data)
      })
      .catch((err)=>{
        console.log(err)
      })
    },
    logout(context){
      axios({
        method: 'post',
        url: `${API_URL}/accounts/logout/`,
      })
      .then(()=>{
        context.commit('REMOVE_TOKEN')
        localStorage.removeItem('vuex')
        router.push({name:'HomeView'})
      })

    }
    

  },
  modules: {
  }
})
