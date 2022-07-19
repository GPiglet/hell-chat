import '../styles/globals.css'
import * as React from 'react';
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import {AuthContext, UserType} from '../contexts/AuthContext';
import AuthApi from '../services/Auth';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserType>();

  const signup = (user: UserType, subscriber: any, onError: any) => {
    AuthApi.signup(user, subscriber, onError);
  }

  const login = (email: string, password: string, isRemember: boolean, subscriber: any, onError: any) => {
    AuthApi.login(email, password, isRemember, (res: any) => {
      setUser(res.user);
      router.push('/');
      if ( subscriber ) subscriber(res.token);
    }, onError);
  }

  return (
    <AuthContext.Provider value={{user, signup, login, setUser}}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  ) 
}

export default MyApp
