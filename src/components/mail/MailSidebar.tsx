import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface MailSidebarProps {
  activeMailbox: string;
  onMailboxChange: (mailbox: string) => void;
  onCompose: () => void;
}

const MailSidebar = ({ activeMailbox, onMailboxChange, onCompose }: MailSidebarProps) => {
  const mailboxes = [
    { name: 'Inbox', icon: 'Inbox', label: 'Входящие' },
    { name: 'Sent', icon: 'Send', label: 'Отправленные' },
    { name: 'Drafts', icon: 'FileEdit', label: 'Черновики' },
    { name: 'Trash', icon: 'Trash2', label: 'Корзина' },
  ];

  return (
    <div className="w-64 border-r border-border bg-card/30 p-4 flex flex-col gap-4">
      <Button onClick={onCompose} className="w-full gap-2">
        <Icon name="Plus" size={18} />
        Новое письмо
      </Button>

      <div className="flex flex-col gap-1">
        {mailboxes.map((mailbox) => (
          <button
            key={mailbox.name}
            onClick={() => onMailboxChange(mailbox.name)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeMailbox === mailbox.name
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Icon name={mailbox.icon} size={18} />
            <span className="text-sm font-medium">{mailbox.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MailSidebar;
