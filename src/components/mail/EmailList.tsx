import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

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

interface EmailListProps {
  emails: Email[];
  selectedEmailId: number | null;
  onEmailSelect: (email: Email) => void;
  onToggleStar: (emailId: number) => void;
}

const EmailList = ({ emails, selectedEmailId, onEmailSelect, onToggleStar }: EmailListProps) => {
  return (
    <div className="flex-1 overflow-y-auto border-r border-border">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Icon name="Inbox" size={48} className="mb-4 opacity-50" />
          <p>Нет писем</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                selectedEmailId === email.id ? 'bg-accent' : ''
              } ${!email.is_read ? 'bg-card/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id);
                  }}
                  className="mt-1"
                >
                  <Icon
                    name={email.is_starred ? 'Star' : 'Star'}
                    size={16}
                    className={email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                      {email.from}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(email.received_at), { 
                        addSuffix: true, 
                        locale: ru 
                      })}
                    </span>
                  </div>

                  <div className={`text-sm mb-1 truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                    {email.subject || '(без темы)'}
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    {email.body}
                  </div>

                  {email.attachment_count > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Icon name="Paperclip" size={12} />
                      <span>{email.attachment_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;
