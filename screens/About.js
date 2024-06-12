import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import storagee from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import {sendNotification} from './Notification/NotificationController';
const About = ({navigation, route, user}) => {
  const {groupitem} = route.params;
  const [groupmembers, setgroupmembers] = useState([]);
  const [grupeImage, setgrupimage] = useState();
  const [lodingtwo, setlodingtwo] = useState(false);
  useEffect(() => {
    function onResult(QuerySnapshot) {
      try {
        function onResult(QuerySnapshot) {
          try {
            const fcmtokens = QuerySnapshot.docs.map(docSnap => docSnap.data());
            setgroupmembers(fcmtokens);
          } catch (error) {
            console.log('docSnap==', error);
          }
        }
        const groupdata = QuerySnapshot.data();
        setgrupimage(groupdata?.groupImage);
        firestore()
          .collection('users')
          .where('uid', 'in', groupdata.members)
          .onSnapshot(onResult);
      } catch (error) {
        console.log('docSnap==', error);
      }
    }

    // Assuming userIDs is an array of user IDs you want to fetch
    const unsubscribe = firestore()
      .collection('THREADS')
      .doc(groupitem.threadId)
      .onSnapshot(onResult);

    return () => unsubscribe;
  }, [lodingtwo]);

  const removeMemberFromGroup = async item => {
    try {
      const groupRef = firestore()
        .collection('THREADS')
        .doc(groupitem.threadId);

      // Remove the specified member from the 'members' array
      await groupRef.update({
        members: firestore.FieldValue.arrayRemove(item.uid),
      });

      // Add a system message indicating the member removal
      await groupRef.collection('messages').add({
        _id: new Date(),
        text: `admin removed a member from the group.`,
        createdAt: new Date(),
        system: true,
      });

      // Notify the removed member
      sendNotification(
        `admin removed you from the group.`,
        [item.fcmToken],
        'Group Removal',
        user.uid,
      );
      // navigation.goBack();
    } catch (error) {
      console.error('Error removing user from the group:', error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      // Reference to the group document
      const groupRef = firestore()
        .collection('THREADS')
        .doc(groupitem.threadId);

      // Delete the group document
      await groupRef.delete();

      // Navigate back or perform any other action after deletion
      navigation.navigate('Group');
    } catch (error) {
      console.error('Error deleting group:', error);
      // Handle the error, e.g., show an alert
      // Alert.alert('Error', 'Could not delete the group. Please try again.');
    }
  };
  const exitGroup = async () => {
    try {
      const groupRef = firestore()
        .collection('THREADS')
        .doc(groupitem.threadId);

      // Remove the specified member from the 'members' array
      await groupRef.update({
        members: firestore.FieldValue.arrayRemove(user.uid),
      });

      // Add a system message indicating the member removal
      await groupRef.collection('messages').add({
        _id: new Date(),
        text: `1 member exit from the group.`,
        createdAt: new Date(),
        system: true,
      });
      navigation.navigate('Group');
    } catch (error) {
      console.error('Error removing user from the group:', error);
    }
  };
  const ListFooterComponent = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => exitGroup()}
          style={{
            height: 50,
            width: '93%',
            borderColor: '#009387',
            alignSelf: 'center',
            marginTop: 20,
            borderWidth: 1,
            justifyContent: 'center',
          }}>
          <Text style={{alignSelf: 'center', color: '#009387'}}>
            Exit Group
          </Text>
        </TouchableOpacity>
        {groupitem.createdBy == user.uid && (
          <TouchableOpacity
            onPress={() => handleDeleteGroup()}
            style={{
              height: 50,
              width: '93%',
              borderColor: '#009387',
              alignSelf: 'center',
              marginTop: 20,
              borderWidth: 1,
              justifyContent: 'center',
            }}>
            <Text style={{alignSelf: 'center', color: '#009387'}}>
              Delete Group
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const geturl = async filename => {
    let imageRef = storagee().ref('/' + filename);
    imageRef
      .getDownloadURL()
      .then(url => {
        firestore().collection('THREADS').doc(groupitem.threadId).update({
          groupImage: url,
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
    <View style={styles.Contain}>
      <View style={styles.userImageSTT}>
        {grupeImage ? (
          <Image
            style={styles.groupImage}
            resizeMode="cover"
            source={{uri: grupeImage}}
          />
        ) : (
          <Icon
            style={{alignSelf: 'center'}}
            name={'person'}
            size={55}
            color={'white'}
          />
        )}
        {lodingtwo && (
          <ActivityIndicator
            size={'small'}
            style={{alignSelf: 'center'}}
            color={'#009387'}
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: -1,
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
      <View>
        <Text
          style={{
            alignSelf: 'center',
            color: 'black',
            marginVertical: 10,
            fontSize: 16,
          }}>
          {groupitem.name}
        </Text>
        <Text
          style={{
            alignSelf: 'center',
            color: 'black',
            fontSize: 16,
          }}>
          {new Date(
            groupitem.grupecreatedAt.seconds * 1000 +
              Math.round(groupitem.grupecreatedAt.nanoseconds / 1e6),
          ).toLocaleString()}
        </Text>
      </View>

      <Text
        style={{
          color: '#009387',
          fontWeight: 'bold',
          fontSize: 16,
          paddingTop: 5,
        }}>{`${groupmembers.length} members`}</Text>
      <FlatList
        data={groupmembers}
        style={{marginTop: 30, width: '100%'}}
        keyExtractor={item => item.uid}
        ListFooterComponent={ListFooterComponent}
        renderItem={({item}) => (
          <View
          // onPress={() => selectMemeber(item.uid, item.fcmToken)}
          >
            <View style={styles.card}>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.userImageST}>
                  <Icon
                    style={{alignSelf: 'center'}}
                    name={'person'}
                    size={25}
                    color={'white'}
                  />
                </View>
                <View style={styles.textArea}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.msgContent}>{item.email}</Text>
                </View>
              </View>
              {groupitem.createdBy == item.uid ? (
                <View
                  style={{
                    right: 50,
                    alignSelf: 'center',
                    backgroundColor: '#00bfa5',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                    }}>
                    Admin
                  </Text>
                </View>
              ) : (
                groupitem.createdBy == user.uid && (
                  <TouchableOpacity
                    onPress={() => removeMemberFromGroup(item)}
                    style={{
                      right: 50,
                      alignSelf: 'center',
                      borderRadius: 10,
                    }}>
                    <Text
                      style={{
                        color: '#009387',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                      }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};
export default About;

const styles = StyleSheet.create({
  Contain: {
    flex: 1,
    alignItems: 'center',
  },
  userImageSTT: {
    alignSelf: 'center',
    backgroundColor: '#009387',
    height: '20%',
    width: '40%',
    marginTop: '10%',
    borderRadius: 200,
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  userImageST: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
    backgroundColor: '#009387',
    justifyContent: 'center',
  },
  groupImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
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
  container: {
    height: '70%',
    width: '100%',
    marginTop: 25,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  msgContent: {
    paddingTop: 5,
    color: 'black',
  },

  iconStyle: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 25,
    right: 30,
    backgroundColor: '#009387',
    padding: 10,
    borderRadius: 5,
  },
});
