// Following example: https://github.com/atinux/atidone/blob/main/app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();
  const config = useRuntimeConfig();
  console.log("Auth middleware", to.path, loggedIn.value);
  console.log("Auth strategy", config.authStrategy);
  if (
    config.authStrategy === "auth0" &&
    !loggedIn.value &&
    to.path !== "/login"
  ) {
    return navigateTo("/login");
  }
});
