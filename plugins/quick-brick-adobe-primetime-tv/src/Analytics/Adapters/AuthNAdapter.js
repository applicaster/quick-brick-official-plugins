export default function authNAdapter(data) {
  const {
    payload,
    deviceId,
    credentials: { requestorId = '' }
  } = data;

  const activatedBy = payload?.type?.value === 'video' ? 'Playback' : 'Account Component';

  const result = {
    requestorId,
    deviceId,
    activatedBy
  };

  if (data.error) {
    result.errorCode = data.error.errorCode;
    result.errorMessage = data.error.errorMessage;
  }

  return result;
}
