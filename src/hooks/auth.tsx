import React, { createContext, ReactNode, useContext, useState } from 'react';

import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


interface AuthProviderProps{
  children: ReactNode;
}
interface User{
  id:string;
  name:string;
  email:string;
  photo?:string;
}
interface IAuthContextData{
  user: User;
  singInWithGoogle(): Promise<void>;
  singInWithApple(): Promise<void>;
  SingOut(): Promise<void>;
  userStorageLoading: boolean;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({children}:AuthProviderProps){

  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);
  
  async function singInWithGoogle(){
    try{
      const result = await Google.logInAsync({
        iosClientId: '465328649493-fqvve2ulamr97mbgd965qirjokua7348.apps.googleusercontent.com',
        androidClientId: '465328649493-tnqd2usiflm7ecub6i5sgnl08rhp93fs.apps.googleusercontent.com',
        scopes: ['profile','email']
      });
      if(result.type === 'success'){
        const userLogged = {
          id: String(result.user.id),
          email: result.user.email!,
          name: result.user.name!,
          photo: result.user.photoUrl!
        }
        setUser(userLogged)
        await AsyncStorage.setItem("@gofinances:user", JSON.stringify(userLogged))
      }
    }catch(error){
      throw new Error(error);
    }
  }
  async function singInWithApple(){
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes:[
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      })
      if(credential){
        const name = credential.fullName!.givenName!
        const photo = `https://ui-avatars.com/api/?name=${name}$length=1`
        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name,
          photo 
        }
          setUser(userLogged)
          await AsyncStorage.setItem("@gofinances:user", JSON.stringify(userLogged))
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  async function SingOut(){
    setUser({} as User);
    await AsyncStorage.removeItem("@gofinances:user")
  }
  useEffect(()=>{
    async function loadUserStorageDate(){
      const userStorage = await AsyncStorage.getItem("@gofinances:user")
      if(userStorage){
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged);
      }
      setUserStorageLoading(false)
    }
    loadUserStorageDate();
  },[])

  return (
    <AuthContext.Provider value={{
      user,
      singInWithGoogle,
      singInWithApple,
      SingOut,
      userStorageLoading
    }} >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext)

  return context;
}

export { AuthProvider, useAuth }