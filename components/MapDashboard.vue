<template>
  <div class="flex flex-col items-center mt-4 relative"> <!-- Add relative class here for positioning -->
    <nuxt-link to="/map/" class="generate-map-btn">+ Generate Map</nuxt-link> <!-- Use nuxt-link with the desired route -->
    <h1 class="text-4xl font-bold text-gray-800 mb-4">Available Offline Maps</h1>
    <div v-for="item in data" :key="item.id" class="bg-gray-100 rounded-lg p-4 mb-4 w-1/2">
      <h2 class="text-xl font-semibold text-gray-800 mb-2" v-if="item.filename">{{ item.filename }}</h2>
      <p class="text-gray-600 mb-1" v-if="item.status">
        <strong>Status:</strong> 
        <span :class="formatStatusColor(item.status)">{{ item.status }}</span>
      </p>
      <p class="text-gray-600 mb-1" v-if="item.errormessage"><strong>Error Message:</strong> {{ item.errormessage }}</p>
      <p class="text-gray-600 mb-1" v-if="item.created_at"><strong>Request submitted at:</strong> {{ formatDate(item.created_at) }}</p>
      <p class="text-gray-600 mb-1" v-if="item.style"><strong>Map style:</strong> {{ item.style }}</p>
      <p class="text-gray-600 mb-1" v-if="item.bounds"><strong>Bounds:</strong> [{{ formatBounds(item.bounds) }}]</p>
      <p class="text-gray-600 mb-1" v-if="item.maxzoom"><strong>Zoom level:</strong> {{ item.minzoom }}-{{ item.maxzoom }}</p>
      <p class="text-gray-600 mb-1" v-if="item.filelocation"><strong>File Location:</strong> <a :href="item.filelocation" class="text-blue-500 hover:text-blue-700">link</a></p>
      <p class="text-gray-600 mb-1" v-if="item.filesize"><strong>File Size:</strong> {{ formatNumber(item.filesize) }} bytes</p>
      <p class="text-gray-600 mb-1" v-if="item.numberoftiles"><strong>Number of tiles:</strong> {{ formatNumber(item.numberoftiles) }}</p>
      <p class="text-gray-600 mb-1" v-if="item.workbegun"><strong>Work begun at:</strong> {{ formatDate(item.workbegun) }}</p>
      <p class="text-gray-600 mb-1" v-if="item.workended"><strong>Work ended at:</strong> {{ formatDate(item.workended) }}</p>

    </div>
  </div>
</template>

<script>
export default {
  props: [
    "data"
  ],
  methods: {
    formatNumber(value) {
      return parseInt(value).toLocaleString();
    },
    formatBounds(bounds) {
      return bounds.split(',').join(', ');
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', options).replace(/,/, '');
    },
    formatStatusColor(status) {
      switch (status) {
        case 'FAILED':
          return 'font-semibold text-red-500';
        case 'PENDING':
          return 'font-semibold text-yellow-500';
        case 'SUCCEEDED':
          return 'font-semibold text-green-500';
        default:
          return 'font-semibold text-gray-600';
      }
    }
  }
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

.generate-map-btn {
  position: absolute; /* Position relative to the nearest positioned ancestor (`.container` with `relative`) */
  top: 0; /* Align to the top edge of the container */
  right: 0; /* Align to the right edge of the container */
  background-color: #0056b3;
  color: white; /* White text color */
  padding: 10px 20px; /* Padding around the text */
  border: none; /* No border */
  border-radius: 5px; /* Rounded corners */
  cursor: pointer; /* Mouse cursor changes to pointer when hovered */
  margin-top: 10px; /* Adjust as needed */
  margin-right: 10px; /* Adjust as needed */
}

.generate-map-btn:hover {
  background-color: #45a049; /* Darker green on hover */
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
