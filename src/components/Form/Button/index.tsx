import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Title } from './styles';

interface Props extends RectButtonProps {
  title:string;
  onPress: () => void;
}

export function Button({ title,onPress,... Rest }:Props){
  return (
    <Container onPress={onPress} {... Rest} >
      <Title>
        {title}
      </Title>
    </Container>
  )
}