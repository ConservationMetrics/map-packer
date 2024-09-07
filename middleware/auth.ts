// Following example: https://github.com/atinux/atidone/blob/main/app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value && to.path !== "/login") {
    return navigateTo("/login");
  }
});
