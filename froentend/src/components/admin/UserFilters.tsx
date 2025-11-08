import { ChangeEvent, FC } from 'react';
import { Search } from 'lucide-react';
import { UserFilter } from './types';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeUserFilter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
}

const filterButtons: Array<{ key: UserFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'patients', label: 'Patients' },
  { key: 'doctors', label: 'Doctors' },
  { key: 'pending', label: 'Pending' },
];

const UserFilters: FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeUserFilter,
  onFilterChange,
}) => {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex space-x-2">
        {filterButtons.map(button => (
          <button
            type="button"
            key={button.key}
            onClick={() => onFilterChange(button.key)}
            className={`px-3 py-2 rounded-md transition ${
              activeUserFilter === button.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserFilters;

