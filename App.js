import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import SignupScreen from './screens/SignupScreen';
import SigninScreen from './screens/SigninScreen';
import MessageScreen from './screens/MessageScreen';
import GroupScreen from './screens/GroupScreen';
import About from './screens/About';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {NotificationController} from './screens/Notification/NotificationController';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

<Stack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
  <Stack.Screen name="Chats" component={ChatScreen} />
  <Stack.Screen name="About" component={About} />
</Stack.Navigator>;
const msgsName = 'Messages';
const profileName = 'Profile';
const GroupName = 'Group';

function TheTab({user, setvisiblee}) {
  return (
    <Tab.Navigator
      initialRouteName={msgsName}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let rn = route.name;
          if (rn === msgsName) {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (rn === profileName) {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        headerStyle: {
          backgroundColor: '#009387',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#009387',
        tabBarInactiveTintColor: 'grey',
        tabBarLabelStyle: {paddingBottom: 5, fontSize: 10, fontWeight: '900'},
      })}>
      <Tab.Screen name="Messages">
        {props => <MessageScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Group" options={{headerShown: false}}>
        {props => (
          <Stack.Navigator>
            <Stack.Screen
              name="GroupScreen"
              component={GroupScreen}
              initialParams={{userid: user.uid}}
              options={{
                title: 'Group',
                headerRight: () => (
                  <Icon
                    name="add"
                    onPress={() => setvisiblee()}
                    size={30}
                    color="white"
                    style={{marginRight: 10}}
                  />
                ),
                headerStyle: {
                  backgroundColor: '#009387',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Stack.Navigator>
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, setUser] = useState('');
  const [visible, setvisible] = useState(false);
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    const userCheck = auth().onAuthStateChanged(userExist => {
      if (userExist) {
        setUser(userExist);
      } else {
        setUser('');
      }
    });
    return () => {
      userCheck();
    };
  }, []);

  const createRoom = () => {
    if (channelName.length > 0) {
      const createGroupAndAddUser = async (channelName, userId) => {
        try {
          // Create a group
          const groupRef = await firestore()
            .collection('THREADS')
            .add({
              name: channelName,
              latestMessage: {
                text: `You have joined the room ${channelName}.`,
                createdAt: new Date(),
              },
              members: [userId],
              grupecreatedAt: new Date(),
              createdBy: userId,
            });

          const groupId = groupRef.id;
          // Add a system message to the group
          await groupRef.collection('messages').add({
            _id: new Date(),
            text: `You have joined the ${channelName}.`,
            createdAt: new Date(),
            system: true,
          });
          return groupId;
        } catch (error) {
          console.error('Error creating group and adding user:', error);
          return null;
        }
      };
      createGroupAndAddUser(channelName, user.uid);
      setChannelName('');
      setvisible(!visible);
    }
  };
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#009387',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          {user ? (
            <>
              <Stack.Screen name="Home" options={{headerShown: false}}>
                {props => (
                  <TheTab
                    {...props}
                    user={user}
                    visiblee={visible}
                    setvisiblee={() => setvisible(!visible)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Chats"
                options={({route}) => ({
                  title: route.params.name,
                  headerBackTitleVisible: false,
                })}>
                {props => <ChatScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="About"
                options={({route}) => ({
                  title: route.params.name,
                  headerBackTitleVisible: false,
                })}>
                {props => <About {...props} user={user} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen
                name="Signin"
                component={SigninScreen}
                options={() => ({
                  headerBackVisible: false,
                  headerShown: false,
                })}
              />

              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={() => ({
                  headerBackVisible: false,
                  headerShown: false,
                })}
              />
            </>
          )}
        </Stack.Navigator>
        <NotificationController />
      </NavigationContainer>
      <Modal
        visible={visible}
        onRequestClose={() => setvisible(!visible)}
        animationType="slide"
        style={{height: 600}}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <Icon
            name="close-circle-outline"
            color={'#009387'}
            size={30}
            onPress={() => setvisible(!visible)}
            style={{alignSelf: 'flex-end', padding: 10}}
          />
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Create a new channel</Text>
            <TextInput
              placeholder="Channel Name"
              placeholderTextColor={'#009387'}
              maxLength={12}
              value={channelName}
              onChangeText={text => setChannelName(text)}
              clearButtonMode="while-editing"
              style={styles.inputStyle}
            />
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => createRoom()}
              disabled={channelName.length === 0}>
              <Text style={styles.buttonLabel}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  iconColor: {
    color: '009387',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#009387',
  },
  buttonLabel: {
    fontSize: 22,
    color: 'white',
    alignSelf: 'center',
  },
  buttonStyle: {
    backgroundColor: '#009387',
    height: 50,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  inputStyle: {
    height: 54,
    width: '90%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#009387',
    color: 'black',
  },
});
