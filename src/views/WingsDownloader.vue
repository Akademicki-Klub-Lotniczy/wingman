<template>
  <p>
    How many? Leave empty to download all:
    <input type="text" v-model="how_many_wings_str" id="" />
  </p>

  <button v-on:click="start_download">Download wings</button>
  <p></p>

  <div>
    <p>Logs:</p>

    <div class="logs" v-for="log in logs" v-bind:key="log">
      {{ log }}
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
// import WingProfile from '../components/WingProfile';
import DownloadWings from "../components/WingsDownloader";

export default defineComponent({
  name: "WingsDownloader",
  data() {
    return {
      logs: [""],
      download_running: false,
      how_many_wings_str: "",
    };
  },
  methods: {
    add_logs(new_log: string) {
      if (new_log.includes("Download running for")) {
        this.logs = this.logs.slice(0, 3);
      }

      this.logs.push(new_log);
    },

    start_download() {
      if (this.download_running) {
        alert("Download already running!");
        return;
      }

      this.download_running = true;

      const how_many_wings = parseInt(this.how_many_wings_str, 10);
      // Pass add_logs as a logging callback
      DownloadWings(how_many_wings, this.add_logs);
    },
  },
});
</script>

<style scoped>
.logs {
  font-family: monospace;
  font-size: 1.2em;
}
</style>
