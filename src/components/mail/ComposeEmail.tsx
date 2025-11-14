import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Attachment {
  file: File;
  url: string;
}

interface ComposeEmailProps {
  onSend: (to: string, subject: string, body: string, attachments: File[]) => void;
  onCancel: () => void;
}

const ComposeEmail = ({ onSend, onCancel }: ComposeEmailProps) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        file,
        url: URL.createObjectURL(file)
      });
    }
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    URL.revokeObjectURL(newAttachments[index].url);
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSend = () => {
    if (!to) {
      alert('Укажите получателя');
      return;
    }
    const files = attachments.map(a => a.file);
    onSend(to, subject, body, files);
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

        <div>
          <label className="text-sm font-medium mb-2 block">Вложения:</label>
          <div className="flex flex-col gap-2">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-accent px-3 py-2 rounded-lg text-sm"
                  >
                    <Icon name="Paperclip" size={14} />
                    <span className="max-w-[200px] truncate">{attachment.file.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({Math.round(attachment.file.size / 1024)}KB)
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="gap-2"
              >
                <Icon name="Paperclip" size={16} />
                Прикрепить файлы
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;