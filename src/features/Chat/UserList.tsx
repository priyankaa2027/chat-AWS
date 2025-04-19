import React, { useState, useEffect, memo, useCallback } from 'react';
import { get } from 'aws-amplify/api';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { User } from './types';

const UserRow = memo(({ user }: { user: User }) => (
  <div
    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg"
    role="listitem"
    aria-label={`${user.username} ${user.isOnline ? 'online' : 'offline'}`}
  >
    <div 
      className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
      aria-hidden="true"
    />
    <span>{user.username}</span>
    {!user.isOnline && user.lastSeen && (
      <span className="text-xs text-gray-500">
        Last seen: {new Date(user.lastSeen).toLocaleString()}
      </span>
    )}
  </div>
));

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await get({
        apiName: 'chatAPI',
        path: '/users'
      }).response;
      
      const responseData = (await result.body.json()) as unknown as { users: User[] };
      if (responseData?.users) {
        setUsers(responseData.users);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Failed to fetch users:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold" role="heading">Users</h2>
        {error && (
          <div className="text-sm text-red-500 mt-2" role="alert">
            {error}
          </div>
        )}
      </div>
      <div 
        ref={parentRef}
        className="flex-1 overflow-auto"
        role="list"
        aria-label="Online users"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <UserRow user={users[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t text-sm text-gray-500">
        {users.filter(u => u.isOnline).length} users online
      </div>
    </div>
  );
};

export default memo(UserList);