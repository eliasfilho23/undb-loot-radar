export const Api = {
  User: {
    Create: 'lootradar.user.create',
    Read  : 'lootradar.user.read',
    List  : 'lootradar.user.list',
  },
  Auth: {
    ClientLogin  : 'auth/client-login',
    Me           : 'auth/me',
    RefreshCookie: 'auth/refresh-cookie',
    ClientLogout : 'auth/client-logout',
  },
  Game: {
    List: 'lootradar.game.list',
  },
  Deal: {
    List: 'lootradar.deal.list',
  },
  Claim: {
    Create: 'lootradar.claim.create',
    List  : 'lootradar.claim.list',
  },
}
