import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import PriorityAdmin from './priority-admin';
import './priority-modal.scss';

const Priority = () => {
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isAdmin = hasAnyAuthority(authorities, [AUTHORITIES.ADMIN]);

  return <>{isAdmin ? <PriorityAdmin /> : null}</>;
};

export default Priority;
