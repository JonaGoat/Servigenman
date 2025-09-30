export type LoginSuccess = {
  message: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type LoginError = {
  error?: string;
};
