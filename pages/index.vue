<template>
  <div class="container">
    <h1>Available Offline Maps</h1>
    <MapDashboard />
    <div v-for="item in data" :key="item.id" class="table-item">
      <h2>{{ item }}</h2>
    </div>
  </div>
</template>

<script>
import MapDashboard from "~/components/MapDashboard.vue";

export default {
  head() {
    return {
      title: "MapPacker: Available Offline Maps",
    };
  },
  data() {
    return {
      data: [],
    };
  },
  async asyncData({ $axios, app }) {
    // Set up the headers for the request
    let headers = {
      "x-api-key": app.$config.apiKey.replace(/['"]+/g, ""),
      "x-auth-strategy": app.$auth.strategy.name,
    };

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/data`, { headers });
      return { data: response };
    } catch (error) {
      // Handle errors as appropriate
      console.error("Error fetching data:", error);
      return { data: [] };
    }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2em;
}

.container h1 {
  color: #333;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 900;
}

.table-item {
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 1em;
  margin-bottom: 1em;
  width: 50%;
}

.table-item h2 {
  color: #333;
  margin-bottom: 0.5em;
}

.table-item ul {
  list-style: none;
  padding: 0;
}

.table-item ul li {
  margin-bottom: 0.5em;
}

.table-item ul li a {
  color: #007bff;
  text-decoration: none;
}

.table-item ul li a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
