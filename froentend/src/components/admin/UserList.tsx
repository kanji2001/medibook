import { FC } from 'react';
import { CheckCircle, Clock, Users } from 'lucide-react';
import { AdminUser } from '@/stores/adminStore';

interface UserListProps {
  users: AdminUser[];
  loading: boolean;
  onApproveDoctor: (user: AdminUser) => Promise<void> | void;
  onRejectDoctor: (user: AdminUser) => Promise<void> | void;
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

  if (status === 'rejected') {
    return (
      <div className="flex items-center text-red-600">
        <Clock className="w-4 h-4 mr-1 rotate-180" />
        <span>Rejected</span>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="flex items-center text-red-500">
        <Clock className="w-4 h-4 mr-1" />
        <span>Suspended</span>
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

            <div className="flex-grow space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="font-semibold">{user.name}</h3>
                <div className="badge badge-outline capitalize">{user.role}</div>
                {user.doctorProfile && (
                  <div className="badge capitalize bg-primary/10 text-primary border-primary/20">
                    {user.doctorProfile.specialty}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="text-xs text-muted-foreground">
                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </div>

              {user.doctorProfile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">Experience:</span>{' '}
                    {user.doctorProfile.experience} years
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Phone:</span>{' '}
                    {user.doctorProfile.phone || '—'}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-foreground">Location:</span>{' '}
                    {user.doctorProfile.location}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-foreground">Clinic Address:</span>{' '}
                    {user.doctorProfile.address}
                  </div>
                  {user.status === 'rejected' && user.doctorProfile.rejectionReason && (
                    <div className="sm:col-span-2 text-red-600">
                      <span className="font-medium text-foreground">Rejection Reason:</span>{' '}
                      {user.doctorProfile.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:text-right">
              <div className="mb-2 flex justify-end">{getStatusBadge(user.status)}</div>

              {user.status === 'pending' && user.doctorProfile ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApproveDoctor(user)}
                    className="btn-primary py-1 px-3 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectDoctor(user)}
                    className="btn-outline py-1 px-3 text-sm text-red-500 border-red-500 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              ) : user.status === 'rejected' ? (
                <span className="text-xs text-muted-foreground">Application rejected</span>
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

