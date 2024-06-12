import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import {sendNotification} from '../Notification/NotificationController';
function AddUserc({visible, props, groupId, onClose}) {
  const [userMembers, setuserMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedFcm, setSelectedfcm] = useState([]);

  useEffect(() => {
    async function onResult(QuerySnapshot) {
      try {
        const group = await firestore()
          .collection('THREADS')
          .doc(groupId)
          .get();
        const allUsers = QuerySnapshot.docs.map(docSnap => docSnap.data());
        const filteredUsers = allUsers.filter(
          user => !group.data().members.includes(user.uid),
        );
        setuserMembers(filteredUsers);
      } catch (error) {
        console.log('docSanp==', error);
      }
    }

    const unsubscribe = firestore()
      .collection('users')
      .where('uid', '!=', props.uid)
      .onSnapshot(onResult);
    return () => unsubscribe;
  }, [visible]);

  const addMemberToGroup = async () => {
    onClose();
    if (selected.length > 0) {
      try {
        const groupRef = firestore().collection('THREADS').doc(groupId);
        await groupRef.update({
          members: firestore.FieldValue.arrayUnion(...selected),
        });
        await groupRef.collection('messages').add({
          _id: new Date(),
          text: `${props.email} have added ${selected.length} members to the group.`,
          createdAt: new Date(),
          system: true,
        });
        sendNotification(
          `${props.email} have added you to the group.`,
          selectedFcm,
          'New Group',
        );
        setSelected([]);
        setSelectedfcm([]);
      } catch (error) {
        console.error('Error adding user to the group:', error);
      }
    } else {
      onClose();
    }
  };

  const selectMemeber = (id, fcmToken) => {
    const index = selected.indexOf(id);
    const tokenindex = selectedFcm.indexOf(fcmToken);
    if (index === -1) {
      setSelected([...selected, id]);
      setSelectedfcm([...selectedFcm, fcmToken]);
    } else {
      const updatedSelected = selected.filter(itemId => itemId !== id);
      const updatedFcm = selectedFcm.filter(itemId => itemId !== fcmToken);
      setSelected(updatedSelected);
      setSelectedfcm(updatedFcm);
    }
  };
  const renderCheckIcon = useCallback(
    id => {
      if (selected.indexOf(id) !== -1)
        return (
          <Icon
            name="checkmark-circle"
            color={'#009387'}
            size={30}
            onPress={onClose}
          />
        );
    },
    [selected],
  );
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
      style={{height: 400}}>
      <View style={styles.container}>
        <View style={{flex: 1, marginTop: 15}}>
          {userMembers.length > 0 ? (
            <FlatList
              data={userMembers}
              keyExtractor={item => item.uid}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => selectMemeber(item.uid, item.fcmToken)}>
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
                    {renderCheckIcon(item.uid)}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={{alignSelf: 'center', color: 'black'}}>
              No User Found
            </Text>
          )}
        </View>

        <Icon
          name="checkmark-sharp"
          color={'white'}
          size={30}
          onPress={addMemberToGroup}
          style={styles.iconStyle}
        />
      </View>
    </Modal>
  );
}
export default AddUserc;
const styles = StyleSheet.create({
  buttonCancel: {
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderColor: 'black',
    left: 13,
  },
  card: {
    width: '90%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: 'row',
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
