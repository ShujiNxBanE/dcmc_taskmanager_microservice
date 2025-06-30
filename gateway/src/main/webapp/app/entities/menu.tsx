import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

const EntitiesMenu = () => {
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isAdmin = hasAnyAuthority(authorities, [AUTHORITIES.ADMIN]);
  return (
    <>
      <MenuItem icon="asterisk" to="/work-group">
        Work Group
      </MenuItem>
      <MenuItem icon="asterisk" to="/project">
        Project
      </MenuItem>
      {isAdmin && (
        <MenuItem icon="asterisk" to="/priority">
          Priority
        </MenuItem>
      )}
      {/* prettier-ignore */}
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
