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
import Video, {LoadError, VideoRef} from 'react-native-video';
import Icon from 'react-native-vector-icons/FontAwesome5';
// import VideoPlayerr from 'react-native-video-player';

const VideoPlayer = ({item}) => {
  const [priloading, setpriloading] = useState(true);
  const [pousevedio, setvediopouse] = useState(false);
  const [player, setplayer] = useState();
  const videoRef = useRef();

  const [paused, setPaused] = useState(true);

  const handleVideoEnd = () => {
    setvediopouse(true);
  };
  const onError = error => {
    console.log('error', error);
    setvediopouse(false);
  };

  return (
    <View>
      {priloading && (
        <ActivityIndicator
          animating
          color={'white'}
          size="large"
          style={{
            flex: 1,
            position: 'absolute',
            top: '50%',
            left: '45%',
          }}
        />
      )}

      {/* <VideoPlayerr
    video={{ uri: item.vedio }}
    videoWidth={1600}
    videoHeight={900}
    thumbnail={{ uri: 'https://i.picsum.photos/id/866/1600/900.jpg' }}
/> */}
      <Video
        repeat={true}
        style={styles.video}
        source={{uri: item.vedio, type: 'm3u8'}}
        resizeMode="cover"
        ref={videoRef}
        playInBackground={false}
        onLoadStart={() => {
          setpriloading(true);
        }}
        // paused={pousevedio}
        onEnd={handleVideoEnd}
        onLoad={() => {
          setpriloading(false);
        }}
        bufferConfig={{
          minBufferMs: 10000,
          maxBufferMs: 80000,
          bufferForPlaybackMs: 2000,
          bufferForPlaybackAfterRebufferMs: 8000,
        }}
        onError={onError}
      />
    </View>
  );
};

export default React.memo(VideoPlayer);

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
