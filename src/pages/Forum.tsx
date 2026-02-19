import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FORUM_API = 'https://functions.poehali.dev/58ac260a-a36e-4d53-9858-d0c993339a0e';

interface Topic {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  replies_count: number;
  views_count: number;
}

interface Message {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн. назад`;
  return date.toLocaleDateString('ru-RU');
}

function getAvatarColor(name: string) {
  const colors = [
    'from-primary to-secondary',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const Forum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicId = searchParams.get('topic');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState(() => localStorage.getItem('forum_name') || '');
  const [newContent, setNewContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('forum_admin_pwd'));
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('forum_admin_pwd') || '');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (topicId) {
      loadTopic(Number(topicId));
    } else {
      loadTopics();
    }
  }, [topicId]);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${FORUM_API}?action=topics`);
      const data = await res.json();
      setTopics(data.topics || []);
      setSelectedTopic(null);
      setMessages([]);
    } catch (e) {
      console.error('Error loading topics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopic = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${FORUM_API}?action=messages&topic_id=${id}`);
      const data = await res.json();
      setSelectedTopic(data.topic);
      setMessages(data.messages || []);
    } catch (e) {
      console.error('Error loading topic:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTitle.trim() || !newAuthor.trim() || !newContent.trim()) return;
    setIsSending(true);
    try {
      localStorage.setItem('forum_name', newAuthor.trim());
      const res = await fetch(`${FORUM_API}?action=create_topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), author_name: newAuthor.trim(), content: newContent.trim() })
      });
      const data = await res.json();
      setNewTitle('');
      setNewContent('');
      setShowNewTopic(false);
      setSearchParams({ topic: String(data.topic_id) });
    } catch (e) {
      console.error('Error creating topic:', e);
    } finally {
      setIsSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !newAuthor.trim() || !selectedTopic) return;
    setIsSending(true);
    try {
      localStorage.setItem('forum_name', newAuthor.trim());
      await fetch(`${FORUM_API}?action=reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: selectedTopic.id, author_name: newAuthor.trim(), content: replyContent.trim() })
      });
      setReplyContent('');
      await loadTopic(selectedTopic.id);
    } catch (e) {
      console.error('Error sending reply:', e);
    } finally {
      setIsSending(false);
    }
  };

  const loginAdmin = async () => {
    setAdminError('');
    try {
      const res = await fetch(`${FORUM_API}?action=check_admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminInput })
      });
      const data = await res.json();
      if (data.is_admin) {
        localStorage.setItem('forum_admin_pwd', adminInput);
        setAdminPassword(adminInput);
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminInput('');
      } else {
        setAdminError('Неверный пароль');
      }
    } catch (e) {
      setAdminError('Ошибка проверки');
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('forum_admin_pwd');
    setIsAdmin(false);
    setAdminPassword('');
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Удалить это сообщение?')) return;
    try {
      await fetch(`${FORUM_API}?action=delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, message_id: messageId })
      });
      if (selectedTopic) await loadTopic(selectedTopic.id);
    } catch (e) {
      console.error('Error deleting message:', e);
    }
  };

  const deleteTopic = async (topicId: number) => {
    if (!confirm('Удалить эту тему и все сообщения в ней?')) return;
    try {
      await fetch(`${FORUM_API}?action=delete_topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, topic_id: topicId })
      });
      setSearchParams({});
      await loadTopics();
    } catch (e) {
      console.error('Error deleting topic:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-4xl flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Форум NARGIZA
            </h1>
            <p className="text-xs text-muted-foreground">
              Общение фанатов
              {isAdmin && <span className="ml-2 text-primary font-semibold">(модератор)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Button variant="outline" size="sm" onClick={logoutAdmin} className="gap-1.5 text-xs">
                <Icon name="Shield" size={14} className="text-primary" />
                Выйти
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} title="Вход модератора">
                <Icon name="Shield" size={18} className="text-muted-foreground" />
              </Button>
            )}
            {!topicId && (
              <Button onClick={() => setShowNewTopic(true)} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Icon name="Plus" size={16} />
                Новая тема
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-8">
        {showAdminLogin && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Icon name="Shield" size={20} className="text-primary" />
                Вход модератора
              </h3>
              <div>
                <Input
                  type="password"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  placeholder="Пароль модератора"
                  onKeyDown={(e) => e.key === 'Enter' && loginAdmin()}
                />
                {adminError && <p className="text-sm text-red-500 mt-2">{adminError}</p>}
              </div>
              <div className="flex gap-3">
                <Button onClick={loginAdmin} disabled={!adminInput.trim()} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Icon name="LogIn" size={16} />
                  Войти
                </Button>
                <Button variant="outline" onClick={() => { setShowAdminLogin(false); setAdminInput(''); setAdminError(''); }}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!newAuthor.trim() || showNewTopic ? (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold">{showNewTopic ? 'Создать тему' : 'Представьтесь'}</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Ваше имя</label>
                <Input
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Как вас зовут?"
                  maxLength={100}
                />
              </div>
              {showNewTopic && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Заголовок темы</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="О чём хотите поговорить?"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Сообщение</label>
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Напишите первое сообщение..."
                      rows={4}
                      maxLength={5000}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={createTopic}
                      disabled={isSending || !newTitle.trim() || !newAuthor.trim() || !newContent.trim()}
                      className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {isSending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                      Создать тему
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTopic(false)}>Отмена</Button>
                  </div>
                </>
              )}
              {!showNewTopic && newAuthor.trim() && (
                <Button onClick={() => localStorage.setItem('forum_name', newAuthor.trim())} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Сохранить
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : topicId && selectedTopic ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setSearchParams({})} className="gap-2">
                <Icon name="ArrowLeft" size={16} />
                Все темы
              </Button>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      {selectedTopic.is_pinned && <Icon name="Pin" size={16} className="text-primary mt-1 shrink-0" />}
                      <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{selectedTopic.author_name}</span>
                      <span>{timeAgo(selectedTopic.created_at)}</span>
                      <span className="flex items-center gap-1"><Icon name="Eye" size={14} /> {selectedTopic.views_count}</span>
                      <span className="flex items-center gap-1"><Icon name="MessageSquare" size={14} /> {selectedTopic.replies_count}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTopic(selectedTopic.id)}
                      className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 shrink-0"
                    >
                      <Icon name="Trash2" size={14} />
                      Удалить тему
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {messages.map((msg) => (
                <Card key={msg.id} className="border border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(msg.author_name)} flex items-center justify-center shrink-0`}>
                        <span className="text-white font-bold text-sm">{msg.author_name[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">{msg.author_name}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(msg.created_at)}</span>
                          </div>
                          {isAdmin && msg.content !== '[сообщение удалено модератором]' && msg.content !== '[удалено]' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMessage(msg.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                              title="Удалить сообщение"
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.content === '[сообщение удалено модератором]' || msg.content === '[удалено]' ? 'italic text-muted-foreground' : ''}`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-primary/20 mt-6">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(newAuthor)} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold text-sm">{(newAuthor[0] || '?').toUpperCase()}</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Напишите ответ..."
                      rows={3}
                      maxLength={5000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">от {newAuthor}</span>
                      <Button
                        onClick={sendReply}
                        disabled={isSending || !replyContent.trim()}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      >
                        {isSending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                        Ответить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Пока нет тем</p>
                <p className="text-sm text-muted-foreground mb-6">Будьте первым — создайте тему для обсуждения!</p>
                <Button onClick={() => setShowNewTopic(true)} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Icon name="Plus" size={16} />
                  Создать тему
                </Button>
              </div>
            ) : (
              topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setSearchParams({ topic: String(topic.id) })}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(topic.author_name)} flex items-center justify-center shrink-0`}>
                        <span className="text-white font-bold text-sm">{topic.author_name[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.is_pinned && <Icon name="Pin" size={14} className="text-primary shrink-0" />}
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{topic.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{topic.author_name}</span>
                          <span>{timeAgo(topic.updated_at)}</span>
                          <span className="flex items-center gap-1"><Icon name="MessageSquare" size={12} /> {topic.replies_count}</span>
                          <span className="flex items-center gap-1"><Icon name="Eye" size={12} /> {topic.views_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-2">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                            title="Удалить тему"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Forum;
