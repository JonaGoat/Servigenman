export type AuthTokens = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
};

export type LoginSuccess = {
  message: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  tokens?: AuthTokens;
};

export type LoginError = {
  error?: string;
};
