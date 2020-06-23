import PlaybackComponent from './src/PlaybackComponent';


const PlaybackPrehook = {
  Component: PlaybackComponent,
  isFlowBlocker: () => true,
  presentFullScreen: true,
  hasPlayerHook: true,
  weight: 2
};

export default PlaybackPrehook;
