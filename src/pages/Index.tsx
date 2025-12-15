import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Server {
  id: number;
  name: string;
  ip: string;
  description: string;
  mode: string;
  version: string;
  players: number;
  maxPlayers: number;
  rating: number;
  votes: number;
  owner: string;
}

const mockServers: Server[] = [
  {
    id: 1,
    name: "SkyBlock Heaven",
    ip: "sky.heaven.ru:25565",
    description: "Лучший SkyBlock сервер с уникальными островами и крафтами",
    mode: "SkyBlock",
    version: "1.20.1",
    players: 487,
    maxPlayers: 1000,
    rating: 4.8,
    votes: 2340
  },
  {
    id: 2,
    name: "CraftWars PvP",
    ip: "wars.craft.net:25565",
    description: "Хардкорный PvP с кланами, рейдами и эпичными битвами",
    mode: "PvP",
    version: "1.19.4",
    players: 312,
    maxPlayers: 500,
    rating: 4.6,
    votes: 1820
  },
  {
    id: 3,
    name: "Survival Master",
    ip: "survival.pro:19132",
    description: "Классический выживание с экономикой и привилегиями",
    mode: "Survival",
    version: "1.20.2",
    players: 156,
    maxPlayers: 300,
    rating: 4.7,
    votes: 980
  },
  {
    id: 4,
    name: "MiniGames Paradise",
    ip: "mini.paradise.com:25565",
    description: "50+ мини-игр, турниры каждый день, уникальные режимы",
    mode: "MiniGames",
    version: "1.20.1",
    players: 623,
    maxPlayers: 1500,
    rating: 4.9,
    votes: 3120
  }
];

