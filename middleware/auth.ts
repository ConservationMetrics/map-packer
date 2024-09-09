// Following example: https://github.com/atinux/atidone/blob/main/app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();
  const config = useRuntimeConfig();

  if (
    config.public.authStrategy === "auth0" &&
    !loggedIn.value &&
    to.path !== "/login"
  ) {
    return navigateTo("/login");
  }
});
