import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAllGroups} from './helper/hepler';
const GroupScreen = ({route, navigation}) => {
  const [groups, setgroups] = useState(null);

  useEffect(() => {
    function onResult(QuerySnapshot) {
      setgroups(getAllGroups(QuerySnapshot));
    }
    const unsubscribe = firestore()
      .collection('THREADS')
      .where('members', 'array-contains', route.params.userid)
      .onSnapshot(onResult);
    return () => unsubscribe;
  }, []);

  return (
    <View style={styles.Contain}>
      <SafeAreaView>
        <StatusBar />
        <View style={styles.Contain}>
          <FlatList
            data={groups}
            contentContainerStyle={{flexGrow: 1}}
            keyExtractor={item => item.name}
            ListEmptyComponent={
              <Text style={{color: 'black'}}>No Group Avaliable</Text>
            }
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Chats', {
                    name: item.name,
                    uid: item.threadId,
                    fcmToken: item.members,
                    from: 'group',
                    item: item,
                  })
                }>
                <View style={styles.card}>
                  <View style={styles.userImageST}>
                    {item.groupImage ? (
                      <Image
                        style={styles.userImageST}
                        resizeMode="cover"
                        source={{uri: item.groupImage}}
                      />
                    ) : (
                      <Icon
                        style={{alignSelf: 'center'}}
                        name={'person'}
                        size={25}
                        color={'white'}
                      />
                    )}
                  </View>
                  <View style={styles.textArea}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.msgContent}>
                      {item.latestMessage.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default GroupScreen;
const styles = StyleSheet.create({
  Contain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userImageST: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
    backgroundColor: '#009387',
    justifyContent: 'center',
  },
  textArea: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 5,
    paddingLeft: 10,
    width: 300,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },

  nameText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Verdana',
    color: 'black',
  },
  msgContent: {
    paddingTop: 5,
    color: 'black',
  },
});
