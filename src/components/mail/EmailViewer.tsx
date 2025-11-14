import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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

interface EmailViewerProps {
  email: Email | null;
  onReply?: () => void;
  onForward?: () => void;
}

const EmailViewer = ({ email, onReply, onForward }: EmailViewerProps) => {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Icon name="Mail" size={64} className="mx-auto mb-4 opacity-30" />
          <p>Выберите письмо для просмотра</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{email.subject || '(без темы)'}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onReply}>
              <Icon name="Reply" size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onForward}>
              <Icon name="Forward" size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Trash2" size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {email.from[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium">{email.from}</div>
            <div className="text-muted-foreground text-xs">
              Кому: {email.to}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(email.received_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{email.body}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;
