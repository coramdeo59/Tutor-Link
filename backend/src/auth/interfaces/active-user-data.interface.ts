import { Role } from 'src/users/enums/role-enums';

export interface ActiveUserData {
  /**
   * The "subject" of the token. The value of this property is the user ID
   * or child ID that granted this token.
   */
  sub: number;
  /**
   * The subject's (user) email. Optional, as child accounts use username.
   */
  email?: string;
  /**
   * The subject's (child) username. Optional, as regular users use email.
   */
  username?: string;
  /**
   * The unique identifier for the refresh token.
   */
  refreshTokenId?: string;
  /**
   *  The subject's role.
   */
  role: Role;
}
