import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import statusClientApi from 'app/rest/StatusClientApi';
import { StatusDTO } from 'app/rest/dto';

interface Props {
  status: StatusDTO;
  isOpen: boolean;
  toggle: () => void;
  onStatusUpdated: () => void;
}

const EditStatusModal: React.FC<Props> = ({ status, isOpen, toggle, onStatusUpdated }) => {
  const [name, setName] = useState(status.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await statusClientApi.updateStatus(status.id, { ...status, name });
    setSaving(false);
    onStatusUpdated();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <ModalHeader toggle={toggle}>Editar Status</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="statusName">Nombre</Label>
            <Input
              id="statusName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del status"
              disabled={saving}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={saving}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSave} disabled={saving || !name}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditStatusModal;
