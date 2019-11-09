/**
 * Our JSON Web Tokens will only store the ID of the user for lookup.
 */
export default interface JwtPayload {
  id: number;
}
