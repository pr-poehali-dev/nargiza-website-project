import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const API = 'https://functions.poehali.dev/58ac260a-a36e-4d53-9858-d0c993339a0e';

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
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

const AVATAR_COLORS = [
  'from-primary to-secondary', 'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500', 'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500',
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const Forum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicId = searchParams.get('topic');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [userName, setUserName] = useState(() => localStorage.getItem('forum_name') || '');
  const [nameInput, setNameInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const [showNewTopic, setShowNewTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [replyText, setReplyText] = useState('');

  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('forum_admin_pwd'));
  const [adminPwd, setAdminPwd] = useState(() => localStorage.getItem('forum_admin_pwd') || '');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const loadTopics = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}?action=topics`);
      const d = await r.json();
      setTopics(d.topics || []);
      setTopic(null);
      setMessages([]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const loadTopic = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}?action=messages&topic_id=${id}`);
      const d = await r.json();
      setTopic(d.topic);
      setMessages(d.messages || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (topicId) loadTopic(Number(topicId));
    else loadTopics();
  }, [topicId, loadTopic, loadTopics]);

  const saveName = (name: string) => {
    const n = name.trim();
    if (!n) return;
    localStorage.setItem('forum_name', n);
    setUserName(n);
    setShowNamePrompt(false);
  };

  const ensureName = (callback: () => void) => {
    if (userName) { callback(); return; }
    setShowNamePrompt(true);
    const checkName = setInterval(() => {
      const saved = localStorage.getItem('forum_name');
      if (saved) { clearInterval(checkName); callback(); }
    }, 200);
    setTimeout(() => clearInterval(checkName), 30000);
  };

  const handleCreateTopic = () => {
    ensureName(() => setShowNewTopic(true));
  };

  const submitTopic = async () => {
    if (!topicTitle.trim() || !topicContent.trim() || !userName) return;
    setSending(true);
    try {
      const r = await fetch(`${API}?action=create_topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: topicTitle.trim(), author_name: userName, content: topicContent.trim() })
      });
      const d = await r.json();
      setTopicTitle('');
      setTopicContent('');
      setShowNewTopic(false);
      setSearchParams({ topic: String(d.topic_id) });
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const submitReply = async () => {
    if (!replyText.trim() || !userName || !topic) return;
    setSending(true);
    try {
      await fetch(`${API}?action=reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topic.id, author_name: userName, content: replyText.trim() })
      });
      setReplyText('');
      await loadTopic(topic.id);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const handleReply = () => {
    ensureName(() => {});
  };

  const loginAdmin = async () => {
    setAdminError('');
    try {
      const r = await fetch(`${API}?action=check_admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminInput })
      });
      const d = await r.json();
      if (d.is_admin) {
        localStorage.setItem('forum_admin_pwd', adminInput);
        setAdminPwd(adminInput);
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminInput('');
      } else {
        setAdminError('Неверный пароль');
      }
    } catch { setAdminError('Ошибка'); }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('forum_admin_pwd');
    setIsAdmin(false);
    setAdminPwd('');
  };

  const delMessage = async (id: number) => {
    if (!confirm('Удалить это сообщение?')) return;
    try {
      const r = await fetch(`${API}?action=delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPwd, message_id: id })
      });
      if (r.ok && topic) await loadTopic(topic.id);
    } catch (e) { console.error(e); }
  };

  const delTopic = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Удалить эту тему?')) return;
    try {
      const r = await fetch(`${API}?action=delete_topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPwd, topic_id: id })
      });
      if (r.ok) {
        setSearchParams({});
        await loadTopics();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-4xl flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => topicId ? setSearchParams({}) : navigate('/')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              {topicId && topic ? topic.title : 'Форум NARGIZA'}
            </h1>
            {userName && (
              <button onClick={() => setShowNamePrompt(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {userName} (сменить)
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin ? (
              <Button variant="outline" size="sm" onClick={logoutAdmin} className="gap-1 text-xs h-8">
                <Icon name="Shield" size={14} className="text-primary" />
                Выйти
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} className="h-8 w-8">
                <Icon name="Shield" size={16} className="text-muted-foreground/50" />
              </Button>
            )}
            {!topicId && (
              <Button onClick={handleCreateTopic} size="sm" className="gap-1.5 h-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Icon name="Plus" size={14} />
                <span className="hidden sm:inline">Новая тема</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-4">

        {showNamePrompt && (
          <Card className="border-2 border-primary/20 animate-in fade-in">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Как вас зовут?</h3>
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Введите ваше имя"
                  maxLength={100}
                  onKeyDown={(e) => e.key === 'Enter' && saveName(nameInput)}
                  autoFocus
                />
                <Button onClick={() => saveName(nameInput)} disabled={!nameInput.trim()} className="shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  OK
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showAdminLogin && (
          <Card className="border-2 border-primary/20 animate-in fade-in">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-primary" />
                Вход модератора
              </h3>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  placeholder="Пароль"
                  onKeyDown={(e) => e.key === 'Enter' && loginAdmin()}
                  autoFocus
                />
                <Button onClick={loginAdmin} disabled={!adminInput.trim()} className="shrink-0">Войти</Button>
                <Button variant="ghost" onClick={() => { setShowAdminLogin(false); setAdminInput(''); setAdminError(''); }}>
                  <Icon name="X" size={16} />
                </Button>
              </div>
              {adminError && <p className="text-sm text-red-500 mt-2">{adminError}</p>}
            </CardContent>
          </Card>
        )}

        {showNewTopic && (
          <Card className="border-2 border-primary/20 animate-in fade-in">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">Новая тема</h3>
              <Input
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="Заголовок темы"
                maxLength={255}
                autoFocus
              />
              <Textarea
                value={topicContent}
                onChange={(e) => setTopicContent(e.target.value)}
                placeholder="Первое сообщение..."
                rows={4}
                maxLength={5000}
              />
              <div className="flex gap-2">
                <Button
                  onClick={submitTopic}
                  disabled={sending || !topicTitle.trim() || !topicContent.trim()}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {sending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                  Создать
                </Button>
                <Button variant="outline" onClick={() => setShowNewTopic(false)}>Отмена</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader2" size={28} className="animate-spin text-primary" />
          </div>
        ) : topicId && topic ? (
          <>
            {isAdmin && (
              <div className="flex justify-end">
                <Button
                  variant="outline" size="sm"
                  onClick={() => delTopic(topic.id)}
                  className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-200"
                >
                  <Icon name="Trash2" size={14} />
                  Удалить тему
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {messages.map((msg) => {
                const isDeleted = msg.content === '[сообщение удалено модератором]' || msg.content === '[удалено]';
                return (
                  <Card key={msg.id} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(msg.author_name)} flex items-center justify-center shrink-0`}>
                          <span className="text-white font-bold text-xs">{msg.author_name[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-sm truncate">{msg.author_name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{timeAgo(msg.created_at)}</span>
                            </div>
                            {isAdmin && !isDeleted && (
                              <button onClick={() => delMessage(msg.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 p-1">
                                <Icon name="Trash2" size={14} />
                              </button>
                            )}
                          </div>
                          <p className={`text-sm whitespace-pre-wrap break-words ${isDeleted ? 'italic text-muted-foreground/50' : ''}`}>
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-4">
                {userName ? (
                  <div className="space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Напишите ответ..."
                      rows={3}
                      maxLength={5000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{userName}</span>
                      <Button
                        onClick={submitReply}
                        disabled={sending || !replyText.trim()}
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      >
                        {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
                        Ответить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleReply} variant="outline" className="w-full gap-2">
                    <Icon name="MessageSquare" size={16} />
                    Ответить (введите имя)
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        ) : topics.length === 0 && !showNewTopic ? (
          <div className="text-center py-20">
            <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground mb-4">Пока нет тем. Будьте первым!</p>
            <Button onClick={handleCreateTopic} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Icon name="Plus" size={16} />
              Создать тему
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((t) => (
              <Card
                key={t.id}
                className="border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSearchParams({ topic: String(t.id) })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(t.author_name)} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-xs">{t.author_name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {t.is_pinned && <Icon name="Pin" size={12} className="text-primary shrink-0" />}
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{t.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t.author_name}</span>
                        <span>{timeAgo(t.updated_at)}</span>
                        <span className="flex items-center gap-1"><Icon name="MessageSquare" size={11} /> {t.replies_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && (
                        <button
                          onClick={(e) => delTopic(t.id, e)}
                          className="p-1.5 text-muted-foreground/30 hover:text-red-500 transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                      <Icon name="ChevronRight" size={18} className="text-muted-foreground/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Forum;
