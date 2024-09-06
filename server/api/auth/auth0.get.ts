export default oauthAuth0EventHandler({
  async onSuccess(event: any, { user }: { user: any }) {
    await setUserSession(event, { user });
    // return sendRedirect(event, '/')
  },
  onError(event: any, error: any) {
    console.error("OAuth error:", error);
    return sendRedirect(event, "/login");
  },
});
