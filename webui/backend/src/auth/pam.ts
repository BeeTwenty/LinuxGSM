let authenticateLinuxUser: (
  username: string,
  password: string,
) => Promise<boolean>;

if (process.platform === "win32") {
  // Windows mock: always return true and log a warning
  authenticateLinuxUser = async (username: string, password: string) => {
    console.warn(
      "[MOCK] PAM authentication is not available on Windows. Always returns true.",
    );
    return true;
  };
} else {
  // Real Linux PAM auth
  const pam = require("authenticate-pam");
  authenticateLinuxUser = (username: string, password: string) => {
    return new Promise((resolve) => {
      pam.authenticate(username, password, (err: Error | null) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };
}

export { authenticateLinuxUser };
