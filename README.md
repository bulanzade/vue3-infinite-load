# vue3-infinite-load
vue3-infinite-load is the vue3 version of [vue-infinite-scroll](https://github.com/ElemeFE/vue-infinite-scroll), 
and adds the scroll direction property configuration.
# Install

```Bash
npm i vue3-infinite-load
```

### CommonJS

You can use any build tool which supports `commonjs`:

```JavaScript
// register globally
var infiniteLoad =  require('vue-infinite-load');
Vue.use(infiniteLoad)

// or for a single instance
var infiniteLoad = require('vue-infinite-load');
new Vue({
  directives: {infiniteLoad}
})

```

Or in ES2015:

```JavaScript
// register globally
import infiniteScroll from 'vue-infinite-load'
Vue.use(infiniteLoad)

// or for a single instance
import infiniteLoad from 'vue-infinite-load'
new Vue({
  directives: {infiniteLoad}
})

```

```HTML
<script src="../node_modules/vue-infinite-load/vue-infinite-load.js"></script>
```

## Usage

Use v-infinite-load to enable the infinite scroll, and use infinite-load-* attributes to define its options.

The method appointed as the value of v-infinite-load will be executed when the bottom of the element reaches the bottom of the viewport.

```HTML
<div v-infinite-load="loadMore" infinite-load-disabled="busy" infinite-load-distance="10">
  ...
</div>
```

```JavaScript
var count = 0;

new Vue({
  el: '#app',
  data: {
    data: [],
    busy: false
  },
  methods: {
    loadMore: function() {
      this.busy = true;

      setTimeout(() => {
        for (var i = 0, j = 10; i < j; i++) {
          this.data.push({ name: count++ });
        }
        this.busy = false;
      }, 1000);
    }
  }
});
```

# Options

| Option                         | Description                                                                                                                                                                     |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| infinite-load-disabled         | infinite scroll will be disabled if the value of this attribute is true.                                                                                                        |
| infinite-load-distance         | Number(default = 0) - the minimum distance between the bottom of the element and the bottom of the viewport before the v-infinite-scroll method is executed.                    |
| infinite-load-immediate-check  | Boolean(default = true) - indicates that the directive should check immediately after bind. Useful if it's possible that the content is not tall enough to fill up the scrollable container. |
| infinite-load-listen-for-event | infinite scroll will check again when the event is emitted in Vue instance.                                                                                                     |
| infinite-load-throttle-delay   | Number(default = 200) - interval(ms) between next time checking and this time                                                                                                   |
| infinite-load-reversed         | Boolean(default = false) - when this property is set to true, the trigger method will change from scroll down to scroll up                                                      |                                                                                                                                                             |
