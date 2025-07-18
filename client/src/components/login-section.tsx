import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginSectionProps {
  onSendCode: (phone: string) => void;
  onVerifyCode: (phone: string, code: string) => void;
  onVerifyPassword: (password: string) => void;
  currentStep: 'phone' | 'code' | 'password';
  isLoading?: boolean;
}

export function LoginSection({ 
  onSendCode, 
  onVerifyCode, 
  onVerifyPassword, 
  currentStep,
  isLoading = false 
}: LoginSectionProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const handleSendCode = () => {
    if (phone.trim()) {
      onSendCode(phone.trim());
    }
  };

  const handleVerifyCode = () => {
    if (code.trim()) {
      onVerifyCode(phone.trim(), code.trim());
    }
  };

  const handleVerifyPassword = () => {
    if (password.trim()) {
      onVerifyPassword(password.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto mb-8">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center gradient-text">
            Secure Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-300 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-gray-800/50 border-purple-500/30 text-center focus:border-cyan-400 focus:ring-cyan-400/20"
                  placeholder="+1234567890"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendCode}
                disabled={!phone.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 font-bold transform hover:scale-105 transition-all"
              >
                {isLoading ? 'Sending...' : 'Get Verification Code'}
              </Button>
            </div>
          )}

          {currentStep === 'code' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-gray-300 font-medium">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-gray-800/50 border-cyan-500/30 text-center focus:border-purple-400 focus:ring-purple-400/20"
                  placeholder="12345"
                  maxLength={5}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleVerifyCode}
                disabled={!code.trim() || isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          )}

          {currentStep === 'password' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  2FA Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-blue-500/30 text-center focus:border-indigo-400 focus:ring-indigo-400/20"
                  placeholder="Enter 2FA password"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleVerifyPassword}
                disabled={!password.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-bold"
              >
                {isLoading ? 'Authenticating...' : 'Authenticate'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
