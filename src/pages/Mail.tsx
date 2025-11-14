import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MailSidebar from '@/components/mail/MailSidebar';
import EmailList from '@/components/mail/EmailList';
import EmailViewer from '@/components/mail/EmailViewer';
import ComposeEmail from '@/components/mail/ComposeEmail';
import AuthForm from '@/components/mail/AuthForm';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
  attachment_count: number;
}

interface User {
  user_id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
}

const MAIL_AUTH_URL = 'https://functions.poehali.dev/1614ce0b-4b18-44e3-b023-d49b7c1ec5eb';
const MAIL_API_URL = 'https://functions.poehali.dev/59c1f232-2c99-4baa-bea6-70b46dadc4b0';
const MAIL_SEND_URL = 'https://functions.poehali.dev/b0676639-547e-4ae9-9838-9a9950973c46';
const MAIL_UPLOAD_URL = 'https://functions.poehali.dev/d836b8ef-9632-4717-b97d-d766255f2600';

const Mail = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeMailbox, setActiveMailbox] = useState('Inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mailDomain, setMailDomain] = useState('mail.local');

  useEffect(() => {
    const storedUser = localStorage.getItem('mail_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchMailDomain();
  }, []);

  const fetchMailDomain = async () => {
    try {
      const response = await fetch(`${MAIL_AUTH_URL}?action=get_domain`);
      if (response.ok) {
        const data = await response.json();
        setMailDomain(data.domain || 'mail.local');
      }
    } catch (error) {
      console.error('Error fetching mail domain:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user, activeMailbox]);

  const fetchEmails = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${MAIL_API_URL}?mailbox=${activeMailbox}`, {
        headers: {
          'X-User-Id': user.user_id.toString(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(MAIL_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('mail_user', JSON.stringify(userData));
      } else {
        alert('Ошибка входа. Проверьте email и пароль.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  const handleRegister = async (username: string, password: string, fullName: string) => {
    try {
      const response = await fetch(MAIL_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'register', 
          username, 
          password, 
          full_name: fullName 
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('mail_user', JSON.stringify(userData));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  const handleSendEmail = async (to: string, subject: string, body: string, attachments: File[]) => {
    if (!user) return;

    try {
      let uploadedAttachments: any[] = [];
      
      if (attachments.length > 0) {
        const filesData = await Promise.all(
          attachments.map(async (file) => {
            const reader = new FileReader();
            return new Promise<any>((resolve) => {
              reader.onload = () => {
                const base64 = reader.result?.toString().split(',')[1];
                resolve({
                  filename: file.name,
                  content: base64,
                  mime_type: file.type,
                });
              };
              reader.readAsDataURL(file);
            });
          })
        );

        const uploadResponse = await fetch(MAIL_UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.user_id.toString(),
          },
          body: JSON.stringify({ files: filesData }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedAttachments = uploadData.files || [];
        }
      }

      const response = await fetch(MAIL_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.user_id.toString(),
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          attachments: uploadedAttachments,
        }),
      });

      if (response.ok) {
        setIsComposing(false);
        alert('Письмо отправлено!');
        fetchEmails();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка отправки письма');
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  const handleToggleStar = async (emailId: number) => {
    if (!user) return;

    try {
      await fetch(MAIL_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.user_id.toString(),
        },
        body: JSON.stringify({
          action: 'toggle_star',
          email_id: emailId,
        }),
      });

      setEmails(emails.map(email => 
        email.id === emailId 
          ? { ...email, is_starred: !email.is_starred }
          : email
      ));
    } catch (error) {
      console.error('Toggle star error:', error);
    }
  };

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);
    
    if (!email.is_read && user) {
      try {
        await fetch(MAIL_API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.user_id.toString(),
          },
          body: JSON.stringify({
            action: 'mark_read',
            email_id: email.id,
          }),
        });

        setEmails(emails.map(e => 
          e.id === email.id ? { ...e, is_read: true } : e
        ));
      } catch (error) {
        console.error('Mark read error:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mail_user');
    setEmails([]);
    setSelectedEmail(null);
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} mailDomain={mailDomain} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Почта</h1>
          <span className="text-muted-foreground">— {user.email}</span>
        </div>
        <div className="flex items-center gap-3">
          {user.is_admin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/mail/admin')}
              className="gap-2"
            >
              <Icon name="Settings" size={16} />
              Админ-панель
            </Button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <MailSidebar
          activeMailbox={activeMailbox}
          onMailboxChange={(mailbox) => {
            setActiveMailbox(mailbox);
            setSelectedEmail(null);
            setIsComposing(false);
          }}
          onCompose={() => {
            setIsComposing(true);
            setSelectedEmail(null);
          }}
        />

        {isComposing ? (
          <ComposeEmail
            onSend={handleSendEmail}
            onCancel={() => setIsComposing(false)}
          />
        ) : (
          <>
            <EmailList
              emails={emails}
              selectedEmailId={selectedEmail?.id || null}
              onEmailSelect={handleEmailSelect}
              onToggleStar={handleToggleStar}
            />
            <EmailViewer email={selectedEmail} />
          </>
        )}
      </div>
    </div>
  );
};

export default Mail;