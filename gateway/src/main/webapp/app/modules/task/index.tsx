import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import TaskAdmin from './task-admin';
import TaskUser from './task-user';
import './task-modal.scss';

const Task = () => {
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isAdmin = hasAnyAuthority(authorities, [AUTHORITIES.ADMIN]);

  return <>{isAdmin ? <TaskAdmin /> : <TaskUser />}</>;
};

export default Task;
