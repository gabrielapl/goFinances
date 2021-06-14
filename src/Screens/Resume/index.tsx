import React,{useEffect, useState, useCallback} from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Mouth,
  LoadContainer
} from './styles';

interface TransactionData{
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
 }
 interface CategoryData{
   key:string;
   name: string;
   total: Number;
   totalFormatted: string;
   color: string;
   percentFormatted: string;

 }

import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';


import { HistoryCard } from '../../components/HistoryCard';
import { categories } from '../../utils/categories';

export function Resume(){

  const theme = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])

  const dataKey = `@gofinances:transactions_user${user.id}`;


  function handleDateChange(action: 'next'| 'prev'){
    if(action === 'next'){
      setSelectedDate(addMonths(selectedDate,1) )
    }else{
      setSelectedDate(subMonths(selectedDate,1) )
    }
  }

  async function loadData(){
    setIsLoading(true) 
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted
    .filter((expensive:TransactionData) => 
    expensive.type === 'negative' &&
    new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
    new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensivesTotal = expensives
    .reduce((accumulator: number, expensive:TransactionData)=>{
      return accumulator + Number(expensive.amount)
    },0);


    const totalByCategory: CategoryData[] = [];

    categories.forEach(category => {
      let categorySum = 0;

      expensives.forEach((expensive:TransactionData)=> {
        if(expensive.category === category.key){
          categorySum += Number(expensive.amount);
        }
      });
      if(categorySum > 0 ){
        const totalFormatted = categorySum
        .toLocaleString('pt-BR',{
          style:'currency',
          currency: 'BRL'
        });
        const percent = (categorySum / expensivesTotal * 100);
        const percentFormatted = `${percent.toFixed(0)}%`;
        totalByCategory.push({
          name: category.name,
          color: category.color,
          key: category.key,
          total: categorySum,
          totalFormatted,
          percentFormatted
        });
      };
    });
    setTotalByCategories(totalByCategory)
    setIsLoading(false)
  }

  useFocusEffect(useCallback(()=>{
    loadData();
  },[selectedDate]));
  return(
    <Container>
      
        <Header>
          <Title>Resumo por categoria</Title>
        </Header>
        {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
        :
        <Content 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal:24,
            paddingBottom:  useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={()=>handleDateChange('prev')} >
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Mouth>{format(selectedDate,"MMMM, yyyy", {locale: ptBR})}</Mouth>

            <MonthSelectButton  onPress={()=>handleDateChange('next')} >
              <MonthSelectIcon name="chevron-right"  />
            </MonthSelectButton>
          </MonthSelect>
          <ChartContainer>
            <VictoryPie
                data={totalByCategories}
                colorScale={totalByCategories.map(category => category.color)}
                style={{
                  labels: { 
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape
                  }
                }}
                labelRadius={50}
                x="percentFormatted"
                y="total"
            />
          </ChartContainer>
          {
            totalByCategories.map(item => (
              <HistoryCard
                key={item.key}
                title={item.name}
                amount={item.totalFormatted}
                color={item.color}
              />
            ))
            
          }
        </Content>
    }
    </Container>
  );
};
