import Link from 'next/link';
import { Layout, Menu, Button, Space } from 'antd';
import { UserOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

interface User {
  id: string;
  email: string;
}

interface HeaderProps {
  currentUser?: User;
}

export default function Header({ currentUser }: HeaderProps) {
  const menuItems: MenuProps['items'] = [
    !currentUser ? {
      key: 'signup',
      icon: <UserAddOutlined />,
      label: <Link href="/auth/signup">Sign Up</Link>,
    } : null,
    !currentUser ? {
      key: 'signin',
      icon: <LoginOutlined />,
      label: <Link href="/auth/signin">Sign In</Link>,
    } : null,
    currentUser ? {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: <Link href="/auth/signout">Sign Out</Link>,
    } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <AntHeader className="bg-white shadow-sm border-b border-gray-200 px-0">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link 
          href="/" 
          className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          🎫 GitTix
        </Link>

        <Space>
          {currentUser && (
            <span className="text-gray-600 mr-4">
              <UserOutlined className="mr-2" />
              {currentUser.email}
            </span>
          )}
          <Menu
            mode="horizontal"
            items={menuItems}
            className="border-0 bg-transparent"
            style={{ lineHeight: '64px' }}
          />
        </Space>
      </div>
    </AntHeader>
  );
}
