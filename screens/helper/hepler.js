import dayjs from 'dayjs';
import firestore from '@react-native-firebase/firestore';
import storagee from '@react-native-firebase/storage';
import {storage} from '../Notification/NotificationController';

// get all users
export const getUsers = QuerySnapshot => {
  try {
    return QuerySnapshot.docs.map(docSnap => docSnap.data());
  } catch (error) {
    console.log('docSanp==', error);
  }
};
// get all added and created grups for user
export const getAllGroups = QuerySnapshot => {
  try {
    return QuerySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const threadId = docSnap.id;
      return {...data, threadId};
    });
  } catch (error) {
    console.log('docSanp==', error);
  }
};
//get fcm tokens
export const getFcmTokens = QuerySnapshot => {
  try {
    const fcmtokens = QuerySnapshot.docs
      .filter(
        docSnap => docSnap.data().fcmToken !== storage.getString('fcmtoken'),
      )
      .map(docSnap => docSnap.data().fcmToken);
    // console.log('fcmtokens   -   >', fcmtokens);
    return fcmtokens;
  } catch (error) {
    console.log('docSnap==', error);
  }
};
// get messages
export const getMessages = QuerySnapshot => {
  try {
    const allTheMsgs = QuerySnapshot.docs.map(docSanp => {
      return {
        ...docSanp.data(),
        createdAt: docSanp.data()?.createdAt?.toDate(),
      };
    });
    return allTheMsgs;
  } catch (error) {
    console.log('docSanp==', error);
  }
};
// update letest message on firestore
export const updateLetestMessage = (from, uid, docid, newMessage) => {
  firestore()
    .collection(from == 'group' ? 'THREADS' : 'Chats')
    .doc(from == 'group' ? uid : docid)
    .set(
      {
        latestMessage: {
          ...newMessage,
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
      },
      {merge: true},
    );
};
export const updateMessages = (from, uid, docid, newMessage) => {
  firestore()
    .collection(from == 'group' ? 'THREADS' : 'Chats')
    .doc(from == 'group' ? uid : docid)
    .collection('messages')
    .add({
      ...newMessage,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};
export const fileUploadd = async uploaduri => {
  const filename = uploaduri.substring(uploaduri.lastIndexOf('/') + 1);
  const task = storagee().ref(filename).putFile(uploaduri);
  task.on('state_changed', snapshot => {
    console.log(
      Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000,
    );
  });
  try {
    await task;
  } catch (e) {
    console.error(e);
  }
};

export const getUrl = async uploaduri => {
  const filename = uploaduri.substring(uploaduri.lastIndexOf('/') + 1);
  let imageRef = storagee().ref('/' + filename);
  return imageRef
    .getDownloadURL()
    .then(url => {
      return url;
    })
    .catch(e => console.log('getting downloadURL of image error => ', e));
};

export const getUserName = async userid => {
  const querySanp = await firestore()
    .collection('users')
    .where('uid', '==', userid)
    .get();
  const allUsers = querySanp.docs.map(docSnap => docSnap.data());
  return allUsers[0];
};

export const timeFormat = dateString => {
  return dayjs(dateString).locale('en').format('LT');
};
