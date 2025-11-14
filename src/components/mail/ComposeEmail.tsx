import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ComposeEmailProps {
  onSend: (to: string, subject: string, body: string) => void;
  onCancel: () => void;
}

const ComposeEmail = ({ onSend, onCancel }: ComposeEmailProps) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!to) {
      alert('Укажите получателя');
      return;
    }
    onSend(to, subject, body);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Новое письмо</h2>
        <div className="flex gap-2">
          <Button onClick={handleSend} className="gap-2">
            <Icon name="Send" size={18} />
            Отправить
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            <Icon name="X" size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Кому:</label>
          <Input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Тема:</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема письма"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium mb-2 block">Сообщение:</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Введите текст письма..."
            className="flex-1 min-h-[300px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
