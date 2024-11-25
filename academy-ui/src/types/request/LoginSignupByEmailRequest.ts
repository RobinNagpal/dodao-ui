import { Contexts } from "@dodao/web-core/utils/constants/constants";

export interface LoginSignupByEmailRequestBody {
    spaceId: string;
    email: string;
    context: Contexts;
  }
  