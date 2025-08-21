import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Card, Button, Typography, Space, Avatar } from 'antd';
import { UserOutlined, ShoppingOutlined, PlusOutlined } from '@ant-design/icons';
import buildClient from '../api/build-client';

const { Title, Paragraph } = Typography;

interface User {
  id: string;
  email: string;
}

interface LandingPageProps {
  currentUser?: User;
}

const LandingPage = ({ currentUser }: LandingPageProps) => {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        {currentUser ? (
          <Card className="text-center">
            <Space direction="vertical" size="large" className="w-full">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
              <div>
                <Title level={3}>Welcome back!</Title>
                <Paragraph className="text-gray-600">
                  You are signed in as <strong>{currentUser.email}</strong>
                </Paragraph>
              </div>
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingOutlined />}
                  className="w-full"
                >
                  Browse Tickets
                </Button>
                <Button 
                  size="large" 
                  icon={<PlusOutlined />}
                  className="w-full"
                >
                  Create New Ticket
                </Button>
              </Space>
            </Space>
          </Card>
        ) : (
          <Card className="text-center">
            <Space direction="vertical" size="large" className="w-full">
              <div className="text-6xl">🎫</div>
              <div>
                <Title level={3}>Welcome to GitTix</Title>
                <Paragraph className="text-gray-600">
                  Please sign in to start buying and selling tickets
                </Paragraph>
              </div>
              <Space direction="vertical" size="middle" className="w-full">
                <Link href="/auth/signin">
                  <Button type="primary" size="large" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="large" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </Space>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

LandingPage.getInitialProps = async (context: any) => {
  console.log('LANDING PAGE!');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;
