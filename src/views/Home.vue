<template>
  <div class="home">
    <!-- <a href="/wings.json">Download the fucking wings</a> -->

    <form>
      <p>
        <b> Liczba Reynoldsa </b> od
        <input type="text" v-model="reynolds_section.from" name="" id="" />
        do
        <input type="text" v-model="reynolds_section.to" name="" id="" />
      </p>

      <p>
        <b> Cl/Cd </b> w Cl równym
        <input v-model="cl_cd_section.cl_value" type="text" name="" id="" />
        <select v-model="cl_cd_section.comparator" name="" id="">
          <option value="higher_than">większe niż</option>
          <option value="lower_than">mniejsze niż</option>
        </select>
        <input v-model="cl_cd_section.cd_value" type="text" name="" id="" />
      </p>

      <p>
        <b> Cl/Cd v Alpha </b> w Alpha równym
        <input
          v-model="cl_cd_alpha_section.alpha_value"
          type="text"
          name=""
          id=""
        />
        <select v-model="cl_cd_alpha_section.comparator" name="" id="">
          <option value="higher_than">większe niż</option>
          <option value="lower_than">mniejsze niż</option>
        </select>
        <input
          v-model="cl_cd_alpha_section.cl_cd_value"
          type="text"
          name=""
          id=""
        />
      </p>

      <button type="button" v-on:click="search_for_wings">Szukaj</button>
    </form>

    <p></p>

    <div v-if="this.app_state === WingSearchState.Searching">Szukam...</div>

    <div
      v-if="
        this.app_state === WingSearchState.DoneSearching &&
        this.wings_search_result.data.length !== 0
      "
    >
      Coś tu mamy...
    </div>

    <div
      v-if="
        this.app_state === WingSearchState.DoneSearching &&
        this.wings_search_result.data.length === 0
      "
    >
      Nic nie znaleziono!
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

import WingProfile, { PolarData, WingPolar } from "../components/WingProfile";
// import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

interface WingsData {
  data: WingProfile[];
}

interface SearchResult {
  data: WingPolar[];
}

enum WingSearchState {
  Loaded,
  Searching,
  DoneSearching,
}

export default defineComponent({
  name: "Home",
  components: {},
  data() {
    return {
      WingSearchState,
      app_state: WingSearchState.Loaded,

      wings_data: { data: [] } as WingsData,
      wings_search_result: { data: [] } as SearchResult,

      reynolds_section: {
        from: "",
        to: "",
        active: false,
      },

      cl_cd_section: {
        comparator: "higher_than",
        cl_value: "",
        cd_value: "",
        active: false,
      },

      cl_cd_alpha_section: {
        comparator: "lower_than",
        alpha_value: "",
        cl_cd_value: "",
        active: true,
      },
    };
  },
  created() {
    console.log(this.app_state);
    const wings_data_from_local_storage = localStorage.getItem("wings_data");

    if (wings_data_from_local_storage !== null) {
      console.log("Wings data already present, loading from local storage");
      this.wings_data.data = JSON.parse(wings_data_from_local_storage);

      console.log(this.wings_data.data[0].name);
      return;
    }
    console.log("Fetching wings data..");

    // const self = this;

    axios.get("/wings.json").then((response) => {
      console.log("Got wings data!");
      // console.log(this);
      this.wings_data = response.data;
      localStorage.setItem("wings_data", JSON.stringify(this.wings_data));

      console.log(this.wings_data);
      // console.log(this.wings_data[0].name);
    });
  },

  methods: {
    search_for_wings() {
      this.wings_search_result.data = [];
      this.app_state = WingSearchState.Searching;

      // setTimeout(() => {
      //   this.app_state = WingSearchState.DoneSearching;
      // }, 3000);

      /**
       * VALIDATE REYNOLDS SECTION
       */

      if (
        Number.isNaN(parseInt(this.reynolds_section.from, 10)) ||
        Number.isNaN(parseInt(this.reynolds_section.from, 10))
      ) {
        this.reynolds_section.active = false;
      }

      const reynolds_section_range = [
        parseInt(this.reynolds_section.from, 10),
        parseInt(this.reynolds_section.to, 10),
      ];

      /**
       * VALIDATE CD/CL SECTION
       */

      /**
       * VALIDATE CD/CL v ALPHA SECTION
       */

      /**
       * THE ACTUAL SEARCH
       */

      for (const wing of this.wings_data.data) {
        for (const wing_polar of wing.polars) {
          break;
        }
      }
    },
  },
});
</script>
