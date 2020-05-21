import * as React from 'react';
import { Image } from 'react-native';
import { createQrCodeUrl } from '../../Adobe/Config';

export default function QRButton({ url = '' }) {
  const width = 340;
  const height = 340;
  const uri = createQrCodeUrl(url, width, height);
  return (
    <Image
      style={{ width, height }}
      resizeMode="contain"
      source={{ uri }}
    />
  );
}
