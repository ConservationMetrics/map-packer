import { Middleware } from '@nuxt/types'

const authMiddleware: Middleware = ({ $auth, redirect, route }) => {
  if (route.path === '/login') {
    return; // Do nothing if we're already on the login page
  }
  
  const AUTH_STRATEGY = process.env.NUXT_ENV_AUTH_STRATEGY ? process.env.NUXT_ENV_AUTH_STRATEGY.replace(/['"]+/g, '') : 'none';
  if (AUTH_STRATEGY === 'auth0' && !$auth.loggedIn) {
    return redirect('/login')
  } else if (AUTH_STRATEGY === 'password' && !$auth.loggedIn) {
    return redirect('/login')
  }
}

export default authMiddleware
