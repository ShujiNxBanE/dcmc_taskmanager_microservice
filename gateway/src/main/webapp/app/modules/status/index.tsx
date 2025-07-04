import React, { useEffect, useState } from 'react';
import statusClientApi from 'app/rest/StatusClientApi';
import { StatusDTO } from 'app/rest/dto';
import { Button, Table } from 'reactstrap';
import CreateStatusModal from './create-status-modal';
import EditStatusModal from './edit-status-modal';
import DeleteStatusModal from './delete-status-modal';

const StatusAdmin = () => {
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusDTO | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<StatusDTO | null>(null);

  const fetchStatuses = async () => {
    setLoading(true);
    const res = await statusClientApi.getAllStatuses();
    setStatuses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div>
      <h2>Status</h2>
      <Button color="primary" onClick={() => setShowCreate(true)} className="mb-2">
        Crear nuevo Status
      </Button>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(status => (
            <tr key={status.id}>
              <td>{status.id}</td>
              <td>{status.name}</td>
              <td>
                <Button size="sm" color="info" onClick={() => setEditStatus(status)} className="me-2">
                  Editar
                </Button>
                <Button size="sm" color="danger" onClick={() => setDeleteStatus(status)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <CreateStatusModal isOpen={showCreate} toggle={() => setShowCreate(false)} onStatusCreated={fetchStatuses} />
      {editStatus && (
        <EditStatusModal status={editStatus} isOpen={!!editStatus} toggle={() => setEditStatus(null)} onStatusUpdated={fetchStatuses} />
      )}
      {deleteStatus && (
        <DeleteStatusModal
          status={deleteStatus}
          isOpen={!!deleteStatus}
          toggle={() => setDeleteStatus(null)}
          onStatusDeleted={fetchStatuses}
        />
      )}
    </div>
  );
};

export default StatusAdmin;
