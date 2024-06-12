/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  useColorScheme,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storagee from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';

Icon.loadFont().then();

const ProfileScreen = ({user}) => {
  const [users, setUsers] = useState(null);
  const [loding, setloding] = useState(true);
  const [lodingtwo, setlodingtwo] = useState(false);

  //   const [messages, setMessages] = useState([]);
  //
  const getUsers = async () => {
    const querySanp = await firestore()
      .collection('users')
      .where('uid', '==', user.uid)
      .get();
    const allUsers = querySanp.docs.map(docSnap => docSnap.data());
    setUsers(allUsers);
    setloding(false);
  };

  useEffect(() => {
    getUsers();
  }, [lodingtwo]);
  const geturl = async filename => {
    let imageRef = storagee().ref('/' + filename);
    imageRef
      .getDownloadURL()
      .then(url => {
        firestore().collection('users').doc(user.uid).update({
          profilePic: url,
        });
      })
      .catch(e => console.log('getting downloadURL of image error => ', e))
      .finally(() => {
        setlodingtwo(false);
      });
  };
  const uploadfile = async uploaduri => {
    setlodingtwo(true);
    const filename = uploaduri.substring(uploaduri.lastIndexOf('/') + 1);
    const task = storagee().ref(filename).putFile(uploaduri);
    try {
      await task;
      await geturl(filename);
    } catch (e) {
      console.error(e);
    }
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        copyTo: 'documentDirectory',
        mode: 'import',
        allowMultiSelection: true,
      });
      const fileUri = result[0].fileCopyUri;
      if (!fileUri) {
        return;
      }
      if (fileUri.indexOf('.png') !== -1 || fileUri.indexOf('.jpg') !== -1) {
        uploadfile(
          Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        );
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.log('DocumentPicker err => ', err);
        throw err;
      }
    }
  };
  return (
    <SafeAreaView>
      {!loding && (
        <ScrollView>
          <View style={styles.card}>
            <View style={{backgroundColor: '#009387', borderRadius: 100}}>
              {users[0].profilePic ? (
                <Image
                  style={styles.userImageST}
                  resizeMode="cover"
                  source={{uri: users[0].profilePic}}
                />
              ) : (
                <Icon
                  style={{alignSelf: 'center', padding: 10}}
                  name={'person'}
                  size={55}
                  color={'white'}
                />
              )}

              <View
                style={{
                  position: 'absolute',
                  bottom: -8,
                  alignSelf: 'flex-end',
                }}>
                <Icon
                  style={{alignSelf: 'center'}}
                  name={'create'}
                  size={25}
                  color={'#009387'}
                  onPress={() => pickImage()}
                />
              </View>
            </View>
            {lodingtwo && (
              <ActivityIndicator
                size={'small'}
                style={{alignSelf: 'center'}}
                color={'#009387'}
              />
            )}
            <View style={styles.textArea}>
              <Text style={styles.msgContent}>{users[0].name}</Text>
              <Text style={styles.msgContent}>{users[0].email}</Text>
              <TouchableOpacity
                onPress={() => auth().signOut()}
                style={[
                  styles.signIn,
                  {
                    borderColor: '#009387',
                    borderWidth: 1,
                    marginTop: 15,
                  },
                ]}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#009387',
                    },
                  ]}>
                  {' '}
                  Log out{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  card: {
    width: '100%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    paddingTop: 100,
    alignItems: 'center',
    textAlign: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
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
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  textArea: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 5,
    paddingLeft: 10,
    width: 200,
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
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: 'Verdana',
    color: '#009387',
  },
  msgTime: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: -20,
  },
  msgContent: {
    paddingTop: 5,
    textAlign: 'center',
    color: '#009387',
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

export default ProfileScreen;
