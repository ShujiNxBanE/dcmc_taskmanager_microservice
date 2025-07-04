import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import statusClientApi from 'app/rest/StatusClientApi';
import { StatusDTO } from 'app/rest/dto';

interface Props {
  isOpen: boolean;
  toggle: () => void;
  onStatusCreated: () => void;
}

const CreateStatusModal: React.FC<Props> = ({ isOpen, toggle, onStatusCreated }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await statusClientApi.createStatus({ name });
    setSaving(false);
    setName('');
    onStatusCreated();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <ModalHeader toggle={toggle}>Crear nuevo Status</ModalHeader>
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

export default CreateStatusModal;
