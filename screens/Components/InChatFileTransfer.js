import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import SoundPlayer from 'react-native-sound-player';
import {useFocusEffect} from '@react-navigation/native';

Icon.loadFont().then();

const InChatFileTransfer = ({filePath}) => {
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        _onFinishedPlayingSubscription.remove();
        _onFinishedLoadingURLSubscription.remove();
        try {
          SoundPlayer.stop();
        } catch (e) {
          console.log('cannot play the song file', e);
        }
      };
    }, []),
  );
  const [playaudio, setplayaudio] = useState(false);
  const [audiodur, setaudiodue] = useState();
  const [playingurl, setplayingurl] = useState('');

  let _onFinishedPlayingSubscription = null;
  let _onFinishedLoadingURLSubscription = null;

  useEffect(() => {
    _onFinishedPlayingSubscription = SoundPlayer.addEventListener(
      'FinishedPlaying',
      ({success}) => {
        setplayaudio(false);
      },
    );
    _onFinishedLoadingURLSubscription = SoundPlayer.addEventListener(
      'FinishedLoadingURL',
      ({success, url}) => {
        // setplayaudio(true);
      },
    );
  }, [
    _onFinishedPlayingSubscription,
    _onFinishedLoadingURLSubscription,
    playaudio,
  ]);

  const playSong = async playurl => {
    try {
      if (playaudio) {
        SoundPlayer.stop();
      } else {
        SoundPlayer.playUrl(playurl);
      }
    } catch (e) {
      console.log('cannot play the song file', e);
    }
    return playurl;
  };

  const onPressPlayButton = urll => {
    setplayaudio(!playaudio);
    playSong(urll);
  };
  var fileType = '';
  var name = '';
  if (filePath !== undefined) {
    name = filePath.split('/').pop();
    fileType = filePath.split('.').pop().split('?')[0];
  }
  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        {fileType === 'mp3' ? (
          <Feather
            style={{alignSelf: 'center', padding: '2%'}}
            onPress={() => onPressPlayButton(filePath)}
            name={playaudio ? 'pause' : 'play'}
            size={25}
            color={'grey'}
          />
        ) : (
          <Icon
            style={{alignSelf: 'center', padding: 5}}
            name={fileType == 'mp4' ? 'playcircleo' : 'pdffile1'}
            size={25}
            color={'grey'}
          />
        )}
        <View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
            {name.replace('%20', '').replace(' ', '').replace('%', '')}
          </Text>
          <Text style={styles.textType}>
            {fileType.toUpperCase().slice(0, 3)}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default InChatFileTransfer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    borderRadius: 15,
    padding: 5,
  },
  text: {
    color: 'black',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 5,
    marginRight: 5,
    width: '20%',
  },
  video: {
    width: '92%',
    aspectRatio: 16 / 9,
    marginTop: 10,
    marginLeft: '4%',
    marginRight: '4%',
  },
  textType: {
    color: 'black',
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  frame: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
    marginTop: -4,
  },
});
