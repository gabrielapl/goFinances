import React,{ useState } from 'react';
import { Alert, ActivityIndicator,Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';

import { SignInSocialButton } from '../../components/SignInSocialButton';

import { useAuth } from '../../hooks/auth';

import { 
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from './styles'


export function SignIn(){
  const theme = useTheme();
  const { singInWithGoogle, singInWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  async function handleSingInWithGoogle(){

    try {
      setIsLoading(true)
      return await singInWithGoogle();
    } catch (error) {
      console.log(error)
      Alert.alert("Não foi possível conectar com a conta Google")
      setIsLoading(false)

    }

  }
  async function handleSingInWithApple(){

    try {
      setIsLoading(true)
      return await singInWithApple();
    } catch (error) {
      console.log(error)
      Alert.alert("Não foi possível conectar com a conta Apple")
      setIsLoading(false)
    }

  }

  return(
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg
            width={RFValue(120)}
            height={RFValue(168)}
          />
          <Title>
            Controle suas{'\n'}
            finanças de forma{'\n'}
            muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>
          Faça seu login com{'\n'}
          uma das contas abaixo
        </SignInTitle>
      </Header>
      <Footer>
        <FooterWrapper>
          <SignInSocialButton
            onPress={handleSingInWithGoogle}
            title="Entrar Com Google"
            svg={GoogleSvg}
          />
          {
            Platform.OS === 'ios' &&
              <SignInSocialButton
              onPress={handleSingInWithApple}
              title="Entrar Com Apple"
              svg={AppleSvg}
            />
          }
        </FooterWrapper>
        {
          isLoading && <ActivityIndicator color={theme.colors.shape} 
           style={{marginTop: 18}} 
          />
        }
      </Footer>
    </Container>
  );
};