<template>
  <div class="home">
    <a href="/wings.json">Download the fucking wings</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

import WingProfile, { PolarData, WingPolar } from "../components/WingProfile";
// import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {},
  data() {
    return {
      reynolds_range: [0, 0],
      wings_data: number[] = [],
    };
  },
  created() {
    console.log('Fetching wings data..');
    
    // const self = this;

    axios.get('/wings.json').then((response) => {
      console.log('Got wings data!');
      // console.log(this);
      this.wings_data = response.data;
      console.log(response.data);

      // console.log(this.wings_data[0].name);
    });
  },
});
</script>
