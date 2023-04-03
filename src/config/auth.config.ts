export const authConfig = {
  jwt: {
    accessTokenExpiresInSec: 3 * 60 * 60,
    secret: process.env.JWT_SECRET || 'secret',
  },
};
