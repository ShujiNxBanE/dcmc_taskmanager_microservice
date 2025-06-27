// modules/work-group/index.tsx

import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import WorkGroupAdmin from './work-group-admin';
import WorkGroupUser from './work-group-user';

const WorkGroup = () => {
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isAdmin = hasAnyAuthority(authorities, [AUTHORITIES.ADMIN]);

  return <>{isAdmin ? <WorkGroupAdmin /> : <WorkGroupUser />}</>;
};

export default WorkGroup;
