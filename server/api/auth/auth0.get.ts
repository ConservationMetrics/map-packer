import { H3Event } from 'h3';

interface Auth0User {
  email: string;
}

export default oauthAuth0EventHandler({
  config: {
    emailRequired: true,
  },

  async onSuccess(event: H3Event, { user }: { user: Auth0User }) {
    await setUserSession(event, { 
      user: {
        auth0: user.email,
      },
      loggedInAt: Date.now(),
    });

    // TODO: remove this console.log for debugging
    const session = await getUserSession(event)
    console.log("OAuth success on API side:", session);
    // While the session is stored in the API, it is not yet available in the client.

    return sendRedirect(event, '/')
  },
  onError(event: H3Event, error: string) {
    console.error("OAuth error:", error);
    return sendRedirect(event, "/login");
  },
});
