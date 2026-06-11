'use client';
import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, Trophy, Users, BarChart3, Swords, Star, KeyRound, Ticket, Settings } from 'lucide-react';
import { AdminResults } from './admin-results';
import { AdminDeadlines } from './admin-deadlines';
import { AdminUsers } from './admin-users';
import { AdminBracketResults } from './admin-bracket-results';
import { AdminBracketMatchups } from './admin-bracket-matchups';
import { AdminBonus } from './admin-bonus';
import { AdminResetRequests } from './admin-reset-requests';
import { AdminInviteCodes } from './admin-invite-codes';
import { AdminConfig } from './admin-config';

export function AdminClient() {
  const [tab, setTab] = useState('results');
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-bold tracking-tight">Panel de Administración</h1>
        </div>
        <p className="text-muted-foreground mb-6">Gestiona resultados, enfrentamientos, fechas y usuarios</p>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="results" className="gap-2"><Trophy className="h-4 w-4" /> Resultados Grupos</TabsTrigger>
            <TabsTrigger value="matchups" className="gap-2"><Swords className="h-4 w-4" /> Enfrentamientos 1/16</TabsTrigger>
            <TabsTrigger value="bracket" className="gap-2"><BarChart3 className="h-4 w-4" /> Resultados Bracket</TabsTrigger>
            <TabsTrigger value="deadlines" className="gap-2"><Clock className="h-4 w-4" /> Fechas</TabsTrigger>
            <TabsTrigger value="bonus" className="gap-2"><Star className="h-4 w-4" /> Quiz Bonus</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Usuarios</TabsTrigger>
            <TabsTrigger value="resets" className="gap-2"><KeyRound className="h-4 w-4" /> Contraseñas</TabsTrigger>
            <TabsTrigger value="invites" className="gap-2"><Ticket className="h-4 w-4" /> Códigos</TabsTrigger>
            <TabsTrigger value="config" className="gap-2"><Settings className="h-4 w-4" /> Puntos y Premios</TabsTrigger>
          </TabsList>
          <TabsContent value="results"><AdminResults /></TabsContent>
          <TabsContent value="matchups"><AdminBracketMatchups /></TabsContent>
          <TabsContent value="bracket"><AdminBracketResults /></TabsContent>
          <TabsContent value="deadlines"><AdminDeadlines /></TabsContent>
          <TabsContent value="bonus"><AdminBonus /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="resets"><AdminResetRequests /></TabsContent>
          <TabsContent value="invites"><AdminInviteCodes /></TabsContent>
          <TabsContent value="config"><AdminConfig /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
