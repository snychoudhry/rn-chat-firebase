/**
 * @format
 */

import {AppRegistry, Alert, Linking} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

setJSExceptionHandler((e, fatal) => {
  if (fatal) {
    showAlert(`${e.name}\n${e.message}`, 'JS');
  } else {
    console.log(`JSException\n${e}`);
  }
}, true);

setNativeExceptionHandler(e => {
  showAlert(e, 'NATIVE');
  console.log(`NativeException\n${e}`);
});

// Ask user to email me the log
function showAlert(msg, mode) {
  Alert.alert(
    `FATAL ${mode} ERROR`,
    `${msg}\n\nPlease contact developer`,
    [
      {
        text: 'OK',
        style: 'cancel',
        onPress: () => null,
      },
      {
        text: 'E-mail',
        onPress: () =>
          Linking.openURL(
            `mailto:${'sorbh73@gmail.com'}?subject=[Chat App] &body=${msg}`,
          ),
      },
    ],
    {cancelable: false},
  );
}
AppRegistry.registerComponent(appName, () => App);
