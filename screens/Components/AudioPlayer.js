import React, {useCallback, useRef, useState, useEffect} from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import Feather from 'react-native-vector-icons/Feather';

const AudioPlayer = ({item}) => {
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
        setplayaudio(true);
      },
    );
  }, [_onFinishedPlayingSubscription, _onFinishedLoadingURLSubscription]);

  const playSong = async playurl => {
    try {
      SoundPlayer.playUrl(playurl);
    } catch (e) {
      console.log('cannot play the song file', e);
    }
    return playurl;
  };

  const getInfo = async () => {
    // You need the keyword `async`
    try {
      const info = await SoundPlayer.getInfo(); // Also, you need to await this because it is async
      setaudiodue(info.duration); // {duration: 12.416, currentTime: 7.691}
    } catch (e) {
      console.log('There is no song playing', e);
    }
  };
  const onPressPlayButton = urll => {
    playSong(urll).finally(() => {
      console.log('playingurlplayingurl', playingurl);
    });
    getInfo();
  };
  return (
    <View
      style={{
        width: '95%',
        alignSelf: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        flexDirection: 'row',
        margin: '2%',
        borderRadius: 10,
      }}>
      <View
        style={{
          height: 50,
          width: 50,
          backgroundColor: '#009387',
          margin: 3,
          borderRadius: 40,
          justifyContent: 'center',
        }}>
        <Feather
          style={{alignSelf: 'center', padding: '2%'}}
          name="headphones"
          size={25}
          color={'white'}
        />
      </View>
      <Feather
        style={{alignSelf: 'center', padding: '2%'}}
        name={playaudio && item._id !== playingurl ? 'pause' : 'play'}
        size={25}
        onPress={() => {
          setplayingurl(item._id);
          onPressPlayButton(item.file.url, item._id);
        }}
        color={'#009387'}
      />
    </View>
  );
};

export default React.memo(AudioPlayer);

const styles = StyleSheet.create({
  video: {
    width: '92%',
    aspectRatio: 16 / 9,
    marginTop: 10,
    marginLeft: '4%',
    marginRight: '4%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',

    bottom: 40,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    // Additional styles for your play button
  },
});
