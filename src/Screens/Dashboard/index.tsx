import React ,{useCallback, useEffect, useState} from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import {Container, 
Header, 
UserWrapper, 
UserInfo, Photo, 
User, UserGreeting, 
UserName, 
HighLightCards, 
Transaction, 
Title,
TransactionsList,
LogoutButton,
LogoutIcon,
LoadContainer
} from './styles'

import { HighLightCard } from '../../components/HighLightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import { date } from 'yup';

export interface DataListProps extends TransactionCardProps{
  id:string;
}
interface HighLightProps{
  amount:string;
  lastTransition: string;
}
interface HighLightData{
  entries: HighLightProps;
  expensives:HighLightProps;
  total: HighLightProps;
}
export function Dashboard(){

  const [transactions, setTransactions] = useState <DataListProps[]>([]);
  const [highLightData, setHighLightData] = useState<HighLightData>({} as HighLightData);
  const [isLoading, setIsLoading] = useState(true)
  
  const theme = useTheme();
  const { SingOut, user } = useAuth();

  function getLastTransactionDate(
    collections: DataListProps[],
    type: 'positive' | 'negative'
    ){

    const collectionFiltered =  collections
    .filter(transaction => transaction.type === type);
    
    if(collectionFiltered.length === 0)
      return 0;

    const lastTransaction = new Date(
    Math.max.apply(Math, collectionFiltered
    .map(transaction => new Date(transaction.date).getTime())))

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleDateString('pt-Br',{month:"long"})} de ${lastTransaction.toLocaleDateString('pt-Br',{year:"numeric"})}`

  }

  async function loadTransactions(){
    const dataKey = `@gofinances:transactions_user${user.id}`;

    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : []
    
    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted:DataListProps[] = transactions
    .map((item:DataListProps) =>{

      if(item.type === 'positive'){
        entriesTotal += Number(item.amount)
      }else{
        expensiveTotal += Number(item.amount)
      }
     
      const amount = Number(item.amount)
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      const date = Intl.DateTimeFormat('pt-BR',{
        day:'2-digit',
        month:'2-digit',
        year:'2-digit'
      }).format(new Date(item.date));

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date,
      }
    });
    setTransactions(transactionsFormatted)

    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive')
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative')
    const totalInterval = lastTransactionExpensives === 0 ? `Não há Transações` : `01 a ${lastTransactionExpensives}`

    const total = entriesTotal - expensiveTotal;

    setHighLightData({
      entries:{
        amount: entriesTotal.toLocaleString('pt-BR',{
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransition: lastTransactionExpensives === 0 ? `Não há Transações` 
        :
        `Última entrada dia ${lastTransactionEntries}`,
      },
      expensives:{
        amount: expensiveTotal.toLocaleString('pt-BR',{
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransition: lastTransactionExpensives === 0 ? `Não há Transações` 
        : 
        `Última saída dia ${lastTransactionExpensives}`,
      },
      total:{
        amount: total.toLocaleString('pt-BR',{
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransition: totalInterval
      } 
    })
    setIsLoading(false)
  }

  useEffect(()=>{
    loadTransactions();
  },[])
  useFocusEffect(useCallback(()=>{
    loadTransactions();
  },[]));
  return(
    <Container>
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>  
        :
        <>
        <Header>
          <UserWrapper>
          <UserInfo>
            <Photo
              source={{uri: user.photo}}
            />
            <User>
              <UserGreeting>
                Olá,
              </UserGreeting>
              <UserName>
                {user.name}
              </UserName>
            </User>
          </UserInfo>
            <LogoutButton onPress={SingOut} >
              <LogoutIcon name="power"/>
            </LogoutButton>
          </UserWrapper>
        </Header>
        <HighLightCards>
          <HighLightCard 
            type="up"
            title="Entradas" 
            amount={highLightData.entries.amount}
            lastTransaction={highLightData.entries.lastTransition}
          />
          <HighLightCard 
            type="down"
            title="Saídas" 
            amount={highLightData.expensives.amount}
            lastTransaction={highLightData.expensives.lastTransition}  
          />
          <HighLightCard 
            type="total"
            title="Total" 
            amount={highLightData.total.amount}
            lastTransaction={highLightData.total.lastTransition}    
          />
        </HighLightCards>
        <Transaction>
          <Title>Listagem</Title>
          <TransactionsList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({item})=> <TransactionCard  data={item}/>}
          />
          
        </Transaction>
        </>
      }
    </Container>
  );
};
