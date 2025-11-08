import { FC } from 'react';
import { CheckCircle, Clock, Users } from 'lucide-react';
import { AdminUser } from '@/stores/adminStore';

interface UserListProps {
  users: AdminUser[];
  loading: boolean;
  onApproveDoctor: (userId: string) => Promise<void> | void;
  onRejectDoctor: (userId: string) => Promise<void> | void;
}

const UserList: FC<UserListProps> = ({ users, loading, onApproveDoctor, onRejectDoctor }) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <div className="flex items-center text-yellow-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Pending</span>
        </div>
      );
    }

    if (status === 'active') {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Active</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user.id} className="glass-card rounded-xl p-5 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center uppercase font-semibold text-primary">
              {user.name.charAt(0)}
            </div>

            <div className="flex-grow">
              <div className="flex items-center">
                <h3 className="font-semibold">{user.name}</h3>
                <div className="badge badge-outline ml-2 capitalize">{user.role}</div>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="text-xs text-muted-foreground mt-1">
                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>

            <div className="md:text-right">
              <div className="mb-2">{getStatusBadge(user.status)}</div>

              {user.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApproveDoctor(user.id)}
                    className="btn-primary py-1 px-3 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectDoctor(user.id)}
                    className="btn-outline py-1 px-3 text-sm text-red-500 border-red-500 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <button className="btn-outline py-1 px-3 text-sm">View Details</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

