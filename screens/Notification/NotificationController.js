import {useEffect} from 'react';

import messaging from '@react-native-firebase/messaging';
import {MMKV} from 'react-native-mmkv';

import notifee, {
  AuthorizationStatus,
  EventDetail,
  EventType,
} from '@notifee/react-native';

let channelId = 'demo';
const TOPIC = 'test_notification';

// ! Notification logic
export const NotificationController = () => {
  const onNotificationArrieved = () => {
    // dispatch(fetchAccountDetailsAction());
  };

  //  Function for navigation on proper screen
  const naviagteToScreen = detail => {
    console.log('Detail', detail);
    // TODO: logic for naviagtion
  };

  // Function for local notification click handle
  // const onNotifiClick = ({ type, detail }: {
  //     type: EventType,
  //     detail: EventDetail
  // }) => {
  //     try {
  //         switch (type) {
  //             case EventType.DISMISSED:
  //                 console.log('User dismissed notification => ', detail.notification);
  //                 break;
  //             case EventType.PRESS || EventType.ACTION_PRESS:
  //                 console.log(
  //                     'User pressed notification of background => ',
  //                     detail.notification,
  //                 );
  //                 break;
  //         }
  //     } catch (error) {
  //         console.log('Error when local notification clicked => ', error);
  //     }
  // };

  // useEffect(() => {
  //     const unsubscribeNotifeeBackgroundEvent = notifee.onBackgroundEvent(async ({ type, detail }) => {
  //         console.log('Notifee onBackgroundEvent called => ', type, detail);
  //         onNotifiClick({ type, detail });
  //     });
  //     return unsubscribeNotifeeBackgroundEvent;
  // }, []);

  // useEffect(() => {
  //     const unsubscribeNotifeeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
  //         console.log('Notifee onForegroundEvent called => ', type, detail);
  //         onNotifiClick({ type, detail });
  //     });
  //     return unsubscribeNotifeeForegroundEvent;
  // }, []);

  useEffect(() => {
    // initialize notifee for local notification
    configureNotification();

    /**
     * On iOS, messaging permission must be requested by
     * the current application before messages can be
     * received or sent
     */
    //  Functon for request permission
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    };
    requestUserPermission()
      .then(val => {
        /**
         * Returns an FCM token for this device
         */
        if (val) {
          messaging()
            .getToken()
            .then(async fcmToken => {
              storage.set('fcmtoken', fcmToken);
            })
            .catch(error => {
              console.log('FCM Token->', error);
            });
        } else {
          console.log('Unable to get token ');
        }
      })
      .catch(error => {
        console.log('Error during request persmission => ', error);
      });
    /**
     * When a notification from FCM has triggered the application
     * to open from a quit state, this method will return a
     * `RemoteMessage` containing the notification data, or
     * `null` if the app was opened via another method.
     */
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'getInitialNotification called:' +
              'Notification caused app to open from quit state',
          );
          console.log('Remote message => ', remoteMessage);
          naviagteToScreen(remoteMessage.data);
        }
      });

    /**
     * When the user presses a notification displayed via FCM,
     * this listener will be called if the app has opened from
     * a background state. See `getInitialNotification` to see
     * how to watch for when a notification opens the app from
     * a quit state.
     */
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        console.log(
          'onNotificationOpenedApp called: ' +
            'Notification caused app to open from background state',
        );
        console.log('Remote message => ', remoteMessage);
        naviagteToScreen(remoteMessage.data);
      }
    });

    /**
     * Set a message handler function which is called when
     * the app is in the background or terminated. In Android,
     * a headless task is created, allowing you to access the
     * React Native environment to perform tasks such as updating
     * local storage, or sending a network request.
     */
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log(
        'setBackgroundMessageHandler called: Message handled in the background!',
      );
      console.log('Remote message => ', remoteMessage);
    });

    /**
     * When any FCM payload is received, the listener callback
     * is called with a `RemoteMessage`. Returns an unsubscribe
     * function to stop listening for new messages.
     */
    const unsubscribeNewMessageListener = messaging().onMessage(
      async remoteMessage => {
        console.log(
          'A new FCM message arrived! => ',
          JSON.stringify(remoteMessage),
        );
        console.log('session name--', storage.getString('sessionName'));
        console.log('remoteMessage -- ', remoteMessage?.data?.fromm);
        if (
          remoteMessage?.notification?.title &&
          remoteMessage?.data?.fromm !== storage.getString('sessionName')
        ) {
          displayNotification(
            `${remoteMessage?.notification?.title}`,
            `${remoteMessage?.notification?.body ?? ''}`,
            remoteMessage?.data,
          );
          // onNotificationArrieved();
        }
      },
    );

    /**
     * Apps can subscribe to a topic, which allows the FCM
     * server to send targeted messages to only those devices
     * subscribed to that topic.
     */
    messaging()
      .subscribeToTopic(TOPIC)
      .then(() => {
        console.log(`Topic: ${TOPIC} Subscribed`);
      });

    return () => {
      /**
       * Unsubscribe listening new messsages and the device from a topic.
       */
      unsubscribeNewMessageListener();
      messaging().unsubscribeFromTopic(TOPIC);
    };
  }, []);

  return null;
};

//! =========== Local Notification setup via Notifee ===========

// Configure notifee in app

export const configureNotification = async () => {
  try {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.log('User denied permissions request');
    } else if (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
    ) {
      // console.log('User granted permissions request');
    } else if (
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    ) {
      console.log('User provisionally granted permissions request');
    }

    // Create a channel (required for Android)
    channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  } catch (error) {
    console.error('Error configuring notification => ', error);
  }
};

// Function for displaying local notifications in app
export const displayNotification = async (title, body, data) => {
  notifee.displayNotification({
    title: title ?? 'Notification Title',
    body: body ?? 'Main body content of the notification',
    data: data,
    android: {
      channelId: channelId ?? 'default',
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const storage = new MMKV({
  id: `user-chatRn-storage`,
  encryptionKey: 'chatRn2024',
});

export const sendNotification = async (text, fcmToken, title, from) => {
  console.log('text- ', text);
  console.log('fcmToken- ', fcmToken);
  console.log('title- ', title);
  console.log('from- ', from);

  try {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      'key',
    );
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      registration_ids: fcmToken,
      notification: {
        body: text,
        title: title,
        sound: 'default',
      },
      data: {
        fromm: from,
      },
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch(
      'https://fcm.googleapis.com/fcm/send',
      requestOptions,
    );
    const result = await response.text();
    console.log('notification result', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Call the async function
// sendNotification();
