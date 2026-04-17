import { httpClient } from './httpClient';

export const fetchPreferences = async () => {
  return httpClient('/preferences');
};

export const savePreferences = async (preferences) => {
  return httpClient('/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
};
