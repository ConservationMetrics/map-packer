<template>
    <div class="sidebar">
    </div>
  </template>
  
  <script>
  
  export default {
  };
  </script>
  
  <style scoped>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 400px;
    background: white;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    z-index: 1000;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      height: 50%;
      width: 100%;
      bottom: 0;
      top: auto;
    }
}
  </style>
  