export default function Index() {
  const [servers, setServers] = useState<Server[]>(mockServers);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (ip: string) => {
    navigator.clipboard.writeText(ip);
    toast({
      title: "IP скопирован!",
      description: `${ip} добавлен в буфер обмена`,
      duration: 2000,
    });
  };

  const filteredServers = servers
    .filter(server => 
      (filterMode === 'all' || server.mode.toLowerCase() === filterMode) &&
      (searchQuery === '' || server.name.toLowerCase().includes(searchQuery.toLowerCase()) || server.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.rating * b.votes - a.rating * a.votes);

  const topServers = [...servers].sort((a, b) => b.rating * b.votes - a.rating * a.votes).slice(0, 10);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary pixel-corners flex items-center justify-center text-2xl">
              ⛏️
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MineCraft Servers
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 pixel-corners">
                  <Icon name="Plus" size={18} />
                  Добавить сервер
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Добавить свой сервер</DialogTitle>
                  <DialogDescription>
                    Заполните информацию о вашем сервере для публикации
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="server-name">Название сервера</Label>
                    <Input id="server-name" placeholder="Мой крутой сервер" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="server-ip">IP адрес</Label>
                    <Input id="server-ip" placeholder="server.example.com:25565" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="server-mode">Режим игры</Label>
                    <Select>
                      <SelectTrigger id="server-mode">
                        <SelectValue placeholder="Выберите режим" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survival">Survival</SelectItem>
                        <SelectItem value="skyblock">SkyBlock</SelectItem>
                        <SelectItem value="pvp">PvP</SelectItem>
                        <SelectItem value="minigames">MiniGames</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="server-version">Версия</Label>
                    <Input id="server-version" placeholder="1.20.1" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="server-description">Описание</Label>
                    <Textarea id="server-description" placeholder="Расскажите о вашем сервере..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="pixel-corners">Опубликовать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="pixel-corners">
                  <Icon name="User" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Профиль пользователя</DialogTitle>
                  <DialogDescription>
                    Управляйте своими серверами и настройками
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary pixel-corners flex items-center justify-center text-3xl">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold">Игрок123</p>
                      <p className="text-sm text-muted-foreground">player@example.com</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Ваши серверы</Label>
                    <div className="text-sm text-muted-foreground">У вас пока нет добавленных серверов</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Избранное</Label>
                    <div className="text-sm text-muted-foreground">0 серверов в избранном</div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 relative overflow-hidden bg-card rounded-lg border border-border p-8 md:p-12">
          <div className="absolute top-4 right-4 w-16 h-16 bg-secondary/20 pixel-corners animate-float" />
          <div className="absolute bottom-8 left-8 w-12 h-12 bg-primary/20 pixel-corners" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-accent/30 pixel-corners animate-float" style={{ animationDelay: '2s' }} />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Найди свой идеальный сервер
            </h2>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Тысячи серверов Minecraft ждут тебя. Выбирай лучшие!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Поиск серверов..." 
                  className="pl-10 h-12 pixel-corners"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 pixel-corners">
                  <SelectValue placeholder="Все режимы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все режимы</SelectItem>
                  <SelectItem value="survival">Survival</SelectItem>
                  <SelectItem value="skyblock">SkyBlock</SelectItem>
                  <SelectItem value="pvp">PvP</SelectItem>
                  <SelectItem value="minigames">MiniGames</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 pixel-corners">
            <TabsTrigger value="catalog" className="gap-2">
              <Icon name="Grid3x3" size={18} />
              Каталог
            </TabsTrigger>
            <TabsTrigger value="rating" className="gap-2">
              <Icon name="Trophy" size={18} />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServers.map((server, index) => (
                <Card key={server.id} className="pixel-corners overflow-hidden hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{server.name}</CardTitle>
                        <CardDescription>{server.description}</CardDescription>
                      </div>
                      <Badge className="pixel-corners bg-primary text-primary-foreground">{server.mode}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={16} className="text-primary" />
                        <span className="font-semibold">{server.players}/{server.maxPlayers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-accent fill-accent" />
                        <span className="font-semibold">{server.rating}</span>
                        <span className="text-muted-foreground">({server.votes})</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{server.version}</Badge>
                    </div>
                    
                    <div className="bg-muted p-3 rounded pixel-corners font-mono text-sm flex items-center justify-between">
                      <span>{server.ip}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button 
                      className="flex-1 gap-2 pixel-corners"
                      onClick={() => copyToClipboard(server.ip)}
                    >
                      <Icon name="Copy" size={16} />
                      Копировать IP
                    </Button>
                    <Button variant="outline" size="icon" className="pixel-corners">
                      <Icon name="Heart" size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredServers.length === 0 && (
              <div className="text-center py-12">
                <Icon name="SearchX" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Серверы не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rating" className="space-y-4">
            <div className="bg-card rounded-lg border border-border pixel-corners overflow-hidden">
              {topServers.map((server, index) => (
                <div 
                  key={server.id} 
                  className="flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-12 h-12 pixel-corners flex items-center justify-center font-bold text-xl
                    ${index === 0 ? 'bg-accent text-accent-foreground' : ''}
                    ${index === 1 ? 'bg-muted text-foreground' : ''}
                    ${index === 2 ? 'bg-secondary text-secondary-foreground' : ''}
                    ${index > 2 ? 'bg-card border border-border text-muted-foreground' : ''}
                  `}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{server.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        {server.players}
                      </span>
                      <Badge variant="outline" className="text-xs">{server.mode}</Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent font-semibold">
                      <Icon name="Star" size={16} className="fill-accent" />
                      {server.rating}
                    </div>
                    <div className="text-xs text-muted-foreground">{server.votes} голосов</div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="gap-2 pixel-corners"
                    onClick={() => copyToClipboard(server.ip)}
                  >
                    <Icon name="Copy" size={14} />
                    IP
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-secondary pixel-corners flex items-center justify-center">
                  ⛏️
                </div>
                <span className="font-bold">MineCraft Servers</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Лучшая платформа для поиска и продвижения серверов Minecraft
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Популярные режимы</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Survival серверы</li>
                <li>SkyBlock серверы</li>
                <li>PvP арены</li>
                <li>MiniGames</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Сообщество</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="pixel-corners">
                  <Icon name="MessageCircle" size={18} />
                </Button>
                <Button variant="outline" size="icon" className="pixel-corners">
                  <Icon name="Github" size={18} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 MineCraft Servers. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}