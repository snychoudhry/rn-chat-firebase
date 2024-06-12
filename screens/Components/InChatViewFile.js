import React, {useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Video from 'react-native-video';

function InChatViewFile({props, visible, filee, onClose}) {
  const source = {uri: props.file.url, cache: true};
  const [priloading, setpriloading] = useState(true);
  const [player, setplayer] = useState();

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      style={{height: 600}}>
      <View style={styles.container}>
        <View style={{padding: 20}}>
          <TouchableOpacity onPress={onClose} style={styles.buttonCancel}>
            <Text style={styles.textBtn}>X</Text>
          </TouchableOpacity>
        </View>

        {props.file.url ? (
          <Pdf
            trustAllCerts={false}
            source={source}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={error => {
              console.log(error);
            }}
            onPressLink={uri => {
              console.log(`Link pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
        ) : (
          <View style={{flex: 1, justifyContent: 'center'}}>
            {priloading && (
              <ActivityIndicator
                animating
                color={'#009387'}
                size="large"
                style={{
                  flex: 1,
                  position: 'absolute',
                  top: '50%',
                  left: '45%',
                }}
              />
            )}
            <Video
              style={styles.video}
              source={{uri: props.vedio}}
              resizeMode="cover"
              ref={ref => setplayer(ref)}
              onLoadStart={() => {
                setpriloading(true);
              }}
              onLoad={() => {
                setpriloading(false);
              }}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              filter="CIPhotoEffectFade"
            />
          </View>
        )}
      </View>
    </Modal>
  );
}
export default InChatViewFile;
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
  textBtn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 25,
  },
  video: {
    width: '99%',
    aspectRatio: 16 / 9,
    marginTop: 10,
    marginLeft: '4%',
    marginRight: '4%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'white',
  },
});
