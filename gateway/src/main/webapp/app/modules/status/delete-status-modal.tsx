import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import statusClientApi from 'app/rest/StatusClientApi';
import { StatusDTO } from 'app/rest/dto';

interface Props {
  status: StatusDTO;
  isOpen: boolean;
  toggle: () => void;
  onStatusDeleted: () => void;
}

const DeleteStatusModal: React.FC<Props> = ({ status, isOpen, toggle, onStatusDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await statusClientApi.deleteStatus(status.id);
    setDeleting(false);
    onStatusDeleted();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <ModalHeader toggle={toggle}>Eliminar Status</ModalHeader>
      <ModalBody>¿Estás seguro que deseas eliminar el status &quot;{status.name}&quot;?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={deleting}>
          Cancelar
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={deleting}>
          Eliminar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteStatusModal;
