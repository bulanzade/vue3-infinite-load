import InfiniteLoad from './directive';

const install = function(Vue) {
    Vue.directive('infiniteLoad', InfiniteLoad)
}

if (window.Vue) {
    window.infiniteLoad = InfiniteLoad
    Vue.use(install)
}

InfiniteLoad.install = install
export default InfiniteLoad