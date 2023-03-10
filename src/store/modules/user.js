import {getCurrentUser, getToken, removeCurrentUser, removeToken, setCurrentUser, setToken} from "src/utils/auth.js";
import {create} from "src/api/token.js";
import {Notify} from "quasar";
import {me} from "src/api/user.js";

// // 使用 store.state.user.xxx 调用
const state = () => ({
  currentUser: getCurrentUser(),
  token: getToken(),
})

// 使用 store.getters['user/nicknameFastWord'] 调用
const getters = {
  nicknameFastWord: state => {
    return state.currentUser ? state.currentUser.nickname.slice(1) : '登录'

  }
};
// 使用 store.dispatch调用
const actions = {
  login({commit}, {username, password}) {
    return new Promise((resolve, reject) => {
      create(username, password).then(response => {
        if (response.code !== 200) {
          Notify.create({
            type: 'negative',
            message: response.message,
            position: "top",
          })
          resolve()
          return
        }
        const token = response.data;
        commit('SET_TOKEN', token);
        setToken(token);
        resolve()
      }).finally(() => {
      })
    });
  },
  logout({commit, state, dispatch}) {
    commit('SET_TOKEN', ''); // 设置用户toke为空
    commit('SET_ROLES', null); // 设置权限为空
    removeToken();//设置cookie里面的token为空

    commit('SET_CURRENT_USER', '')
    removeCurrentUser()


  },
  fetchCurrentUser({commit}) {
    return new Promise((resolve, reject) => {
      me()
        .then(response => {

            commit("SET_CURRENT_USER", response.data) //set Vuex
            setCurrentUser(response.data) //  set CooKie
            resolve(response.data) // return response.data

        }).catch(error => {
        reject(error)
      })
    })
  }
};
// 使用 store.commit调用
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token

  },
  SET_CURRENT_USER: (state, currentUser) => {
    state.currentUser = currentUser
  }
};

export default {
  namespace: true,
  state,
  getters,
  actions,
  mutations
}

