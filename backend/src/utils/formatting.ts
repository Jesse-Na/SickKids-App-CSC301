export const formatAdminUser = (u) => ({
  username: u.Username,
  email: u.Attributes.find((a) => a.Name === "email").Value,
  email_verified:
    u.Attributes.find((a) => a.Name === "email_verified").Value === "true",
  status: u.UserStatus,
  created: u.UserCreateDate,
  lastModified: u.UserLastModifiedDate,
});
