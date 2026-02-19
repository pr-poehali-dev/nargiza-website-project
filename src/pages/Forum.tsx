import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const API = 'https://functions.poehali.dev/58ac260a-a36e-4d53-9858-d0c993339a0e';

interface User { user_id: number; token: string; display_name: string; is_admin: boolean; }
interface Topic { id: number; title: string; author_name: string; created_at: string; updated_at: string; is_pinned: boolean; replies_count: number; views_count: number; avatar_color: string; }
interface Msg { id: number; author_name: string; content: string; created_at: string; user_id: number; avatar_color: string; posts_count: number; }

const C: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500', red: 'from-red-500 to-pink-500',
  green: 'from-emerald-500 to-teal-500', purple: 'from-violet-500 to-purple-500',
  orange: 'from-orange-500 to-amber-500', pink: 'from-pink-500 to-rose-500',
  teal: 'from-teal-500 to-cyan-500',
};

function ago(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин.`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч.`;
  if (s < 604800) return `${Math.floor(s / 86400)} дн.`;
  return new Date(d).toLocaleDateString('ru-RU');
}

async function req(action: string, opts?: { method?: string; body?: object; token?: string }) {
  const { method = 'GET', body, token } = opts || {};
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['X-Auth-Token'] = token;
  const r = await fetch(`${API}?action=${action}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  return r.json();
}

const Forum = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const topicId = sp.get('topic');
  const view = sp.get('view');

  const [user, setUser] = useState<User | null>(() => { const s = localStorage.getItem('forum_user'); return s ? JSON.parse(s) : null; });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regName, setRegName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState('');

  const [isMod, setIsMod] = useState(() => !!localStorage.getItem('forum_admin_pwd'));
  const [modPwd, setModPwd] = useState(() => localStorage.getItem('forum_admin_pwd') || '');
  const token = user?.token || '';
  const canMod = isMod || user?.is_admin;

  const saveUser = (u: User) => { localStorage.setItem('forum_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('forum_user'); setUser(null); };

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const d = await req('topics');
    setTopics(d.topics || []); setTopic(null); setMessages([]);
    setLoading(false);
  }, []);

  const fetchTopic = useCallback(async (id: number) => {
    setLoading(true);
    const r = await fetch(`${API}?action=messages&topic_id=${id}`);
    const d = await r.json();
    setTopic(d.topic); setMessages(d.messages || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (view === 'login' || view === 'register' || view === 'new') { setLoading(false); return; }
    if (topicId) fetchTopic(Number(topicId)); else fetchTopics();
  }, [topicId, view, fetchTopic, fetchTopics]);

  const doLogin = async () => {
    setError(''); setSending(true);
    const d = await req('login', { method: 'POST', body: { username: loginUser, password: loginPass } });
    setSending(false);
    if (d.error) { setError(d.error); return; }
    saveUser(d); setLoginUser(''); setLoginPass(''); setSp({});
  };

  const doRegister = async () => {
    setError(''); setSending(true);
    const d = await req('register', { method: 'POST', body: { username: regUser, password: regPass, display_name: regName } });
    setSending(false);
    if (d.error) { setError(d.error); return; }
    saveUser(d); setRegUser(''); setRegPass(''); setRegName(''); setSp({});
  };

  const doCreateTopic = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setError(''); setSending(true);
    const d = await req('create_topic', { method: 'POST', body: { title: newTitle, content: newContent }, token });
    setSending(false);
    if (d.error) { setError(d.error); return; }
    setNewTitle(''); setNewContent(''); setSp({ topic: String(d.topic_id) });
  };

  const doReply = async () => {
    if (!replyText.trim() || !topic) return;
    setSending(true);
    const d = await req('reply', { method: 'POST', body: { topic_id: topic.id, content: replyText }, token });
    setSending(false);
    if (d.error) { setError(d.error); return; }
    setReplyText(''); fetchTopic(topic.id);
  };

  const delMsg = async (id: number) => {
    if (!confirm('Удалить сообщение?')) return;
    await req('delete_message', { method: 'POST', body: { message_id: id, password: modPwd }, token });
    if (topic) fetchTopic(topic.id);
  };

  const delTopic = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Удалить тему?')) return;
    await req('delete_topic', { method: 'POST', body: { topic_id: id, password: modPwd }, token });
    setSp({}); fetchTopics();
  };

  const modLogin = async () => {
    const pwd = prompt('Пароль модератора:');
    if (!pwd) return;
    const d = await req('check_admin', { method: 'POST', body: { password: pwd } });
    if (d.is_admin) { localStorage.setItem('forum_admin_pwd', pwd); setModPwd(pwd); setIsMod(true); }
    else alert('Неверный пароль');
  };

  const goBack = () => { if (topicId || view) setSp({}); else navigate('/'); };

  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isNew = view === 'new';
  const showTopicList = !loading && !view && !topicId;
  const showTopic = !loading && !view && !!topicId && !!topic;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0"><Icon name="ArrowLeft" size={20} /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Форум</h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:block mr-1">{user.display_name}</span>
                {showTopicList && (
                  <Button size="sm" onClick={() => setSp({ view: 'new' })} className="gap-1.5 h-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <Icon name="Plus" size={14} /><span className="hidden sm:inline">Тема</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="h-8 text-xs text-muted-foreground">Выйти</Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => setSp({ view: 'login' })} className="h-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90">Войти</Button>
                <Button size="sm" variant="outline" onClick={() => setSp({ view: 'register' })} className="h-8">Регистрация</Button>
              </>
            )}
            {!isMod ? (
              <Button variant="ghost" size="icon" onClick={modLogin} className="h-8 w-8"><Icon name="Shield" size={14} className="text-muted-foreground/30" /></Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => { localStorage.removeItem('forum_admin_pwd'); setIsMod(false); setModPwd(''); }} className="h-8 w-8" title="Выйти из модерации"><Icon name="ShieldOff" size={14} className="text-primary" /></Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6">

        {loading && (
          <div className="flex justify-center py-20"><Icon name="Loader2" size={28} className="animate-spin text-primary" /></div>
        )}

        {/* --- LOGIN --- */}
        {isLogin && (
          <div className="max-w-md mx-auto">
            <Card><CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-center">Вход на форум</h2>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3">{error}</div>}
              <div>
                <label className="text-sm font-medium mb-1 block">Логин</label>
                <Input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ваш логин" maxLength={30} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Пароль</label>
                <Input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Ваш пароль" onKeyDown={e => e.key === 'Enter' && doLogin()} />
              </div>
              <Button onClick={doLogin} disabled={sending} className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                {sending && <Icon name="Loader2" size={16} className="animate-spin" />} Войти
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <button onClick={() => { setError(''); setSp({ view: 'register' }); }} className="text-primary hover:underline font-medium">Регистрация</button>
              </p>
            </CardContent></Card>
          </div>
        )}

        {/* --- REGISTER --- */}
        {isRegister && (
          <div className="max-w-md mx-auto">
            <Card><CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-center">Регистрация</h2>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3">{error}</div>}
              <div>
                <label className="text-sm font-medium mb-1 block">Ваше имя</label>
                <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Как вас видят другие" maxLength={50} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Логин</label>
                <Input value={regUser} onChange={e => setRegUser(e.target.value)} placeholder="От 3 символов" maxLength={30} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Пароль</label>
                <Input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="От 4 символов" onKeyDown={e => e.key === 'Enter' && doRegister()} />
              </div>
              <Button onClick={doRegister} disabled={sending} className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                {sending && <Icon name="Loader2" size={16} className="animate-spin" />} Зарегистрироваться
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <button onClick={() => { setError(''); setSp({ view: 'login' }); }} className="text-primary hover:underline font-medium">Войти</button>
              </p>
            </CardContent></Card>
          </div>
        )}

        {/* --- NEW TOPIC --- */}
        {isNew && (
          user ? (
            <div className="max-w-2xl mx-auto">
              <Card><CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Новая тема</h2>
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3">{error}</div>}
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Заголовок" maxLength={255} autoFocus />
                <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Сообщение..." rows={5} maxLength={5000} />
                <div className="flex gap-2">
                  <Button onClick={doCreateTopic} disabled={sending || !newTitle.trim() || !newContent.trim()} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    {sending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />} Создать
                  </Button>
                  <Button variant="outline" onClick={() => setSp({})}>Отмена</Button>
                </div>
              </CardContent></Card>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <Card><CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-center">Вход на форум</h2>
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3">{error}</div>}
                <div>
                  <label className="text-sm font-medium mb-1 block">Логин</label>
                  <Input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ваш логин" maxLength={30} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Пароль</label>
                  <Input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Ваш пароль" onKeyDown={e => e.key === 'Enter' && doLogin()} />
                </div>
                <Button onClick={doLogin} disabled={sending} className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  {sending && <Icon name="Loader2" size={16} className="animate-spin" />} Войти
                </Button>
              </CardContent></Card>
            </div>
          )
        )}

        {/* --- TOPIC LIST --- */}
        {showTopicList && (
          <div className="space-y-2">
            {topics.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground mb-4">Пока нет тем</p>
                {user ? (
                  <Button onClick={() => setSp({ view: 'new' })} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"><Icon name="Plus" size={16} /> Создать тему</Button>
                ) : (
                  <Button onClick={() => setSp({ view: 'register' })} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">Зарегистрируйтесь</Button>
                )}
              </div>
            ) : topics.map(t => (
              <Card key={t.id} className="hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setSp({ topic: String(t.id) })}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${C[t.avatar_color] || C.blue} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold text-sm">{t.author_name[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {t.is_pinned && <Icon name="Pin" size={12} className="text-primary shrink-0" />}
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{t.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{t.author_name}</span>
                      <span>{ago(t.updated_at)}</span>
                      <span className="flex items-center gap-1"><Icon name="MessageSquare" size={11} /> {t.replies_count}</span>
                      <span className="flex items-center gap-1"><Icon name="Eye" size={11} /> {t.views_count}</span>
                    </div>
                  </div>
                  {canMod && (
                    <button onClick={e => delTopic(t.id, e)} className="p-1.5 text-muted-foreground/20 hover:text-red-500 transition-colors shrink-0"><Icon name="Trash2" size={14} /></button>
                  )}
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- TOPIC VIEW --- */}
        {showTopic && topic && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold truncate">{topic.title}</h2>
              {canMod && (
                <Button variant="outline" size="sm" onClick={() => delTopic(topic.id)} className="gap-1.5 text-red-500 hover:bg-red-500/10 border-red-200 shrink-0">
                  <Icon name="Trash2" size={14} /> Удалить
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex gap-3 mb-4">
              <span>{topic.author_name}</span>
              <span>{ago(topic.created_at)}</span>
              <span className="flex items-center gap-1"><Icon name="Eye" size={11} /> {topic.views_count}</span>
            </div>

            <div className="space-y-2">
              {messages.map(m => (
                <Card key={m.id}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${C[m.avatar_color] || C.blue} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-white font-bold text-xs">{m.author_name[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{m.author_name}</span>
                        <span className="text-xs text-muted-foreground">{ago(m.created_at)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                    {canMod && (
                      <button onClick={() => delMsg(m.id)} className="p-1 text-muted-foreground/20 hover:text-red-500 transition-colors shrink-0"><Icon name="Trash2" size={13} /></button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {user ? (
              <Card className="border-2 border-primary/20 mt-4">
                <CardContent className="p-4 space-y-3">
                  <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Напишите ответ..." rows={3} maxLength={5000} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{user.display_name}</span>
                    <Button onClick={doReply} disabled={sending || !replyText.trim()} size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />} Ответить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground/20 mt-4">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Войдите, чтобы ответить</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => setSp({ view: 'login' })} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">Войти</Button>
                    <Button size="sm" variant="outline" onClick={() => setSp({ view: 'register' })}>Регистрация</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Forum;
