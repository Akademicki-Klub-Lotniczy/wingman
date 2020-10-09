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
        <b> Cl/Alpha </b> w Alpha równym
        <input
          v-model="cl_alpha_section.alpha_value"
          type="text"
          name=""
          id=""
        />
        <select v-model="cl_alpha_section.comparator" name="" id="">
          <option value="higher_than">większe niż</option>
          <option value="lower_than">mniejsze niż</option>
        </select>
        <input v-model="cl_alpha_section.cd_value" type="text" name="" id="" />
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

      <div
        v-bind:key="search_result.url"
        v-for="search_result in this.wings_search_result.data"
      >
        <a href="{{search_result.url}}">{{ search_result.url }}</a>
      </div>
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

function index_with_value_closest_to(
  array: number[],
  value_to_search_for: number
) {
  let closest_distance = Infinity;
  let closest_number_index = -1;

  for (const [index, value] of array.entries()) {
    const distance = Math.abs(value_to_search_for - value);

    if (distance < closest_distance) {
      closest_distance = distance;
      closest_number_index = index;
    }
  }

  return closest_number_index;
}

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

      cl_alpha_section: {
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
    // const wings_data_from_local_storage = localStorage.getItem("wings_data");

    // if (wings_data_from_local_storage !== null) {
    //   console.log("Wings data already present, loading from local storage");
    //   this.wings_data.data = JSON.parse(wings_data_from_local_storage);

    //   console.log(this.wings_data.data[0].name);
    //   return;
    // }
    console.log("Fetching wings data..");

    // const self = this;

    axios.get("/wings.json").then((response) => {
      console.log("Got wings data!");
      // console.log(this);
      this.wings_data.data = response.data;

      let counter = 1;

      for (const wing of this.wings_data.data) {
        for (const wing_polar of wing.polars) {
          counter += 1;
        }
      }
      console.log(`All polars: ${counter}`);
      // localStorage.setItem("wings_data", JSON.stringify(this.wings_data));

      console.log(this.wings_data);
      // console.log(this.wings_data[0].name);
    });
  },

  methods: {
    search_for_wings() {
      this.wings_search_result.data = [];
      this.app_state = WingSearchState.Searching;

      // console.log("This fucks up....");
      for (const wing of this.wings_data.data) {
        // console.log("Iterating through polars");
        for (const wing_polar of wing.polars) {
          // 200 000 reynolds
          // console.log("Reyunolds check...?");
          if (wing_polar.reynolds !== 200000) {
            continue;
          }

          // console.log("This fucks up!!!!!!!");

          // I cl dla 0 alphy większy od 1
          const alpha_zero_index = index_with_value_closest_to(
            wing_polar.polar_data.alpha,
            0
          );
          if (wing_polar.polar_data.cl[alpha_zero_index] < 0) {
            continue;
          }

          // I cl/cd  dla zera większy od 50
          if (
            wing_polar.polar_data.cl[alpha_zero_index] /
              wing_polar.polar_data.cd[alpha_zero_index] <
            50
          ) {
            continue;
          }

          // console.log("This fucks up");
          this.wings_search_result.data.push(wing_polar);
        }
      }

      console.log("All done");
      console.log(this.wings_search_result.data);
      this.app_state = WingSearchState.DoneSearching;
    },
  },
});
</script>
