export const getUserRole = (role) => {
  let roleName;
  switch (role) {
    case '1':
      roleName = 'student';
      break;
    case '2':
      roleName = 'teacher';
      break;
    case '3':
      roleName = 'admin';
      break;
    default: roleName = 'student';
  }
  return roleName;
};
