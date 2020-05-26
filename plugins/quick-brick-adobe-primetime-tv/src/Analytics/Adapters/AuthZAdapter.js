export default function authZAdapter(data) {
  const {
    payload,
    credentials: {
      requestorId = '',
      resourceId = ''
    }
  } = data;

  const activatedBy = payload?.type?.value === 'video' ? 'Playback' : 'Account Component';

  const result = {
    requestorId,
    resourceId,
    contentEntityName: payload.title,
    contentEntityId: payload.id,
    contentEntityType: payload.type.value,
    activatedBy
  };

  if (data.error) {
    result.code = data.error.message;
  }

  return result;
}
