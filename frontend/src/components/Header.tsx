
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Settings, User, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/documents" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              DynaDocument
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/documents"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveRoute('/documents')
                  ? 'text-purple-300'
                  : 'hover:bg-white/10'
              }`}
            >
              Meus Templates
            </Link>
            {/* <Link
              to="/batch"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveRoute('/batch')
                  ? 'text-purple-300'
                  : 'hover:bg-white/10'
              }`}
            >
              Lote
            </Link> */}
            <Link
              to="/files"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveRoute('/files')
                  ? 'text-purple-300'
                  : 'hover:bg-white/10'
              }`}
            >
              Arquivos Gerados
            </Link>
            <Link
              to="/api"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveRoute('/api')
                  ? 'text-purple-300'
                  : 'hover:bg-white/10'
              }`}
            >
              API
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveRoute('/settings')
                  ? 'text-purple-300'
                  : 'hover:bg-white/10'
              }`}
            >
              Configurações
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* User Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 h-auto">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:block">
                      {user?.name}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong border-white/20">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/documents"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/documents')
                    ? 'text-purple-300'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Meus Templates
              </Link>
              <Link
                to="/batch"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/batch')
                    ? 'text-purple-300'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Lote
              </Link>
              <Link
                to="/files"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/files')
                    ? 'text-purple-300'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Arquivos Gerados
              </Link>
              <Link
                to="/api"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/api')
                    ? 'text-purple-300'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                API
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/settings')
                    ? 'text-purple-300'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Configurações
              </Link>
              <Link
                to="/profile"
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Meu Perfil
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="justify-start px-3 py-2 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
