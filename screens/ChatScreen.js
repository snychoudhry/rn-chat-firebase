import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getUrl,
  timeFormat,
  updateLetestMessage,
  updateMessages,
  fileUploadd,
  getFcmTokens,
  getMessages,
} from './helper/hepler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {GiftedChat, Bubble, InputToolbar, Send} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import DocumentPicker from 'react-native-document-picker';
import InChatFileTransfer from './Components/InChatFileTransfer';
import InChatViewFile from './Components/InChatViewFile';
import AddUserc from './Components/AddUserc';
import {sendNotification} from './Notification/NotificationController';
import {storage} from './Notification/NotificationController';
const ChatScreen = ({user, route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const {uid, from, fcmToken, item} = route.params;
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [priloading, setpriloading] = useState(true);
  const [transe, setTransferred] = useState();
  const [uplodedimagerul, setuplodedimagerul] = useState('');
  const [loding, setloding] = useState(false);
  const [selecteditem, setselecteditem] = useState();
  const [username, setusername] = useState('');
  const [showAddUser, setshowAddUser] = useState(false);
  const [fcmTokenss, setfcmTokens] = useState([]);
  useEffect(() => {
    const docid = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid;
    function onResult(QuerySnapshot) {
      setMessages(getMessages(QuerySnapshot));
    }
    const unsubscribe = firestore()
      .collection(from == 'group' ? 'THREADS' : 'Chats')
      .doc(from == 'group' ? uid : docid)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(onResult);
    return () => unsubscribe;
  }, []);
  useEffect(() => {
    function onResult(QuerySnapshot) {
      // console.log(getFcmTokens(QuerySnapshot));
      setfcmTokens(getFcmTokens(QuerySnapshot));
      console.log('fcmTokenss     ', fcmTokenss);
      // try {
      //   const fcmtokens = QuerySnapshot.docs
      //     .filter(
      //       docSnap =>
      //         docSnap.data().fcmToken !== storage.getString('fcmtoken'),
      //     )
      //     .map(docSnap => docSnap.data().fcmToken);
      //   setfcmTokens(fcmtokens);
      // } catch (error) {
      //   console.log('docSnap==', error);
      // }
    }

    // Assuming userIDs is an array of user IDs you want to fetch
    const unsubscribe = firestore()
      .collection('users')
      .where('uid', 'in', from == 'group' ? fcmToken : [uid])
      .onSnapshot(onResult);

    return () => unsubscribe;
  }, []); // Ensure that the dependency array is empty to mimic componentDidMount behavior

  useEffect(() => {
    storage.set('sessionName', uid);
    return () => {
      storage.delete('sessionName');
    };
  }, []);

  useEffect(() => {
    const getUserName = async () => {
      const querySanp = await firestore()
        .collection('users')
        .where('uid', '==', user.uid)
        .get();
      const allUsers = querySanp.docs.map(docSnap => docSnap.data());
      setusername(allUsers[0].name);
    };
    if (from == 'group') {
      navigation.setOptions({
        headerRight: () => (
          <View style={{flexDirection: 'row'}}>
            {user.uid == item.createdBy && (
              <Icon
                name="person-add-outline"
                size={25}
                color="white"
                onPress={() => setshowAddUser(!showAddUser)}
                style={{marginRight: 10}}
              />
            )}
            <Icon
              name="ellipsis-vertical"
              size={25}
              color="white"
              onPress={() =>
                navigation.navigate('About', {
                  name: route.params.name,
                  groupitem: item,
                })
              }
              style={{marginRight: 10}}
            />
          </View>
        ),
      });
    }
    getUserName();
  }, []);

  const uploadfile = async uploaduri => {
    try {
      await fileUploadd(uploaduri).then(() => {
        getUrl(uploaduri)
          .then(url => {
            setuplodedimagerul(url);
          })
          .finally(() => {
            setpriloading(false);
            setloding(false);
          });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const _pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.pdf,
          DocumentPicker.types.video,
          DocumentPicker.types.audio,
        ],
        copyTo: 'documentDirectory',
        mode: 'import',
        allowMultiSelection: true,
      });
      const fileUri =
        Platform.OS === 'ios'
          ? result[0].fileCopyUri.replace('file://', '')
          : result[0].fileCopyUri;
      if (!fileUri) {
        return;
      }
      if (
        ['.png', '.jpg', '.mp4', '.mov'].some(extension =>
          fileUri.includes(extension),
        )
      ) {
        setImagePath(fileUri);
        setIsAttachImage(true);
      } else {
        setFilePath(fileUri);
        setIsAttachFile(true);
      }
      setloding(true);
      uploadfile(fileUri);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.log('DocumentPicker err => ', err);
        throw err;
      }
    }
  };

  const renderSend = props => {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={_pickDocument}>
          <Icon
            type="font-awesome"
            name="attach"
            style={styles.paperClip}
            size={28}
            color="grey"
          />
        </TouchableOpacity>
        {!loding ? (
          <Send {...props}>
            <View style={styles.sendContainer}>
              <Icon
                type="font-awesome"
                name="send"
                style={styles.sendButton}
                size={25}
                color="#009387"
              />
            </View>
          </Send>
        ) : null}
      </View>
    );
  };
  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View style={styles.chatFooter}>
          <ImageBackground
            source={{uri: imagePath}}
            style={{height: 75, width: 75, justifyContent: 'center'}}>
            {loding == true ? (
              <ActivityIndicator
                color={'white'}
                size={'small'}
                style={{alignSelf: 'center'}}
              />
            ) : null}
          </ImageBackground>
          <TouchableOpacity
            onPress={() => {
              setImagePath(''), setloding(false);
            }}
            style={styles.buttonFooterChatImg}>
            <View style={styles.textFooterChat}>
              <Text style={{color: '#009387', alignSelf: 'center'}}>X</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    if (filePath) {
      return (
        <View style={styles.chatFooter}>
          <InChatFileTransfer filePath={filePath} />
          <TouchableOpacity
            onPress={() => setFilePath('')}
            style={styles.buttonFooterChatImg}>
            <View style={styles.textFooterChat}>
              <Text style={{color: '#009387', alignSelf: 'center'}}>X</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filePath, imagePath, loding]);

  const onSend = useCallback(
    (messages = []) => {
      const [messageToSend] = messages;
      var newMessage = {
        ...messageToSend,
        createdAt: new Date(),
        sentBy: user.uid,
        sentTo: uid,
        image: isAttachImage
          ? imagePath.split('.').pop() == 'mp4'
            ? ''
            : uplodedimagerul
          : '',
        vedio: isAttachImage
          ? imagePath.split('.').pop() == 'mp4'
            ? uplodedimagerul
            : ''
          : '',
        file: {
          url: isAttachFile
            ? filePath.split('.').pop() == 'pdf' ||
              filePath.split('.').pop() == 'mp3'
              ? uplodedimagerul
              : ''
            : '',
          type: isAttachFile ? filePath.split('.').pop() : '',
        },
      };
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessage),
      );
      const docid =
        uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid;
      updateLetestMessage(from, uid, docid, newMessage);
      updateMessages(from, uid, docid, newMessage);
      setImagePath('');
      setIsAttachImage(false);
      setFilePath('');
      setIsAttachFile(false);
      sendNotification(
        newMessage.text,
        fcmTokenss,
        `New Message From ${username}`,
        from == 'group' ? uid : user.uid,
      );
    },
    [
      filePath,
      imagePath,
      isAttachFile,
      isAttachImage,
      uplodedimagerul,
      username,
    ],
  );
  //
  const renderBubble = useCallback(
    props => {
      const {currentMessage} = props;
      // return funtion for attached vedio,audio and pdf massages
      if (
        (currentMessage.file && currentMessage.file.url) ||
        currentMessage.vedio
      ) {
        return (
          <TouchableOpacity
            style={{
              ...styles.fileContainer,
              backgroundColor:
                props.currentMessage.user._id === user.uid
                  ? '#009387'
                  : 'lightgrey',
              borderBottomLeftRadius:
                props.currentMessage.user._id === user.uid ? 15 : 5,
              borderBottomRightRadius:
                props.currentMessage.user._id === user.uid ? 5 : 15,
              right:
                props.currentMessage.user._id === user.uid
                  ? 0
                  : currentMessage.vedio
                  ? '35%'
                  : '35%',
            }}
            onPress={() => {
              setFileVisible(!fileVisible);
              setselecteditem(currentMessage);
            }}>
            <InChatFileTransfer
              style={{marginTop: -10}}
              filePath={
                currentMessage.vedio
                  ? currentMessage.vedio
                  : currentMessage.file.url
              }
            />
            <Text
              style={{
                ...styles.fileText,
                color: currentMessage.user._id === user.uid ? 'white' : 'black',
              }}>
              {currentMessage.text}
            </Text>
            <View style={styles.msgTimetextCon}>
              <Text style={styles.msgTimetext}>
                {props.currentMessage.user._id !== user.uid &&
                  currentMessage.user.name}
              </Text>
              <Text style={styles.msgTimetext}>
                {timeFormat(currentMessage.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
      // return funtion for only text and attached images massages
      return (
        <Bubble
          {...props}
          renderUsernameOnMessage={from == 'group' ? true : false}
          wrapperStyle={{
            right: {
              backgroundColor: '#009387',
            },
            left: {
              backgroundColor: 'lightgrey',
              right: '13%',
            },
          }}
          textStyle={{
            right: {
              color: '#efefef',
            },
          }}
        />
      );
    },
    [fileVisible, selecteditem],
  );

  // for scrolling mssages to the most recent
  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  return (
    <View style={{flex: 1}}>
      <GiftedChat
        style={{flex: 1}}
        messages={messages}
        onSend={text => onSend(text)}
        renderChatFooter={renderChatFooter}
        renderSend={renderSend}
        user={{
          _id: user.uid,
          name: username,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={props => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{borderTopWidth: 1.5, borderTopColor: '#009387'}}
              textInputStyle={{color: 'black'}}
            />
          );
        }}
        alwaysShowSend
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
      />

      {/* view Component for attached pdf files and vedios */}
      {fileVisible ? (
        <InChatViewFile
          props={selecteditem}
          visible={fileVisible}
          filee={selecteditem}
          onClose={() => setFileVisible(!fileVisible)}
        />
      ) : null}

      {/* add users in the group Component */}
      <AddUserc
        visible={showAddUser}
        props={user}
        groupId={uid}
        onClose={() => setshowAddUser(false)}
      />
    </View>
  );
};
export default ChatScreen;

export const styles = StyleSheet.create({
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
  },
  fileContainer: {
    flex: 1,
    maxWidth: 300,
    marginVertical: 2,
    borderRadius: 15,
  },
  fileText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 5,
  },
  msgTime: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: -20,
  },
  msgContent: {
    paddingTop: 5,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  sendContainer: {
    padding: 8,
  },
  video: {
    width: '92%',
    aspectRatio: 16 / 9,
    marginTop: 10,
    marginLeft: '4%',
    marginRight: '4%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  paperClip: {
    padding: 8,
  },
  chatFooter: {
    backgroundColor: '#009387',
    flexDirection: 'row',
    padding: 7,
  },
  textFooterChat: {
    backgroundColor: 'lightgrey',
    borderRadius: 40,
    color: 'white',
    width: 20,
    height: 20,
    justifyContent: 'center',
  },
  msgTimetext: {
    alignSelf: 'flex-end',
    margin: 4,
    fontSize: 12,
    backgroundColor: 'transparent',
    color: 'white',
  },
  msgTimetextCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '96%',
    alignSelf: 'center',
  },
});
