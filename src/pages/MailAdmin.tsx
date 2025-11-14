import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
  storage_used_mb: number;
  storage_limit_mb: number;
  sent_count: number;
  received_count: number;
}

interface Stats {
  total_users: number;
  active_users: number;
  total_emails: number;
  total_storage_mb: number;
}

const MAIL_ADMIN_URL = 'https://functions.poehali.dev/f928b7d9-e354-4cb3-920d-eff5bc052354';

const MailAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mail_user');
    if (!storedUser) {
      navigate('/mail');
      return;
    }
    
    const user = JSON.parse(storedUser);
    if (!user.is_admin) {
      navigate('/mail');
      return;
    }
    
    setCurrentUser(user);
    fetchStats();
    fetchUsers();
  }, [navigate]);

  const fetchStats = async () => {
    const user = JSON.parse(localStorage.getItem('mail_user') || '{}');
    try {
      const response = await fetch(`${MAIL_ADMIN_URL}?action=stats`, {
        headers: {
          'X-User-Id': user.user_id.toString(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    const user = JSON.parse(localStorage.getItem('mail_user') || '{}');
    setLoading(true);
    try {
      const response = await fetch(`${MAIL_ADMIN_URL}?action=users`, {
        headers: {
          'X-User-Id': user.user_id.toString(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userId: number) => {
    const user = JSON.parse(localStorage.getItem('mail_user') || '{}');
    try {
      const response = await fetch(MAIL_ADMIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.user_id.toString(),
        },
        body: JSON.stringify({
          action: 'toggle_active',
          user_id: userId,
        }),
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mail')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Админ-панель почты</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {currentUser?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/mail')}>
              К почте
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Всего пользователей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon name="Users" size={24} className="text-primary" />
                  <span className="text-3xl font-bold">{stats.total_users}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Активных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon name="UserCheck" size={24} className="text-green-500" />
                  <span className="text-3xl font-bold">{stats.active_users}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Писем отправлено
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={24} className="text-blue-500" />
                  <span className="text-3xl font-bold">{stats.total_emails}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Использовано (МБ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon name="HardDrive" size={24} className="text-orange-500" />
                  <span className="text-3xl font-bold">{stats.total_storage_mb}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Пользователи системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет пользователей
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Имя
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Дата регистрации
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Отправлено
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Получено
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Хранилище
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Статус
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm">{user.full_name || '—'}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">{user.sent_count}</td>
                        <td className="py-3 px-4 text-sm text-center">{user.received_count}</td>
                        <td className="py-3 px-4 text-sm text-center">
                          {user.storage_used_mb.toFixed(1)} / {user.storage_limit_mb} МБ
                        </td>
                        <td className="py-3 px-4 text-center">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                              <Icon name="Check" size={12} />
                              Активен
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs">
                              <Icon name="X" size={12} />
                              Заблокирован
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserActive(user.id)}
                          >
                            {user.is_active ? (
                              <>
                                <Icon name="Ban" size={14} className="mr-1" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <Icon name="CheckCircle" size={14} className="mr-1" />
                                Активировать
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MailAdmin;
