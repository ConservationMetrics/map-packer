import { H3Event } from "h3";

interface Auth0User {
  email: string;
}

export default oauthAuth0EventHandler({
  config: {
    emailRequired: true,
    redirectURL: `${useRuntimeConfig().public.baseUrl}/login`,
  },

  async onSuccess(event: H3Event, { user }: { user: Auth0User }) {
    await setUserSession(event, {
      user: {
        auth0: user.email,
      },
      loggedInAt: Date.now(),
    });

    return sendRedirect(event, "/login");
  },
  onError(event: H3Event, error: string) {
    console.error("OAuth error:", error);
    return sendRedirect(event, "/login");
  },
});
