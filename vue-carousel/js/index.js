'use strict';

// Items displayed in the carousel
Vue.component('carousel-item', {
  template: '<div class="carousel-item" v-bind:style="style" v-on:click="centerSelf"><slot></slot></div>',
  data: function data() {
    return {
      zIndex: 0,
      xtrans: 0,
      ytrans: 0,
      scale: 1,
      opacity: 1
    };
  },

  computed: {
    style: function style() {
      return {
        transition: 'transform 0.5s, opacity 0.5s',
        transform: this.transform,
        'z-index': this.zIndex,
        opacity: this.opacity
      };
    },
    transform: function transform() {
      return ['translate(' + (this.xtrans - 50) + '%, ' + (this.ytrans - 50) + '%)', 'scale(' + this.scale + ')'].join(' ');
    }
  },

  methods: {
    centerSelf: function centerSelf() {
      this.$parent.arrange(this.$parent.$children.indexOf(this));
    }
  }
});

// Carousel component
Vue.component('carousel', {
  // Render function wraps all children in carousel-item components

  render: function render(createElement) {
    return createElement('div', {
      class: 'carousel',
      ref: 'carousel'
    }, this.$slots.default.map(function (el) {
      return createElement('carousel-item', [el]);
    }));
  },

  data: function data() {
    return {};
  },

  // Begin by centering the first element in the carousel
  mounted: function mounted() {
    this.arrange(0);
  },

  methods: {
    // http://stackoverflow.com/q/4467539
    _mod: function _mod(n, m) {
      return (n % m + m) % m;
    },

    // Distribute elements so that they align with the selected elemenent in the center
    arrange: function arrange(centerIndex) {
      var center = this.$children[centerIndex];
      var half = (this.$children.length - 1) / 2;

      // Items that will be displayed to the left of the item at centerIndex
      var before = [];
      // Keep adding items before until half the non-centerIndex items have been added
      for (var i = centerIndex - 1; before.length < half; i--) {
        // this._mod is used to emulate a toroidal array by mapping elements below index 0 or beyond
        // the max index to elements in the valid array range
        before.push(this.$children[this._mod(i, this.$children.length)]);
      }

      // Items that will be displayed to the right of the item at centerIndex
      var after = [];
      for (var i = centerIndex + 1; after.length < this.$children.length - before.length - 1; i++) {
        after.push(this.$children[this._mod(i, this.$children.length)]);
      }

      // Position all elements

      // Position center
      center.xtrans = 0;
      center.scale = 1;
      center.opacity = 1;
      center.zIndex = Math.max(before.length, after.length) + 1;

      // Position elements to left and right
      [before, after].forEach(function (list, listIndex) {
        // Tracks the amount by which the parent was translated
        var parentTrans = 0;

        // Apply styles for each element in selected list
        list.forEach(function (item, i) {
          // Set size
          item.scale = Math.pow(0.8, i + 1);
          // Set x offset. Negative for before, positive for after
          var absolute = 105 * item.scale * 1.125 + parentTrans;
          parentTrans = absolute; // Update how much parent was translated by
          item.xtrans = (listIndex == 0 ? -1 : 1) * absolute;
          // Set opacity
          item.opacity = Math.max(1 - 0.25 * Math.pow(i / 2 + 1, 2), 0);
          // Set z-index
          item.zIndex = Math.max(before.length, after.length) - i;
        });
      });
    }
  }
});

var app = new Vue({
  el: '#app'
});