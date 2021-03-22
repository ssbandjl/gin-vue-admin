import { login } from '@/api/user'
import { jsonInBlacklist } from '@/api/jwt'
import router from '@/router/index'
export const user = {
    namespaced: true,
    state: {
        userInfo: {
            uuid: "",
            nickName: "",
            headerImg: "",
            authority: "",
        },
        token: "",
    },
    mutations: {
        setUserInfo(state, userInfo) {
            // 这里的 `state` 对象是模块的局部状态
            state.userInfo = userInfo
        },
        setToken(state, token) {
            // 这里的 `state` 对象是模块的局部状态
            state.token = token
        },
        NeedInit(state){
            state.userInfo = {}
            state.token = ""
            sessionStorage.clear()
            router.push({ name: 'init', replace: true })

        },
        LoginOut(state) {
            state.userInfo = {}
            state.token = ""
            sessionStorage.clear()
            router.push({ name: 'login', replace: true })
            window.location.reload()
        },
        ResetUserInfo(state, userInfo = {}) {
            state.userInfo = {...state.userInfo,
                ...userInfo
            }
        }
    },
    // https://vuex.vuejs.org/zh/guide/actions.html
    // https://vuex.vuejs.org/zh/guide/modules.html 模块
    actions: {
        async LoginIn({ commit, dispatch, rootGetters, getters }, loginInfo) {
            // console.log("loginInfo:", loginInfo)
            const res = await login(loginInfo)
            if (res.code == 0) {
                commit('setUserInfo', res.data.user)
                commit('setToken', res.data.token)
                await dispatch('router/SetAsyncRouter', {}, { root: true }) //从后台获取动态路由, 需要在全局命名空间内分发 action 或提交 mutation，将 { root: true } 作为第三参数传给 dispatch 或 commit 即可
                const asyncRouters = rootGetters['router/asyncRouters']
                console.log("asyncRouterRes:", asyncRouters)
                router.addRoutes(asyncRouters)
                // const redirect = router.history.current.query.redirect
                // console.log(redirect)
                // if (redirect) {
                //     router.push({ path: redirect })
                // } else {
                    router.push({ name: getters["userInfo"].authority.defaultRouter })  // dashboard
                // }
                return true
            }
        },
        async LoginOut({ commit }) {
            const res = await jsonInBlacklist()
            if (res.code == 0) {
                commit("LoginOut")
            }
        }
    },
    getters: {
        userInfo(state) {
            return state.userInfo
        },
        token(state) {
            return state.token
        },

    }
}
