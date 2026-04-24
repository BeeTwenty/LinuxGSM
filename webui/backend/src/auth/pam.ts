import pam from 'authenticate-pam';

export function authenticateLinuxUser(username: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    pam.authenticate(username, password, (err: Error | null) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
