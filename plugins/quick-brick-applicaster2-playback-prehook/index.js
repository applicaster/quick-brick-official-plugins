import PlaybackComponent from './src/PlaybackComponent';


const PlaybackPrehook = {
  Component: PlaybackComponent,
  isFlowBlocker: () => true,
  presentFullScreen: true
};

export default PlaybackPrehook;
