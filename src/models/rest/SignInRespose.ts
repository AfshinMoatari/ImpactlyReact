import Authorization from "../Authorization";
import AuthUser from "../AuthUser";

export interface SignInResponse {
    authorization: Authorization;
    user: Required<AuthUser>;
}

export default SignInResponse;