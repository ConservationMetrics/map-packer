<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="italic">{{ $t("authMessage") }}.</p>
    <button
      class="px-4 py-2 mt-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      @click="login"
    >
      {{ $t("loginButton") }}
    </button>
    <p v-if="errorMessage" class="text-red-500 text-xs italic">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      errorMessage: "",
      redirectPath: this.localePath("/"),
    };
  },
  created() {
    const redirect = this.$route.query.redirect;
    this.redirectPath = redirect
      ? decodeURIComponent(redirect)
      : this.localePath("/");
  },
  mounted() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error === "access_denied") {
      this.errorMessage = decodeURIComponent(errorDescription);
    }
    if (this.$auth.loggedIn) {
      this.$router.replace(this.redirectPath);
    }
  },
  methods: {
    async login() {
      try {
        await this.$auth.loginWith("auth0", {
          redirectUri: window.location.origin + this.redirectPath,
        });
      } catch (error) {
        console.error(this.$t("auth0LoginError") + ":", error);
      }
    },
  },
};
</script>
