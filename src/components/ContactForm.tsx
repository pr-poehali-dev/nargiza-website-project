import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('https://functions.poehali.dev/8d9df3f6-786c-4ddc-a4ce-2d4c86953f32', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error('Failed to send');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Send error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Mail" size={24} />
          Связаться со мной
        </CardTitle>
        <CardDescription>
          Заполните форму, и я обязательно вам отвечу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Ваше имя
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Как к вам обращаться?"
              disabled={status === 'sending'}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={status === 'sending'}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Сообщение
            </label>
            <Textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Напишите ваше сообщение..."
              rows={5}
              disabled={status === 'sending'}
              className="resize-none"
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
              <Icon name="CheckCircle" size={20} />
              <span>Сообщение отправлено! Спасибо за обратную связь.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
              <Icon name="AlertCircle" size={20} />
              <span>Ошибка отправки. Попробуйте позже.</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={20} />
                Отправить сообщение
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;