import React from 'react';
import { useUserManagementLogic } from './UserManagement.logic';
import { UserManagementTemplate } from './UserManagement.jsx';

export default function UserManagement(props) {
  const logic = useUserManagementLogic(props);
  return <UserManagementTemplate logic={logic} {...props} />;
}
