import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-virtualized-view';
import firestore from '@react-native-firebase/firestore';
import {getUsers} from './helper/hepler';
Icon.loadFont().then();

const MessageScreen = ({user, navigation}) => {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    function onResultt(QuerySnapshot) {
      setUsers(getUsers(QuerySnapshot));
    }
    const unsubscribe = firestore()
      .collection('users')
      .where('uid', '!=', user.uid)
      .onSnapshot(onResultt);
    return () => unsubscribe;
  }, []);

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView>
        <View style={styles.Contain}>
          <FlatList
            data={users}
            keyExtractor={item => item.uid}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Chats', {
                    name: item.name,
                    uid: item.uid,
                    from: 'messages',
                    fcmToken: item.fcmToken,
                    item: item,
                  })
                }>
                <View style={styles.card}>
                  <View style={styles.userImageST}>
                    {item.profilePic ? (
                      <Image
                        style={styles.userImageST}
                        resizeMode="cover"
                        source={{uri: item.profilePic}}
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
                    <Text style={styles.msgTime}>{item.messageTime}</Text>
                    <Text style={styles.msgContent}>{item.email}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Contain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profilephoto: {},
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userImage: {
    paddingTop: 15,
    paddingBottom: 15,
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
  userText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Verdana',
    color: 'black',
  },
  msgTime: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: -20,
    color: 'black',
  },
  msgContent: {
    paddingTop: 5,
    color: 'black',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default MessageScreen;
